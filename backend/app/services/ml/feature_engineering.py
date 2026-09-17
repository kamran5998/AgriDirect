"""Feature Engineering Pipeline for Agricultural Commodity Time-Series Price Prediction."""

import math
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import List, Dict, Tuple, Optional, Any


FEATURE_NAMES = [
    "price_lag_1",
    "price_lag_2",
    "price_lag_3",
    "price_lag_7",
    "rolling_mean_3",
    "rolling_mean_7",
    "rolling_mean_14",
    "rolling_std_7",
    "price_delta_1d",
    "price_delta_7d",
    "min_max_spread",
    "day_of_week",
    "day_of_month",
    "month",
    "sin_month",
    "cos_month",
    "sin_day_of_week",
    "cos_day_of_week",
]


class AgriFeatureEngineer:
    """Transforms raw historical agricultural price timeseries into supervised ML features."""

    @classmethod
    def extract_features_from_history(
        cls,
        historical_records: List[Dict[str, Any]],
        horizon_days: int = 1
    ) -> Tuple[List[List[float]], List[float], List[str]]:
        """
        Takes raw chronological price observations (sorted ascending by date)
        and builds (X, y) training datasets.

        Each observation dictionary should have:
        - 'recorded_at': datetime or date
        - 'price': float or Decimal (modal price)
        - 'min_price': Optional[float]
        - 'max_price': Optional[float]

        Returns:
        - X: List[List[float]] (feature matrix)
        - y: List[float] (target prices at t + horizon_days)
        - feature_names: List[str]
        """
        if len(historical_records) < 14:
            return [], [], FEATURE_NAMES

        # Ensure sorted ascending by date
        sorted_records = sorted(
            historical_records,
            key=lambda r: r["recorded_at"] if isinstance(r["recorded_at"], (datetime, date)) else datetime.fromisoformat(str(r["recorded_at"]))
        )

        prices = [float(r["price"]) for r in sorted_records]
        min_prices = [float(r.get("min_price", r["price"])) for r in sorted_records]
        max_prices = [float(r.get("max_price", r["price"])) for r in sorted_records]
        dates = [
            r["recorded_at"] if isinstance(r["recorded_at"], (datetime, date))
            else datetime.fromisoformat(str(r["recorded_at"]))
            for r in sorted_records
        ]

        X: List[List[float]] = []
        y: List[float] = []

        # We need at least 7 lag days + 14 rolling window to form features
        start_idx = 14
        end_idx = len(prices) - horizon_days

        for i in range(start_idx, end_idx + 1):
            target_price = prices[i + horizon_days - 1]
            feat_row = cls._build_feature_row(
                prices=prices[:i + 1],
                min_prices=min_prices[:i + 1],
                max_prices=max_prices[:i + 1],
                record_date=dates[i]
            )
            X.append(feat_row)
            y.append(target_price)

        return X, y, FEATURE_NAMES

    @classmethod
    def build_latest_inference_features(
        cls,
        historical_records: List[Dict[str, Any]],
        target_date: Optional[datetime] = None
    ) -> Optional[List[float]]:
        """
        Constructs the feature vector from the most recent historical observations
        to predict forward prices.
        """
        if len(historical_records) < 14:
            return None

        sorted_records = sorted(
            historical_records,
            key=lambda r: r["recorded_at"] if isinstance(r["recorded_at"], (datetime, date)) else datetime.fromisoformat(str(r["recorded_at"]))
        )

        prices = [float(r["price"]) for r in sorted_records]
        min_prices = [float(r.get("min_price", r["price"])) for r in sorted_records]
        max_prices = [float(r.get("max_price", r["price"])) for r in sorted_records]
        
        eval_date = target_date or (sorted_records[-1]["recorded_at"] + timedelta(days=1))
        if not isinstance(eval_date, (datetime, date)):
            eval_date = datetime.fromisoformat(str(eval_date))

        return cls._build_feature_row(
            prices=prices,
            min_prices=min_prices,
            max_prices=max_prices,
            record_date=eval_date
        )

    @classmethod
    def _build_feature_row(
        cls,
        prices: List[float],
        min_prices: List[float],
        max_prices: List[float],
        record_date: Any
    ) -> List[float]:
        """Constructs a single row of 18 features from price history and calendar date."""
        curr_p = prices[-1]

        # 1. Historical Lag features (relative to forecast horizon)
        lag_1 = prices[-1]
        lag_2 = prices[-2] if len(prices) >= 2 else lag_1
        lag_3 = prices[-3] if len(prices) >= 3 else lag_2
        lag_7 = prices[-7] if len(prices) >= 7 else prices[0]

        # 2. Rolling Average features
        r3_slice = prices[-3:]
        rolling_3 = sum(r3_slice) / len(r3_slice)

        r7_slice = prices[-7:]
        rolling_7 = sum(r7_slice) / len(r7_slice)

        r14_slice = prices[-14:]
        rolling_14 = sum(r14_slice) / len(r14_slice)

        # 3. Rolling volatility (Standard deviation over 7 days)
        if len(r7_slice) > 1:
            var_7 = sum((x - rolling_7) ** 2 for x in r7_slice) / (len(r7_slice) - 1)
            rolling_std_7 = math.sqrt(var_7)
        else:
            rolling_std_7 = 0.0

        # 4. Momentum / Delta features
        price_delta_1d = curr_p - lag_2
        price_delta_7d = curr_p - lag_7

        # 5. Price spread (Daily intraday volatility)
        curr_min = min_prices[-1]
        curr_max = max_prices[-1]
        spread = max(0.0, curr_max - curr_min)

        # 6. Calendar & Cyclical Seasonality features
        dt = record_date if isinstance(record_date, (datetime, date)) else datetime.fromisoformat(str(record_date))
        day_of_week = float(dt.weekday())  # 0=Monday, 6=Sunday
        day_of_month = float(dt.day)
        month = float(dt.month)

        # Cyclical month encoding (sine/cosine periodicity for 12 months)
        sin_month = math.sin(2 * math.pi * (month - 1) / 12.0)
        cos_month = math.cos(2 * math.pi * (month - 1) / 12.0)

        # Cyclical weekday encoding (periodicity for 7 days)
        sin_dow = math.sin(2 * math.pi * day_of_week / 7.0)
        cos_dow = math.cos(2 * math.pi * day_of_week / 7.0)

        return [
            round(lag_1, 2),
            round(lag_2, 2),
            round(lag_3, 2),
            round(lag_7, 2),
            round(rolling_3, 2),
            round(rolling_7, 2),
            round(rolling_14, 2),
            round(rolling_std_7, 2),
            round(price_delta_1d, 2),
            round(price_delta_7d, 2),
            round(spread, 2),
            day_of_week,
            day_of_month,
            month,
            round(sin_month, 4),
            round(cos_month, 4),
            round(sin_dow, 4),
            round(cos_dow, 4),
        ]
