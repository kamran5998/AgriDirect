# AgriDirect Pulse - Python FastAPI Backend

FastAPI backend service for **Real-Time Market Intelligence and Direct Market Access for Farmers**.

---

## 🛠️ Architecture

- **Framework**: FastAPI (Python 3.10+)
- **ORM & Database**: SQLAlchemy 2.0 + MySQL 8.0 / MariaDB 10.5+
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt Password Hashing
- **Data Validation**: Pydantic v2
- **Server**: Uvicorn ASGI

---

## 📂 Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization, CORS & router mounting
│   ├── config.py            # Pydantic Settings & environment variable loader
│   ├── database.py          # SQLAlchemy Engine, SessionLocal, and DB dependencies
│   ├── models/              # SQLAlchemy ORM database models
│   │   ├── user.py          # Users & Roles (Farmer, Buyer, Admin)
│   │   ├── farmer.py        # FarmerProfile & FarmerCrop
│   │   ├── buyer.py         # BuyerProfile & BuyerRequirement
│   │   ├── crop.py          # Crop catalog
│   │   ├── market.py        # Markets & MarketPrice
│   │   ├── trade.py         # FarmerListing & BuyerRequest
│   │   ├── notification.py  # Notification feed
│   │   └── prediction.py    # PricePrediction
│   ├── schemas/             # Pydantic validation & serialization schemas
│   │   ├── auth.py
│   │   ├── farmer.py
│   │   ├── buyer.py
│   │   ├── crop.py
│   │   ├── market.py
│   │   ├── admin.py
│   │   └── notification.py
│   ├── routers/             # API endpoint route handlers
│   │   ├── auth.py          # /api/auth/register, /api/auth/login, /api/auth/me
│   │   ├── farmer.py        # /api/farmer/profile, /api/farmer/crops, /api/farmer/listings
│   │   ├── market.py        # /api/markets, /api/markets/prices/search, /api/markets/compare
│   │   ├── crop.py          # /api/crops
│   │   ├── buyer.py         # /api/buyers, /api/buyers/requirements, /api/buyers/requests
│   │   ├── admin.py         # /api/admin/stats, /api/admin/users, /api/admin/prices/override
│   │   └── notifications.py # /api/notifications
│   ├── services/            # Business logic layer
│   │   ├── auth_service.py
│   │   ├── farmer_service.py
│   │   ├── market_service.py
│   │   ├── buyer_service.py
│   │   ├── admin_service.py
│   │   └── notification_service.py
│   └── utils/               # Cryptography, dependencies & error handlers
│       ├── security.py      # JWT & Bcrypt password hashers
│       ├── dependencies.py  # FastAPI OAuth2 & RBAC dependencies
│       └── exceptions.py    # Custom HTTP exceptions
├── .env.example             # Template for environment configuration
├── requirements.txt         # Python package dependencies
├── run.py                   # Local Uvicorn runner
└── README.md
```

---

## 🚀 Setup & Execution

### 1. Create Python Virtual Environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
# Edit .env to set DB_HOST, DB_USER, DB_PASSWORD, and JWT_SECRET_KEY
```

### 4. Initialize Database
Import schema and seed data into your MySQL server:
```bash
mysql -u root -p < ../database/init.sql
```

### 5. Launch FastAPI Server
```bash
python run.py
# Or with uvicorn CLI:
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📖 API Documentation (Swagger & ReDoc)

Once running:
- **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI JSON**: [http://localhost:8000/api/openapi.json](http://localhost:8000/api/openapi.json)
