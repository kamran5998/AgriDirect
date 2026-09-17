"""AGMARKNET (Directorate of Marketing and Inspection, Ministry of Agriculture) API Provider."""

import logging
import json
import urllib.request
import urllib.parse
from typing import List, Dict, Any, Optional

try:
    from app.config import settings
    DEFAULT_API_URL = settings.AGMARKNET_API_URL
    DEFAULT_API_KEY = settings.AGMARKNET_API_KEY
except ImportError:
    DEFAULT_API_URL = "https://api.agmarknet.gov.in/v1/prices"
    DEFAULT_API_KEY = ""

from app.services.ingestion.base_provider import BaseMarketDataProvider
from app.services.ingestion.models import RawMarketPriceRecord

logger = logging.getLogger(__name__)


class AgmarknetApiMarketDataProvider(BaseMarketDataProvider):
    """
    Integrates with the official Government of India AGMARKNET REST API endpoint.
    Retrieves daily APMC mandi spot arrivals and modal prices.
    """

    def __init__(
        self,
        api_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: int = 15
    ):
        self._api_url = api_url or DEFAULT_API_URL
        self._api_key = api_key or DEFAULT_API_KEY
        self._timeout = timeout

    @property
    def provider_name(self) -> str:
        return "AGMARKNET_GOV_IN_API"

    @property
    def is_mock(self) -> bool:
        return False

    async def fetch_prices(
        self,
        state: Optional[str] = None,
        crop: Optional[str] = None,
        market: Optional[str] = None,
        limit: int = 200
    ) -> List[RawMarketPriceRecord]:
        """
        Queries AGMARKNET API with query parameters for state, commodity, and market.
        """
        params: Dict[str, Any] = {
            "format": "json",
            "limit": limit
        }
        if self._api_key:
            params["api-key"] = self._api_key
        if state:
            params["state"] = state
        if crop:
            params["commodity"] = crop
        if market:
            params["market"] = market

        query_string = urllib.parse.urlencode(params)
        full_url = f"{self._api_url}?{query_string}"

        req = urllib.request.Request(
            full_url,
            headers={
                "Accept": "application/json",
                "User-Agent": "AgriDirectPulse/1.0 (SIH-2026 Farmer Intelligence Platform)"
            }
        )

        try:
            logger.info(f"Connecting to AGMARKNET API at {self._api_url} with params: {params}")
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                if resp.status != 200:
                    logger.warning(f"AGMARKNET API returned status {resp.status}")
                    return []
                body = resp.read().decode("utf-8")
                data = json.loads(body)

            raw_records: List[RawMarketPriceRecord] = []
            records_list = data.get("records") or data.get("data") or (data if isinstance(data, list) else [])

            for item in records_list:
                raw_records.append(
                    RawMarketPriceRecord(
                        crop_name=item.get("commodity") or item.get("commodity_name") or item.get("crop"),
                        variety=item.get("variety") or item.get("grade") or "Standard FAQ",
                        market_name=item.get("market") or item.get("market_name") or item.get("mandi"),
                        district=item.get("district") or item.get("district_name"),
                        state=item.get("state") or item.get("state_name"),
                        modal_price=item.get("modal_price") or item.get("modal_rate") or item.get("price"),
                        min_price=item.get("min_price") or item.get("min_rate"),
                        max_price=item.get("max_price") or item.get("max_rate"),
                        arrival_volume=item.get("arrival_volume") or item.get("arrivals_tonnes"),
                        date_str=item.get("arrival_date") or item.get("date") or item.get("reported_date"),
                        raw_payload=item
                    )
                )

            return raw_records

        except Exception as exc:
            logger.error(f"Error querying AGMARKNET API: {str(exc)}", exc_info=True)
            raise

    async def health_check(self) -> Dict[str, Any]:
        has_key = bool(self._api_key)
        return {
            "provider": self.provider_name,
            "status": "CONFIGURED" if has_key else "MISSING_API_KEY",
            "is_mock": False,
            "endpoint": self._api_url,
            "has_credentials": has_key,
            "message": "AGMARKNET integration ready." if has_key else "AGMARKNET API key not configured in environment."
        }
