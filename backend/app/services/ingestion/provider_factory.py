"""Provider Factory for dynamic instantiation and swapping of market data providers."""

import logging
from typing import Optional, Dict, Type
from app.config import settings
from app.services.ingestion.base_provider import BaseMarketDataProvider
from app.services.ingestion.mock_provider import SimulatedMockMarketDataProvider
from app.services.ingestion.agmarknet_provider import AgmarknetApiMarketDataProvider
from app.services.ingestion.data_gov_in_provider import DataGovInMarketDataProvider

logger = logging.getLogger(__name__)

PROVIDER_REGISTRY: Dict[str, Type[BaseMarketDataProvider]] = {
    "mock": SimulatedMockMarketDataProvider,
    "simulated": SimulatedMockMarketDataProvider,
    "agmarknet": AgmarknetApiMarketDataProvider,
    "data_gov_in": DataGovInMarketDataProvider,
    "ogd": DataGovInMarketDataProvider,
}


def get_market_data_provider(provider_type: Optional[str] = None) -> BaseMarketDataProvider:
    """
    Factory method to retrieve the requested or configured market data provider instance.
    If the requested external provider lacks configuration and fallback is enabled, returns mock provider.
    """
    key = (provider_type or settings.MARKET_DATA_PROVIDER).strip().lower()

    provider_class = PROVIDER_REGISTRY.get(key)
    if not provider_class:
        logger.warning(
            f"Unknown market data provider '{key}'. Falling back to SimulatedMockMarketDataProvider."
        )
        return SimulatedMockMarketDataProvider()

    provider = provider_class()

    # If provider is an external API but lacks credentials or host, and mock fallback is enabled
    if not provider.is_mock and settings.INGESTION_ENABLE_MOCK_FALLBACK:
        if isinstance(provider, AgmarknetApiMarketDataProvider) and not settings.AGMARKNET_API_KEY:
            logger.info(
                "AGMARKNET API key not found; activating SimulatedMockMarketDataProvider with mock data transparency flag."
            )
            return SimulatedMockMarketDataProvider()
        elif isinstance(provider, DataGovInMarketDataProvider) and not settings.DATA_GOV_IN_API_KEY:
            logger.info(
                "data.gov.in API key not found; activating SimulatedMockMarketDataProvider with mock data transparency flag."
            )
            return SimulatedMockMarketDataProvider()

    return provider
