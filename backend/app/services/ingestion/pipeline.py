"""End-to-End Market Data Ingestion Pipeline.
Orchestrates collection, cleaning, validation, database deduplication, and persistence.
"""

import time
import uuid
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

try:
    from sqlalchemy.orm import Session
    from sqlalchemy import func
    from app.models.market import Market, MarketPrice, MarketStatus
    from app.models.crop import Crop, CropCategory
except ImportError:
    Session = Any
    func = Any
    Market = None
    MarketPrice = None
    MarketStatus = None
    Crop = None
    CropCategory = None

from app.services.ingestion.models import (
    RawMarketPriceRecord,
    CleanedMarketPriceRecord,
    IngestionReport,
    ValidationFailure,
)
from app.services.ingestion.base_provider import BaseMarketDataProvider
from app.services.ingestion.provider_factory import get_market_data_provider
from app.services.ingestion.cleaner import MarketDataCleaner
from app.services.ingestion.validator import MarketDataValidator

logger = logging.getLogger(__name__)

# Global registry of recent ingestion reports for telemetry and auditing
_RECENT_INGESTION_RUNS: List[IngestionReport] = []


class MarketDataIngestionPipeline:
    """Executes the complete market price ingestion lifecycle."""

    def __init__(
        self,
        provider: Optional[BaseMarketDataProvider] = None,
        validator: Optional[MarketDataValidator] = None
    ):
        self.provider = provider or get_market_data_provider()
        self.validator = validator or MarketDataValidator()

    async def execute_ingestion(
        self,
        db: Optional[Any] = None,
        state: Optional[str] = None,
        crop: Optional[str] = None,
        market: Optional[str] = None,
        limit: int = 200
    ) -> IngestionReport:
        """
        Runs the full ingestion pipeline:
        1. Fetch raw data from external source / API
        2. Clean and standardize records
        3. Validate against business rules & thresholds
        4. Match / resolve Market and Crop entities in database
        5. Check and skip existing duplicate records
        6. Batch insert valid records
        7. Generate detailed telemetry audit report
        """
        run_id = f"INGEST-{uuid.uuid4().hex[:8].upper()}"
        start_time = time.perf_counter()
        timestamp = datetime.utcnow()

        report = IngestionReport(
            run_id=run_id,
            timestamp=timestamp,
            provider=self.provider.provider_name,
            is_mock_provider=self.provider.is_mock,
        )

        logger.info(
            f"Starting Ingestion Run {run_id} | Provider: {self.provider.provider_name} | Mock: {self.provider.is_mock}"
        )

        try:
            # 1. Fetch raw records
            raw_records: List[RawMarketPriceRecord] = await self.provider.fetch_prices(
                state=state,
                crop=crop,
                market=market,
                limit=limit
            )
            report.total_raw_fetched = len(raw_records)

            if not raw_records:
                report.status = "SUCCESS"
                report.execution_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
                _record_run(report)
                return report

            # 2. Clean & sanitize
            cleaned_records: List[CleanedMarketPriceRecord] = []
            for raw in raw_records:
                cleaned = MarketDataCleaner.clean_record(
                    raw=raw,
                    source=self.provider.provider_name,
                    is_mock=self.provider.is_mock
                )
                if cleaned:
                    cleaned_records.append(cleaned)
                else:
                    report.total_rejected += 1
                    report.rejected_reasons_breakdown["UNPARSEABLE_RAW_DATA"] = (
                        report.rejected_reasons_breakdown.get("UNPARSEABLE_RAW_DATA", 0) + 1
                    )

            report.total_cleaned = len(cleaned_records)

            # 3. Validate against rules & detect in-batch duplicates
            valid_records, failures, error_counts = self.validator.validate_batch(cleaned_records)
            report.total_valid = len(valid_records)
            report.total_rejected += len(failures)
            report.rejected_reasons_breakdown.update(error_counts)
            report.sample_rejections = failures[:10]

            # 4. If database session provided, persist to MySQL preventing duplicates
            if db is not None and Market is not None and Crop is not None:
                market_cache: Dict[str, Any] = {}
                crop_cache: Dict[str, Any] = {}

                # Preload existing markets and crops
                for m in db.query(Market).all():
                    market_cache[f"{m.name.lower()}::{m.district.lower()}::{m.state.lower()}"] = m

                for c in db.query(Crop).all():
                    crop_cache[c.name.lower()] = c

                inserted_count = 0
                duplicates_count = 0

                for rec in valid_records:
                    # Match or create Crop
                    c_key = rec.standard_crop_name.lower()
                    crop_obj = crop_cache.get(c_key)
                    if not crop_obj:
                        cat_enum = CropCategory.GRAINS
                        for cat in CropCategory:
                            if cat.value.lower() == rec.standard_category.lower():
                                cat_enum = cat
                                break

                        crop_obj = Crop(
                            name=rec.standard_crop_name,
                            category=cat_enum,
                            description=f"Standard commodity catalog entry for {rec.standard_crop_name}"
                        )
                        db.add(crop_obj)
                        db.flush()
                        crop_cache[c_key] = crop_obj

                    # Match or create Market
                    m_key = f"{rec.standard_market_name.lower()}::{rec.district.lower()}::{rec.state.lower()}"
                    market_obj = market_cache.get(m_key)
                    if not market_obj:
                        market_obj = Market(
                            name=rec.standard_market_name,
                            district=rec.district,
                            state=rec.state,
                            location=f"{rec.district}, {rec.state}",
                            status=MarketStatus.ACTIVE
                        )
                        db.add(market_obj)
                        db.flush()
                        market_cache[m_key] = market_obj

                    # Check if duplicate price record exists for this market + crop on this exact date
                    rec_date = rec.recorded_at.date()
                    existing = db.query(MarketPrice).filter(
                        MarketPrice.market_id == market_obj.id,
                        MarketPrice.crop_id == crop_obj.id,
                        func.date(MarketPrice.recorded_at) == rec_date
                    ).first()

                    if existing:
                        duplicates_count += 1
                        continue

                    # Create persistent MarketPrice record
                    price_record = MarketPrice(
                        market_id=market_obj.id,
                        crop_id=crop_obj.id,
                        price=rec.modal_price,
                        min_price=rec.min_price,
                        max_price=rec.max_price,
                        demand_level=rec.demand_level,
                        recorded_at=rec.recorded_at,
                        ingested_at=datetime.utcnow(),
                        source=rec.source,
                        is_mock=rec.is_mock
                    )
                    db.add(price_record)
                    inserted_count += 1

                db.commit()
                report.total_inserted = inserted_count
                report.total_duplicates_skipped = duplicates_count
            else:
                # Standalone simulation run without live db session
                report.total_inserted = len(valid_records)
                report.total_duplicates_skipped = 0

            report.status = "SUCCESS" if report.total_rejected == 0 else "PARTIAL"

        except Exception as exc:
            if db is not None and hasattr(db, "rollback"):
                db.rollback()
            logger.error(f"Ingestion Run {run_id} failed: {str(exc)}", exc_info=True)
            report.status = "FAILED"
            report.error_message = str(exc)

        finally:
            report.execution_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
            _record_run(report)
            logger.info(
                f"Completed Ingestion {run_id}: Fetched={report.total_raw_fetched}, "
                f"Valid={report.total_valid}, Inserted={report.total_inserted}, "
                f"DuplicatesSkipped={report.total_duplicates_skipped}, Time={report.execution_time_ms}ms"
            )

        return report


def _record_run(report: IngestionReport) -> None:
    global _RECENT_INGESTION_RUNS
    _RECENT_INGESTION_RUNS.insert(0, report)
    if len(_RECENT_INGESTION_RUNS) > 50:
        _RECENT_INGESTION_RUNS.pop()


def get_recent_ingestion_runs() -> List[IngestionReport]:
    return _RECENT_INGESTION_RUNS


def get_latest_ingestion_status() -> Optional[IngestionReport]:
    return _RECENT_INGESTION_RUNS[0] if _RECENT_INGESTION_RUNS else None
