"""End-to-end integration tests for the market data ingestion pipeline."""

import unittest
import asyncio
from decimal import Decimal
from unittest.mock import MagicMock
from app.services.ingestion.mock_provider import SimulatedMockMarketDataProvider
from app.services.ingestion.provider_factory import get_market_data_provider, PROVIDER_REGISTRY
from app.services.ingestion.cleaner import MarketDataCleaner
from app.services.ingestion.validator import MarketDataValidator
from app.services.ingestion.pipeline import MarketDataIngestionPipeline


class TestMarketDataIngestionPipeline(unittest.TestCase):
    """Verifies end-to-end data ingestion, cleaning, validation, and transparency flags."""

    def setUp(self):
        self.mock_provider = SimulatedMockMarketDataProvider()
        self.validator = MarketDataValidator()
        self.pipeline = MarketDataIngestionPipeline(
            provider=self.mock_provider,
            validator=self.validator
        )

    def test_mock_provider_flags_are_explicit(self):
        """Ensure mock provider is strictly identified to prevent deceptive presentation."""
        self.assertTrue(self.mock_provider.is_mock)
        self.assertEqual(self.mock_provider.provider_name, "SIMULATED_MOCK_PROVIDER")

    def test_provider_factory_swapping(self):
        """Ensure data source provider is easily swappable without changing pipeline code."""
        mock_p = get_market_data_provider("mock")
        self.assertEqual(mock_p.provider_name, "SIMULATED_MOCK_PROVIDER")
        self.assertTrue(mock_p.is_mock)

        # Check registry keys
        self.assertIn("agmarknet", PROVIDER_REGISTRY)
        self.assertIn("data_gov_in", PROVIDER_REGISTRY)
        self.assertIn("mock", PROVIDER_REGISTRY)

    def test_mock_provider_feed_generation_and_validation(self):
        """Fetch raw feeds, clean them, and validate that clean records pass validation."""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            raw_records = loop.run_until_complete(
                self.mock_provider.fetch_prices(limit=20)
            )
        finally:
            loop.close()

        self.assertGreater(len(raw_records), 0)

        # Clean all records
        cleaned = []
        for raw in raw_records:
            c = MarketDataCleaner.clean_record(raw, source="SIMULATED_MOCK_PROVIDER", is_mock=True)
            if c:
                cleaned.append(c)

        self.assertEqual(len(cleaned), len(raw_records))

        # Validate all records
        valid, failures, error_counts = self.validator.validate_batch(cleaned)
        self.assertEqual(len(valid), len(cleaned))
        self.assertEqual(len(failures), 0)

        # Ensure all records have is_mock=True and source recorded
        for r in valid:
            self.assertTrue(r.is_mock)
            self.assertEqual(r.source, "SIMULATED_MOCK_PROVIDER")
            self.assertGreater(r.modal_price, Decimal("0"))
            self.assertLessEqual(r.min_price, r.max_price)


if __name__ == "__main__":
    unittest.main()
