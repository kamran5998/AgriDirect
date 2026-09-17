"""Pydantic schemas for the Farmer Decision Support and Market Recommendation Engine."""

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


class RecommendationRequest(BaseModel):
    crop_id: int = Field(..., description="Crop ID to evaluate")
    quantity_quintals: Decimal = Field(default=Decimal("50.0"), ge=0.1, description="Lot quantity in Quintals")
    farmer_district: Optional[str] = Field(default=None, description="Farmer origin district for distance calculation")
    farmer_state: Optional[str] = Field(default=None, description="Farmer origin state")
    max_distance_km: Optional[float] = Field(default=None, description="Maximum travel radius in km")
    preferred_payment_mode: Optional[str] = Field(default="Any", description="Instant UPI, RTGS/NEFT, or Cash")


class RecommendationFactorScore(BaseModel):
    factor_name: str
    score: float = Field(..., description="Factor score out of 100")
    weight_percentage: float = Field(..., description="Weight percentage in MOS formula")
    weighted_score: float = Field(..., description="Weighted score contribution")
    explanation: str


class MarketRecommendationCard(BaseModel):
    rank: int
    market_id: int
    market_name: str
    district: str
    state: str
    distance_km: float = Field(..., description="Estimated distance from farmer origin")
    opportunity_score: float = Field(..., description="Explainable opportunity score (0-100)")
    opportunity_rating: str = Field(..., description="'Exceptional', 'Favorable', 'Moderate', 'Unfavorable'")
    badge_label: Optional[str] = Field(None, description="e.g. 'Top Net Return', 'Best Price', 'Nearest Mandi'")
    
    # Pricing & Revenue
    spot_price_per_qtl: Decimal
    price_diff_vs_benchmark: Decimal
    price_diff_percent: Decimal
    estimated_freight_per_qtl: Decimal
    net_price_per_qtl: Decimal
    total_gross_value: Decimal
    total_freight_cost: Decimal
    total_net_realization: Decimal
    
    # Indicators
    demand_level: str  # "Surge", "High", "Moderate", "Low"
    trend_direction: str  # "Rising", "Falling", "Stable"
    trend_rate_pct: Decimal
    price_stability_rating: str  # "High Stability", "Moderate", "Volatile"
    
    # Transparent Reasons
    key_reasons: List[str] = Field(..., description="Human-readable bullet points explaining why this market ranked here")
    summary_explanation: str = Field(..., description="Concise narrative explanation of market superiority")
    factor_breakdown: Dict[str, RecommendationFactorScore]


class RecommendationMethodology(BaseModel):
    title: str
    description: str
    weights: Dict[str, float]
    formula: str
    rating_scale: Dict[str, str]
    disclaimer: str


class RecommendationResponse(BaseModel):
    status: str = "SUCCESS"
    crop_id: int
    crop_name: str
    quantity_quintals: Decimal
    farmer_location: str
    regional_benchmark_spot_price: Decimal
    regional_benchmark_net_price: Decimal
    total_markets_evaluated: int
    top_recommended_market: Optional[str] = None
    max_additional_income: Decimal = Field(..., description="Additional net earnings choosing #1 vs lowest market")
    recommendations: List[MarketRecommendationCard]
    methodology: RecommendationMethodology
    disclaimer: str = Field(
        default=(
            "Advisory Notice: Opportunity rankings and revenue projections are decision-support estimates based on "
            "prevailing APMC prices, estimated road freight, and historical arrival liquidity. "
            "They do not constitute guaranteed financial returns or binding price commitments."
        )
    )
