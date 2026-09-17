"""AgriDirect Analytics API Router.
Exposes specialized statistical and market intelligence endpoints for KPI cards,
trend charts, regional heatmaps, commodity volatility, and explainable opportunity scores.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.analytics import (
    PriceSummaryResponse,
    PriceTrendAnalysisResponse,
    MarketComparisonAnalyticsResponse,
    CropAnalysisResponse,
    RegionalAnalysisResponse,
    MarketOpportunityScoreResponse,
)
from app.services.analytics_service import AnalyticsEngine

router = APIRouter(prefix="/analytics", tags=["Agricultural Analytics Engine"])


@router.get(
    "/price-summary",
    response_model=PriceSummaryResponse,
    summary="Get comprehensive price summary statistics and KPI cards"
)
def get_price_summary(
    crop_id: int = Query(..., description="Crop ID to analyze"),
    market_id: Optional[int] = Query(None, description="Optional APMC Mandi ID"),
    days: int = Query(30, ge=1, le=365, description="Timeframe window in days (e.g. 7, 30, 90)"),
    db: Session = Depends(get_db)
):
    """
    Computes summary price statistics:
    - Current spot price
    - Arithmetic mean price
    - Minimum and maximum price bounds
    - Absolute price spread
    - Price change percentage over window
    - Standard deviation
    - Pre-formatted KPI card objects for frontend dashboard
    """
    return AnalyticsEngine.get_price_summary(
        db=db,
        crop_id=crop_id,
        market_id=market_id,
        days=days
    )


@router.get(
    "/price-trends",
    response_model=PriceTrendAnalysisResponse,
    summary="Get multi-timeframe price trend analysis and momentum classification"
)
def get_price_trends(
    crop_id: int = Query(..., description="Crop ID to analyze"),
    market_id: Optional[int] = Query(None, description="Optional APMC Mandi ID"),
    db: Session = Depends(get_db)
):
    """
    Analyzes price momentum across multiple timeframes:
    - Daily trend (24h)
    - Weekly trend (7d)
    - Monthly trend (30d)
    - Overall trajectory classification (Rising, Falling, Stable)
    - Price velocity (₹/day) and momentum score (-100 to +100)
    - 7-day and 30-day moving average time-series points
    """
    return AnalyticsEngine.get_price_trends(
        db=db,
        crop_id=crop_id,
        market_id=market_id
    )


@router.get(
    "/market-comparison",
    response_model=MarketComparisonAnalyticsResponse,
    summary="Compare markets for a crop with arbitrage and demand analytics"
)
def get_market_comparison(
    crop_id: int = Query(..., description="Crop ID to compare across regional APMC yards"),
    db: Session = Depends(get_db)
):
    """
    Compares commodity prices across all active APMC mandis for a given crop:
    - Current spot price vs. regional benchmark average
    - Mandi historical average and recent price changes
    - Buyer demand level and arrival liquidity
    - Net arbitrage spread and percentage premium
    - Ranked list of highest-paying mandis
    """
    return AnalyticsEngine.get_market_comparison(
        db=db,
        crop_id=crop_id
    )


@router.get(
    "/crop-analysis",
    response_model=CropAnalysisResponse,
    summary="Get cross-commodity portfolio analytics, volatility index, and demand trends"
)
def get_crop_analysis(
    db: Session = Depends(get_db)
):
    """
    Portfolio-wide commodity analysis across all tracked crops:
    - Crop-wise average and current modal prices
    - Price volatility index (% standard deviation)
    - Demand level distribution and momentum trend
    - Market performance classification (Outperforming, Neutral, Lagging)
    - Category-level price benchmarks
    - Top gainers and highest volatility crops
    """
    return AnalyticsEngine.get_crop_analysis(db=db)


@router.get(
    "/regional-analysis",
    response_model=RegionalAnalysisResponse,
    summary="Get state and district geographic price distribution and market activity"
)
def get_regional_analysis(
    db: Session = Depends(get_db)
):
    """
    Regional agricultural market intelligence:
    - State-wise active mandi counts, commodities tracked, and activity scores
    - District-wise price spreads and index vs. state baseline
    - Regional timeseries trends
    - Geographic price divergence coefficient of variation (%)
    """
    return AnalyticsEngine.get_regional_analysis(db=db)


@router.get(
    "/opportunity-score",
    response_model=MarketOpportunityScoreResponse,
    summary="Calculate explainable Market Opportunity Score (MOS) for a crop at a target mandi"
)
def get_opportunity_score(
    crop_id: int = Query(..., description="Crop ID"),
    market_id: int = Query(..., description="Target APMC Mandi ID"),
    db: Session = Depends(get_db)
):
    """
    Calculates an EXPLAINABLE Market Opportunity Score (0-100) based on four transparent pillars:
    1. **Price Premium Factor (35% weight)**: Spot price vs regional benchmark
    2. **Price Momentum Factor (25% weight)**: 7-day price percentage change
    3. **Demand Strength Factor (25% weight)**: Trading liquidity and arrival demand
    4. **Price Stability Factor (15% weight)**: Inverse price volatility
    
    Includes detailed factor score breakdowns, mathematical documentation,
    actionable farmer recommendations, and a ranked leaderboard of alternative mandis.
    """
    return AnalyticsEngine.calculate_opportunity_score(
        db=db,
        crop_id=crop_id,
        market_id=market_id
    )
