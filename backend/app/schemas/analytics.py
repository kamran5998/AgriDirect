"""Pydantic schemas for the AgriDirect Analytics Engine.
Provides strongly-typed schemas for price analytics, trend classifications,
market arbitrage comparisons, crop volatility, regional intelligence, and explainable opportunity scores.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def model_dump(self, mode: str = "json") -> Dict[str, Any]:
            return self.__dict__

    def Field(default=None, default_factory=None, **kwargs):
        if default_factory is not None:
            return default_factory()
        return default


# ---------------------------------------------------------
# 1. Price Summary Schemas
# ---------------------------------------------------------
class PriceSummaryKPICard(BaseModel):
    title: str
    value: str
    subtext: Optional[str] = None
    change_type: Optional[str] = None  # "positive", "negative", "neutral"
    icon: Optional[str] = None


class PriceSummaryResponse(BaseModel):
    crop_id: int
    crop_name: str
    market_id: Optional[int] = None
    market_name: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    current_price: Decimal = Field(..., description="Latest spot price in ₹/Quintal")
    average_price: Decimal = Field(..., description="Arithmetic mean price in ₹/Quintal")
    min_price: Decimal = Field(..., description="Lowest recorded price in window")
    max_price: Decimal = Field(..., description="Highest recorded price in window")
    price_spread: Decimal = Field(..., description="Difference between maximum and minimum prices")
    price_change_amount: Decimal = Field(..., description="Absolute difference between current and baseline")
    price_change_percent: Decimal = Field(..., description="Percentage change in price over window")
    standard_deviation: float = Field(..., description="Sample standard deviation of prices")
    sample_size: int = Field(..., description="Total price observations analyzed")
    period_days: int = Field(..., description="Analysis window in days")
    kpi_cards: List[PriceSummaryKPICard] = Field(default_factory=list)


# ---------------------------------------------------------
# 2. Price Trend Analysis Schemas
# ---------------------------------------------------------
class TrendPeriodDetail(BaseModel):
    period_name: str  # "Daily (24h)", "Weekly (7d)", "Monthly (30d)"
    change_amount: Decimal
    change_percent: Decimal
    direction: str  # "Rising", "Falling", "Stable"
    velocity_per_day: Decimal  # ₹ change per day


class PriceTrendPoint(BaseModel):
    date: str
    modal_price: Decimal
    min_price: Decimal
    max_price: Decimal
    moving_avg_7d: Optional[Decimal] = None
    moving_avg_30d: Optional[Decimal] = None


class PriceTrendAnalysisResponse(BaseModel):
    crop_id: int
    crop_name: str
    market_id: Optional[int] = None
    market_name: Optional[str] = None
    daily_trend: TrendPeriodDetail
    weekly_trend: TrendPeriodDetail
    monthly_trend: TrendPeriodDetail
    overall_classification: str  # "Rising", "Falling", "Stable"
    momentum_score: float = Field(..., description="Normalized price velocity score (-100 to +100)")
    timeseries: List[PriceTrendPoint] = Field(default_factory=list)


# ---------------------------------------------------------
# 3. Market Comparison Schemas
# ---------------------------------------------------------
class MarketComparisonItem(BaseModel):
    market_id: int
    market_name: str
    district: str
    state: str
    current_price: Decimal
    average_price: Decimal
    min_price: Decimal
    max_price: Decimal
    price_change_amount: Decimal
    price_change_percent: Decimal
    demand_level: str
    market_activity: str  # "High Arrival", "Moderate Arrival", "Low Arrival"
    price_spread_against_benchmark: Decimal
    arbitrage_premium_percent: Decimal
    rank: int


class MarketComparisonAnalyticsResponse(BaseModel):
    crop_id: int
    crop_name: str
    regional_benchmark_price: Decimal
    markets_analyzed_count: int
    highest_price_market: str
    lowest_price_market: str
    max_arbitrage_gain_per_qtl: Decimal
    markets: List[MarketComparisonItem]


# ---------------------------------------------------------
# 4. Crop Analytics Schemas
# ---------------------------------------------------------
class CropAnalyticsItem(BaseModel):
    crop_id: int
    crop_name: str
    category: str
    average_price: Decimal
    current_modal_price: Decimal
    min_recorded_price: Decimal
    max_recorded_price: Decimal
    price_volatility_index: float  # (StdDev / Mean) * 100
    demand_distribution: Dict[str, int]
    demand_trend: str  # "Surging", "Strong", "Steady", "Weak"
    market_performance: str  # "Outperforming", "Neutral", "Lagging"
    active_mandis_count: int


class CropAnalysisResponse(BaseModel):
    total_crops_tracked: int
    crops: List[CropAnalyticsItem]
    category_averages: Dict[str, Decimal]
    top_gainers: List[Dict[str, Any]]
    most_volatile_crops: List[Dict[str, Any]]


# ---------------------------------------------------------
# 5. Regional Analytics Schemas
# ---------------------------------------------------------
class StateActivityItem(BaseModel):
    state: str
    active_markets_count: int
    total_commodities_tracked: int
    average_price_level: Decimal
    primary_driver_crop: str
    activity_score: float  # 0 to 100


class DistrictComparisonItem(BaseModel):
    district: str
    state: str
    active_mandis: int
    average_price: Decimal
    min_price: Decimal
    max_price: Decimal
    price_spread: Decimal
    price_index_vs_state: float  # Percentage of state average


class RegionalTrendPoint(BaseModel):
    date: str
    state: str
    average_price: Decimal


class RegionalAnalysisResponse(BaseModel):
    state_wise_activity: List[StateActivityItem]
    district_wise_comparison: List[DistrictComparisonItem]
    regional_price_trends: List[RegionalTrendPoint]
    regional_divergence_coefficient: float = Field(..., description="Coefficient of variation across states (%)")


# ---------------------------------------------------------
# 6. Market Opportunity Score Schemas (Explainable Scoring)
# ---------------------------------------------------------
class OpportunityFactorScore(BaseModel):
    factor_name: str
    raw_value: Any
    score: float = Field(..., description="Normalized factor score out of 100")
    weight_percentage: float = Field(..., description="Factor weight contribution percentage")
    weighted_score: float = Field(..., description="Calculated contribution to final MOS")
    explanation: str


class MarketOpportunityRankedItem(BaseModel):
    market_id: int
    market_name: str
    district: str
    state: str
    current_price: Decimal
    opportunity_score: float
    opportunity_rating: str
    demand_level: str
    price_premium_percent: Decimal
    rank: int


class MarketOpportunityScoreResponse(BaseModel):
    crop_id: int
    crop_name: str
    market_id: int
    market_name: str
    district: str
    state: str
    opportunity_score: float = Field(..., description="Overall Market Opportunity Score (0-100)")
    opportunity_rating: str = Field(..., description="Rating band: Exceptional, Favorable, Moderate, Unfavorable")
    scoring_formula_documentation: str = Field(..., description="Full mathematical breakdown of scoring factors")
    factor_breakdown: Dict[str, OpportunityFactorScore]
    farmer_recommendation: str
    top_ranked_opportunities: List[MarketOpportunityRankedItem] = Field(default_factory=list)
