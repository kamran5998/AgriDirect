"""Machine Learning Price Prediction API Router.
Exposes commodity price forecasting endpoints with confidence ranges, factor importances,
model evaluation benchmarks, and statistical estimate disclaimers.
"""

from typing import Optional, Union, List, Dict, Any
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.prediction import (
    PricePredictionResponse,
    InsufficientDataResponse,
    ModelEvaluationSummary,
)
from app.services.ml.predictor import PricePredictionService

router = APIRouter(prefix="/predictions", tags=["Machine Learning Price Prediction"])


@router.get(
    "/{crop_id}/{market_id}",
    response_model=Union[PricePredictionResponse, InsufficientDataResponse],
    summary="Get ML price prediction for a crop at a specific mandi"
)
def get_crop_price_prediction(
    crop_id: int = Path(..., description="Crop ID to forecast"),
    market_id: int = Path(..., description="Target APMC Mandi ID"),
    horizon_days: int = Query(7, ge=1, le=30, description="Forecast horizon in days (e.g. 1, 7, 14, 30)"),
    db: Session = Depends(get_db)
):
    """
    Generates an estimated future price using the trained Machine Learning regression pipeline:
    - **Predicted Modal Price** on target future date
    - **Estimated Confidence Interval Range** (Lower Bound and Upper Bound)
    - **Key Feature Importances** (Lags, 7-day moving average, price momentum, calendar seasonality)
    - **Model Evaluation Metrics** (MAE, RMSE, R², MAPE)
    - **Multi-Day Forward Forecast Curve** (Day +1 to Day +14)
    - **Advisory Disclaimer** (Statistical estimate notice)

    *Note: Returns `INSUFFICIENT_DATA` if fewer than 14 historical observations exist.*
    """
    return PricePredictionService.generate_price_prediction(
        db=db,
        crop_id=crop_id,
        market_id=market_id,
        horizon_days=horizon_days
    )
