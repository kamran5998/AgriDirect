"""Data models for raw, cleaned, validated market price records and ingestion statistics.
Provides full Pydantic models when pydantic is available, with pure Python fallback for minimal environments.
"""

from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List, Dict, Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    # Pure Python dataclass-like fallback for standalone execution
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

        def model_dump(self, mode: str = "json") -> Dict[str, Any]:
            res = {}
            for k, v in self.__dict__.items():
                if isinstance(v, (datetime, date)):
                    res[k] = v.isoformat()
                elif isinstance(v, Decimal):
                    res[k] = float(v)
                elif hasattr(v, "value"):
                    res[k] = v.value
                else:
                    res[k] = v
            return res

    def Field(default=None, default_factory=None, **kwargs):
        if default_factory is not None:
            return default_factory()
        return default


class RawMarketPriceRecord(BaseModel):
    """Raw record received directly from an external data source or API."""
    def __init__(
        self,
        crop_name: Optional[str] = None,
        variety: Optional[str] = None,
        market_name: Optional[str] = None,
        district: Optional[str] = None,
        state: Optional[str] = None,
        modal_price: Optional[Any] = None,
        min_price: Optional[Any] = None,
        max_price: Optional[Any] = None,
        arrival_volume: Optional[Any] = None,
        date_str: Optional[Any] = None,
        raw_payload: Optional[Dict[str, Any]] = None,
        **kwargs
    ):
        self.crop_name = crop_name
        self.variety = variety
        self.market_name = market_name
        self.district = district
        self.state = state
        self.modal_price = modal_price
        self.min_price = min_price
        self.max_price = max_price
        self.arrival_volume = arrival_volume
        self.date_str = date_str
        self.raw_payload = raw_payload or {}


class CleanedMarketPriceRecord(BaseModel):
    """Record after sanitization, type coercion, and standardizing naming."""
    def __init__(
        self,
        standard_crop_name: str,
        standard_category: str,
        variety: str,
        standard_market_name: str,
        district: str,
        state: str,
        modal_price: Decimal,
        min_price: Decimal,
        max_price: Decimal,
        demand_level: Any,
        recorded_at: datetime,
        source: str,
        arrival_volume: Optional[Decimal] = None,
        is_mock: bool = False,
        **kwargs
    ):
        self.standard_crop_name = standard_crop_name
        self.standard_category = standard_category
        self.variety = variety
        self.standard_market_name = standard_market_name
        self.district = district
        self.state = state
        self.modal_price = modal_price
        self.min_price = min_price
        self.max_price = max_price
        self.demand_level = demand_level
        self.recorded_at = recorded_at
        self.source = source
        self.arrival_volume = arrival_volume
        self.is_mock = is_mock


class ValidationFailure(BaseModel):
    """Details of a record rejected during the validation stage."""
    def __init__(
        self,
        raw_record: Dict[str, Any],
        reason: str,
        rule: str,
        value_rejected: Optional[Any] = None,
        **kwargs
    ):
        self.raw_record = raw_record
        self.reason = reason
        self.rule = rule
        self.value_rejected = value_rejected


class IngestionReport(BaseModel):
    """Audit report and telemetry statistics for an ingestion run."""
    def __init__(
        self,
        run_id: str,
        timestamp: datetime,
        provider: str,
        is_mock_provider: bool,
        total_raw_fetched: int = 0,
        total_cleaned: int = 0,
        total_valid: int = 0,
        total_rejected: int = 0,
        total_inserted: int = 0,
        total_duplicates_skipped: int = 0,
        execution_time_ms: float = 0.0,
        status: str = "SUCCESS",
        error_message: Optional[str] = None,
        rejected_reasons_breakdown: Optional[Dict[str, int]] = None,
        sample_rejections: Optional[List[ValidationFailure]] = None,
        **kwargs
    ):
        self.run_id = run_id
        self.timestamp = timestamp
        self.provider = provider
        self.is_mock_provider = is_mock_provider
        self.total_raw_fetched = total_raw_fetched
        self.total_cleaned = total_cleaned
        self.total_valid = total_valid
        self.total_rejected = total_rejected
        self.total_inserted = total_inserted
        self.total_duplicates_skipped = total_duplicates_skipped
        self.execution_time_ms = execution_time_ms
        self.status = status
        self.error_message = error_message
        self.rejected_reasons_breakdown = rejected_reasons_breakdown or {}
        self.sample_rejections = sample_rejections or []
