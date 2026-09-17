"""Open Government Data (data.gov.in) Agricultural Commodity Price API Provider."""

import logging
import json
import urllib.request
import urllib.parse
from typing import List, Dict, Any, Optional

try:
    from app.config import settings
    DEFAULT_API_URL = settings.DATA_GOV_IN_API_URL
    DEFAULT_API_KEY = settings.DATA_GOV_IN_API_KEY
    DEFAULT_RESOURCE_ID = settings.DATA_GOV_IN_RESOURCE_ID
except ImportError:
    DEFAULT_API_URL = "https://api.data.gov.in/resource"
    DEFAULT_API_KEY = ""
    DEFAULT_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"

from app.services.ingestion.base_provider import BaseMarketDataProvider
from app.services.ingestion.models import RawMarketPriceRecord

logger = logging.getLogger(__name__)


class DataGovInMarketDataProvider(BaseMarketDataProvider):
    """
    Integrates with data.gov.in API (OGD Platform India) for national mandi price datasets.
    """

    def __init__(
        self,
        api_url: Optional[str] = None,
        api_key: Optional[str] = None,
        resource_id: Optional[str] = None,
        timeout: int = 15
    ):
        self._api_url = api_url or DEFAULT_API_URL
        self._api_key = api_key or DEFAULT_API_KEY
        self._resource_id = resource_id or DEFAULT_RESOURCE_ID
        self._timeout = timeout

    @property
    def provider_name(self) -> str:
        return "DATA_GOV_IN_OGD_API"

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
        Query data.gov.in resource endpoint.
        """
        url = f"{self._api_url.rstrip('/')}/{self._resource_id}"
        params: Dict[str, Any] = {
            "api-key": self._api_key or "",
            "format": "json",
            "limit": limit
        }

        if state:
            params["filters[state]"] = state
        if crop:
            params["filters[commodity]"] = crop
        if market:
            params["filters[market]"] = market

        query_string = urllib.parse.urlencode(params)
        full_url = f"{url}?{query_string}"

        req = urllib.request.Request(
            full_url,
            headers={
                "Accept": "application/json",
                "User-Agent": "AgriDirectPulse-GovIngestion/1.0"
            }
        )

        try:
            logger.info(f"Connecting to data.gov.in API resource {self._resource_id}")
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                if resp.status != 200:
                    logger.warning(f"data.gov.in API returned status {resp.status}")
                    return []
                body = resp.read().decode("utf-8")
                json_resp = json.loads(body)

            records_data = json_resp.get("records", [])

            raw_records: List[RawMarketPriceRecord] = []
            for item in records_data:
                raw_records.append(
                    RawMarketPriceRecord(
                        crop_name=item.get("commodity") or item.get("Commodity"),
                        variety=item.get("variety") or item.get("Variety") or "FAQ Standard",
                        market_name=item.get("market") or item.get("Market"),
                        district=item.get("district") or item.get("District"),
                        state=item.get("state") or item.get("State"),
                        modal_price=item.get("modal_price") or item.get("Modal_Price"),
                        min_price=item.get("min_price") or item.get("Min_Price"),
                        max_price=item.get("max_price") or item.get("Max_Price"),
                        arrival_volume=item.get("arrival_volume") or item.get("Arrivals"),
                        date_str=item.get("arrival_date") or item.get("Arrival_Date"),
                        raw_payload=item
                    )
                )

            return raw_records

        except Exception as exc:
            logger.error(f"Error querying data.gov.in API: {str(exc)}", exc_info=True)
            raise

    async def health_check(self) -> Dict[str, Any]:
        has_key = bool(self._api_key)
        return {
            "provider": self.provider_name,
            "status": "CONFIGURED" if has_key else "MISSING_API_KEY",
            "is_mock": False,
            "resource_id": self._resource_id,
            "has_credentials": has_key,
            "message": "data.gov.in API configured." if has_key else "data.gov.in API key missing in environment."
        }
