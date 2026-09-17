"""Unit tests for agricultural market data cleaning engine."""

import unittest
from datetime import datetime
from decimal import Decimal
from app.services.ingestion.models import RawMarketPriceRecord
from app.services.ingestion.cleaner import MarketDataCleaner


class TestMarketDataCleaner(unittest.TestCase):
    """Test suite for sanitization, alias mapping, and price calculation."""

    def test_crop_alias_mapping(self):
        # Test Hindi and common colloquial aliases
        test_cases = [
            ("chana dal", "Gram (Chana)"),
            ("bengal gram", "Gram (Chana)"),
            ("soyabean", "Soybean"),
            ("soya", "Soybean"),
            ("sarson", "Mustard"),
            ("rai", "Mustard"),
            ("gehun", "Wheat"),
            ("sharbati", "Wheat"),
            ("kapas", "Cotton"),
            ("aloo", "Potato"),
            ("pyaz", "Onion"),
        ]
        for raw_crop, expected_std in test_cases:
            std_name, _ = MarketDataCleaner._standardize_crop(raw_crop)
            self.assertEqual(
                std_name,
                expected_std,
                f"Alias '{raw_crop}' expected to map to '{expected_std}', got '{std_name}'"
            )

    def test_string_sanitization(self):
        raw_str = "   Sehore   APMC   Yard ,. -  "
        clean_str = MarketDataCleaner._sanitize_string(raw_str)
        self.assertEqual(clean_str, "Sehore APMC Yard")

    def test_price_cleaning_with_all_three_values(self):
        prices = MarketDataCleaner._clean_prices("2,850.50", "2700", "2950")
        self.assertIsNotNone(prices)
        modal_p, min_p, max_p = prices
        self.assertEqual(modal_p, Decimal("2850.50"))
        self.assertEqual(min_p, Decimal("2700.00"))
        self.assertEqual(max_p, Decimal("2950.00"))

    def test_price_cleaning_modal_derivation_from_min_max(self):
        # Modal price missing: should calculate average of min and max
        prices = MarketDataCleaner._clean_prices(None, "2600", "2800")
        self.assertIsNotNone(prices)
        modal_p, min_p, max_p = prices
        self.assertEqual(modal_p, Decimal("2700.00"))

    def test_price_cleaning_min_max_derivation_from_modal(self):
        # Only modal price provided: should calculate reasonable min/max spread (+/- 5%)
        prices = MarketDataCleaner._clean_prices("3000", None, None)
        self.assertIsNotNone(prices)
        modal_p, min_p, max_p = prices
        self.assertEqual(modal_p, Decimal("3000.00"))
        self.assertEqual(min_p, Decimal("2850.00"))  # 3000 * 0.95
        self.assertEqual(max_p, Decimal("3150.00"))  # 3000 * 1.05

    def test_price_inverted_min_max_fix(self):
        # If API sends min > max by mistake (e.g. min=3000, max=2500), cleaner swaps them
        prices = MarketDataCleaner._clean_prices("2750", "3000", "2500")
        self.assertIsNotNone(prices)
        modal_p, min_p, max_p = prices
        self.assertLessEqual(min_p, max_p)
        self.assertEqual(min_p, Decimal("2500.00"))
        self.assertEqual(max_p, Decimal("3000.00"))

    def test_date_parsing_various_formats(self):
        # Test DD/MM/YYYY
        dt1 = MarketDataCleaner._parse_date("18/08/2026")
        self.assertEqual(dt1.year, 2026)
        self.assertEqual(dt1.month, 8)
        self.assertEqual(dt1.day, 18)

        # Test YYYY-MM-DD
        dt2 = MarketDataCleaner._parse_date("2026-08-19")
        self.assertEqual(dt2.year, 2026)
        self.assertEqual(dt2.month, 8)
        self.assertEqual(dt2.day, 19)

    def test_unparseable_record_returns_none(self):
        raw = RawMarketPriceRecord(
            crop_name="",  # Missing crop name
            market_name="Sehore Mandi",
            modal_price="2800"
        )
        cleaned = MarketDataCleaner.clean_record(raw)
        self.assertIsNone(cleaned)


if __name__ == "__main__":
    unittest.main()
