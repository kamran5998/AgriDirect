"""Farmer Decision Support and Market Recommendation API Router.
Generates explainable mandi rankings, net revenue projections after road logistics,
and transparent Opportunity Score breakdowns.
"""

from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationMethodology,
)
from app.services.recommendation_engine import RecommendationEngine

router = APIRouter(prefix="/recommendations", tags=["Farmer Decision Support & Recommendations"])


@router.post(
    "/evaluate",
    response_model=RecommendationResponse,
    summary="Evaluate selling opportunities across APMC mandis with custom quantity and location"
)
def evaluate_market_recommendations(
    payload: RecommendationRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Evaluates commodity selling options across regional APMC mandis:
    - **Ranked Market Opportunities** with Opportunity Score (0-100)
    - **Farm-Gate Net Revenue** (Gross price minus road freight deduction)
    - **Comparative Explanations** (Highlighting price premium, liquidity, and transit trade-offs)
    - **Demand & Momentum Indicators**
    - **Transparent Scoring Methodology** (30% Price, 25% Net Rev, 20% Demand, 15% Momentum, 10% Stability)
    """
    return RecommendationEngine.evaluate_selling_opportunities(
        db=db,
        req=payload
    )


@router.get(
    "/markets",
    response_model=RecommendationResponse,
    summary="Get market recommendations via query parameters"
)
def get_market_recommendations_query(
    crop_id: int = Query(..., description="Crop ID to evaluate"),
    quantity_quintals: Decimal = Query(Decimal("50.0"), ge=0.1, description="Lot quantity in Quintals"),
    farmer_district: Optional[str] = Query(None, description="Farmer origin district (e.g. Sehore, Indore, Bhopal)"),
    farmer_state: Optional[str] = Query("Madhya Pradesh", description="Farmer origin state"),
    max_distance_km: Optional[float] = Query(None, description="Maximum travel radius in km"),
    db: Session = Depends(get_db)
):
    """
    Quick GET endpoint to retrieve ranked market recommendations for a crop and lot volume.
    """
    req = RecommendationRequest(
        crop_id=crop_id,
        quantity_quintals=quantity_quintals,
        farmer_district=farmer_district,
        farmer_state=farmer_state,
        max_distance_km=max_distance_km
    )
    return RecommendationEngine.evaluate_selling_opportunities(
        db=db,
        req=req
    )


@router.get(
    "/methodology",
    response_model=RecommendationMethodology,
    summary="Get transparent Market Opportunity Score methodology and weighting documentation"
)
def get_recommendation_methodology():
    """
    Returns the complete documented formulation, factor weights, and score classification bands.
    """
    return RecommendationMethodology(
        title="AgriDirect Multi-Factor Opportunity Scoring Methodology",
        description=(
            "The Market Opportunity Score (0-100) provides a transparent, explainable decision benchmark "
            "evaluating 5 key economic pillars for agricultural producers."
        ),
        weights={
            "Spot Price Premium": 30.0,
            "Net Farm-Gate Realization": 25.0,
            "Buyer Demand & Liquidity": 20.0,
            "7-Day Price Momentum": 15.0,
            "Price Stability": 10.0,
        },
        formula="MOS = (0.30 * S_price) + (0.25 * S_net_revenue) + (0.20 * S_demand) + (0.15 * S_trend) + (0.10 * S_stability)",
        rating_scale={
            "80 - 100": "Exceptional Opportunity (High price premium, strong demand liquidity, optimal net revenue)",
            "65 - 79": "Favorable Opportunity (Above-average returns with low transaction friction)",
            "50 - 64": "Moderate Opportunity (Standard baseline regional return)",
            "< 50": "Unfavorable Opportunity (Sub-par net realization or high transport penalty)",
        },
        disclaimer=(
            "All recommendations and revenue projections are decision-support estimates. "
            "They do not constitute guaranteed financial returns or binding price commitments."
        )
    )
