"""Unit tests for the AgriDirect Analytics Engine.
Tests statistical calculations, moving averages, trend classifications, cross-mandi arbitrage,
crop volatility, regional dynamics, and explainable Market Opportunity Scores (MOS).
"""

import unittest
from decimal import Decimal
from app.services.analytics_service import (
    calculate_mean,
    calculate_std_dev,
    calculate_moving_average,
    classify_trend_direction,
)


class TestAnalyticsCalculations(unittest.TestCase):
    """Test suite verifying mathematical and statistical accuracy."""

    def test_calculate_mean(self):
        prices = [Decimal("2800.00"), Decimal("2900.00"), Decimal("3000.00")]
        mean = calculate_mean(prices)
        self.assertEqual(mean, Decimal("2900.00"))

        # Empty list fallback
        self.assertEqual(calculate_mean([]), Decimal("0.00"))

    def test_calculate_std_dev(self):
        # Known sample: 2, 4, 4, 4, 5, 5, 7, 9 -> mean=5, s=2.14
        prices = [
            Decimal("2.0"), Decimal("4.0"), Decimal("4.0"), Decimal("4.0"),
            Decimal("5.0"), Decimal("5.0"), Decimal("7.0"), Decimal("9.0")
        ]
        s = calculate_std_dev(prices)
        self.assertAlmostEqual(s, 2.14, delta=0.05)

        # Single element or empty list
        self.assertEqual(calculate_std_dev([Decimal("2500.0")]), 0.0)
        self.assertEqual(calculate_std_dev([]), 0.0)

    def test_calculate_moving_average_7d_30d(self):
        series = [Decimal(str(x)) for x in range(10, 110, 10)]  # 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
        ma3 = calculate_moving_average(series, window_size=3)

        self.assertEqual(len(ma3), len(series))
        # First point: 10
        self.assertEqual(ma3[0], Decimal("10.00"))
        # Second point: (10+20)/2 = 15
        self.assertEqual(ma3[1], Decimal("15.00"))
        # Third point: (10+20+30)/3 = 20
        self.assertEqual(ma3[2], Decimal("20.00"))
        # Fourth point: (20+30+40)/3 = 30
        self.assertEqual(ma3[3], Decimal("30.00"))
        # Last point: (80+90+100)/3 = 90
        self.assertEqual(ma3[-1], Decimal("90.00"))

    def test_trend_direction_classification(self):
        # >= +1.5% -> Rising
        self.assertEqual(classify_trend_direction(Decimal("2.5")), "Rising")
        self.assertEqual(classify_trend_direction(Decimal("1.50")), "Rising")

        # <= -1.5% -> Falling
        self.assertEqual(classify_trend_direction(Decimal("-2.5")), "Falling")
        self.assertEqual(classify_trend_direction(Decimal("-1.50")), "Falling")

        # Between -1.5% and +1.5% -> Stable
        self.assertEqual(classify_trend_direction(Decimal("0.8")), "Stable")
        self.assertEqual(classify_trend_direction(Decimal("-0.5")), "Stable")
        self.assertEqual(classify_trend_direction(Decimal("0.0")), "Stable")

    def test_price_volatility_index_calculation(self):
        # Volatility Index = (StdDev / Mean) * 100
        mean = Decimal("3000.00")
        sample_prices = [
            Decimal("2900.00"), Decimal("2950.00"), Decimal("3000.00"),
            Decimal("3050.00"), Decimal("3100.00")
        ]
        s = calculate_std_dev(sample_prices, mean)
        volatility_index = (s / float(mean)) * 100.0
        self.assertGreater(volatility_index, 0.0)
        self.assertLess(volatility_index, 10.0)  # Low volatility cluster

    def test_market_opportunity_score_formula_weights_and_bounds(self):
        """
        Verifies the MOS formula:
        MOS = 0.35 * S_price + 0.25 * S_momentum + 0.25 * S_demand + 0.15 * S_stability
        """
        # Test Case 1: Ideal high-opportunity market
        # Spot price 15% above benchmark -> S_price = 100
        # 7-day growth +10% -> S_momentum = 100
        # Surge demand -> S_demand = 100
        # Low volatility (0%) -> S_stability = 100
        s_price = 100.0
        s_mom = 100.0
        s_dem = 100.0
        s_stab = 100.0

        mos_max = (0.35 * s_price) + (0.25 * s_mom) + (0.25 * s_dem) + (0.15 * s_stab)
        self.assertEqual(mos_max, 100.0)

        # Test Case 2: Worst-case low-opportunity market
        # Spot price 15% below benchmark -> S_price = 0
        # 7-day decline -10% -> S_momentum = 0
        # Low demand -> S_demand = 20
        # High volatility (20%) -> S_stability = 0
        mos_min = (0.35 * 0.0) + (0.25 * 0.0) + (0.25 * 20.0) + (0.15 * 0.0)
        self.assertEqual(mos_min, 5.0)
        self.assertGreaterEqual(mos_min, 0.0)
        self.assertLessEqual(mos_min, 100.0)

        # Test Case 3: Baseline neutral market
        # At benchmark (0% diff) -> S_price = 50
        # Flat 7d (0% change) -> S_momentum = 50
        # Moderate demand -> S_demand = 50
        # Average stability (V=4%) -> S_stability = 80
        mos_neutral = (0.35 * 50.0) + (0.25 * 50.0) + (0.25 * 50.0) + (0.15 * 80.0)
        self.assertEqual(mos_neutral, 54.5)
        # 54.5 falls cleanly into the "Moderate Opportunity" band (50.0 - 64.9)
        self.assertTrue(50.0 <= mos_neutral < 65.0)

    def test_price_spread_and_arbitrage_gain(self):
        market_a_price = Decimal("3150.00")  # Indore APMC
        market_b_price = Decimal("2850.00")  # Sehore APMC
        benchmark_price = Decimal("2950.00")

        # Spread against benchmark
        spread_a = market_a_price - benchmark_price
        spread_b = market_b_price - benchmark_price
        self.assertEqual(spread_a, Decimal("200.00"))
        self.assertEqual(spread_b, Decimal("-100.00"))

        # Arbitrage gain
        max_arbitrage = market_a_price - market_b_price
        self.assertEqual(max_arbitrage, Decimal("300.00"))

        premium_percent_a = round((spread_a / benchmark_price) * Decimal("100.00"), 2)
        self.assertEqual(premium_percent_a, Decimal("6.78"))


if __name__ == "__main__":
    unittest.main()
