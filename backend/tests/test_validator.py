"""Unit tests for agricultural market data validation engine."""

import unittest
from datetime import datetime, timedelta
from decimal import Decimal
from app.services.ingestion.cleaner import DemandLevel
from app.services.ingestion.models import CleanedMarketPriceRecord
from app.services.ingestion.validator import MarketDataValidator


class TestMarketDataValidator(unittest.TestCase):
    """Test suite verifying all data integrity validation rules."""

    def setUp(self):
        self.validator = MarketDataValidator(
            min_price_threshold=Decimal("100.00"),
            max_price_threshold=Decimal("100000.00"),
            max_future_hours=24,
            max_past_days=365
        )

    def _create_valid_record(self, **kwargs) -> CleanedMarketPriceRecord:
        defaults = {
            "standard_crop_name": "Wheat",
            "standard_category": "Grains",
            "variety": "Sharbati",
            "standard_market_name": "Sehore APMC Yard",
            "district": "Sehore",
            "state": "Madhya Pradesh",
            "modal_price": Decimal("2860.00"),
            "min_price": Decimal("2680.00"),
            "max_price": Decimal("2940.00"),
            "demand_level": DemandLevel.HIGH,
            "arrival_volume": Decimal("1250.00"),
            "recorded_at": datetime.utcnow() - timedelta(hours=2),
            "source": "TEST_DATA_SOURCE",
            "is_mock": False
        }
        defaults.update(kwargs)
        return CleanedMarketPriceRecord(**defaults)

    def test_valid_record_passes(self):
        rec = self._create_valid_record()
        valid, failures, error_counts = self.validator.validate_batch([rec])
        self.assertEqual(len(valid), 1)
        self.assertEqual(len(failures), 0)
        self.assertEqual(len(error_counts), 0)

    def test_missing_crop_name_fails(self):
        rec = self._create_valid_record(standard_crop_name="")
        valid, failures, error_counts = self.validator.validate_batch([rec])
        self.assertEqual(len(valid), 0)
        self.assertEqual(len(failures), 1)
        self.assertEqual(failures[0].rule, "MANDATORY_CROP_NAME")

    def test_missing_market_name_fails(self):
        rec = self._create_valid_record(standard_market_name="")
        valid, failures, error_counts = self.validator.validate_batch([rec])
        self.assertEqual(len(valid), 0)
        self.assertEqual(len(failures), 1)
        self.assertEqual(failures[0].rule, "MANDATORY_MARKET_NAME")

    def test_non_positive_price_fails(self):
        # Modal price is zero or negative
        rec1 = self._create_valid_record(modal_price=Decimal("0.00"))
        valid, failures, error_counts = self.validator.validate_batch([rec1])
        self.assertEqual(len(valid), 0)
        self.assertEqual(failures[0].rule, "PRICE_POSITIVE")

        rec2 = self._create_valid_record(modal_price=Decimal("-50.00"))
        valid, failures, error_counts = self.validator.validate_batch([rec2])
        self.assertEqual(len(valid), 0)
        self.assertEqual(failures[0].rule, "PRICE_POSITIVE")

    def test_min_greater_than_max_fails(self):
        # min price exceeds max price
        rec = self._create_valid_record(
            modal_price=Decimal("2800.00"),
            min_price=Decimal("3000.00"),
            max_price=Decimal("2500.00")
        )
        valid, failures, error_counts = self.validator.validate_batch([rec])
        self.assertEqual(len(valid), 0)
        self.assertEqual(failures[0].rule, "PRICE_MIN_MAX_ORDER")

    def test_price_below_min_threshold_fails(self):
        # Price ₹50 is below minimum threshold ₹100/Qtl (likely unit error like ₹/kg)
        rec = self._create_valid_record(
            modal_price=Decimal("50.00"),
            min_price=Decimal("45.00"),
            max_price=Decimal("55.00")
        )
        valid, failures, error_counts = self.validator.validate_batch([rec])
        self.assertEqual(len(valid), 0)
        self.assertEqual(failures[0].rule, "PRICE_BELOW_MIN_THRESHOLD")

    def test_price_exceeding_max_threshold_fails(self):
        # Price ₹150,000 exceeds ₹100,000 threshold (outlier anomaly)
        rec = self._create_valid_record(
            modal_price=Decimal("150000.00"),
            min_price=Decimal("140000.00"),
            max_price=Decimal("160000.00")
        )
        valid, failures, error_counts = self.validator.validate_batch([rec])
        self.assertEqual(len(valid), 0)
        self.assertEqual(failures[0].rule, "PRICE_EXCEEDS_MAX_THRESHOLD")

    def test_future_date_fails(self):
        # Date 5 days in the future
        future_dt = datetime.utcnow() + timedelta(days=5)
        rec = self._create_valid_record(recorded_at=future_dt)
        valid, failures, error_counts = self.validator.validate_batch([rec])
        self.assertEqual(len(valid), 0)
        self.assertEqual(failures[0].rule, "DATE_FUTURE_INVALID")

    def test_expired_historical_date_fails(self):
        # Date 500 days ago (> 365 days)
        old_dt = datetime.utcnow() - timedelta(days=500)
        rec = self._create_valid_record(recorded_at=old_dt)
        valid, failures, error_counts = self.validator.validate_batch([rec])
        self.assertEqual(len(valid), 0)
        self.assertEqual(failures[0].rule, "DATE_EXPIRED_INVALID")

    def test_batch_duplicate_detection(self):
        # Two records with identical market + crop + date in same ingestion batch
        dt = datetime.utcnow() - timedelta(hours=3)
        rec1 = self._create_valid_record(recorded_at=dt)
        rec2 = self._create_valid_record(recorded_at=dt)  # Exact duplicate

        valid, failures, error_counts = self.validator.validate_batch([rec1, rec2])
        self.assertEqual(len(valid), 1)
        self.assertEqual(len(failures), 1)
        self.assertEqual(failures[0].rule, "BATCH_DUPLICATE_KEY")


if __name__ == "__main__":
    unittest.main()
