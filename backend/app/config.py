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

# Vision Model: Deprecated llama-3.2-11b-vision-preview is swapped for meta-llama/llama-4-scout-17b-16e-instruct
GROQ_VISION_MODEL = os.getenv("GROQ_VISION_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")

# CORS origins setting
ALLOWED_ORIGINS_RAW = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_RAW.split(",") if origin.strip()]

# Server port for deployments
PORT = int(os.getenv("PORT", 8000))
