"""Unit tests for the Machine Learning Price Prediction service."""

import unittest
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Dict, Any

from app.services.ml.feature_engineering import AgriFeatureEngineer, FEATURE_NAMES
from app.services.ml.models import BaselineModelTrainer, compute_metrics


class TestMachineLearningPricePrediction(unittest.TestCase):
    """Test suite for feature engineering, baseline regression models, and prediction intervals."""

    def _generate_synthetic_history(self, days: int = 30, base_price: float = 2800.0) -> List[Dict[str, Any]]:
        """Generates realistic chronological historical price data with seasonal trend and noise."""
        start_date = datetime(2026, 1, 1)
        history = []
        for i in range(days):
            d = start_date + timedelta(days=i)
            # Upward drift + slight wave
            price = base_price + (i * 3.5) + (15.0 * (i % 4 - 1.5))
            history.append({
                "recorded_at": d,
                "price": round(price, 2),
                "min_price": round(price * 0.96, 2),
                "max_price": round(price * 1.04, 2),
            })
        return history

    def test_feature_engineering_dimension_and_lags(self):
        history = self._generate_synthetic_history(days=30)
        X, y, feature_names = AgriFeatureEngineer.extract_features_from_history(history, horizon_days=1)

        self.assertGreater(len(X), 0)
        self.assertEqual(len(X), len(y))
        self.assertEqual(len(feature_names), 18)
        self.assertEqual(len(X[0]), 18)

        # Check that lag-1 price matches current day price at step i
        first_row = X[0]
        lag_1 = first_row[0]
        self.assertEqual(lag_1, history[14]["price"])

    def test_feature_engineering_insufficient_samples(self):
        # Fewer than 14 samples should return empty matrices
        short_history = self._generate_synthetic_history(days=10)
        X, y, feature_names = AgriFeatureEngineer.extract_features_from_history(short_history)
        self.assertEqual(len(X), 0)
        self.assertEqual(len(y), 0)

    def test_latest_inference_features_generation(self):
        history = self._generate_synthetic_history(days=25)
        inference_feat = AgriFeatureEngineer.build_latest_inference_features(history)
        self.assertIsNotNone(inference_feat)
        self.assertEqual(len(inference_feat), 18)

        # Most recent price should be lag_1 in next-day inference
        self.assertEqual(inference_feat[0], history[-1]["price"])

    def test_compute_metrics_accuracy(self):
        y_true = [2800.0, 2850.0, 2900.0, 2950.0]
        y_pred = [2810.0, 2840.0, 2910.0, 2940.0]  # Absolute error = 10 for all points

        mae, rmse, r2, mape = compute_metrics(y_true, y_pred)
        self.assertEqual(mae, 10.0)
        self.assertEqual(rmse, 10.0)
        self.assertGreater(r2, 0.90)  # Strong positive fit
        self.assertLess(mape, 1.0)  # MAPE < 1%

    def test_baseline_models_training_and_comparison(self):
        history = self._generate_synthetic_history(days=35)
        X, y, feature_names = AgriFeatureEngineer.extract_features_from_history(history, horizon_days=1)

        trainer = BaselineModelTrainer(test_split_ratio=0.2)
        best_name, evaluations = trainer.train_and_evaluate(X, y, feature_names)

        self.assertIn(best_name, ["Ridge Linear Regression", "Random Forest Regressor"])
        self.assertIn("Ridge Linear Regression", evaluations)
        self.assertIn("Random Forest Regressor", evaluations)

        # Verify evaluation metrics
        res1 = evaluations["Ridge Linear Regression"]
        self.assertGreaterEqual(res1.mae, 0.0)
        self.assertGreaterEqual(res1.rmse, 0.0)

        # Verify feature importances are extracted
        self.assertGreater(len(res1.feature_importances), 0)

    def test_prediction_inference_bounds(self):
        history = self._generate_synthetic_history(days=30, base_price=2500.0)
        X, y, feature_names = AgriFeatureEngineer.extract_features_from_history(history, horizon_days=7)

        trainer = BaselineModelTrainer(test_split_ratio=0.2)
        trainer.train_and_evaluate(X, y, feature_names)

        feat = AgriFeatureEngineer.build_latest_inference_features(history)
        predicted_price, std_error = trainer.predict_with_best_model(feat)

        self.assertGreater(predicted_price, 2000.0)
        self.assertLess(predicted_price, 3500.0)
        self.assertGreaterEqual(std_error, 0.0)

        # 80% confidence interval check
        margin = 1.28 * std_error
        lower_bound = predicted_price - margin
        upper_bound = predicted_price + margin
        self.assertLessEqual(lower_bound, predicted_price)
        self.assertGreaterEqual(upper_bound, predicted_price)

    def test_disclaimer_presence_and_non_guarantee(self):
        from app.schemas.prediction import PricePredictionResponse, InsufficientDataResponse
        
        # Test PricePredictionResponse disclaimer
        if hasattr(PricePredictionResponse, "model_fields"):
            resp = PricePredictionResponse.model_fields["disclaimer"].default
        elif hasattr(PricePredictionResponse, "__fields__"):
            resp = PricePredictionResponse.__fields__["disclaimer"].default
        else:
            resp = getattr(PricePredictionResponse, "disclaimer", "")
        self.assertIn("statistical estimates", str(resp).lower())
        self.assertIn("not constitute price guarantees", str(resp).lower())

        # Test InsufficientDataResponse
        insuf = InsufficientDataResponse(
            crop_id=1,
            market_id=1,
            historical_samples_count=5
        )
        self.assertEqual(insuf.status, "INSUFFICIENT_DATA")
        self.assertFalse(insuf.has_sufficient_data)
        self.assertIn("14", insuf.message)
        self.assertIn("disabled", insuf.disclaimer.lower())


if __name__ == "__main__":
    unittest.main()
