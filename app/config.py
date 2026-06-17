import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Optional: only needed for admin-only operations (e.g. deleting an
# Auth user when a tailor deletes their account). Safe to leave unset.
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_KEY must be set in your .env file. "
        "Make sure there are NO spaces around the '=' sign, e.g.:\n"
        "SUPABASE_URL=https://xxxx.supabase.co\n"
        "SUPABASE_KEY=your-anon-key"
    )
