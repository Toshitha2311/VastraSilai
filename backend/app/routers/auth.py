from fastapi import APIRouter, HTTPException
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse
from app.supabase_client import supabase, get_user_client
from supabase import create_client
from app.config import SUPABASE_URL, SUPABASE_KEY
import os

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Service role key bypasses RLS — needed for server-side inserts
# when the user's session isn't available (e.g. email confirmation enabled).
# This is safe only on server-side code and must never be exposed to clients.
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")


def get_admin_client():
    """
    Returns a Supabase client that bypasses RLS.
    Uses service_role key if available, otherwise falls back to anon key.
    """
    key = SERVICE_KEY if SERVICE_KEY else SUPABASE_KEY
    client = create_client(SUPABASE_URL, key)
    return client


# -------------------------
# REQUEST HANDLERS
# -------------------------


# -------------------------
# REGISTER
# -------------------------

@router.post("/register", response_model=AuthResponse)
def register(request: RegisterRequest):
    """Register a new tailor.

    Creates a Supabase Auth user and a matching Tailors record.
    """

    try:
        # Trim email for consistency
        email = request.email.strip()

        auth = supabase.auth.sign_up(
            {
                "email": email,
                "password": request.password,
            }
        )

        if auth.user is None:
            raise HTTPException(
                status_code=400,
                detail="Registration failed"
            )

        user_id = auth.user.id

        # If session exists (no email confirmation), use user's token
        # Otherwise, use admin/service client to bypass RLS
        if auth.session and auth.session.access_token:
            client = get_user_client(auth.session.access_token)
        else:
            client = get_admin_client()

        # Insert a tailor record linked to the Supabase auth user.
        client.table("Tailors").insert(
            {
                "auth_user_id": user_id,
                "name": request.name,
                "phone": request.phone,
                "email": email,
                "shop_name": request.shop_name,
                "address": request.address,
            }
        ).execute()

        return {
            "message": "Registration Successful"
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# -------------------------
# LOGIN
# -------------------------

@router.post("/login")
def login(request: LoginRequest):
    """Authenticate a tailor and return an access token."""

    try:
        # Trim email for consistency
        email = request.email.strip()

        auth = supabase.auth.sign_in_with_password(
            {
                "email": email,
                "password": request.password,
            }
        )

        if auth.user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        # Use user's token to query (RLS-compliant) and ensure the
        # returned data is scoped to the authenticated user.
        client = get_user_client(auth.session.access_token)

        tailor = (
            client.table("Tailors")
            .select("*")
            .eq("auth_user_id", auth.user.id)
            .execute()
        )

        if len(tailor.data) == 0:
            raise HTTPException(
                status_code=404,
                detail="Tailor profile not found"
            )

        tailor = tailor.data[0]

        return {
            "message": "Login Successful",
            "access_token": auth.session.access_token,
            "tailor": tailor
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
