import os
from supabase import create_client, Client
from ..config import get_settings

settings = get_settings()

# We use the service key for backend operations (bypassing RLS)
# However, we must ensure we attribute actions to the correct user_id.
# Alternatively, we could initialize a client with the user's JWT.
def get_supabase_client() -> Client:
    # Explicitly bypass Pydantic race conditions locally and retrieve the system keys
    url = os.getenv("LUMINAE_SUPABASE_URL") or settings.supabase_url
    key = os.getenv("LUMINAE_SUPABASE_SERVICE_KEY") or os.getenv("LUMINAE_SUPABASE_ANON_KEY") or settings.supabase_service_key or settings.supabase_anon_key
    if not url or not key:
        return None # Return None if not configured, handle gracefully
    return create_client(url, key)

class LazySupabase:
    def __init__(self):
        self._client = None
        
    @property
    def client(self) -> Client:
        if self._client is None:
            self._client = get_supabase_client()
        return self._client
        
    def __getattr__(self, name):
        if self.client is None:
            return None
        return getattr(self.client, name)

supabase = LazySupabase()
