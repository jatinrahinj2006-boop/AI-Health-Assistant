import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import httpx
import logging
from app import config
from app.routers import chat, symptom_checker, medication, health_tips, image_analysis

logger = logging.getLogger("app.startup")

app = FastAPI(
    title="AegisHealth AI - Clinical Health Information Assistant Backend",
    description="FastAPI service utilizing the Groq API for clinical symptom checker wizards, chat, and visual analyses.",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    """
    FastAPI startup diagnostics to verify Groq API configurations, list available
    models, and print active alerts if the configured models are decommissioned.
    """
    print("\n=================== AegisHealth AI Diagnostics ===================")
    if not config.GROQ_API_KEY:
        print("INFO: GROQ_API_KEY is NOT configured.")
        print("      AegisHealth is running in Local Simulation Mode (Mock data).")
        print("==================================================================\n")
        return

    print("INFO: Connecting to Groq models gateway to verify configuration...")
    url = "https://api.groq.com/openai/v1/models"
    headers = {
        "Authorization": f"Bearer {config.GROQ_API_KEY}"
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                models_data = response.json()
                available_models = [m["id"] for m in models_data.get("data", [])]
                
                print("Available Groq Models on gateway:")
                for m in available_models:
                    print(f"  - {m}")
                
                # Check text model
                if config.GROQ_MODEL in available_models:
                    print(f"\n[OK] Text model '{config.GROQ_MODEL}' is active and ready.")
                else:
                    print(f"\n[WARNING] Text model '{config.GROQ_MODEL}' not found in active models!")
                
                # Check vision model
                if config.GROQ_VISION_MODEL in available_models:
                    print(f"[OK] Vision model '{config.GROQ_VISION_MODEL}' is active and ready.")
                else:
                    print(f"[WARNING] Vision model '{config.GROQ_VISION_MODEL}' not found in active models!")
                    active_visions = [m for m in available_models if "vision" in m or "scout" in m]
                    if active_visions:
                        print(f"          Suggested active vision replacements: {active_visions}")
            else:
                print(f"[ERROR] Groq API returned status {response.status_code}: {response.text}")
                print("        Verify your API key has active completion credits.")
    except Exception as e:
        print(f"[ERROR] Connection to Groq gateway failed: {str(e)}")
        print("        Gateway timeouts will gracefully trigger mock local profiles.")
    print("==================================================================\n")

# CORS configuration
allow_origins = config.ALLOWED_ORIGINS
allow_credentials = True
if "*" in allow_origins:
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(chat.router)
app.include_router(symptom_checker.router)
app.include_router(medication.router)
app.include_router(health_tips.router)
app.include_router(image_analysis.router)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Serve static frontend SPA build assets
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if os.path.exists(static_dir):
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        
    # Catchall for single-page routing (SPA fallback)
    @app.get("/{catchall:path}")
    async def serve_spa_frontend(catchall: str):
        # Prevent routing API calls to the index
        if catchall.startswith("api/") or catchall == "health":
            return {"detail": "Not Found"}
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "AegisHealth API Online"}

@app.get("/health")
async def health_status():
    """
    Standard platform health monitor.
    """
    return {
        "status": "healthy",
        "env": config.ENV,
        "llm_provider": config.LLM_PROVIDER,
        "groq_configured": bool(config.GROQ_API_KEY)
    }

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    # Disable Uvicorn auto-reload in production container to optimize resources
    reload_enabled = os.environ.get("ENV", "development") == "development"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload_enabled)
