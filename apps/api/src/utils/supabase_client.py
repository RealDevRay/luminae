import logging
import os

from supabase import Client, create_client

from ..config import get_settings

logger = logging.getLogger("luminae")
settings = get_settings()


# We use the service key for backend operations (bypassing RLS)
# However, we must ensure we attribute actions to the correct user_id.
# Alternatively, we could initialize a client with the user's JWT.
def get_supabase_client() -> Client:
    # Explicitly bypass Pydantic race conditions locally and retrieve the system keys
    url = os.getenv("LUMINAE_SUPABASE_URL") or settings.supabase_url
    key = (
        os.getenv("LUMINAE_SUPABASE_SERVICE_KEY")
        or os.getenv("LUMINAE_SUPABASE_ANON_KEY")
        or settings.supabase_service_key
        or settings.supabase_anon_key
    )
    if not url or not key:
        logger.warning("Supabase URL or key not configured  --  Supabase features disabled")
        return None  # Return None if not configured, handle gracefully
    try:
        return create_client(url, key)
    except Exception as e:
        logger.error(f"Supabase client initialization failed: {e}")
        return None


class LazySupabase:
    def __init__(self):
        self._client = None

    @property
    def client(self) -> Client:
        if self._client is None:
            self._client = get_supabase_client()
        return self._client

    def __bool__(self) -> bool:
        return self.client is not None

    def __getattr__(self, name):
        if self.client is None:
            return None
        return getattr(self.client, name)


supabase = LazySupabase()
