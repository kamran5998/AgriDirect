"""Decision Support and Market Recommendation Engine for Agricultural Producers.
Evaluates selling opportunities across APMC Mandis using spot prices, estimated freight logistics,
demand liquidity, price momentum trends, and explainable multi-factor scoring.
"""

import math
import logging
from decimal import Decimal
from typing import List, Dict, Any, Optional, Tuple

try:
    from sqlalchemy.orm import Session, joinedload
    from sqlalchemy import desc, func
    from app.models.market import Market, MarketPrice, DemandLevel
    from app.models.crop import Crop
except ImportError:
    Session = Any
    joinedload = lambda *args: None
    desc = lambda *args: None
    func = Any
    Market = None
    MarketPrice = None
    DemandLevel = None
    Crop = None

from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    MarketRecommendationCard,
    RecommendationFactorScore,
    RecommendationMethodology,
)
from app.utils.exceptions import NotFoundException

logger = logging.getLogger(__name__)

# Approximate inter-district distance matrix (in km) for major agricultural hubs
DISTRICT_DISTANCES: Dict[str, Dict[str, float]] = {
    "indore": {"indore": 12.0, "dewas": 38.0, "ujjain": 55.0, "dhar": 65.0, "sehore": 140.0, "bhopal": 185.0, "khandwa": 130.0, "khargone": 145.0},
    "sehore": {"sehore": 15.0, "bhopal": 38.0, "dewas": 115.0, "indore": 140.0, "hoshangabad": 75.0, "raisen": 85.0, "ujjain": 165.0},
    "ujjain": {"ujjain": 10.0, "dewas": 35.0, "indore": 55.0, "ratlam": 95.0, "mandsaur": 150.0, "shajapur": 65.0, "agar": 70.0},
    "dewas": {"dewas": 12.0, "indore": 38.0, "ujjain": 35.0, "shajapur": 55.0, "sehore": 115.0, "bhopal": 150.0},
    "bhopal": {"bhopal": 12.0, "sehore": 38.0, "raisen": 45.0, "vidisha": 55.0, "hoshangabad": 70.0, "dewas": 150.0, "indore": 185.0},
    "nashik": {"nashik": 15.0, "lasalgaon": 60.0, "pimpalgaon": 30.0, "yeola": 85.0, "malegaon": 105.0, "pune": 210.0, "mumbai": 170.0},
    "guntur": {"guntur": 15.0, "vijayawada": 35.0, "tenali": 30.0, "narasaraopet": 48.0, "ongole": 115.0, "hyderabad": 270.0},
    "bathinda": {"bathinda": 15.0, "mansa": 50.0, "moga": 70.0, "muktsar": 55.0, "faridkot": 65.0, "ludhiana": 135.0},
    "kota": {"kota": 15.0, "baran": 70.0, "bundi": 40.0, "jhalawar": 85.0, "jaipur": 240.0},
}


def estimate_mandi_distance(farmer_district: Optional[str], farmer_state: Optional[str], market_district: str, market_state: str) -> float:
    """Estimates road transit distance in kilometers between farmer location and mandi yard."""
    if not farmer_district:
        return 25.0  # Default reasonable regional radius

    f_dist = farmer_district.strip().lower()
    m_dist = market_district.strip().lower()

    if f_dist == m_dist:
        return 15.0  # Within same home district

    # Check known matrix
    if f_dist in DISTRICT_DISTANCES and m_dist in DISTRICT_DISTANCES[f_dist]:
        return DISTRICT_DISTANCES[f_dist][m_dist]
    if m_dist in DISTRICT_DISTANCES and f_dist in DISTRICT_DISTANCES[m_dist]:
        return DISTRICT_DISTANCES[m_dist][f_dist]

    # Geographic heuristics
    if farmer_state and farmer_state.strip().lower() == market_state.strip().lower():
        return 85.0  # Neighboring district within same state
    return 240.0  # Interstate transit


def calculate_freight_cost_per_qtl(distance_km: float) -> Decimal:
    """
    Calculates estimated road freight cost per quintal based on standard rural commercial vehicle rates:
    Base loading fee + ₹1.60 per quintal per km, capped reasonably.
    """
    if distance_km <= 15.0:
        return Decimal("15.00")  # Flat local tractor/trolley charge
    
    rate = 15.0 + ((distance_km - 15.0) * 1.35)
    clamped_rate = min(140.0, max(15.0, rate))
    return Decimal(str(round(clamped_rate, 2)))


class RecommendationEngine:
    """Core decision support engine translating market intelligence into ranked actionable selling options."""

    @classmethod
    def evaluate_selling_opportunities(
        cls,
        db: Session,
        req: RecommendationRequest
    ) -> RecommendationResponse:
        """
        Processes multi-factor market intelligence to generate ranked, explainable market recommendations.
        """
        crop = db.query(Crop).filter(Crop.id == req.crop_id).first()
        if not crop:
            raise NotFoundException(detail=f"Crop with ID {req.crop_id} not found")

        # 1. Fetch latest prices across all mandis for this crop
        subquery = (
            db.query(
                MarketPrice.market_id,
                func.max(MarketPrice.recorded_at).label("max_recorded_at")
            )
            .filter(MarketPrice.crop_id == req.crop_id)
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
            .join(MarketPrice.market)
            .options(joinedload(MarketPrice.market))
            .filter(MarketPrice.crop_id == req.crop_id)
            .all()
        )

        if not latest_prices:
            # Return empty baseline
            return cls._generate_fallback_response(crop, req)

        # 2. Compute regional benchmark averages
        all_spot_prices = [Decimal(str(p.price)) for p in latest_prices]
        benchmark_spot = round(sum(all_spot_prices) / Decimal(len(all_spot_prices)), 2)

        # 3. Process each market's indicators, logistics, and multi-factor scores
        raw_market_cards: List[MarketRecommendationCard] = []

        for p in latest_prices:
            m = p.market
            dist_km = estimate_mandi_distance(
                farmer_district=req.farmer_district,
                farmer_state=req.farmer_state,
                market_district=m.district,
                market_state=m.state
            )

            if req.max_distance_km and dist_km > req.max_distance_km:
                continue

            freight_per_qtl = calculate_freight_cost_per_qtl(dist_km)
            net_price_per_qtl = round(p.price - freight_per_qtl, 2)
            gross_val = round(p.price * req.quantity_quintals, 2)
            freight_tot = round(freight_per_qtl * req.quantity_quintals, 2)
            net_realization = round(gross_val - freight_tot, 2)

            price_diff_qtl = round(p.price - benchmark_spot, 2)
            price_diff_pct = round((price_diff_qtl / benchmark_spot) * Decimal("100.00"), 2) if benchmark_spot > 0 else Decimal("0.00")

            # Fetch recent price history for trend & momentum
            history_rows = (
                db.query(MarketPrice.price)
                .filter(MarketPrice.crop_id == req.crop_id, MarketPrice.market_id == m.id)
                .order_by(MarketPrice.recorded_at.desc())
                .limit(7)
                .all()
            )
            hist_prices = [Decimal(str(h[0])) for h in history_rows]
            if len(hist_prices) >= 2:
                prev_p = hist_prices[-1]
                trend_delta = round(p.price - prev_p, 2)
                trend_pct = round((trend_delta / prev_p) * Decimal("100.00"), 2) if prev_p > 0 else Decimal("0.00")
            else:
                trend_delta = Decimal("0.00")
                trend_pct = Decimal("0.00")

            if trend_pct >= Decimal("1.50"):
                trend_dir = "Rising"
            elif trend_pct <= Decimal("-1.50"):
                trend_dir = "Falling"
            else:
                trend_dir = "Stable"

            demand_str = p.demand_level.value if hasattr(p.demand_level, "value") else str(p.demand_level)

            # Volatility
            if len(hist_prices) > 1:
                h_mean = float(sum(hist_prices) / len(hist_prices))
                h_var = sum((float(v) - h_mean) ** 2 for v in hist_prices) / (len(hist_prices) - 1)
                h_std = math.sqrt(h_var)
                vol_pct = (h_std / h_mean) * 100.0 if h_mean > 0 else 1.0
            else:
                vol_pct = 2.0

            if vol_pct <= 3.0:
                stability_str = "High Stability"
            elif vol_pct <= 8.0:
                stability_str = "Moderate"
            else:
                stability_str = "Volatile"

            # -------------------------------------------------------------
            # Multi-Pillar Scoring Calculation
            # -------------------------------------------------------------
            # Factor 1: Current Spot Price vs. Benchmark (Weight: 30%)
            raw_s1 = 50.0 + (float(price_diff_pct) / 15.0) * 50.0
            s_price = max(0.0, min(100.0, round(raw_s1, 1)))

            # Factor 2: Net Realization after Freight vs. Benchmark (Weight: 25%)
            net_diff_pct = float(price_diff_pct) - (float(freight_per_qtl) / float(benchmark_spot) * 100.0)
            raw_s2 = 50.0 + (net_diff_pct / 15.0) * 50.0
            s_net = max(0.0, min(100.0, round(raw_s2, 1)))

            # Factor 3: Demand Liquidity (Weight: 20%)
            demand_score_map = {"Surge": 100.0, "High": 80.0, "Moderate": 55.0, "Low": 25.0}
            s_demand = demand_score_map.get(demand_str, 55.0)

            # Factor 4: Price Momentum & Trend (Weight: 15%)
            raw_s4 = 50.0 + (float(trend_pct) * 5.0)
            s_trend = max(0.0, min(100.0, round(raw_s4, 1)))

            # Factor 5: Price Stability (Weight: 10%)
            s_stability = max(0.0, min(100.0, round(100.0 - (vol_pct * 5.0), 1)))

            # Composite Explainable Opportunity Score
            total_mos = round(
                (0.30 * s_price) +
                (0.25 * s_net) +
                (0.20 * s_demand) +
                (0.15 * s_trend) +
                (0.10 * s_stability),
                1
            )

            # Rating Band
            if total_mos >= 80.0:
                opp_rating = "Exceptional"
            elif total_mos >= 65.0:
                opp_rating = "Favorable"
            elif total_mos >= 50.0:
                opp_rating = "Moderate"
            else:
                opp_rating = "Unfavorable"

            # Transparent Factor Breakdown
            factors: Dict[str, RecommendationFactorScore] = {
                "spot_price_premium": RecommendationFactorScore(
                    factor_name="Spot Price Premium vs. Benchmark",
                    score=s_price,
                    weight_percentage=30.0,
                    weighted_score=round(0.30 * s_price, 2),
                    explanation=f"Spot price of ₹{p.price}/q is {price_diff_pct:+.1f}% vs regional benchmark (₹{benchmark_spot}/q)."
                ),
                "net_farm_gate_realization": RecommendationFactorScore(
                    factor_name="Net Realization after Freight",
                    score=s_net,
                    weight_percentage=25.0,
                    weighted_score=round(0.25 * s_net, 2),
                    explanation=f"Estimated freight of ₹{freight_per_qtl}/q ({dist_km:.0f} km) yields net ₹{net_price_per_qtl}/q."
                ),
                "demand_liquidity": RecommendationFactorScore(
                    factor_name="Buyer Demand & Auction Velocity",
                    score=s_demand,
                    weight_percentage=20.0,
                    weighted_score=round(0.20 * s_demand, 2),
                    explanation=f"Active {demand_str} demand ensures competitive bidding and prompt settlement."
                ),
                "price_momentum": RecommendationFactorScore(
                    factor_name="7-Day Price Trajectory",
                    score=s_trend,
                    weight_percentage=15.0,
                    weighted_score=round(0.15 * s_trend, 2),
                    explanation=f"Recent 7-day price direction is {trend_dir} ({trend_pct:+.1f}%)."
                ),
                "price_stability": RecommendationFactorScore(
                    factor_name="Price Predictability",
                    score=s_stability,
                    weight_percentage=10.0,
                    weighted_score=round(0.10 * s_stability, 2),
                    explanation=f"Price dispersion is {stability_str} ({vol_pct:.1f}% variation)."
                ),
            }

            # Generate Human-Readable Key Reasons
            reasons = []
            if price_diff_qtl > 0:
                reasons.append(f"Offers a ₹{price_diff_qtl:+.2f}/Qtl premium ({price_diff_pct:+.1f}%) above regional benchmark")
            elif price_diff_qtl == 0:
                reasons.append("Matches prevailing regional benchmark price")
            else:
                reasons.append(f"Trades ₹{abs(price_diff_qtl):.2f}/Qtl below regional benchmark")

            if demand_str in ("Surge", "High"):
                reasons.append(f"Strong {demand_str} buyer demand ensures rapid auction settlement and high liquidity")
            elif demand_str == "Moderate":
                reasons.append("Steady commercial absorption with moderate arrival volume")
            else:
                reasons.append("Slower trading velocity with limited active buyer bidding")

            if dist_km <= 25.0:
                reasons.append(f"Close transit distance ({dist_km:.0f} km) saves ₹{freight_per_qtl}/Qtl in transport cost")
            else:
                reasons.append(f"Road transit of {dist_km:.0f} km costs estimated ₹{freight_per_qtl}/Qtl in transport")

            if trend_dir == "Rising":
                reasons.append(f"Upward price trajectory ({trend_pct:+.1f}% over 7 days)")

            summary_text = (
                f"{m.name} offers a spot rate of ₹{p.price}/Qtl ({price_diff_pct:+.1f}% vs. regional average). "
                f"With {demand_str} demand and estimated transit of {dist_km:.0f} km (freight ₹{freight_per_qtl}/Qtl), "
                f"estimated net return on {req.quantity_quintals}q is ₹{net_realization:,.2f}."
            )

            raw_market_cards.append(
                MarketRecommendationCard(
                    rank=0,
                    market_id=m.id,
                    market_name=m.name,
                    district=m.district,
                    state=m.state,
                    distance_km=dist_km,
                    opportunity_score=total_mos,
                    opportunity_rating=opp_rating,
                    badge_label=None,
                    spot_price_per_qtl=p.price,
                    price_diff_vs_benchmark=price_diff_qtl,
                    price_diff_percent=price_diff_pct,
                    estimated_freight_per_qtl=freight_per_qtl,
                    net_price_per_qtl=net_price_per_qtl,
                    total_gross_value=gross_val,
                    total_freight_cost=freight_tot,
                    total_net_realization=net_realization,
                    demand_level=demand_str,
                    trend_direction=trend_dir,
                    trend_rate_pct=trend_pct,
                    price_stability_rating=stability_str,
                    key_reasons=reasons,
                    summary_explanation=summary_text,
                    factor_breakdown=factors
                )
            )

        # Sort primarily by Opportunity Score descending
        raw_market_cards.sort(key=lambda x: x.opportunity_score, reverse=True)

        for i, card in enumerate(raw_market_cards):
            card.rank = i + 1

        # Assign badges for top performers
        if raw_market_cards:
            raw_market_cards[0].badge_label = "Top Recommendation"

            # Find best gross price
            highest_spot = max(raw_market_cards, key=lambda c: c.spot_price_per_qtl)
            if highest_spot.rank != 1:
                highest_spot.badge_label = "Highest Spot Price"

            # Find nearest
            nearest = min(raw_market_cards, key=lambda c: c.distance_km)
            if nearest.rank != 1 and not nearest.badge_label:
                nearest.badge_label = "Nearest Mandi"

        top_market_name = raw_market_cards[0].market_name if raw_market_cards else None
        
        # Additional income comparing #1 vs worst market
        if len(raw_market_cards) > 1:
            max_gain = round(raw_market_cards[0].total_net_realization - raw_market_cards[-1].total_net_realization, 2)
            max_gain = max(Decimal("0.00"), max_gain)
        else:
            max_gain = Decimal("0.00")

        all_net = [c.net_price_per_qtl for c in raw_market_cards]
        bench_net = round(sum(all_net) / Decimal(len(all_net)), 2) if all_net else benchmark_spot

        farmer_loc_str = f"{req.farmer_district or 'Central'}, {req.farmer_state or 'MP'}"

        methodology = RecommendationMethodology(
            title="Multi-Factor Opportunity Scoring Methodology",
            description=(
                "The Market Opportunity Score (0-100) measures selling attractiveness by synthesizing "
                "5 transparent pillars: Spot Price Premium (30%), Net Realization after Freight (25%), "
                "Buyer Demand & Liquidity (20%), 7-Day Price Momentum (15%), and Price Stability (10%)."
            ),
            weights={
                "Spot Price Premium": 30.0,
                "Net Realization after Freight": 25.0,
                "Demand & Liquidity": 20.0,
                "Price Momentum": 15.0,
                "Price Stability": 10.0,
            },
            formula="MOS = 0.30*Price + 0.25*NetRev + 0.20*Demand + 0.15*Momentum + 0.10*Stability",
            rating_scale={
                "80 - 100": "Exceptional Opportunity (High premium, strong liquidity)",
                "65 - 79": "Favorable Opportunity (Solid returns, low friction)",
                "50 - 64": "Moderate Opportunity (Average baseline returns)",
                "< 50": "Unfavorable Opportunity (Sub-par realizations or high transit cost)",
            },
            disclaimer=(
                "All scores and revenue estimates are mathematical decision-support projections "
                "based on reported APMC arrival prices and estimated freight costs. They do not constitute financial guarantees."
            )
        )

        return RecommendationResponse(
            status="SUCCESS",
            crop_id=crop.id,
            crop_name=crop.name,
            quantity_quintals=req.quantity_quintals,
            farmer_location=farmer_loc_str,
            regional_benchmark_spot_price=benchmark_spot,
            regional_benchmark_net_price=bench_net,
            total_markets_evaluated=len(raw_market_cards),
            top_recommended_market=top_market_name,
            max_additional_income=max_gain,
            recommendations=raw_market_cards,
            methodology=methodology
        )

    @classmethod
    def _generate_fallback_response(cls, crop: Any, req: RecommendationRequest) -> RecommendationResponse:
        dummy_price = Decimal("2850.00")
        methodology = RecommendationMethodology(
            title="Multi-Factor Opportunity Scoring Methodology",
            description="Multi-factor evaluation engine.",
            weights={"Price": 30.0, "NetRev": 25.0, "Demand": 20.0, "Momentum": 15.0, "Stability": 10.0},
            formula="MOS = 0.30*Price + 0.25*NetRev + 0.20*Demand + 0.15*Momentum + 0.10*Stability",
            rating_scale={"80-100": "Exceptional", "65-79": "Favorable", "50-64": "Moderate", "<50": "Unfavorable"},
            disclaimer="All scores are statistical decision-support estimates."
        )
        return RecommendationResponse(
            status="SUCCESS",
            crop_id=crop.id if hasattr(crop, "id") else req.crop_id,
            crop_name=crop.name if hasattr(crop, "name") else "Commodity",
            quantity_quintals=req.quantity_quintals,
            farmer_location=f"{req.farmer_district or 'Central'}, {req.farmer_state or 'MP'}",
            regional_benchmark_spot_price=dummy_price,
            regional_benchmark_net_price=dummy_price,
            total_markets_evaluated=0,
            top_recommended_market=None,
            max_additional_income=Decimal("0.00"),
            recommendations=[],
            methodology=methodology
        )
