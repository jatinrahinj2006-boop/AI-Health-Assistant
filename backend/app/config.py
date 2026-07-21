import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# App environment
ENV = os.getenv("ENV", "development")

# LLM provider settings
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq").lower()

# Substitution rule: map ANTHROPIC_API_KEY to GROQ_API_KEY if needed, or check both
GROQ_API_KEY = os.getenv("GROQ_API_KEY", os.getenv("ANTHROPIC_API_KEY", ""))

# Default Model configuration
# Note: Deprecated llama-3.3-70b-versatile is swapped for openai/gpt-oss-120b
GROQ_MODEL = os.getenv("GROQ_MODEL", os.getenv("ANTHROPIC_MODEL", "openai/gpt-oss-120b"))

# Vision Model: Swap deprecated model for qwen/qwen3.6-27b
GROQ_VISION_MODEL = os.getenv("GROQ_VISION_MODEL", "qwen/qwen3.6-27b")

# CORS origins setting
ALLOWED_ORIGINS_RAW = os.getenv("ALLOWED_ORIGINS", "")
if ALLOWED_ORIGINS_RAW:
    ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_RAW.split(",") if origin.strip()]
else:
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

# Server port for deployments
PORT = int(os.getenv("PORT", 8000))

# Google Places API configuration
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")
MAX_MONTHLY_PLACES_CALLS = int(os.getenv("MAX_MONTHLY_PLACES_CALLS", 2500))
