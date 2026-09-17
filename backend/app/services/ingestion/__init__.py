"""Market Data Ingestion Service Package."""

from app.services.ingestion.base_provider import BaseMarketDataProvider
from app.services.ingestion.models import (
    RawMarketPriceRecord,
    CleanedMarketPriceRecord,
    IngestionReport,
    ValidationFailure,
)
from app.services.ingestion.cleaner import MarketDataCleaner
from app.services.ingestion.validator import MarketDataValidator
from app.services.ingestion.mock_provider import SimulatedMockMarketDataProvider
from app.services.ingestion.agmarknet_provider import AgmarknetApiMarketDataProvider
from app.services.ingestion.data_gov_in_provider import DataGovInMarketDataProvider
from app.services.ingestion.provider_factory import get_market_data_provider, PROVIDER_REGISTRY
from app.services.ingestion.pipeline import (
    MarketDataIngestionPipeline,
    get_recent_ingestion_runs,
    get_latest_ingestion_status,
)

__all__ = [
    "BaseMarketDataProvider",
    "RawMarketPriceRecord",
    "CleanedMarketPriceRecord",
    "IngestionReport",
    "ValidationFailure",
    "MarketDataCleaner",
    "MarketDataValidator",
    "SimulatedMockMarketDataProvider",
    "AgmarknetApiMarketDataProvider",
    "DataGovInMarketDataProvider",
    "get_market_data_provider",
    "PROVIDER_REGISTRY",
    "MarketDataIngestionPipeline",
    "get_recent_ingestion_runs",
    "get_latest_ingestion_status",
]
