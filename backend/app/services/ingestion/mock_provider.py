"""Simulated Mock Data Provider for local development and offline environments.
Explicitly tagged as mock data to ensure transparency and prevent data spoofing.
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.services.ingestion.base_provider import BaseMarketDataProvider
from app.services.ingestion.models import RawMarketPriceRecord


class SimulatedMockMarketDataProvider(BaseMarketDataProvider):
    """
    Generates realistic agricultural APMC market feed data for development and testing.
    Explicitly tags all records with is_mock=True.
    """

    @property
    def provider_name(self) -> str:
        return "SIMULATED_MOCK_PROVIDER"

    @property
    def is_mock(self) -> bool:
        return True

    # Real APMC Mandi clusters across major agricultural states in India
    SAMPLE_MANDI_CATALOG = [
        {"name": "Sehore APMC Yard", "district": "Sehore", "state": "Madhya Pradesh"},
        {"name": "Indore Grain Terminal", "district": "Indore", "state": "Madhya Pradesh"},
        {"name": "Bhopal Karond Mandi", "district": "Bhopal", "state": "Madhya Pradesh"},
        {"name": "Dewas Krishi Mandi", "district": "Dewas", "state": "Madhya Pradesh"},
        {"name": "Ujjain Madhav Nagar Mandi", "district": "Ujjain", "state": "Madhya Pradesh"},
        {"name": "Khanna Grain Market", "district": "Ludhiana", "state": "Punjab"},
        {"name": "Jalandhar Mandi", "district": "Jalandhar", "state": "Punjab"},
        {"name": "Karnal Grain Hub", "district": "Karnal", "state": "Haryana"},
        {"name": "Sirsa APMC Mandi", "district": "Sirsa", "state": "Haryana"},
        {"name": "Akola Cotton & Oilseed Yard", "district": "Akola", "state": "Maharashtra"},
        {"name": "Nashik Lasalgaon Onion Yard", "district": "Nashik", "state": "Maharashtra"},
        {"name": "Latur Pulse & Oilseed Exchange", "district": "Latur", "state": "Maharashtra"},
        {"name": "Kota Bhamashah Mandi", "district": "Kota", "state": "Rajasthan"},
        {"name": "Ganganagar Grain Market", "district": "Sri Ganganagar", "state": "Rajasthan"},
        {"name": "Rajkot APMC Market", "district": "Rajkot", "state": "Gujarat"},
        {"name": "Unjha Spices & Seed Yard", "district": "Mehsana", "state": "Gujarat"},
    ]

    SAMPLE_COMMODITIES = [
        {"crop": "Wheat", "variety": "Sharbati / Lokwan", "base_price": 2860, "spread": 180},
        {"crop": "Soybean", "variety": "Yellow Seed (JS-335)", "base_price": 4680, "spread": 220},
        {"crop": "Basmati Rice", "variety": "Pusa 1121 / 1509", "base_price": 3850, "spread": 260},
        {"crop": "Gram (Chana)", "variety": "Desi / Kabuli Bold", "base_price": 6120, "spread": 310},
        {"crop": "Mustard", "variety": "Black Sarson (42% Oil)", "base_price": 5480, "spread": 250},
        {"crop": "Cotton", "variety": "Medium Staple Shankar-6", "base_price": 7240, "spread": 380},
        {"crop": "Maize", "variety": "Hybrid Yellow Feed", "base_price": 2180, "spread": 140},
        {"crop": "Tur (Arhar)", "variety": "Red Maruthi / Gwalior", "base_price": 9850, "spread": 450},
        {"crop": "Onion", "variety": "Red Medium Grade", "base_price": 1850, "spread": 210},
        {"crop": "Potato", "variety": "Jyoti / Pukhraj", "base_price": 1420, "spread": 160},
    ]

    async def fetch_prices(
        self,
        state: Optional[str] = None,
        crop: Optional[str] = None,
        market: Optional[str] = None,
        limit: int = 200
    ) -> List[RawMarketPriceRecord]:
        """
        Generate raw price feeds with simulated real-world noise (formatting variations, dates, arrival volumes).
        """
        records: List[RawMarketPriceRecord] = []
        now = datetime.utcnow()

        target_mandis = self.SAMPLE_MANDI_CATALOG
        if state:
            target_mandis = [m for m in target_mandis if m["state"].lower() == state.lower()]
        if market:
            target_mandis = [m for m in target_mandis if market.lower() in m["name"].lower()]

        if not target_mandis:
            target_mandis = self.SAMPLE_MANDI_CATALOG

        target_crops = self.SAMPLE_COMMODITIES
        if crop:
            target_crops = [c for c in target_crops if crop.lower() in c["crop"].lower()]

        if not target_crops:
            target_crops = self.SAMPLE_COMMODITIES

        for m in target_mandis:
            for c in target_crops:
                if len(records) >= limit:
                    break

                # Add realistic market fluctuation (+/- 4%)
                fluctuation = random.uniform(-0.04, 0.04)
                modal = round(c["base_price"] * (1 + fluctuation), 2)
                min_p = round(modal - random.uniform(c["spread"] * 0.4, c["spread"] * 0.8), 2)
                max_p = round(modal + random.uniform(c["spread"] * 0.4, c["spread"] * 0.9), 2)
                arrival = random.randint(250, 4800)

                # Simulated timestamp (mostly today or within last 24h)
                hours_ago = random.randint(0, 18)
                rec_date = (now - timedelta(hours=hours_ago)).strftime("%Y-%m-%d %H:%M:%S")

                records.append(
                    RawMarketPriceRecord(
                        crop_name=c["crop"],
                        variety=c["variety"],
                        market_name=m["name"],
                        district=m["district"],
                        state=m["state"],
                        modal_price=str(modal),
                        min_price=str(min_p),
                        max_price=str(max_p),
                        arrival_volume=str(arrival),
                        date_str=rec_date,
                        raw_payload={
                            "provider": self.provider_name,
                            "simulated": True,
                            "market_raw": m["name"],
                            "commodity_raw": c["crop"]
                        }
                    )
                )

        return records

    async def health_check(self) -> Dict[str, Any]:
        return {
            "provider": self.provider_name,
            "status": "HEALTHY",
            "is_mock": True,
            "message": "Simulated mock provider operational. Generates synthetic Indian APMC mandi price feeds."
        }
