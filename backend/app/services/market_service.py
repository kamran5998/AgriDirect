"""Market directory, APMC prices, search, comparison, historical timeseries, and trend analytics."""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
from app.models.market import Market, MarketPrice, MarketStatus, DemandLevel
from app.models.crop import Crop
from app.schemas.market import (
    MarketComparisonResponse,
    MarketComparisonItem,
    LatestMarketPricesResponse,
    LatestPriceItem,
    CropTrendResponse,
    CropTrendPoint,
)
from app.utils.exceptions import NotFoundException
from app.services.ingestion.pipeline import (
    MarketDataIngestionPipeline,
    get_latest_ingestion_status,
    get_recent_ingestion_runs,
)
from app.services.ingestion.provider_factory import get_market_data_provider, PROVIDER_REGISTRY


class MarketService:
    @staticmethod
    def get_markets(
        db: Session,
        state: Optional[str] = None,
        district: Optional[str] = None,
        status: Optional[MarketStatus] = None,
        limit: int = 100
    ) -> List[Market]:
        query = db.query(Market)
        if state:
            query = query.filter(Market.state == state)
        if district:
            query = query.filter(Market.district == district)
        if status:
            query = query.filter(Market.status == status)

        return query.order_by(Market.state.asc(), Market.district.asc()).limit(limit).all()

    @staticmethod
    def get_market_by_id(db: Session, market_id: int) -> Market:
        market = db.query(Market).filter(Market.id == market_id).first()
        if not market:
            raise NotFoundException(detail=f"Market with ID {market_id} not found")
        return market

    @staticmethod
    def search_crop_prices(
        db: Session,
        crop_id: Optional[int] = None,
        market_id: Optional[int] = None,
        state: Optional[str] = None,
        search_query: Optional[str] = None,
        limit: int = 50
    ) -> List[MarketPrice]:
        query = (
            db.query(MarketPrice)
            .join(MarketPrice.market)
            .join(MarketPrice.crop)
            .options(joinedload(MarketPrice.market), joinedload(MarketPrice.crop))
        )

        if crop_id:
            query = query.filter(MarketPrice.crop_id == crop_id)
        if market_id:
            query = query.filter(MarketPrice.market_id == market_id)
        if state:
            query = query.filter(Market.state == state)
        if search_query:
            term = f"%{search_query}%"
            query = query.filter(
                (Crop.name.ilike(term)) | (Market.name.ilike(term)) | (Market.district.ilike(term))
            )

        return query.order_by(desc(MarketPrice.recorded_at)).limit(limit).all()

    @staticmethod
    def get_latest_market_prices(
        db: Session,
        crop_id: Optional[int] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        limit: int = 50
    ) -> LatestMarketPricesResponse:
        """
        Retrieves the latest available price for each (market, crop) pair with 24-hour delta metrics
        and transparency metadata about real vs. mock data source provenance.
        """
        # Subquery to get max recorded_at per (market_id, crop_id)
        subquery = (
            db.query(
                MarketPrice.market_id,
                MarketPrice.crop_id,
                func.max(MarketPrice.recorded_at).label("max_recorded_at")
            )
            .group_by(MarketPrice.market_id, MarketPrice.crop_id)
            .subquery()
        )

        query = (
            db.query(MarketPrice)
            .join(
                subquery,
                (MarketPrice.market_id == subquery.c.market_id) &
                (MarketPrice.crop_id == subquery.c.crop_id) &
                (MarketPrice.recorded_at == subquery.c.max_recorded_at)
            )
            .join(MarketPrice.market)
            .join(MarketPrice.crop)
            .options(joinedload(MarketPrice.market), joinedload(MarketPrice.crop))
        )

        if crop_id:
            query = query.filter(MarketPrice.crop_id == crop_id)
        if state:
            query = query.filter(Market.state == state)
        if district:
            query = query.filter(Market.district == district)

        latest_records = query.order_by(desc(MarketPrice.recorded_at)).limit(limit).all()

        items: List[LatestPriceItem] = []
        real_count = 0
        mock_count = 0
        sources_seen = set()

        for rec in latest_records:
            if rec.is_mock:
                mock_count += 1
            else:
                real_count += 1
            sources_seen.add(rec.source)

            # Query 24h prior record to compute price change
            prev_cutoff = rec.recorded_at - timedelta(hours=36)
            prev_record = (
                db.query(MarketPrice)
                .filter(
                    MarketPrice.market_id == rec.market_id,
                    MarketPrice.crop_id == rec.crop_id,
                    MarketPrice.recorded_at < rec.recorded_at,
                    MarketPrice.recorded_at >= prev_cutoff
                )
                .order_by(desc(MarketPrice.recorded_at))
                .first()
            )

            change_amt = Decimal("0.00")
            change_pct = Decimal("0.00")
            if prev_record and prev_record.price > 0:
                change_amt = round(rec.price - prev_record.price, 2)
                change_pct = round((change_amt / prev_record.price) * Decimal("100.00"), 2)

            items.append(
                LatestPriceItem(
                    price_id=rec.id,
                    crop_id=rec.crop_id,
                    crop_name=rec.crop.name,
                    category=rec.crop.category.value,
                    market_id=rec.market_id,
                    market_name=rec.market.name,
                    district=rec.market.district,
                    state=rec.market.state,
                    modal_price=rec.price,
                    min_price=rec.min_price,
                    max_price=rec.max_price,
                    demand_level=rec.demand_level,
                    recorded_at=rec.recorded_at,
                    ingested_at=rec.ingested_at or rec.recorded_at,
                    source=rec.source,
                    is_mock=rec.is_mock,
                    change_24h_amount=change_amt,
                    change_24h_percent=change_pct
                )
            )

        source_summary = {
            "total_records": len(items),
            "real_records_count": real_count,
            "mock_records_count": mock_count,
            "is_pure_real_time": (mock_count == 0 and real_count > 0),
            "active_sources": list(sources_seen)
        }

        return LatestMarketPricesResponse(
            total=len(items),
            source_summary=source_summary,
            items=items
        )

    @staticmethod
    def get_crop_price_history(
        db: Session,
        crop_id: int,
        market_id: Optional[int] = None,
        days: int = 30
    ) -> List[MarketPrice]:
        cutoff = datetime.utcnow() - timedelta(days=days)
        query = (
            db.query(MarketPrice)
            .options(joinedload(MarketPrice.market), joinedload(MarketPrice.crop))
            .filter(MarketPrice.crop_id == crop_id, MarketPrice.recorded_at >= cutoff)
        )
        if market_id:
            query = query.filter(MarketPrice.market_id == market_id)

        return query.order_by(MarketPrice.recorded_at.asc()).all()

    @staticmethod
    def compare_markets_for_crop(
        db: Session,
        crop_id: int,
        benchmark_mandi_id: Optional[int] = None
    ) -> MarketComparisonResponse:
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        if not crop:
            raise NotFoundException(detail=f"Crop with ID {crop_id} not found")

        # Get latest recorded price per market for this crop
        subquery = (
            db.query(
                MarketPrice.market_id,
                func.max(MarketPrice.recorded_at).label("max_recorded_at")
            )
            .filter(MarketPrice.crop_id == crop_id)
            .group_by(MarketPrice.market_id)
            .subquery()
        )

        latest_prices = (
            db.query(MarketPrice)
            .join(
                subquery,
                (MarketPrice.market_id == subquery.c.market_id) &
                (MarketPrice.recorded_at == subquery.c.max_recorded_at)
            )
            .options(joinedload(MarketPrice.market), joinedload(MarketPrice.crop))
            .filter(MarketPrice.crop_id == crop_id)
            .all()
        )

        items = []
        for p in latest_prices:
            items.append(
                MarketComparisonItem(
                    market=p.market,
                    crop=p.crop,
                    modal_price=p.price,
                    min_price=p.min_price,
                    max_price=p.max_price,
                    demand_level=p.demand_level,
                    recorded_at=p.recorded_at,
                    distance_km=None,
                    net_realization_per_qtl=p.price,
                    source=p.source,
                    is_mock=p.is_mock
                )
            )

        items.sort(key=lambda x: x.modal_price, reverse=True)

        return MarketComparisonResponse(
            crop_id=crop.id,
            crop_name=crop.name,
            benchmark_mandi_id=benchmark_mandi_id,
            markets=items
        )

    @staticmethod
    def get_crop_trends(
        db: Session,
        crop_id: int,
        market_id: Optional[int] = None,
        days: int = 30
    ) -> CropTrendResponse:
        """
        Calculates aggregate price trend analytics, 7-day moving averages, price volatility, and market sentiment.
        """
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        if not crop:
            raise NotFoundException(detail=f"Crop with ID {crop_id} not found")

        cutoff = datetime.utcnow() - timedelta(days=days)
        query = (
            db.query(
                func.date(MarketPrice.recorded_at).label("record_date"),
                func.avg(MarketPrice.price).label("avg_modal"),
                func.min(MarketPrice.min_price).label("min_p"),
                func.max(MarketPrice.max_price).label("max_p"),
                func.count(MarketPrice.id).label("count_records")
            )
            .filter(MarketPrice.crop_id == crop_id, MarketPrice.recorded_at >= cutoff)
        )
        if market_id:
            query = query.filter(MarketPrice.market_id == market_id)

        grouped = query.group_by(func.date(MarketPrice.recorded_at)).order_by(func.date(MarketPrice.recorded_at).asc()).all()

        points: List[CropTrendPoint] = []
        prices_list = []

        for row in grouped:
            date_str = row.record_date.strftime("%Y-%m-%d") if hasattr(row.record_date, "strftime") else str(row.record_date)
            avg_m = round(Decimal(str(row.avg_modal)), 2)
            min_p = round(Decimal(str(row.min_p)), 2)
            max_p = round(Decimal(str(row.max_p)), 2)
            prices_list.append(avg_m)

            # Compute 7-day moving average
            window = prices_list[-7:]
            ma7 = round(sum(window) / Decimal(len(window)), 2)

            points.append(
                CropTrendPoint(
                    date=date_str,
                    modal_price=avg_m,
                    min_price=min_p,
                    max_price=max_p,
                    moving_avg_7d=ma7,
                    sample_size=row.count_records
                )
            )

        if not points:
            # Fallback if no records yet
            curr_p = Decimal("2850.00")
            return CropTrendResponse(
                crop_id=crop.id,
                crop_name=crop.name,
                period_days=days,
                current_modal_price=curr_p,
                price_change_amount=Decimal("0.00"),
                price_change_percent=Decimal("0.00"),
                price_volatility_index=1.2,
                sentiment="Steady",
                data_points=[],
                data_source_summary={"message": "No historical price records ingested yet."}
            )

        curr_p = points[-1].modal_price
        start_p = points[0].modal_price
        change_amt = round(curr_p - start_p, 2)
        change_pct = round((change_amt / start_p) * Decimal("100.00"), 2) if start_p > 0 else Decimal("0.00")

        # Volatility Index (Standard deviation of daily price changes)
        if len(prices_list) > 1:
            mean = sum(prices_list) / Decimal(len(prices_list))
            variance = sum((p - mean) ** 2 for p in prices_list) / Decimal(len(prices_list))
            std_dev = float(variance ** Decimal("0.5"))
            volatility_pct = round((std_dev / float(mean)) * 100, 2) if mean > 0 else 0.0
        else:
            volatility_pct = 0.5

        # Sentiment logic
        if change_pct >= Decimal("3.0"):
            sentiment = "Bullish (High Upward Momentum)"
        elif change_pct <= Decimal("-3.0"):
            sentiment = "Bearish (Downside Pressure)"
        else:
            sentiment = "Steady (Range-Bound Trading)"

        return CropTrendResponse(
            crop_id=crop.id,
            crop_name=crop.name,
            period_days=days,
            current_modal_price=curr_p,
            price_change_amount=change_amt,
            price_change_percent=change_pct,
            price_volatility_index=volatility_pct,
            sentiment=sentiment,
            data_points=points,
            data_source_summary={
                "data_points_analyzed": len(points),
                "period_days": days,
                "crop": crop.name
            }
        )

    @staticmethod
    async def trigger_ingestion(
        db: Session,
        provider_type: Optional[str] = None,
        state: Optional[str] = None,
        crop: Optional[str] = None,
        market: Optional[str] = None,
        limit: int = 200
    ):
        provider = get_market_data_provider(provider_type)
        pipeline = MarketDataIngestionPipeline(provider=provider)
        return await pipeline.execute_ingestion(
            db=db,
            state=state,
            crop=crop,
            market=market,
            limit=limit
        )

    @staticmethod
    def get_ingestion_telemetry() -> Dict[str, Any]:
        latest_run = get_latest_ingestion_status()
        recent_runs = get_recent_ingestion_runs()
        provider = get_market_data_provider()

        providers_meta = [
            {"id": "mock", "name": "Simulated Mock Provider", "type": "Synthetic Feed", "is_mock": True},
            {"id": "agmarknet", "name": "AGMARKNET (Govt of India)", "type": "REST API", "is_mock": False},
            {"id": "data_gov_in", "name": "data.gov.in (OGD Platform)", "type": "REST API", "is_mock": False},
        ]

        return {
            "active_provider": provider.provider_name,
            "is_mock_provider": provider.is_mock,
            "configured_providers": providers_meta,
            "last_run": latest_run.model_dump(mode="json") if latest_run else None,
            "recent_runs": [r.model_dump(mode="json") for r in recent_runs[:10]],
        }
