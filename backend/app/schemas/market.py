"""Pydantic schemas for Markets (APMC Mandis), Price Intelligence, Ingestion & Analytics."""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.market import MarketStatus, DemandLevel
from app.schemas.crop import CropRead


class MarketBase(BaseModel):
    name: str = Field(..., max_length=150)
    state: str = Field(..., max_length=100)
    district: str = Field(..., max_length=100)
    location: str = Field(..., max_length=255)
    status: MarketStatus = MarketStatus.ACTIVE


class MarketCreate(MarketBase):
    pass


class MarketRead(MarketBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Market Price Schemas
class MarketPriceBase(BaseModel):
    market_id: int
    crop_id: int
    price: Decimal = Field(..., description="Modal price in INR / Quintal")
    min_price: Decimal = Field(..., description="Minimum price in INR / Quintal")
    max_price: Decimal = Field(..., description="Maximum price in INR / Quintal")
    demand_level: DemandLevel = DemandLevel.MODERATE


class MarketPriceCreate(MarketPriceBase):
    recorded_at: Optional[datetime] = None
    source: Optional[str] = "SIMULATED_MOCK_PROVIDER"
    is_mock: Optional[bool] = False


class MarketPriceRead(MarketPriceBase):
    id: int
    recorded_at: datetime
    ingested_at: Optional[datetime] = None
    source: str = "SIMULATED_MOCK_PROVIDER"
    is_mock: bool = False
    market: Optional[MarketRead] = None
    crop: Optional[CropRead] = None

    class Config:
        from_attributes = True


class MarketComparisonItem(BaseModel):
    market: MarketRead
    crop: CropRead
    modal_price: Decimal
    min_price: Decimal
    max_price: Decimal
    demand_level: DemandLevel
    recorded_at: datetime
    distance_km: Optional[float] = None
    net_realization_per_qtl: Optional[Decimal] = None
    source: str = "SIMULATED_MOCK_PROVIDER"
    is_mock: bool = False


class MarketComparisonResponse(BaseModel):
    crop_id: int
    crop_name: str
    benchmark_mandi_id: Optional[int] = None
    markets: List[MarketComparisonItem]


# Ingestion Schemas
class IngestTriggerRequest(BaseModel):
    provider: Optional[str] = Field(None, description="Provider type: 'mock', 'agmarknet', 'data_gov_in'")
    state: Optional[str] = Field(None, description="Optional state filter (e.g. 'Madhya Pradesh')")
    crop: Optional[str] = Field(None, description="Optional crop filter (e.g. 'Wheat')")
    market: Optional[str] = Field(None, description="Optional market name")
    limit: int = Field(200, ge=1, le=1000, description="Max raw records to fetch")


class IngestionStatusResponse(BaseModel):
    active_provider: str
    is_mock_provider: bool
    configured_providers: List[Dict[str, Any]]
    last_run: Optional[Dict[str, Any]] = None
    recent_runs: List[Dict[str, Any]] = Field(default_factory=list)


# Crop Trends & Analytics Schemas
class CropTrendPoint(BaseModel):
    date: str
    modal_price: Decimal
    min_price: Decimal
    max_price: Decimal
    moving_avg_7d: Optional[Decimal] = None
    sample_size: int = 1


class CropTrendResponse(BaseModel):
    crop_id: int
    crop_name: str
    period_days: int
    current_modal_price: Decimal
    price_change_amount: Decimal
    price_change_percent: Decimal
    price_volatility_index: float
    sentiment: str  # Bullish, Bearish, Steady
    data_points: List[CropTrendPoint]
    data_source_summary: Dict[str, Any]


class LatestPriceItem(BaseModel):
    price_id: int
    crop_id: int
    crop_name: str
    category: str
    market_id: int
    market_name: str
    district: str
    state: str
    modal_price: Decimal
    min_price: Decimal
    max_price: Decimal
    demand_level: DemandLevel
    recorded_at: datetime
    ingested_at: datetime
    source: str
    is_mock: bool
    change_24h_amount: Decimal = Decimal("0.00")
    change_24h_percent: Decimal = Decimal("0.00")


class LatestMarketPricesResponse(BaseModel):
    total: int
    source_summary: Dict[str, Any]
    items: List[LatestPriceItem]
