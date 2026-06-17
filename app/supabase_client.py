from typing import Optional

from supabase import create_client, Client

from app.config import SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY

# Main client used for all regular queries (Auth + table access).
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Optional admin client, only created if a service-role key is provided.
# Used for privileged operations like deleting an Auth user.
supabase_admin: Optional[Client] = (
    create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_SERVICE_KEY else None
)
