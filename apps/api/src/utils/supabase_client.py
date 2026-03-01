import os
from supabase import create_client, Client
from ..config import get_settings

settings = get_settings()

# We use the service key for backend operations (bypassing RLS)
# However, we must ensure we attribute actions to the correct user_id.
# Alternatively, we could initialize a client with the user's JWT.
def get_supabase_client() -> Client:
    url = settings.supabase_url
    key = settings.supabase_service_key or settings.supabase_anon_key
    if not url or not key:
        return None # Return None if not configured, handle gracefully
    return create_client(url, key)

supabase = get_supabase_client()
