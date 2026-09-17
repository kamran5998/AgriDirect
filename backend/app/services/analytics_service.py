"""AgriDirect Agricultural Analytics Engine.
Processes agricultural commodity price distributions, timeseries trends, cross-mandi arbitrage,
crop volatility, regional dynamics, and explainable Market Opportunity Scores (MOS).
"""

import math
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Dict, Any, Optional, Tuple
try:
    from sqlalchemy.orm import Session, joinedload
    from sqlalchemy import desc, func
    from app.models.market import Market, MarketPrice, MarketStatus, DemandLevel
    from app.models.crop import Crop, CropCategory
except ImportError:
    Session = Any
    joinedload = lambda *args: None
    desc = lambda *args: None
    func = Any
    Market = None
    MarketPrice = None
    MarketStatus = None
    DemandLevel = None
    Crop = None
    CropCategory = None
from app.schemas.analytics import (
    PriceSummaryResponse,
    PriceSummaryKPICard,
    PriceTrendAnalysisResponse,
    TrendPeriodDetail,
    PriceTrendPoint,
    MarketComparisonAnalyticsResponse,
    MarketComparisonItem,
    CropAnalysisResponse,
    CropAnalyticsItem,
    RegionalAnalysisResponse,
    StateActivityItem,
    DistrictComparisonItem,
    RegionalTrendPoint,
    MarketOpportunityScoreResponse,
    OpportunityFactorScore,
    MarketOpportunityRankedItem,
)
from app.utils.exceptions import NotFoundException

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Mathematical & Statistical Helper Utilities
# ---------------------------------------------------------------------------
def calculate_mean(values: List[Decimal]) -> Decimal:
    if not values:
        return Decimal("0.00")
    return round(sum(values) / Decimal(len(values)), 2)


def calculate_std_dev(values: List[Decimal], mean: Optional[Decimal] = None) -> float:
    if len(values) <= 1:
        return 0.0
    m = mean if mean is not None else calculate_mean(values)
    variance = sum((float(v) - float(m)) ** 2 for v in values) / (len(values) - 1)
    return round(math.sqrt(variance), 2)


def calculate_moving_average(series: List[Decimal], window_size: int) -> List[Optional[Decimal]]:
    ma: List[Optional[Decimal]] = []
    for i in range(len(series)):
        if i + 1 < window_size:
            # Sub-window average
            sub = series[:i + 1]
            ma.append(round(sum(sub) / Decimal(len(sub)), 2))
        else:
            sub = series[i + 1 - window_size:i + 1]
            ma.append(round(sum(sub) / Decimal(window_size), 2))
    return ma


def classify_trend_direction(change_percent: Decimal) -> str:
    if change_percent >= Decimal("1.50"):
        return "Rising"
    elif change_percent <= Decimal("-1.50"):
        return "Falling"
    return "Stable"


class AnalyticsEngine:
    """Core computational engine for agricultural price intelligence."""

    @staticmethod
    def get_price_summary(
        db: Session,
        crop_id: int,
        market_id: Optional[int] = None,
        days: int = 30
    ) -> PriceSummaryResponse:
        """
        Calculates descriptive statistics for a crop over the selected period:
        mean, min, max, price spread, price change %, and standard deviation.
        """
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        if not crop:
            raise NotFoundException(detail=f"Crop with ID {crop_id} not found")

        market_obj: Optional[Market] = None
        if market_id:
            market_obj = db.query(Market).filter(Market.id == market_id).first()

        cutoff = datetime.utcnow() - timedelta(days=days)
        query = db.query(MarketPrice).filter(
            MarketPrice.crop_id == crop_id,
            MarketPrice.recorded_at >= cutoff
        )
        if market_id:
            query = query.filter(MarketPrice.market_id == market_id)

        prices_records = query.order_by(MarketPrice.recorded_at.asc()).all()

        if not prices_records:
            # Fallback if no recent history exists
            latest_price = Decimal("2850.00")
            return PriceSummaryResponse(
                crop_id=crop.id,
                crop_name=crop.name,
                market_id=market_id,
                market_name=market_obj.name if market_obj else "All Regional Mandis",
                district=market_obj.district if market_obj else None,
                state=market_obj.state if market_obj else None,
                current_price=latest_price,
                average_price=latest_price,
                min_price=latest_price,
                max_price=latest_price,
                price_spread=Decimal("0.00"),
                price_change_amount=Decimal("0.00"),
                price_change_percent=Decimal("0.00"),
                standard_deviation=0.0,
                sample_size=0,
                period_days=days,
                kpi_cards=[
                    PriceSummaryKPICard(title="Current Spot Price", value=f"₹{latest_price}/Qtl", subtext="Baseline", change_type="neutral", icon="DollarSign"),
                    PriceSummaryKPICard(title="Average Price", value=f"₹{latest_price}/Qtl", subtext=f"{days}d Window", change_type="neutral", icon="TrendingUp"),
                    PriceSummaryKPICard(title="Price Range", value=f"₹{latest_price} - ₹{latest_price}", subtext="Spread ₹0", change_type="neutral", icon="BarChart3"),
                ]
            )

        modal_prices = [Decimal(str(r.price)) for r in prices_records]
        current_p = modal_prices[-1]
        baseline_p = modal_prices[0]
        avg_p = calculate_mean(modal_prices)
        min_p = min(modal_prices)
        max_p = max(modal_prices)
        spread = max_p - min_p

        change_amt = round(current_p - baseline_p, 2)
        change_pct = round((change_amt / baseline_p) * Decimal("100.00"), 2) if baseline_p > 0 else Decimal("0.00")
        std_dev = calculate_std_dev(modal_prices, avg_p)

        kpi_cards = [
            PriceSummaryKPICard(
                title="Current Spot Price",
                value=f"₹{current_p}/Qtl",
                subtext=f"{'+' if change_amt >= 0 else ''}₹{change_amt} ({change_pct}%) vs {days}d ago",
                change_type="positive" if change_amt > 0 else ("negative" if change_amt < 0 else "neutral"),
                icon="DollarSign"
            ),
            PriceSummaryKPICard(
                title="Period Average Price",
                value=f"₹{avg_p}/Qtl",
                subtext=f"Std Dev: ±₹{std_dev}",
                change_type="neutral",
                icon="TrendingUp"
            ),
            PriceSummaryKPICard(
                title="Price Range",
                value=f"₹{min_p} - ₹{max_p}",
                subtext=f"Spread: ₹{spread}/Qtl",
                change_type="neutral",
                icon="BarChart3"
            ),
            PriceSummaryKPICard(
                title="Market Activity",
                value=f"{len(prices_records)} Reports",
                subtext=f"Across {days} days tracked",
                change_type="neutral",
                icon="Activity"
            ),
        ]

        return PriceSummaryResponse(
            crop_id=crop.id,
            crop_name=crop.name,
            market_id=market_id,
            market_name=market_obj.name if market_obj else "All Regional Mandis",
            district=market_obj.district if market_obj else None,
            state=market_obj.state if market_obj else None,
            current_price=current_p,
            average_price=avg_p,
            min_price=min_p,
            max_price=max_p,
            price_spread=spread,
            price_change_amount=change_amt,
            price_change_percent=change_pct,
            standard_deviation=std_dev,
            sample_size=len(prices_records),
            period_days=days,
            kpi_cards=kpi_cards
        )

    @staticmethod
    def get_price_trends(
        db: Session,
        crop_id: int,
        market_id: Optional[int] = None
    ) -> PriceTrendAnalysisResponse:
        """
        Computes multi-timeframe price trends (Daily, Weekly, Monthly)
        and classifies momentum trajectory.
        """
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        if not crop:
            raise NotFoundException(detail=f"Crop with ID {crop_id} not found")

        market_obj = db.query(Market).filter(Market.id == market_id).first() if market_id else None

        # Fetch up to 60 days of historical data
        cutoff = datetime.utcnow() - timedelta(days=60)
        query = db.query(
            func.date(MarketPrice.recorded_at).label("record_date"),
            func.avg(MarketPrice.price).label("avg_modal"),
            func.min(MarketPrice.min_price).label("min_p"),
            func.max(MarketPrice.max_price).label("max_p")
        ).filter(
            MarketPrice.crop_id == crop_id,
            MarketPrice.recorded_at >= cutoff
        )
        if market_id:
            query = query.filter(MarketPrice.market_id == market_id)

        rows = query.group_by(func.date(MarketPrice.recorded_at)).order_by(func.date(MarketPrice.recorded_at).asc()).all()

        if not rows:
            dummy_p = Decimal("2850.00")
            dummy_trend = TrendPeriodDetail(period_name="Daily (24h)", change_amount=Decimal("0.00"), change_percent=Decimal("0.00"), direction="Stable", velocity_per_day=Decimal("0.00"))
            return PriceTrendAnalysisResponse(
                crop_id=crop.id,
                crop_name=crop.name,
                market_id=market_id,
                market_name=market_obj.name if market_obj else "Regional Mandis",
                daily_trend=dummy_trend,
                weekly_trend=dummy_trend,
                monthly_trend=dummy_trend,
                overall_classification="Stable",
                momentum_score=0.0,
                timeseries=[]
            )

        modal_series = [Decimal(str(r.avg_modal)) for r in rows]
        min_series = [Decimal(str(r.min_p)) for r in rows]
        max_series = [Decimal(str(r.max_p)) for r in rows]
        dates = [str(r.record_date) for r in rows]

        ma7 = calculate_moving_average(modal_series, 7)
        ma30 = calculate_moving_average(modal_series, 30)

        timeseries_points = []
        for i in range(len(rows)):
            timeseries_points.append(
                PriceTrendPoint(
                    date=dates[i],
                    modal_price=round(modal_series[i], 2),
                    min_price=round(min_series[i], 2),
                    max_price=round(max_series[i], 2),
                    moving_avg_7d=ma7[i],
                    moving_avg_30d=ma30[i]
                )
            )

        current_p = modal_series[-1]

        # 1. Daily Trend (last 1-2 days)
        prev_daily = modal_series[-2] if len(modal_series) >= 2 else current_p
        daily_amt = round(current_p - prev_daily, 2)
        daily_pct = round((daily_amt / prev_daily) * Decimal("100.00"), 2) if prev_daily > 0 else Decimal("0.00")
        daily_trend = TrendPeriodDetail(
            period_name="Daily (24h)",
            change_amount=daily_amt,
            change_percent=daily_pct,
            direction=classify_trend_direction(daily_pct),
            velocity_per_day=daily_amt
        )

        # 2. Weekly Trend (last 7 days)
        idx_7d = max(0, len(modal_series) - 7)
        prev_weekly = modal_series[idx_7d]
        weekly_days = max(1, len(modal_series) - 1 - idx_7d)
        weekly_amt = round(current_p - prev_weekly, 2)
        weekly_pct = round((weekly_amt / prev_weekly) * Decimal("100.00"), 2) if prev_weekly > 0 else Decimal("0.00")
        weekly_trend = TrendPeriodDetail(
            period_name="Weekly (7d)",
            change_amount=weekly_amt,
            change_percent=weekly_pct,
            direction=classify_trend_direction(weekly_pct),
            velocity_per_day=round(weekly_amt / Decimal(weekly_days), 2)
        )

        # 3. Monthly Trend (last 30 days)
        idx_30d = max(0, len(modal_series) - 30)
        prev_monthly = modal_series[idx_30d]
        monthly_days = max(1, len(modal_series) - 1 - idx_30d)
        monthly_amt = round(current_p - prev_monthly, 2)
        monthly_pct = round((monthly_amt / prev_monthly) * Decimal("100.00"), 2) if prev_monthly > 0 else Decimal("0.00")
        monthly_trend = TrendPeriodDetail(
            period_name="Monthly (30d)",
            change_amount=monthly_amt,
            change_percent=monthly_pct,
            direction=classify_trend_direction(monthly_pct),
            velocity_per_day=round(monthly_amt / Decimal(monthly_days), 2)
        )

        # Composite momentum score (-100 to +100)
        momentum = float(weekly_pct * Decimal("5.0"))
        momentum = max(-100.0, min(100.0, momentum))

        # Overall classification based on weekly + monthly confluence
        if weekly_pct >= Decimal("1.5") and monthly_pct >= Decimal("1.0"):
            overall = "Rising"
        elif weekly_pct <= Decimal("-1.5") and monthly_pct <= Decimal("-1.0"):
            overall = "Falling"
        elif weekly_pct >= Decimal("2.5"):
            overall = "Rising"
        elif weekly_pct <= Decimal("-2.5"):
            overall = "Falling"
        else:
            overall = "Stable"

        return PriceTrendAnalysisResponse(
            crop_id=crop.id,
            crop_name=crop.name,
            market_id=market_id,
            market_name=market_obj.name if market_obj else "Regional Mandis",
            daily_trend=daily_trend,
            weekly_trend=weekly_trend,
            monthly_trend=monthly_trend,
            overall_classification=overall,
            momentum_score=round(momentum, 1),
            timeseries=timeseries_points
        )

    @staticmethod
    def get_market_comparison(
        db: Session,
        crop_id: int
    ) -> MarketComparisonAnalyticsResponse:
        """
        Cross-mandi price arbitrage comparison for a crop across all active APMC yards.
        """
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        if not crop:
            raise NotFoundException(detail=f"Crop with ID {crop_id} not found")

        # Subquery to get latest record per market for this crop
        subquery = (
            db.query(
                MarketPrice.market_id,
                func.max(MarketPrice.recorded_at).label("max_recorded_at")
            )
            .filter(MarketPrice.crop_id == crop_id)
            .group_by(MarketPrice.market_id)
            .subquery()
        )

        latest_records = (
            db.query(MarketPrice)
            .join(
                subquery,
                (MarketPrice.market_id == subquery.c.market_id) &
                (MarketPrice.recorded_at == subquery.c.max_recorded_at)
            )
            .join(MarketPrice.market)
            .options(joinedload(MarketPrice.market))
            .filter(MarketPrice.crop_id == crop_id)
            .all()
        )

        if not latest_records:
            return MarketComparisonAnalyticsResponse(
                crop_id=crop.id,
                crop_name=crop.name,
                regional_benchmark_price=Decimal("2850.00"),
                markets_analyzed_count=0,
                highest_price_market="None",
                lowest_price_market="None",
                max_arbitrage_gain_per_qtl=Decimal("0.00"),
                markets=[]
            )

        prices_list = [Decimal(str(r.price)) for r in latest_records]
        benchmark_price = calculate_mean(prices_list)

        items: List[MarketComparisonItem] = []

        for r in latest_records:
            # Query historical mean and baseline for this mandi to get price change
            mandi_history = (
                db.query(MarketPrice.price)
                .filter(MarketPrice.crop_id == crop_id, MarketPrice.market_id == r.market_id)
                .order_by(MarketPrice.recorded_at.desc())
                .limit(7)
                .all()
            )
            hist_prices = [Decimal(str(h[0])) for h in mandi_history]
            mandi_avg = calculate_mean(hist_prices)
            prev_price = hist_prices[-1] if hist_prices else r.price

            chg_amt = round(r.price - prev_price, 2)
            chg_pct = round((chg_amt / prev_price) * Decimal("100.00"), 2) if prev_price > 0 else Decimal("0.00")

            spread_vs_bench = round(r.price - benchmark_price, 2)
            premium_pct = round((spread_vs_bench / benchmark_price) * Decimal("100.00"), 2) if benchmark_price > 0 else Decimal("0.00")

            activity_str = "High Arrival" if r.demand_level in (DemandLevel.SURGE, DemandLevel.HIGH) else ("Moderate Arrival" if r.demand_level == DemandLevel.MODERATE else "Low Arrival")

            items.append(
                MarketComparisonItem(
                    market_id=r.market.id,
                    market_name=r.market.name,
                    district=r.market.district,
                    state=r.market.state,
                    current_price=r.price,
                    average_price=mandi_avg,
                    min_price=r.min_price,
                    max_price=r.max_price,
                    price_change_amount=chg_amt,
                    price_change_percent=chg_pct,
                    demand_level=r.demand_level.value,
                    market_activity=activity_str,
                    price_spread_against_benchmark=spread_vs_bench,
                    arbitrage_premium_percent=premium_pct,
                    rank=0  # Assigned after sorting
                )
            )

        # Sort highest price first
        items.sort(key=lambda x: x.current_price, reverse=True)
        for i, it in enumerate(items):
            it.rank = i + 1

        highest_m = items[0].market_name if items else "N/A"
        lowest_m = items[-1].market_name if items else "N/A"
        max_arbitrage = round(items[0].current_price - items[-1].current_price, 2) if len(items) > 1 else Decimal("0.00")

        return MarketComparisonAnalyticsResponse(
            crop_id=crop.id,
            crop_name=crop.name,
            regional_benchmark_price=benchmark_price,
            markets_analyzed_count=len(items),
            highest_price_market=highest_m,
            lowest_price_market=lowest_m,
            max_arbitrage_gain_per_qtl=max_arbitrage,
            markets=items
        )

    @staticmethod
    def get_crop_analysis(db: Session) -> CropAnalysisResponse:
        """
        Cross-commodity portfolio analytics: volatility index, demand patterns, and market performance.
        """
        crops = db.query(Crop).all()
        crop_items: List[CropAnalyticsItem] = []
        cat_buckets: Dict[str, List[Decimal]] = {}

        for crop in crops:
            prices = (
                db.query(MarketPrice)
                .filter(MarketPrice.crop_id == crop.id)
                .order_by(MarketPrice.recorded_at.desc())
                .limit(100)
                .all()
            )

            if not prices:
                continue

            vals = [Decimal(str(p.price)) for p in prices]
            curr_p = vals[0]
            avg_p = calculate_mean(vals)
            min_p = min(Decimal(str(p.min_price)) for p in prices)
            max_p = max(Decimal(str(p.max_price)) for p in prices)

            std_dev = calculate_std_dev(vals, avg_p)
            volatility_idx = round((std_dev / float(avg_p)) * 100, 2) if avg_p > 0 else 0.0

            # Demand distribution
            demand_counts: Dict[str, int] = {"Surge": 0, "High": 0, "Moderate": 0, "Low": 0}
            mandis_seen = set()
            for p in prices:
                mandis_seen.add(p.market_id)
                dl = p.demand_level.value if hasattr(p.demand_level, "value") else str(p.demand_level)
                demand_counts[dl] = demand_counts.get(dl, 0) + 1

            # Demand trend
            surge_ratio = (demand_counts.get("Surge", 0) + demand_counts.get("High", 0)) / len(prices)
            if surge_ratio >= 0.6:
                demand_trend = "Surging"
            elif surge_ratio >= 0.35:
                demand_trend = "Strong"
            elif surge_ratio >= 0.15:
                demand_trend = "Steady"
            else:
                demand_trend = "Weak"

            # Performance vs baseline
            perf_pct = ((curr_p - avg_p) / avg_p) * Decimal("100.00") if avg_p > 0 else Decimal("0.00")
            if perf_pct >= Decimal("2.0"):
                market_perf = "Outperforming"
            elif perf_pct <= Decimal("-2.0"):
                market_perf = "Lagging"
            else:
                market_perf = "Neutral"

            cat_str = crop.category.value if hasattr(crop.category, "value") else str(crop.category)
            if cat_str not in cat_buckets:
                cat_buckets[cat_str] = []
            cat_buckets[cat_str].append(curr_p)

            crop_items.append(
                CropAnalyticsItem(
                    crop_id=crop.id,
                    crop_name=crop.name,
                    category=cat_str,
                    average_price=avg_p,
                    current_modal_price=curr_p,
                    min_recorded_price=min_p,
                    max_recorded_price=max_p,
                    price_volatility_index=volatility_idx,
                    demand_distribution=demand_counts,
                    demand_trend=demand_trend,
                    market_performance=market_perf,
                    active_mandis_count=len(mandis_seen)
                )
            )

        category_averages: Dict[str, Decimal] = {
            cat: calculate_mean(plist) for cat, plist in cat_buckets.items()
        }

        # Top gainers and most volatile
        gainers = sorted(
            [{"crop_name": c.crop_name, "current_price": float(c.current_modal_price), "change_vs_avg_percent": round(float((c.current_modal_price - c.average_price) / c.average_price * 100), 2)} for c in crop_items if c.average_price > 0],
            key=lambda x: x["change_vs_avg_percent"],
            reverse=True
        )[:5]

        most_volatile = sorted(
            [{"crop_name": c.crop_name, "volatility_index_percent": c.price_volatility_index, "current_price": float(c.current_modal_price)} for c in crop_items],
            key=lambda x: x["volatility_index_percent"],
            reverse=True
        )[:5]

        return CropAnalysisResponse(
            total_crops_tracked=len(crop_items),
            crops=crop_items,
            category_averages=category_averages,
            top_gainers=gainers,
            most_volatile_crops=most_volatile
        )

    @staticmethod
    def get_regional_analysis(db: Session) -> RegionalAnalysisResponse:
        """
        Geographic and administrative market intelligence across Indian States and Mandi Districts.
        """
        markets = db.query(Market).all()
        prices = db.query(MarketPrice).options(joinedload(MarketPrice.market), joinedload(MarketPrice.crop)).all()

        state_groups: Dict[str, List[MarketPrice]] = {}
        district_groups: Dict[str, List[MarketPrice]] = {}

        for p in prices:
            st = p.market.state
            dist = f"{p.market.district}::{p.market.state}"

            if st not in state_groups:
                state_groups[st] = []
            state_groups[st].append(p)

            if dist not in district_groups:
                district_groups[dist] = []
            district_groups[dist].append(p)

        # 1. State activity
        state_items: List[StateActivityItem] = []
        state_avg_prices: List[Decimal] = []

        for st, st_prices in state_groups.items():
            active_mandi_ids = {p.market_id for p in st_prices}
            crops_tracked = {p.crop_id for p in st_prices}
            p_vals = [Decimal(str(p.price)) for p in st_prices]
            st_avg = calculate_mean(p_vals)
            state_avg_prices.append(st_avg)

            # Find top volume crop
            crop_counts: Dict[str, int] = {}
            for p in st_prices:
                cname = p.crop.name
                crop_counts[cname] = crop_counts.get(cname, 0) + 1
            driver_crop = max(crop_counts.items(), key=lambda x: x[1])[0] if crop_counts else "Wheat"

            # Normalized activity score (0-100) based on active mandis & crop breadth
            activity_score = min(100.0, round((len(active_mandi_ids) * 12.0) + (len(crops_tracked) * 5.0), 1))

            state_items.append(
                StateActivityItem(
                    state=st,
                    active_markets_count=len(active_mandi_ids),
                    total_commodities_tracked=len(crops_tracked),
                    average_price_level=st_avg,
                    primary_driver_crop=driver_crop,
                    activity_score=activity_score
                )
            )

        state_items.sort(key=lambda x: x.active_markets_count, reverse=True)

        # 2. District comparison
        district_items: List[DistrictComparisonItem] = []
        for dist_key, dist_prices in district_groups.items():
            dist_name, st_name = dist_key.split("::")
            m_ids = {p.market_id for p in dist_prices}
            p_vals = [Decimal(str(p.price)) for p in dist_prices]
            d_avg = calculate_mean(p_vals)
            d_min = min(Decimal(str(p.min_price)) for p in dist_prices)
            d_max = max(Decimal(str(p.max_price)) for p in dist_prices)
            spread = d_max - d_min

            # Find state average to compute index
            matching_st = next((s for s in state_items if s.state == st_name), None)
            st_bench = matching_st.average_price_level if matching_st and matching_st.average_price_level > 0 else d_avg
            idx_pct = round((float(d_avg) / float(st_bench)) * 100.0, 1) if st_bench > 0 else 100.0

            district_items.append(
                DistrictComparisonItem(
                    district=dist_name,
                    state=st_name,
                    active_mandis=len(m_ids),
                    average_price=d_avg,
                    min_price=d_min,
                    max_price=d_max,
                    price_spread=spread,
                    price_index_vs_state=idx_pct
                )
            )

        district_items.sort(key=lambda x: x.average_price, reverse=True)

        # 3. Regional price trends
        trend_points: List[RegionalTrendPoint] = []
        for st, st_prices in state_groups.items():
            # Group by date for each state
            by_date: Dict[str, List[Decimal]] = {}
            for p in st_prices:
                d_str = p.recorded_at.strftime("%Y-%m-%d")
                if d_str not in by_date:
                    by_date[d_str] = []
                by_date[d_str].append(Decimal(str(p.price)))

            for d_str, val_list in sorted(by_date.items()):
                trend_points.append(
                    RegionalTrendPoint(
                        date=d_str,
                        state=st,
                        average_price=calculate_mean(val_list)
                    )
                )

        # 4. Regional divergence coefficient (std dev across state averages / mean state average)
        if len(state_avg_prices) > 1:
            st_mean = calculate_mean(state_avg_prices)
            st_std = calculate_std_dev(state_avg_prices, st_mean)
            divergence_coeff = round((st_std / float(st_mean)) * 100.0, 2) if st_mean > 0 else 0.0
        else:
            divergence_coeff = 2.5

        return RegionalAnalysisResponse(
            state_wise_activity=state_items,
            district_wise_comparison=district_items,
            regional_price_trends=trend_points,
            regional_divergence_coefficient=divergence_coeff
        )

    @staticmethod
    def calculate_opportunity_score(
        db: Session,
        crop_id: int,
        market_id: int
    ) -> MarketOpportunityScoreResponse:
        """
        Calculates an EXPLAINABLE Market Opportunity Score (MOS) from 0 to 100.

        =============================================================================
        EXPLAINABLE SCORING FORMULA DOCUMENTATION:
        -----------------------------------------------------------------------------
        The Market Opportunity Score (MOS) measures the commercial attractiveness
        for a farmer to sell a specific crop at a target APMC Mandi.
        The score is bounded strictly between 0.0 and 100.0, calculated as a weighted
        linear combination of four transparent pillars:

        1. Price Premium Score (Weight: 35%):
           Measures the spot price (P_m) relative to the regional benchmark average (P_avg).
           Score = min(100, max(0, 50 + 50 * ((P_m - P_avg) / (0.15 * P_avg))))
           - If P_m is 15% above regional average -> Score = 100
           - If P_m equals regional average -> Score = 50
           - If P_m is 15% below regional average -> Score = 0

        2. Price Momentum Score (Weight: 25%):
           Measures the 7-day price percentage change (Delta_7d).
           Score = min(100, max(0, 50 + 5.0 * Delta_7d))
           - If 7-day price rose by +10% -> Score = 100
           - If 7-day price remained flat (0%) -> Score = 50
           - If 7-day price fell by -10% -> Score = 0

        3. Demand Strength Score (Weight: 25%):
           Direct mapping from APMC trading demand and arrival liquidity:
           - Surge Demand: 100 points
           - High Demand: 80 points
           - Moderate Demand: 50 points
           - Low Demand: 20 points

        4. Price Stability Score (Weight: 15%):
           Inversely proportional to price coefficient of variation (V% = StdDev / Mean * 100).
           Score = max(0, min(100, 100 - 5.0 * V%))
           - Highly stable prices (V <= 2%) receive 90-100 points (low downside risk).
           - High volatility prices (V >= 20%) receive 0 points.

        FINAL OPPORTUNITY SCORE:
           MOS = (0.35 * S_price) + (0.25 * S_momentum) + (0.25 * S_demand) + (0.15 * S_stability)

        RATING CLASSIFICATION BANDS:
           - 80.0 to 100.0 : Exceptional Opportunity (High premium, strong demand)
           - 65.0 to 79.9  : Favorable Opportunity (Good returns, solid market)
           - 50.0 to 64.9  : Moderate Opportunity (Average baseline conditions)
           - 0.0  to 49.9  : Unfavorable Opportunity (Sub-par prices or weak demand)
        =============================================================================
        """
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        if not crop:
            raise NotFoundException(detail=f"Crop with ID {crop_id} not found")

        target_market = db.query(Market).filter(Market.id == market_id).first()
        if not target_market:
            raise NotFoundException(detail=f"Market with ID {market_id} not found")

        # Get all market records for this crop to determine regional benchmark
        all_market_prices = (
            db.query(MarketPrice)
            .filter(MarketPrice.crop_id == crop_id)
            .order_by(MarketPrice.recorded_at.desc())
            .all()
        )

        if not all_market_prices:
            raise NotFoundException(detail="No price records found for this crop.")

        regional_prices = [Decimal(str(p.price)) for p in all_market_prices]
        regional_avg = calculate_mean(regional_prices)

        # Target mandi prices
        target_prices_records = [p for p in all_market_prices if p.market_id == market_id]
        if not target_prices_records:
            # Mandi hasn't traded this crop yet, use regional defaults
            target_spot = regional_avg
            target_demand = DemandLevel.MODERATE
            target_history = [regional_avg]
        else:
            target_spot = target_prices_records[0].price
            target_demand = target_prices_records[0].demand_level
            target_history = [Decimal(str(p.price)) for p in target_prices_records[:14]]

        # --- Factor 1: Price Premium (35%) ---
        price_diff = target_spot - regional_avg
        price_diff_pct = (price_diff / regional_avg) * Decimal("100.00") if regional_avg > 0 else Decimal("0.00")
        raw_price_score = 50.0 + (float(price_diff_pct) / 15.0) * 50.0
        score_price = max(0.0, min(100.0, round(raw_price_score, 1)))

        # --- Factor 2: Price Momentum (25%) ---
        if len(target_history) >= 2:
            baseline_7d = target_history[-1]
            chg_7d_pct = ((target_spot - baseline_7d) / baseline_7d) * Decimal("100.00") if baseline_7d > 0 else Decimal("0.00")
        else:
            chg_7d_pct = Decimal("0.00")
        raw_mom_score = 50.0 + (float(chg_7d_pct) * 5.0)
        score_momentum = max(0.0, min(100.0, round(raw_mom_score, 1)))

        # --- Factor 3: Demand Strength (25%) ---
        demand_val = target_demand.value if hasattr(target_demand, "value") else str(target_demand)
        demand_score_map = {
            "Surge": 100.0,
            "High": 80.0,
            "Moderate": 50.0,
            "Low": 20.0
        }
        score_demand = demand_score_map.get(demand_val, 50.0)

        # --- Factor 4: Price Stability (15%) ---
        std_dev = calculate_std_dev(target_history, calculate_mean(target_history))
        mean_p = float(calculate_mean(target_history))
        volatility_pct = (std_dev / mean_p * 100.0) if mean_p > 0 else 1.0
        score_stability = max(0.0, min(100.0, round(100.0 - (volatility_pct * 5.0), 1)))

        # Weighted composite score
        final_mos = round(
            (0.35 * score_price) +
            (0.25 * score_momentum) +
            (0.25 * score_demand) +
            (0.15 * score_stability),
            1
        )

        # Opportunity Rating Band
        if final_mos >= 80.0:
            rating = "Exceptional"
            recommendation = f"Highly advantageous market. {target_market.name} offers ₹{price_diff:+.2f}/Qtl premium over regional average with {demand_val} buyer demand."
        elif final_mos >= 65.0:
            rating = "Favorable"
            recommendation = f"Solid selling opportunity. Current prices at {target_market.name} provide competitive realizations with steady absorption."
        elif final_mos >= 50.0:
            rating = "Moderate"
            recommendation = f"Average market conditions. Prices at {target_market.name} align with regional baseline; consider monitoring transportation costs."
        else:
            rating = "Unfavorable"
            recommendation = f"Below-average return expected. Consider comparing nearby alternative mandis to secure better farm-gate realizations."

        formula_doc = (
            "MOS = 0.35 * PricePremiumScore + 0.25 * MomentumScore + "
            "0.25 * DemandStrengthScore + 0.15 * PriceStabilityScore"
        )

        factor_breakdown = {
            "price_premium": OpportunityFactorScore(
                factor_name="Price Premium vs Regional Benchmark",
                raw_value=f"₹{target_spot} vs Regional Avg ₹{regional_avg} ({price_diff_pct:+.1f}%)",
                score=score_price,
                weight_percentage=35.0,
                weighted_score=round(0.35 * score_price, 2),
                explanation=f"Spot price is {price_diff_pct:+.1f}% relative to regional benchmark (Score: {score_price}/100)."
            ),
            "price_momentum": OpportunityFactorScore(
                factor_name="7-Day Price Momentum",
                raw_value=f"{chg_7d_pct:+.1f}% 7-day change",
                score=score_momentum,
                weight_percentage=25.0,
                weighted_score=round(0.25 * score_momentum, 2),
                explanation=f"Recent price trajectory indicates {classify_trend_direction(chg_7d_pct).lower()} velocity (Score: {score_momentum}/100)."
            ),
            "demand_strength": OpportunityFactorScore(
                factor_name="Market Demand Level",
                raw_value=demand_val,
                score=score_demand,
                weight_percentage=25.0,
                weighted_score=round(0.25 * score_demand, 2),
                explanation=f"APMC Mandi liquidity classified as {demand_val} Demand (Score: {score_demand}/100)."
            ),
            "price_stability": OpportunityFactorScore(
                factor_name="Price Stability (Low Volatility)",
                raw_value=f"{volatility_pct:.1f}% volatility",
                score=score_stability,
                weight_percentage=15.0,
                weighted_score=round(0.15 * score_stability, 2),
                explanation=f"Price dispersion shows {volatility_pct:.1f}% variation over window (Score: {score_stability}/100)."
            ),
        }

        # Calculate opportunity scores for all other mandis trading this crop for ranking
        unique_mandi_ids = {p.market_id for p in all_market_prices}
        ranked_list: List[MarketOpportunityRankedItem] = []

        for mid in unique_mandi_ids:
            m_obj = db.query(Market).filter(Market.id == mid).first()
            if not m_obj:
                continue
            m_prices = [p for p in all_market_prices if p.market_id == mid]
            if not m_prices:
                continue
            m_spot = m_prices[0].price
            m_dem = m_prices[0].demand_level.value if hasattr(m_prices[0].demand_level, "value") else str(m_prices[0].demand_level)

            m_diff_pct = ((m_spot - regional_avg) / regional_avg) * Decimal("100.00") if regional_avg > 0 else Decimal("0.00")
            s_pr = max(0.0, min(100.0, 50.0 + (float(m_diff_pct) / 15.0) * 50.0))
            s_dem = demand_score_map.get(m_dem, 50.0)
            s_mos = round((0.35 * s_pr) + (0.25 * 50.0) + (0.25 * s_dem) + (0.15 * 80.0), 1)

            r_band = "Exceptional" if s_mos >= 80 else ("Favorable" if s_mos >= 65 else ("Moderate" if s_mos >= 50 else "Unfavorable"))

            ranked_list.append(
                MarketOpportunityRankedItem(
                    market_id=m_obj.id,
                    market_name=m_obj.name,
                    district=m_obj.district,
                    state=m_obj.state,
                    current_price=m_spot,
                    opportunity_score=s_mos,
                    opportunity_rating=r_band,
                    demand_level=m_dem,
                    price_premium_percent=round(m_diff_pct, 1),
                    rank=0
                )
            )

        ranked_list.sort(key=lambda x: x.opportunity_score, reverse=True)
        for i, item in enumerate(ranked_list):
            item.rank = i + 1

        return MarketOpportunityScoreResponse(
            crop_id=crop.id,
            crop_name=crop.name,
            market_id=target_market.id,
            market_name=target_market.name,
            district=target_market.district,
            state=target_market.state,
            opportunity_score=final_mos,
            opportunity_rating=rating,
            scoring_formula_documentation=formula_doc,
            factor_breakdown=factor_breakdown,
            farmer_recommendation=recommendation,
            top_ranked_opportunities=ranked_list[:8]
        )
