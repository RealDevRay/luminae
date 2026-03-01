from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

# CRITICAL: Copy LUMINAE_MISTRAL_API_KEY to MISTRAL_API_KEY BEFORE any SDK imports
# The Mistral SDK reads MISTRAL_API_KEY from environment internally
_api_key = os.getenv("LUMINAE_MISTRAL_API_KEY", "")
if _api_key:
    os.environ["MISTRAL_API_KEY"] = _api_key

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
    # Copy LUMINAE_ prefixed vars to SDK-expected names
    api_key = _os.getenv("LUMINAE_MISTRAL_API_KEY", "")
    if api_key:
        # Set MISTRAL_API_KEY so the SDK finds it natively
        _os.environ["MISTRAL_API_KEY"] = api_key
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


@app.get("/debug")
async def debug():
    """Temporary debug endpoint to diagnose Render deployment issues."""
    import os as debug_os
    import importlib

    api_key = debug_os.getenv("LUMINAE_MISTRAL_API_KEY", "")
    supabase_url = debug_os.getenv("LUMINAE_SUPABASE_URL", "")
    redis_url = debug_os.getenv("LUMINAE_UPSTASH_REDIS_REST_URL", "")

    # Check if mistralai is importable
    try:
        import mistralai
        mistral_version = getattr(mistralai, "__version__", "unknown")
        mistral_status = f"installed v{mistral_version}"
    except ImportError as e:
        mistral_status = f"NOT INSTALLED: {e}"

    # Check settings
    try:
        from .config import get_settings
        s = get_settings()
        settings_key = s.mistral_api_key
        settings_key_status = f"{len(settings_key)} chars" if settings_key else "EMPTY"
    except Exception as e:
        settings_key_status = f"ERROR: {e}"

    return {
        "env_LUMINAE_MISTRAL_API_KEY": f"{api_key[:4]}...{api_key[-4:]}" if len(api_key) > 8 else f"EMPTY (len={len(api_key)})",
        "env_LUMINAE_SUPABASE_URL": supabase_url[:30] + "..." if supabase_url else "EMPTY",
        "env_LUMINAE_REDIS_URL": redis_url[:30] + "..." if redis_url else "EMPTY",
        "mistralai_package": mistral_status,
        "settings_mistral_api_key": settings_key_status,
        "python_version": importlib.import_module("sys").version,
        "working_dir": debug_os.getcwd(),
    }
