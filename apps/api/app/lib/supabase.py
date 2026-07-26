"""
Shared Supabase client for the IyaLife API.
Uses the service role key — bypasses RLS, so this must never be exposed
outside of trusted server-side code (routers, webhooks, background jobs).
"""
from supabase import create_client, Client

from ..config import settings

_client: Client | None = None


def get_supabase() -> Client:
    """Lazily initialise and return the shared service-role Supabase client."""
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _client
