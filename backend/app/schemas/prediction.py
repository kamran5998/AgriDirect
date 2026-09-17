"""Pydantic schemas for Machine Learning Price Prediction API responses."""

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


class PredictionConfidenceRange(BaseModel):
    lower_bound: Decimal = Field(..., description="Estimated lower bound of predicted price (80% confidence)")
    upper_bound: Decimal = Field(..., description="Estimated upper bound of predicted price (80% confidence)")
    standard_error: float = Field(..., description="Root Mean Squared Error of the regression model")


class FeatureImportanceItem(BaseModel):
    feature_name: str
    display_name: str
    importance_percent: float
    impact_description: str


class ModelEvaluationSummary(BaseModel):
    model_name: str
    mae: float = Field(..., description="Mean Absolute Error in ₹/Quintal")
    rmse: float = Field(..., description="Root Mean Squared Error in ₹/Quintal")
    r2: float = Field(..., description="Coefficient of Determination (R-squared)")
    mape: float = Field(..., description="Mean Absolute Percentage Error (%)")
    train_samples: int
    test_samples: int
    is_selected_best_model: bool


class ForecastPoint(BaseModel):
    date: str
    day_offset: int
    predicted_price: Decimal
    lower_bound: Decimal
    upper_bound: Decimal
    trend_label: str  # "Uptrend", "Downtrend", "Flat"


class PricePredictionResponse(BaseModel):
    status: str = Field(..., description="'SUCCESS' or 'INSUFFICIENT_DATA'")
    has_sufficient_data: bool = True
    crop_id: int
    crop_name: str
    market_id: int
    market_name: str
    district: str
    state: str
    current_spot_price: Decimal
    predicted_price: Decimal = Field(..., description="Estimated modal price on target prediction date")
    prediction_date: str
    horizon_days: int
    predicted_change_amount: Decimal
    predicted_change_percent: Decimal
    predicted_range: PredictionConfidenceRange
    model_confidence_score: float = Field(..., description="Confidence score out of 100 based on validation fit")
    model_confidence_rating: str = Field(..., description="'High Confidence', 'Moderate Confidence', 'Low Confidence'")
    important_factors: List[FeatureImportanceItem]
    model_evaluation: ModelEvaluationSummary
    baseline_comparison: List[ModelEvaluationSummary]
    forecast_timeseries: List[ForecastPoint]
    historical_samples_count: int
    disclaimer: str = Field(
        default=(
            "Advisory Disclaimer: Agricultural commodity markets are influenced by localized supply arrivals, "
            "weather fluctuations, and policy decisions. All predictions produced by this machine learning model "
            "are statistical estimates provided solely for informational and strategic planning purposes and do not "
            "constitute price guarantees."
        )
    )


class InsufficientDataResponse(BaseModel):
    status: str = "INSUFFICIENT_DATA"
    has_sufficient_data: bool = False
    crop_id: int
    crop_name: Optional[str] = None
    market_id: int
    market_name: Optional[str] = None
    historical_samples_count: int
    minimum_required_samples: int = 14
    message: str = (
        "Insufficient historical trading data available for this mandi and commodity. "
        "A minimum of 14 consecutive market price observations is required to generate reliable machine learning forecasts."
    )
    disclaimer: str = (
        "Predictions are disabled for low-sample commodities to prevent generating unreliable or misleading price estimates."
    )
