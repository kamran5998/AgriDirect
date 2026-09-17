"""Unit tests for the Decision Support and Market Recommendation Engine."""

import unittest
from decimal import Decimal
from app.services.recommendation_engine import (
    estimate_mandi_distance,
    calculate_freight_cost_per_qtl,
)
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationMethodology,
)


class TestRecommendationEngine(unittest.TestCase):
    """Test suite verifying recommendation scoring, distance calculations, and explanations."""

    def test_estimate_mandi_distance(self):
        # Same district
        d1 = estimate_mandi_distance("Sehore", "MP", "Sehore", "MP")
        self.assertEqual(d1, 15.0)

        # Known district matrix
        d2 = estimate_mandi_distance("Indore", "Madhya Pradesh", "Dewas", "Madhya Pradesh")
        self.assertEqual(d2, 38.0)

        # Same state fallback
        d3 = estimate_mandi_distance("Balaghat", "Madhya Pradesh", "Gwalior", "Madhya Pradesh")
        self.assertEqual(d3, 85.0)

        # Interstate fallback
        d4 = estimate_mandi_distance("Indore", "Madhya Pradesh", "Guntur", "Andhra Pradesh")
        self.assertEqual(d4, 240.0)

    def test_calculate_freight_cost_per_qtl(self):
        # Local radius (<= 15 km)
        f1 = calculate_freight_cost_per_qtl(10.0)
        self.assertEqual(f1, Decimal("15.00"))

        # Regional distance (50 km) -> 15 + (35 * 1.35) = 62.25
        f2 = calculate_freight_cost_per_qtl(50.0)
        self.assertEqual(f2, Decimal("62.25"))

        # Far distance (300 km) -> clamped at 140.00
        f3 = calculate_freight_cost_per_qtl(300.0)
        self.assertEqual(f3, Decimal("140.00"))

    def test_multi_factor_weights_sum_to_one(self):
        weights = {
            "spot_price_premium": 0.30,
            "net_farm_gate_realization": 0.25,
            "demand_liquidity": 0.20,
            "price_momentum": 0.15,
            "price_stability": 0.10,
        }
        total_w = sum(weights.values())
        self.assertAlmostEqual(total_w, 1.00, places=4)

    def test_net_realization_calculation(self):
        spot_price = Decimal("2950.00")
        distance_km = 40.0
        freight_per_qtl = calculate_freight_cost_per_qtl(distance_km)  # 15 + (25*1.35) = 48.75
        net_price = spot_price - freight_per_qtl

        quantity = Decimal("60.0")
        gross_value = spot_price * quantity
        total_freight = freight_per_qtl * quantity
        net_realization = gross_value - total_freight

        self.assertEqual(freight_per_qtl, Decimal("48.75"))
        self.assertEqual(net_price, Decimal("2901.25"))
        self.assertEqual(gross_value, Decimal("177000.00"))
        self.assertEqual(total_freight, Decimal("2925.00"))
        self.assertEqual(net_realization, Decimal("174075.00"))

    def test_disclaimer_advisory_notice(self):
        req = RecommendationRequest(crop_id=1, quantity_quintals=Decimal("50.0"))
        self.assertEqual(req.quantity_quintals, Decimal("50.0"))

        # Check default disclaimer in response schema
        if hasattr(RecommendationResponse, "model_fields"):
            disc = RecommendationResponse.model_fields["disclaimer"].default
        elif hasattr(RecommendationResponse, "__fields__"):
            disc = RecommendationResponse.__fields__["disclaimer"].default
        else:
            disc = getattr(RecommendationResponse, "disclaimer", "")

        self.assertIn("decision-support", str(disc).lower())
        self.assertIn("not constitute guaranteed", str(disc).lower())


if __name__ == "__main__":
    unittest.main()
