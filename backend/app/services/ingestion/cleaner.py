"""Data Cleaning and Sanitization Engine for raw agricultural market price records."""

import re
import enum
import logging
from datetime import datetime, date
from decimal import Decimal, InvalidOperation
from typing import Optional, Tuple, Dict, Any

try:
    from app.models.market import DemandLevel
    from app.models.crop import CropCategory
except ImportError:
    class DemandLevel(str, enum.Enum):
        LOW = "Low"
        MODERATE = "Moderate"
        HIGH = "High"
        SURGE = "Surge"

    class CropCategory(str, enum.Enum):
        GRAINS = "Grains"
        PULSES = "Pulses"
        OILSEEDS = "Oilseeds"
        VEGETABLES = "Vegetables"
        FRUITS = "Fruits"
        CASH_CROPS = "Cash Crops"

from app.services.ingestion.models import RawMarketPriceRecord, CleanedMarketPriceRecord

logger = logging.getLogger(__name__)


# Canonical commodity master and alias lookup dictionary
CROP_ALIAS_REGISTRY: Dict[str, Tuple[str, str]] = {
    # Grains
    "wheat": ("Wheat", CropCategory.GRAINS.value),
    "gehun": ("Wheat", CropCategory.GRAINS.value),
    "kanak": ("Wheat", CropCategory.GRAINS.value),
    "sharbati": ("Wheat", CropCategory.GRAINS.value),
    "lokwan": ("Wheat", CropCategory.GRAINS.value),
    "wheat (sharbati)": ("Wheat", CropCategory.GRAINS.value),
    "wheat (lokwan)": ("Wheat", CropCategory.GRAINS.value),
    "rice": ("Basmati Rice", CropCategory.GRAINS.value),
    "basmati": ("Basmati Rice", CropCategory.GRAINS.value),
    "basmati rice": ("Basmati Rice", CropCategory.GRAINS.value),
    "paddy": ("Paddy (Dhan)", CropCategory.GRAINS.value),
    "paddy(dhan)": ("Paddy (Dhan)", CropCategory.GRAINS.value),
    "dhan": ("Paddy (Dhan)", CropCategory.GRAINS.value),
    "maize": ("Maize", CropCategory.GRAINS.value),
    "makka": ("Maize", CropCategory.GRAINS.value),
    "corn": ("Maize", CropCategory.GRAINS.value),
    "barley": ("Barley (Jau)", CropCategory.GRAINS.value),
    "jau": ("Barley (Jau)", CropCategory.GRAINS.value),
    "bajra": ("Bajra (Pearl Millet)", CropCategory.GRAINS.value),
    "jowar": ("Jowar (Sorghum)", CropCategory.GRAINS.value),

    # Oilseeds
    "soybean": ("Soybean", CropCategory.OILSEEDS.value),
    "soyabean": ("Soybean", CropCategory.OILSEEDS.value),
    "soya": ("Soybean", CropCategory.OILSEEDS.value),
    "yellow soybean": ("Soybean", CropCategory.OILSEEDS.value),
    "mustard": ("Mustard", CropCategory.OILSEEDS.value),
    "sarson": ("Mustard", CropCategory.OILSEEDS.value),
    "rai": ("Mustard", CropCategory.OILSEEDS.value),
    "mustard seed": ("Mustard", CropCategory.OILSEEDS.value),
    "groundnut": ("Groundnut", CropCategory.OILSEEDS.value),
    "peanut": ("Groundnut", CropCategory.OILSEEDS.value),
    "mungfali": ("Groundnut", CropCategory.OILSEEDS.value),
    "sunflower": ("Sunflower Seed", CropCategory.OILSEEDS.value),
    "sesame": ("Sesame (Til)", CropCategory.OILSEEDS.value),
    "til": ("Sesame (Til)", CropCategory.OILSEEDS.value),

    # Pulses
    "gram": ("Gram (Chana)", CropCategory.PULSES.value),
    "chana": ("Gram (Chana)", CropCategory.PULSES.value),
    "bengal gram": ("Gram (Chana)", CropCategory.PULSES.value),
    "chana dal": ("Gram (Chana)", CropCategory.PULSES.value),
    "tur": ("Tur (Arhar)", CropCategory.PULSES.value),
    "arhar": ("Tur (Arhar)", CropCategory.PULSES.value),
    "red gram": ("Tur (Arhar)", CropCategory.PULSES.value),
    "moong": ("Moong (Green Gram)", CropCategory.PULSES.value),
    "green gram": ("Moong (Green Gram)", CropCategory.PULSES.value),
    "urad": ("Urad (Black Gram)", CropCategory.PULSES.value),
    "black gram": ("Urad (Black Gram)", CropCategory.PULSES.value),
    "masoor": ("Masoor (Lentil)", CropCategory.PULSES.value),
    "lentil": ("Masoor (Lentil)", CropCategory.PULSES.value),

    # Cash Crops
    "cotton": ("Cotton", CropCategory.CASH_CROPS.value),
    "kapas": ("Cotton", CropCategory.CASH_CROPS.value),
    "sugarcane": ("Sugarcane", CropCategory.CASH_CROPS.value),
    "ganna": ("Sugarcane", CropCategory.CASH_CROPS.value),
    "jute": ("Jute", CropCategory.CASH_CROPS.value),

    # Vegetables & Perishables
    "onion": ("Onion", CropCategory.VEGETABLES.value),
    "pyaz": ("Onion", CropCategory.VEGETABLES.value),
    "potato": ("Potato", CropCategory.VEGETABLES.value),
    "aloo": ("Potato", CropCategory.VEGETABLES.value),
    "tomato": ("Tomato", CropCategory.VEGETABLES.value),
    "tamatar": ("Tomato", CropCategory.VEGETABLES.value),
    "garlic": ("Garlic", CropCategory.VEGETABLES.value),
    "lahsun": ("Garlic", CropCategory.VEGETABLES.value),
    "ginger": ("Ginger", CropCategory.VEGETABLES.value),
    "adrak": ("Ginger", CropCategory.VEGETABLES.value),
}


class MarketDataCleaner:
    """Cleans, normalizes, and coerces raw agricultural market records."""

    @classmethod
    def clean_record(
        cls,
        raw: RawMarketPriceRecord,
        source: str = "EXTERNAL_API",
        is_mock: bool = False
    ) -> Optional[CleanedMarketPriceRecord]:
        """
        Transforms raw payload into sanitized CleanedMarketPriceRecord.
        Returns None if fundamental identity fields cannot be salvaged.
        """
        # 1. Clean string fields
        crop_raw = cls._sanitize_string(raw.crop_name)
        market_raw = cls._sanitize_string(raw.market_name)
        district_raw = cls._sanitize_string(raw.district)
        state_raw = cls._sanitize_string(raw.state)
        variety_raw = cls._sanitize_string(raw.variety) or "FAQ Standard"

        if not crop_raw or not market_raw:
            return None

        # 2. Standardize crop name & category via lookup dictionary
        std_crop, std_category = cls._standardize_crop(crop_raw)

        # 3. Standardize market & region names
        std_market = cls._standardize_market_name(market_raw)
        std_district = district_raw.title() if district_raw else "Central District"
        std_state = cls._standardize_state(state_raw or "Madhya Pradesh")

        # 4. Clean and calculate numeric prices
        prices = cls._clean_prices(raw.modal_price, raw.min_price, raw.max_price)
        if not prices:
            return None

        modal_p, min_p, max_p = prices

        # 5. Clean arrival volume
        arrival = cls._clean_decimal(raw.arrival_volume)

        # 6. Parse and normalize timestamp
        recorded_at = cls._parse_date(raw.date_str)

        # 7. Infer demand level
        demand_level = cls._infer_demand_level(modal_p, min_p, max_p)

        return CleanedMarketPriceRecord(
            standard_crop_name=std_crop,
            standard_category=std_category,
            variety=variety_raw,
            standard_market_name=std_market,
            district=std_district,
            state=std_state,
            modal_price=modal_p,
            min_price=min_p,
            max_price=max_p,
            demand_level=demand_level,
            arrival_volume=arrival,
            recorded_at=recorded_at,
            source=source,
            is_mock=is_mock
        )

    @staticmethod
    def _sanitize_string(value: Optional[Any]) -> str:
        if value is None:
            return ""
        s = str(value).strip()
        # Remove extra whitespace, newlines, and trailing commas
        s = re.sub(r"\s+", " ", s)
        s = s.strip(" ,.-_")
        return s

    @classmethod
    def _standardize_crop(cls, crop_name: str) -> Tuple[str, str]:
        key = crop_name.lower().strip()
        if key in CROP_ALIAS_REGISTRY:
            return CROP_ALIAS_REGISTRY[key]

        # Try partial match
        for alias, target in CROP_ALIAS_REGISTRY.items():
            if alias in key or key in alias:
                return target

        # Default fallback
        return (crop_name.title(), CropCategory.GRAINS.value)

    @staticmethod
    def _standardize_market_name(name: str) -> str:
        s = name.title()
        # Normalize APMC / Mandi suffixes
        s = re.sub(r"\bApmc\b", "APMC", s, flags=re.IGNORECASE)
        s = re.sub(r"\bYard\b", "Yard", s, flags=re.IGNORECASE)
        s = re.sub(r"\bMandi\b", "Mandi", s, flags=re.IGNORECASE)
        return s

    @staticmethod
    def _standardize_state(state: str) -> str:
        s = state.title()
        mapping = {
            "Mp": "Madhya Pradesh",
            "M.P.": "Madhya Pradesh",
            "Up": "Uttar Pradesh",
            "U.P.": "Uttar Pradesh",
            "Pb": "Punjab",
            "Hr": "Haryana",
            "Mh": "Maharashtra",
            "Rj": "Rajasthan",
            "Gj": "Gujarat",
        }
        return mapping.get(s, s)

    @classmethod
    def _clean_decimal(cls, value: Optional[Any]) -> Optional[Decimal]:
        if value is None:
            return None
        try:
            s = str(value).replace(",", "").replace("₹", "").replace("/Qtl", "").strip()
            # Extract first numeric float
            match = re.search(r"[-+]?\d*\.?\d+", s)
            if not match:
                return None
            return round(Decimal(match.group(0)), 2)
        except (ValueError, InvalidOperation):
            return None

    @classmethod
    def _clean_prices(
        cls,
        modal_raw: Optional[Any],
        min_raw: Optional[Any],
        max_raw: Optional[Any]
    ) -> Optional[Tuple[Decimal, Decimal, Decimal]]:
        modal_d = cls._clean_decimal(modal_raw)
        min_d = cls._clean_decimal(min_raw)
        max_d = cls._clean_decimal(max_raw)

        # If all three are missing, cannot process
        if modal_d is None and min_d is None and max_d is None:
            return None

        # Case 1: Modal missing, but min and max present
        if modal_d is None and min_d is not None and max_d is not None:
            modal_d = round((min_d + max_d) / Decimal("2.0"), 2)

        # Case 2: Only modal present
        elif modal_d is not None and min_d is None and max_d is None:
            min_d = round(modal_d * Decimal("0.95"), 2)
            max_d = round(modal_d * Decimal("1.05"), 2)

        # Case 3: Min missing
        elif min_d is None and modal_d is not None:
            min_d = round(modal_d * Decimal("0.96"), 2)

        # Case 4: Max missing
        elif max_d is None and modal_d is not None:
            max_d = round(modal_d * Decimal("1.04"), 2)

        # If min > max (swapped values from API), fix orientation
        if min_d is not None and max_d is not None and min_d > max_d:
            min_d, max_d = max_d, min_d

        # Ensure modal is bounded between min and max
        if modal_d is not None and min_d is not None and max_d is not None:
            if modal_d < min_d:
                min_d = modal_d
            if modal_d > max_d:
                max_d = modal_d

        if modal_d is not None and min_d is not None and max_d is not None:
            return (modal_d, min_d, max_d)

        return None

    @staticmethod
    def _parse_date(date_str: Optional[Any]) -> datetime:
        if date_str is None:
            return datetime.utcnow()

        if isinstance(date_str, datetime):
            return date_str

        if isinstance(date_str, date):
            return datetime.combine(date_str, datetime.min.time())

        s = str(date_str).strip()
        formats = [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d",
            "%d/%m/%Y",
            "%d-%m-%Y",
            "%d/%m/%Y %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M:%S.%f",
            "%Y-%m-%dT%H:%M:%SZ",
        ]

        for fmt in formats:
            try:
                return datetime.strptime(s, fmt)
            except ValueError:
                continue

        # Default fallback to now
        return datetime.utcnow()

    @staticmethod
    def _infer_demand_level(modal: Decimal, min_p: Decimal, max_p: Decimal) -> DemandLevel:
        spread = max_p - min_p
        if spread <= 0:
            return DemandLevel.MODERATE

        ratio = (modal - min_p) / spread
        if ratio >= Decimal("0.85"):
            return DemandLevel.SURGE
        elif ratio >= Decimal("0.55"):
            return DemandLevel.HIGH
        elif ratio >= Decimal("0.25"):
            return DemandLevel.MODERATE
        else:
            return DemandLevel.LOW
