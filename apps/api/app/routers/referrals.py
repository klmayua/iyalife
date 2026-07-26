"""Referrals API Router"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from ..lib.supabase import get_supabase

router = APIRouter()


class ReferralClickTrack(BaseModel):
    referral_code: str
    source: Optional[str] = None  # e.g. "whatsapp", "direct"


@router.get("/")
async def list_referrals(referrer_id: Optional[str] = None, limit: int = 50, offset: int = 0):
    supabase = get_supabase()
    query = supabase.table("referrals").select("*", count="exact").order("created_at", desc=True)
    if referrer_id:
        query = query.eq("referrer_id", referrer_id)
    result = query.range(offset, offset + max(limit, 1) - 1).execute()
    return {"referrals": result.data, "total": result.count or 0}


@router.post("/track", status_code=201)
async def track_referral(data: ReferralClickTrack):
    supabase = get_supabase()
    supabase.table("referral_clicks").insert({
        "referral_code": data.referral_code,
        "source": data.source,
    }).execute()
    return {"message": "Referral click tracked"}
