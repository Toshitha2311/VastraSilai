from supabase import create_client
from app.config import SUPABASE_URL, SUPABASE_KEY

# Default client (anon key) — used for auth operations (sign_up, login)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_user_client(access_token: str):
    """
    Create a Supabase client authenticated with the user's JWT.
    This ensures auth.uid() is set for RLS policies.
    """
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    client.postgrest.auth(access_token)
    return client