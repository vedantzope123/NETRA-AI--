import os
from pydantic import BaseModel

# User's Google API Key configured for Netra+
GOOGLE_GEMINI_KEY = "AQ.Ab8RN6I7kQz5DsYZ06LPxoFEIBD3pmNDcGGVoZ9v0qSYh_sPlw"

class Settings(BaseModel):
    PROJECT_NAME: str = "Netra+ - Explainable Criminal Network Analysis"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "netra-super-secret-production-key-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./netra.db")
    GEMINI_API_KEY: str = GOOGLE_GEMINI_KEY
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ]

settings = Settings()
