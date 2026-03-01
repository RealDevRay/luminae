from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routers import analysis, health
from .middleware.rate_limit import rate_limit_middleware
from .config import get_settings

settings = get_settings()

app = FastAPI(
    title="Luminae API",
    description="Autonomous Research Illumination System API",
    version="1.0.0",
)

import os as _os

@app.on_event("startup")
async def validate_config():
    api_key = _os.getenv("LUMINAE_MISTRAL_API_KEY", "")
    if api_key:
        print(f"✅ Mistral API key loaded ({len(api_key)} chars)")
    else:
        print("❌ WARNING: LUMINAE_MISTRAL_API_KEY is empty! OCR/Analysis will fail.")

# --- Exception handler: always include CORS headers on errors ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

# --- Middleware order matters: LAST added = OUTERMOST ---
# 1. Rate limiter (inner) — runs second
app.middleware("http")(rate_limit_middleware)
# 2. CORS (outer, added last) — runs first, ensures ALL responses have CORS headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(analysis.router)


@app.get("/")
async def root():
    return {
        "name": "Luminae API",
        "version": "1.0.0",
        "description": "Autonomous Research Illumination System",
    }
