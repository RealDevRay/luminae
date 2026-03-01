from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import analysis, health
from .middleware.rate_limit import rate_limit_middleware
from .config import get_settings

settings = get_settings()

app = FastAPI(
    title="Luminae API",
    description="Autonomous Research Illumination System API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(rate_limit_middleware)

app.include_router(health.router)
app.include_router(analysis.router)


@app.get("/")
async def root():
    return {
        "name": "Luminae API",
        "version": "1.0.0",
        "description": "Autonomous Research Illumination System",
    }
