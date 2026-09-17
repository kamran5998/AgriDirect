"""Market Intelligence & Data Ingestion router for APMC mandis, live prices, spatial search, comparisons, and trend analytics."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.market import MarketStatus
from app.schemas.market import (
    MarketRead,
    MarketPriceRead,
    MarketComparisonResponse,
    LatestMarketPricesResponse,
    CropTrendResponse,
    IngestTriggerRequest,
    IngestionStatusResponse,
)
from app.services.market_service import MarketService

router = APIRouter(prefix="/markets", tags=["Market Intelligence & Ingestion"])


@router.get(
    "",
    response_model=List[MarketRead],
    summary="Get all APMC Mandi yards"
)
def get_markets(
    state: Optional[str] = Query(None, description="Filter by Indian state (e.g. Madhya Pradesh)"),
    district: Optional[str] = Query(None, description="Filter by district (e.g. Sehore)"),
    status: Optional[MarketStatus] = Query(None, description="Filter by status (active/inactive)"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Returns registered APMC Mandi directory with location coordinates.
    """
    return MarketService.get_markets(db=db, state=state, district=district, status=status, limit=limit)


@router.get(
    "/prices/latest",
    response_model=LatestMarketPricesResponse,
    summary="Get latest spot commodity prices with 24h trends and source provenance"
)
def get_latest_prices(
    crop_id: Optional[int] = Query(None, description="Filter by crop ID"),
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Returns the latest recorded price for every crop in each APMC Mandi,
    including 24-hour price change calculations and data source provenance tags.
    """
    return MarketService.get_latest_market_prices(
        db=db,
        crop_id=crop_id,
        state=state,
        district=district,
        limit=limit
    )


@router.get(
    "/prices/search",
    response_model=List[MarketPriceRead],
    summary="Search real-time and latest APMC commodity prices"
)
def search_prices(
    crop_id: Optional[int] = Query(None, description="Crop ID"),
    market_id: Optional[int] = Query(None, description="Market ID"),
    state: Optional[str] = Query(None, description="State name"),
    search: Optional[str] = Query(None, description="Keyword search (e.g., Sharbati, Sehore)"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Queries real-time APMC mandi commodity prices with multi-dimensional filtering.
    """
    return MarketService.search_crop_prices(
        db=db,
        crop_id=crop_id,
        market_id=market_id,
        state=state,
        search_query=search,
        limit=limit
    )


@router.get(
    "/prices/history",
    response_model=List[MarketPriceRead],
    summary="Get historical price time-series for a crop"
)
def get_price_history(
    crop_id: int = Query(..., description="Crop ID to fetch history for"),
    market_id: Optional[int] = Query(None, description="Specific APMC mandi ID"),
    days: int = Query(30, ge=7, le=365, description="Number of past days (e.g. 7, 30, 90)"),
    db: Session = Depends(get_db)
):
    """
    Returns historical daily modal, min, and max price time-series for charts and trendlines.
    """
    return MarketService.get_crop_price_history(db=db, crop_id=crop_id, market_id=market_id, days=days)


@router.get(
    "/compare",
    response_model=MarketComparisonResponse,
    summary="Compare mandi prices across regions for a crop"
)
def compare_markets(
    crop_id: int = Query(..., description="Crop ID to compare"),
    benchmark_mandi_id: Optional[int] = Query(None, description="Local benchmark Mandi ID"),
    db: Session = Depends(get_db)
):
    """
    Calculates price differences across regional mandis to identify arbitrage opportunities.
    """
    return MarketService.compare_markets_for_crop(
        db=db,
        crop_id=crop_id,
        benchmark_mandi_id=benchmark_mandi_id
    )


@router.get(
    "/trends",
    response_model=CropTrendResponse,
    summary="Get crop price trend analytics, moving averages, and volatility index"
)
def get_crop_trends(
    crop_id: int = Query(..., description="Crop ID to analyze"),
    market_id: Optional[int] = Query(None, description="Optional APMC Mandi ID"),
    days: int = Query(30, ge=7, le=180, description="Analysis window in days"),
    db: Session = Depends(get_db)
):
    """
    Computes statistical price trends, 7-day moving averages, price volatility percentage,
    and market sentiment (Bullish, Bearish, Steady).
    """
    return MarketService.get_crop_trends(
        db=db,
        crop_id=crop_id,
        market_id=market_id,
        days=days
    )


@router.post(
    "/ingest",
    summary="Trigger on-demand market data collection, cleaning, validation, and storage"
)
async def trigger_data_ingestion(
    payload: IngestTriggerRequest = IngestTriggerRequest(),
    db: Session = Depends(get_db)
):
    """
    Triggers the data ingestion pipeline:
    1. Fetches raw data from the configured external provider (AGMARKNET, data.gov.in, or simulated mock).
    2. Executes data cleaning, alias mapping, and numeric parsing.
    3. Runs rigorous data validation against integrity thresholds.
    4. Prevents duplicate records and persists validated records in MySQL.
    """
    report = await MarketService.trigger_ingestion(
        db=db,
        provider_type=payload.provider,
        state=payload.state,
        crop=payload.crop,
        market=payload.market,
        limit=payload.limit
    )
    return report


@router.get(
    "/ingestion/status",
    response_model=IngestionStatusResponse,
    summary="Get market data ingestion service status and telemetry audit logs"
)
def get_ingestion_status():
    """
    Returns the current data provider configuration, health check, and recent ingestion audit reports.
    """
    return MarketService.get_ingestion_telemetry()


@router.get(
    "/{market_id}",
    response_model=MarketRead,
    summary="Get single APMC Mandi details"
)
def get_market_detail(market_id: int, db: Session = Depends(get_db)):
    """
    Returns detailed metadata and status for a single APMC mandi yard.
    """
    return MarketService.get_market_by_id(db=db, market_id=market_id)
