"""Configuration and environment variable management using Pydantic Settings."""

import os
from decimal import Decimal
from typing import List, Union, Optional

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    
    class Settings(BaseSettings):
        PROJECT_NAME: str = "AgriDirect Pulse Backend API"
        PROJECT_DESCRIPTION: str = "Real-Time Agricultural Market Intelligence and Direct Market Access for Farmers"
        API_V1_STR: str = "/api"
        VERSION: str = "1.0.0"
        
        # Server configuration
        HOST: str = "0.0.0.0"
        PORT: int = 8000
        DEBUG: bool = True
        
        # MySQL Database credentials
        DB_HOST: str = "localhost"
        DB_PORT: int = 3306
        DB_USER: str = "root"
        DB_PASSWORD: str = ""
        DB_NAME: str = "agridirect_db"
        
        # Optional direct connection string override
        DATABASE_URL: Union[str, None] = None

        @property
        def SQLALCHEMY_DATABASE_URI(self) -> str:
            if self.DATABASE_URL:
                return self.DATABASE_URL
            return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

        # JWT Authentication
        JWT_SECRET_KEY: str = "super_secret_dev_key_agridirect_2026_pulse_change_in_prod"
        JWT_ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

        # CORS origins
        CORS_ORIGINS: List[str] = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "*"
        ]

        # ==========================================
        # Market Data Ingestion & Analytics Service
        # ==========================================
        # Active Data Provider: 'mock' | 'agmarknet' | 'data_gov_in' | 'csv'
        MARKET_DATA_PROVIDER: str = "mock"

        # AGMARKNET (Directorate of Marketing & Inspection, Govt of India) API
        AGMARKNET_API_URL: str = "https://api.agmarknet.gov.in/v1/prices"
        AGMARKNET_API_KEY: Optional[str] = ""

        # Open Government Data (data.gov.in) Agricultural Prices API
        DATA_GOV_IN_API_URL: str = "https://api.data.gov.in/resource"
        DATA_GOV_IN_API_KEY: Optional[str] = ""
        DATA_GOV_IN_RESOURCE_ID: str = "9ef84268-d588-465a-a308-a864a43d0070"

        # Ingestion Pipeline Settings
        INGESTION_ENABLE_MOCK_FALLBACK: bool = True
        INGESTION_BATCH_SIZE: int = 500
        PRICE_MIN_THRESHOLD: Decimal = Decimal("100.00")
        PRICE_MAX_THRESHOLD: Decimal = Decimal("100000.00")

        model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            case_sensitive=True,
            extra="ignore"
        )

except ImportError:
    class Settings:
        PROJECT_NAME: str = "AgriDirect Pulse Backend API"
        PROJECT_DESCRIPTION: str = "Real-Time Agricultural Market Intelligence and Direct Market Access for Farmers"
        API_V1_STR: str = "/api"
        VERSION: str = "1.0.0"
        HOST: str = "0.0.0.0"
        PORT: int = 8000
        DEBUG: bool = True
        DB_HOST: str = os.getenv("DB_HOST", "localhost")
        DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
        DB_USER: str = os.getenv("DB_USER", "root")
        DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
        DB_NAME: str = os.getenv("DB_NAME", "agridirect_db")
        DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", None)

        @property
        def SQLALCHEMY_DATABASE_URI(self) -> str:
            if self.DATABASE_URL:
                return self.DATABASE_URL
            return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

        JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super_secret_dev_key_agridirect_2026_pulse_change_in_prod")
        JWT_ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
        CORS_ORIGINS: List[str] = ["*"]
        MARKET_DATA_PROVIDER: str = os.getenv("MARKET_DATA_PROVIDER", "mock")
        AGMARKNET_API_URL: str = os.getenv("AGMARKNET_API_URL", "https://api.agmarknet.gov.in/v1/prices")
        AGMARKNET_API_KEY: Optional[str] = os.getenv("AGMARKNET_API_KEY", "")
        DATA_GOV_IN_API_URL: str = os.getenv("DATA_GOV_IN_API_URL", "https://api.data.gov.in/resource")
        DATA_GOV_IN_API_KEY: Optional[str] = os.getenv("DATA_GOV_IN_API_KEY", "")
        DATA_GOV_IN_RESOURCE_ID: str = os.getenv("DATA_GOV_IN_RESOURCE_ID", "9ef84268-d588-465a-a308-a864a43d0070")
        INGESTION_ENABLE_MOCK_FALLBACK: bool = True
        INGESTION_BATCH_SIZE: int = 500
        PRICE_MIN_THRESHOLD: Decimal = Decimal("100.00")
        PRICE_MAX_THRESHOLD: Decimal = Decimal("100000.00")


settings = Settings()
