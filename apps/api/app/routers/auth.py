"""
Auth API Router
Thin wrapper around Supabase Auth for OTP-based phone authentication.
The web app talks to Supabase directly via the JS SDK; this exists for
clients that can't (WhatsApp/Telegram bots, future mobile apps).
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..lib.supabase import get_supabase

router = APIRouter()


class LoginRequest(BaseModel):
    phone: str


class VerifyRequest(BaseModel):
    phone: str
    otp: str


class RegisterRequest(BaseModel):
    user_id: str
    full_name: str
    phone: str
    email: str | None = None
    referred_by_code: str | None = None
    referral_type: str = "peer"
    journey_stage: str | None = None
    challenge: str | None = None
    help_needed: str | None = None


@router.post("/login")
async def login(data: LoginRequest):
    """Sends a one-time password to the given phone number."""
    supabase = get_supabase()
    supabase.auth.sign_in_with_otp({"phone": data.phone})
    return {"message": "Verification code sent", "phone": data.phone}


@router.post("/verify")
async def verify(data: VerifyRequest):
    """Verifies the OTP and returns a session. Does not create a mother profile — call /register next for new signups."""
    supabase = get_supabase()
    try:
        result = supabase.auth.verify_otp({
            "phone": data.phone,
            "token": data.otp,
            "type": "sms",
        })
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired code") from exc

    if not result.session or not result.user:
        raise HTTPException(status_code=401, detail="Invalid or expired code")

    return {
        "access_token": result.session.access_token,
        "refresh_token": result.session.refresh_token,
        "user_id": result.user.id,
    }


@router.post("/register", status_code=201)
async def register(data: RegisterRequest):
    """
    Completes registration for an already-verified user (see /verify).
    Validates the referral code, creates the mother profile, and records
    the referral relationship for peer referrers.
    """
    supabase = get_supabase()

    referrer_id = None
    if data.referred_by_code:
        referrer = (
            supabase.table("mothers")
            .select("id")
            .eq("referral_code", data.referred_by_code)
            .execute()
        )
        if not referrer.data:
            raise HTTPException(status_code=400, detail="Invalid referral code")
        referrer_id = referrer.data[0]["id"]

    insert_result = supabase.table("mothers").insert({
        "id": data.user_id,
        "full_name": data.full_name,
        "phone": data.phone,
        "email": data.email,
        "referred_by_code": data.referred_by_code,
        "referral_type": data.referral_type,
        "journey_stage": data.journey_stage,
        "challenge": data.challenge,
        "help_needed": data.help_needed,
        "tier": "silver",
    }).execute()

    if not insert_result.data:
        raise HTTPException(status_code=500, detail="Could not create mother profile")

    mother = insert_result.data[0]

    if referrer_id and data.referral_type == "peer":
        supabase.table("referrals").insert({
            "referrer_id": referrer_id,
            "referred_id": mother["id"],
            "referral_type": data.referral_type,
        }).execute()

    return {"message": "Mother registered", "mother": mother}


@router.post("/logout")
async def logout():
    return {"message": "Sign-out is handled client-side by discarding the session token."}
