import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .middleware.rate_limit import rate_limit_middleware
from .routers import analysis, chat, health

logger = logging.getLogger("luminae")

# CRITICAL: Copy LUMINAE_MISTRAL_API_KEY to MISTRAL_API_KEY BEFORE any SDK imports
# The Mistral SDK reads MISTRAL_API_KEY from environment internally
_api_key = os.getenv("LUMINAE_MISTRAL_API_KEY", "")
if _api_key:
    os.environ["MISTRAL_API_KEY"] = _api_key

settings = get_settings()

# --- CORS: Allow localhost for testing by default ---
ALLOWED_ORIGINS = [
    "https://luminae.qzz.io",
    "https://www.luminae.qzz.io",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]

app = FastAPI(
    title="Luminae API",
    description="Autonomous Research Illumination System API",
    version="1.0.0",
)


@app.on_event("startup")
async def validate_config():
    # Copy LUMINAE_ prefixed vars to SDK-expected names
    api_key = os.getenv("LUMINAE_MISTRAL_API_KEY", "")
    if api_key:
        os.environ["MISTRAL_API_KEY"] = api_key
        logger.info(f"✅ Mistral API key loaded ({len(api_key)} chars)")
    else:
        logger.warning("❌ LUMINAE_MISTRAL_API_KEY is empty! OCR/Analysis will fail.")


# --- Exception handler: always include CORS headers on errors ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "")
    cors_origin = origin if origin in ALLOWED_ORIGINS else ALLOWED_ORIGINS[0]
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers={
            "Access-Control-Allow-Origin": cors_origin,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
        },
    )


# --- Middleware order matters: LAST added = OUTERMOST ---
# 1. Rate limiter (inner) — runs second
app.middleware("http")(rate_limit_middleware)
# 2. CORS (outer, added last) — runs first, ensures ALL responses have CORS headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(health.router)
app.include_router(analysis.router)
app.include_router(chat.router)


@app.get("/")
async def root():
    return {
        "name": "Luminae API",
        "version": "1.0.0",
        "description": "Autonomous Research Illumination System",
    }
