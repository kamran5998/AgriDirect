"""Machine Learning Prediction Service for Agricultural Commodity Markets."""

import logging
from datetime import datetime, timedelta, date
from decimal import Decimal
from typing import Optional, List, Dict, Any, Union

try:
    from sqlalchemy.orm import Session
    from sqlalchemy import desc
    from app.models.market import Market, MarketPrice
    from app.models.crop import Crop
except ImportError:
    Session = Any
    desc = lambda *args: None
    Market = None
    MarketPrice = None
    Crop = None
from app.services.ml.feature_engineering import AgriFeatureEngineer
from app.services.ml.models import BaselineModelTrainer, ModelEvaluationResult
from app.schemas.prediction import (
    PricePredictionResponse,
    PredictionConfidenceRange,
    FeatureImportanceItem,
    ModelEvaluationSummary,
    ForecastPoint,
    InsufficientDataResponse,
)
from app.utils.exceptions import NotFoundException

logger = logging.getLogger(__name__)

# Human-readable display mapping for engineered features
FEATURE_DISPLAY_MAPPING: Dict[str, Tuple_Name_Desc := Any] = {
    "price_lag_1": ("Previous Day Spot Price", "Most recent closing modal price at the mandi"),
    "price_lag_2": ("2-Day Prior Price", "Price benchmark from two sessions prior"),
    "price_lag_3": ("3-Day Prior Price", "Mid-week historical price anchor"),
    "price_lag_7": ("7-Day Prior Price", "Weekly cycle baseline comparison"),
    "rolling_mean_3": ("3-Day Moving Average", "Short-term smoothed price trend"),
    "rolling_mean_7": ("7-Day Moving Average", "Weekly average market equilibrium rate"),
    "rolling_mean_14": ("14-Day Moving Average", "Bi-weekly foundational trend indicator"),
    "rolling_std_7": ("7-Day Volatility Spread", "Price dispersion and market risk factor"),
    "price_delta_1d": ("1-Day Price Velocity", "Immediate single-day price momentum"),
    "price_delta_7d": ("7-Day Price Velocity", "Weekly direction of trading movement"),
    "min_max_spread": ("Intraday Price Spread", "Daily spread between min and max mandi bids"),
    "day_of_week": ("Trading Day of Week", "Weekly arrival seasonality and auction volume effect"),
    "day_of_month": ("Calendar Day of Month", "Monthly settlement cycle dynamics"),
    "month": ("Month of Year", "Crop harvesting and post-monsoon arrival seasonality"),
    "sin_month": ("Cyclical Seasonality (Sine)", "Smooth annual crop cycle progression"),
    "cos_month": ("Cyclical Seasonality (Cosine)", "Annual harvest peak and lean period timing"),
    "sin_day_of_week": ("Weekly Periodicity (Sine)", "Weekend and weekday market rhythm"),
    "cos_day_of_week": ("Weekly Periodicity (Cosine)", "Mid-week trading volume distribution"),
}


class PricePredictionService:
    """Orchestrates ML feature engineering, model training, validation, and multi-day forecasting."""

    MIN_REQUIRED_SAMPLES = 14

    @classmethod
    def generate_price_prediction(
        cls,
        db: Session,
        crop_id: int,
        market_id: int,
        horizon_days: int = 7
    ) -> Union[PricePredictionResponse, InsufficientDataResponse]:
        """
        Main entry point to predict future prices for a crop at a specific mandi.
        Returns PricePredictionResponse on success, or InsufficientDataResponse if data is scarce.
        """
        crop = db.query(Crop).filter(Crop.id == crop_id).first()
        if not crop:
            raise NotFoundException(detail=f"Crop with ID {crop_id} not found")

        market = db.query(Market).filter(Market.id == market_id).first()
        if not market:
            raise NotFoundException(detail=f"Market with ID {market_id} not found")

        # 1. Fetch chronological price history
        history_records = (
            db.query(MarketPrice)
            .filter(MarketPrice.crop_id == crop_id, MarketPrice.market_id == market_id)
            .order_by(MarketPrice.recorded_at.asc())
            .all()
        )

        sample_count = len(history_records)

        # Check for insufficient data
        if sample_count < cls.MIN_REQUIRED_SAMPLES:
            logger.info(
                f"Insufficient historical data ({sample_count}/{cls.MIN_REQUIRED_SAMPLES}) "
                f"for crop={crop.name}, market={market.name}"
            )
            return InsufficientDataResponse(
                status="INSUFFICIENT_DATA",
                has_sufficient_data=False,
                crop_id=crop.id,
                crop_name=crop.name,
                market_id=market.id,
                market_name=market.name,
                historical_samples_count=sample_count,
                minimum_required_samples=cls.MIN_REQUIRED_SAMPLES,
                message=(
                    f"Insufficient historical trading data available for {crop.name} at {market.name}. "
                    f"Found {sample_count} observations; at least {cls.MIN_REQUIRED_SAMPLES} consecutive days "
                    f"of market records are required to train a reliable machine learning model."
                )
            )

        # Convert ORM records to clean dictionary sequence
        cleaned_history: List[Dict[str, Any]] = [
            {
                "recorded_at": r.recorded_at,
                "price": float(r.price),
                "min_price": float(r.min_price),
                "max_price": float(r.max_price),
            }
            for r in history_records
        ]

        # 2. Feature Engineering: build supervised (X, y)
        X, y, feature_names = AgriFeatureEngineer.extract_features_from_history(
            historical_records=cleaned_history,
            horizon_days=horizon_days
        )

        if len(X) < 4:
            # Fallback if horizon is too wide relative to dataset
            X, y, feature_names = AgriFeatureEngineer.extract_features_from_history(
                historical_records=cleaned_history,
                horizon_days=1
            )

        # 3. Train & Evaluate Baseline Models (Ridge vs. Random Forest)
        trainer = BaselineModelTrainer(test_split_ratio=0.2)
        best_model_name, evaluations = trainer.train_and_evaluate(X, y, feature_names)

        best_eval: ModelEvaluationResult = evaluations[best_model_name]
        current_spot = Decimal(str(cleaned_history[-1]["price"]))

        # 4. Generate forward prediction for horizon date
        latest_date = cleaned_history[-1]["recorded_at"]
        target_prediction_date = latest_date + timedelta(days=horizon_days)

        inference_features = AgriFeatureEngineer.build_latest_inference_features(
            historical_records=cleaned_history,
            target_date=target_prediction_date
        )

        if inference_features is None:
            # Fallback to current spot
            predicted_float = float(current_spot)
            std_error = 50.0
        else:
            predicted_float, std_error = trainer.predict_with_best_model(inference_features)

        predicted_price = Decimal(str(round(predicted_float, 2)))
        chg_amount = round(predicted_price - current_spot, 2)
        chg_pct = round((chg_amount / current_spot) * Decimal("100.00"), 2) if current_spot > 0 else Decimal("0.00")

        # 5. Calculate Confidence Interval Bounds (80% confidence = ~1.28 * RMSE)
        margin = Decimal(str(round(1.28 * std_error, 2)))
        lower_bound = max(Decimal("100.00"), predicted_price - margin)
        upper_bound = predicted_price + margin

        # 6. Multi-Day Forecast Timeseries (Day +1 to Day + horizon_days)
        forecast_points: List[ForecastPoint] = []
        days_to_forecast = max(7, min(14, horizon_days + 3))

        for day_offset in range(1, days_to_forecast + 1):
            f_date = latest_date + timedelta(days=day_offset)
            f_feat = AgriFeatureEngineer.build_latest_inference_features(
                historical_records=cleaned_history,
                target_date=f_date
            )
            if f_feat:
                p_val, _ = trainer.predict_with_best_model(f_feat)
            else:
                p_val = float(current_spot)

            # Progressive uncertainty expansion over time
            day_std = std_error * math.sqrt(day_offset)
            d_margin = Decimal(str(round(1.28 * day_std, 2)))
            d_pred = Decimal(str(round(p_val, 2)))

            d_diff = d_pred - current_spot
            if d_diff > Decimal("20.00"):
                t_label = "Uptrend"
            elif d_diff < Decimal("-20.00"):
                t_label = "Downtrend"
            else:
                t_label = "Flat"

            forecast_points.append(
                ForecastPoint(
                    date=f_date.strftime("%Y-%m-%d"),
                    day_offset=day_offset,
                    predicted_price=d_pred,
                    lower_bound=max(Decimal("100.00"), d_pred - d_margin),
                    upper_bound=d_pred + d_margin,
                    trend_label=t_label
                )
            )

        # 7. Format Feature Importances
        top_importances: List[FeatureImportanceItem] = []
        sorted_feats = sorted(
            best_eval.feature_importances.items(),
            key=lambda item: item[1],
            reverse=True
        )[:6]

        for fname, imp_pct in sorted_feats:
            display_name, desc_text = FEATURE_DISPLAY_MAPPING.get(
                fname, (fname.replace("_", " ").title(), "Engineered predictive factor")
            )
            top_importances.append(
                FeatureImportanceItem(
                    feature_name=fname,
                    display_name=display_name,
                    importance_percent=imp_pct,
                    impact_description=desc_text
                )
            )

        # 8. Model Confidence Score (0-100)
        # Higher R2 and lower MAPE yields higher confidence
        r2_contribution = max(0.0, best_eval.r2) * 50.0
        mape_clamped = min(20.0, best_eval.mape)
        mape_contribution = max(0.0, (20.0 - mape_clamped) / 20.0) * 50.0
        conf_score = round(r2_contribution + mape_contribution, 1)

        if conf_score >= 75.0:
            conf_rating = "High Confidence"
        elif conf_score >= 50.0:
            conf_rating = "Moderate Confidence"
        else:
            conf_rating = "Low Confidence"

        # 9. Baseline Comparison List
        baseline_summaries = [
            ModelEvaluationSummary(
                model_name=res.model_name,
                mae=res.mae,
                rmse=res.rmse,
                r2=res.r2,
                mape=res.mape,
                train_samples=res.train_samples,
                test_samples=res.test_samples,
                is_selected_best_model=res.is_best_model
            )
            for res in evaluations.values()
        ]

        best_summary = ModelEvaluationSummary(
            model_name=best_eval.model_name,
            mae=best_eval.mae,
            rmse=best_eval.rmse,
            r2=best_eval.r2,
            mape=best_eval.mape,
            train_samples=best_eval.train_samples,
            test_samples=best_eval.test_samples,
            is_selected_best_model=True
        )

        return PricePredictionResponse(
            status="SUCCESS",
            has_sufficient_data=True,
            crop_id=crop.id,
            crop_name=crop.name,
            market_id=market.id,
            market_name=market.name,
            district=market.district,
            state=market.state,
            current_spot_price=current_spot,
            predicted_price=predicted_price,
            prediction_date=target_prediction_date.strftime("%Y-%m-%d"),
            horizon_days=horizon_days,
            predicted_change_amount=chg_amount,
            predicted_change_percent=chg_pct,
            predicted_range=PredictionConfidenceRange(
                lower_bound=lower_bound,
                upper_bound=upper_bound,
                standard_error=std_error
            ),
            model_confidence_score=conf_score,
            model_confidence_rating=conf_rating,
            important_factors=top_importances,
            model_evaluation=best_summary,
            baseline_comparison=baseline_summaries,
            forecast_timeseries=forecast_points,
            historical_samples_count=sample_count
        )
