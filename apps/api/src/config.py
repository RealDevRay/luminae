from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    mistral_api_key: str = ""
    mistral_budget_usd: float = 15.00
    max_request_usd: float = 0.50
    circuit_breaker_threshold: float = 2.00

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""

    upstash_redis_rest_url: str = ""
    upstash_redis_rest_token: str = ""

    api_url: str = "http://localhost:8000"
    demo_mode: bool = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
