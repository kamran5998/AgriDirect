"""Data Validation Engine for Agricultural Market Commodity Prices."""

import enum
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Tuple, Set, Dict, Any

try:
    from app.config import settings
    DEFAULT_MIN_PRICE = settings.PRICE_MIN_THRESHOLD
    DEFAULT_MAX_PRICE = settings.PRICE_MAX_THRESHOLD
except ImportError:
    DEFAULT_MIN_PRICE = Decimal("100.00")
    DEFAULT_MAX_PRICE = Decimal("100000.00")

try:
    from app.models.market import DemandLevel
except ImportError:
    class DemandLevel(str, enum.Enum):
        LOW = "Low"
        MODERATE = "Moderate"
        HIGH = "High"
        SURGE = "Surge"

from app.services.ingestion.models import CleanedMarketPriceRecord, ValidationFailure

logger = logging.getLogger(__name__)


class MarketDataValidator:
    """Validates cleaned market price records against business rules and integrity constraints."""

    def __init__(
        self,
        min_price_threshold: Decimal = DEFAULT_MIN_PRICE,
        max_price_threshold: Decimal = DEFAULT_MAX_PRICE,
        max_future_hours: int = 24,
        max_past_days: int = 365
    ):
        self.min_price_threshold = min_price_threshold
        self.max_price_threshold = max_price_threshold
        self.max_future_hours = max_future_hours
        self.max_past_days = max_past_days

    def validate_batch(
        self,
        records: List[CleanedMarketPriceRecord]
    ) -> Tuple[List[CleanedMarketPriceRecord], List[ValidationFailure], Dict[str, int]]:
        """
        Validates a batch of records. Returns:
        - valid_records: List[CleanedMarketPriceRecord]
        - failures: List[ValidationFailure]
        - error_counts: Dict[str, int]
        """
        valid_records: List[CleanedMarketPriceRecord] = []
        failures: List[ValidationFailure] = []
        error_counts: Dict[str, int] = {}
        seen_keys: Set[str] = set()

        now = datetime.utcnow()
        max_future_dt = now + timedelta(hours=self.max_future_hours)
        min_past_dt = now - timedelta(days=self.max_past_days)

        for rec in records:
            failure_reason = None
            rule_violated = None
            rejected_value = None

            # Rule 1: Mandatory names & length
            if not rec.standard_crop_name or len(rec.standard_crop_name) < 2:
                failure_reason = "Missing or invalid crop name"
                rule_violated = "MANDATORY_CROP_NAME"
                rejected_value = rec.standard_crop_name
            elif not rec.standard_market_name or len(rec.standard_market_name) < 2:
                failure_reason = "Missing or invalid market/mandi name"
                rule_violated = "MANDATORY_MARKET_NAME"
                rejected_value = rec.standard_market_name
            elif not rec.state or not rec.district:
                failure_reason = "Missing state or district location info"
                rule_violated = "MANDATORY_LOCATION"
                rejected_value = f"{rec.district}, {rec.state}"

            # Rule 2: Price positivity
            elif rec.modal_price <= Decimal("0"):
                failure_reason = "Modal price must be strictly positive"
                rule_violated = "PRICE_POSITIVE"
                rejected_value = float(rec.modal_price)
            elif rec.min_price <= Decimal("0") or rec.max_price <= Decimal("0"):
                failure_reason = "Min and Max prices must be strictly positive"
                rule_violated = "PRICE_BOUNDS_POSITIVE"
                rejected_value = (float(rec.min_price), float(rec.max_price))

            # Rule 3: Min <= Modal <= Max consistency
            elif rec.min_price > rec.max_price:
                failure_reason = "Minimum price exceeds Maximum price"
                rule_violated = "PRICE_MIN_MAX_ORDER"
                rejected_value = f"min={rec.min_price} > max={rec.max_price}"

            # Rule 4: Threshold bounds (prevent outlier / unit errors)
            elif rec.modal_price < self.min_price_threshold:
                failure_reason = f"Modal price ₹{rec.modal_price} below minimum threshold ₹{self.min_price_threshold}"
                rule_violated = "PRICE_BELOW_MIN_THRESHOLD"
                rejected_value = float(rec.modal_price)
            elif rec.modal_price > self.max_price_threshold:
                failure_reason = f"Modal price ₹{rec.modal_price} exceeds maximum threshold ₹{self.max_price_threshold}"
                rule_violated = "PRICE_EXCEEDS_MAX_THRESHOLD"
                rejected_value = float(rec.modal_price)

            # Rule 5: Date validation (no future dates, no expired dates)
            elif rec.recorded_at > max_future_dt:
                failure_reason = f"Recorded date {rec.recorded_at} is in the future"
                rule_violated = "DATE_FUTURE_INVALID"
                rejected_value = rec.recorded_at.isoformat()
            elif rec.recorded_at < min_past_dt:
                failure_reason = f"Recorded date {rec.recorded_at} is older than allowed {self.max_past_days} days"
                rule_violated = "DATE_EXPIRED_INVALID"
                rejected_value = rec.recorded_at.isoformat()

            # Rule 6: Duplicate detection in current batch
            date_key = rec.recorded_at.strftime("%Y-%m-%d")
            dup_key = f"{rec.standard_market_name.lower()}::{rec.standard_crop_name.lower()}::{date_key}"

            if not failure_reason:
                if dup_key in seen_keys:
                    failure_reason = f"Duplicate record in same ingestion batch: {dup_key}"
                    rule_violated = "BATCH_DUPLICATE_KEY"
                    rejected_value = dup_key
                else:
                    seen_keys.add(dup_key)

            if failure_reason:
                error_counts[rule_violated] = error_counts.get(rule_violated, 0) + 1
                failures.append(
                    ValidationFailure(
                        raw_record=rec.model_dump(mode="json") if hasattr(rec, "model_dump") else rec.__dict__,
                        reason=failure_reason,
                        rule=rule_violated,
                        value_rejected=rejected_value
                    )
                )
            else:
                valid_records.append(rec)

        return valid_records, failures, error_counts
