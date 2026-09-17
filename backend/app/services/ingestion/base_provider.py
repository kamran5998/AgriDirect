"""Abstract Base Class for Agricultural Market Data Providers."""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from app.services.ingestion.models import RawMarketPriceRecord


class BaseMarketDataProvider(ABC):
    """
    Abstract interface for fetching commodity prices from external market sources.
    Implementations can be official government REST APIs, SOAP endpoints, scrapers, or simulated mock feeds.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Unique identifier name of the data source."""
        pass

    @property
    @abstractmethod
    def is_mock(self) -> bool:
        """
        Flag indicating if this provider generates synthetic/simulated data.
        Requirement #4: Mock data must never be presented as real-time data.
        """
        pass

    @abstractmethod
    async def fetch_prices(
        self,
        state: Optional[str] = None,
        crop: Optional[str] = None,
        market: Optional[str] = None,
        limit: int = 200
    ) -> List[RawMarketPriceRecord]:
        """
        Fetch raw price records from the upstream market data source.
        Returns a list of unvalidated, uncleaned RawMarketPriceRecord instances.
        """
        pass

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """
        Check connectivity and credentials for the upstream market API.
        """
        pass
