"""
Mothers API Router
The primary constituency. Every endpoint here serves or protects them.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

from ..lib.supabase import get_supabase

router = APIRouter()


class Tier(str, Enum):
    silver  = "silver"
    gold    = "gold"
    diamond = "diamond"


class MotherCreate(BaseModel):
    full_name:  str
    phone:      str
    email:      Optional[EmailStr] = None
    referred_by: Optional[str] = None   # referral code


@router.get("/", summary="List all mothers (admin)")
async def list_mothers(
    tier:   Optional[Tier] = None,
    limit:  int = 50,
    offset: int = 0,
):
    """Returns paginated list of registered mothers. Filterable by tier."""
    supabase = get_supabase()
    query = supabase.table("mothers").select("*", count="exact").order("created_at", desc=True)
    if tier:
        query = query.eq("tier", tier.value)
    result = query.range(offset, offset + max(limit, 1) - 1).execute()
    return {"mothers": result.data, "total": result.count or 0, "limit": limit, "offset": offset}


@router.get("/{mother_id}", summary="Get mother profile")
async def get_mother(mother_id: str):
    """Returns a single mother's profile and earnings summary."""
    supabase = get_supabase()
    result = supabase.table("mothers").select("*").eq("id", mother_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Mother not found")

    mother = result.data[0]
    return {
        **mother,
        "earnings_summary": {
            "total_earned":     mother.get("total_earned", 0),
            "pending_earnings": mother.get("pending_earnings", 0),
            "paid_out":         mother.get("paid_out", 0),
        },
    }


@router.post("/", summary="Register a new mother", status_code=201)
async def register_mother(data: MotherCreate):
    """
    Onboards a new mother. Assigns Silver tier by default.
    If referred_by is supplied, records the referral relationship.
    """
    supabase = get_supabase()

    referrer_id = None
    if data.referred_by:
        referrer = (
            supabase.table("mothers").select("id").eq("referral_code", data.referred_by).execute()
        )
        if not referrer.data:
            raise HTTPException(status_code=400, detail="Invalid referral code")
        referrer_id = referrer.data[0]["id"]

    insert_result = supabase.table("mothers").insert({
        "full_name":        data.full_name,
        "phone":            data.phone,
        "email":            data.email,
        "referred_by_code": data.referred_by,
        "tier":             Tier.silver.value,
    }).execute()

    if not insert_result.data:
        raise HTTPException(status_code=500, detail="Could not create mother profile")

    mother = insert_result.data[0]

    if referrer_id:
        supabase.table("referrals").insert({
            "referrer_id":   referrer_id,
            "referred_id":   mother["id"],
            "referral_type": "peer",
        }).execute()

    return {"message": "Mother registered", "mother": mother}


@router.get("/{mother_id}/referrals", summary="Get mother's referral network")
async def get_mother_referrals(mother_id: str):
    """Returns all mothers referred by this mother and their conversion status."""
    supabase = get_supabase()
    result = (
        supabase.table("referrals")
        .select("*, referred:referred_id(full_name, tier, total_orders)")
        .eq("referrer_id", mother_id)
        .execute()
    )
    referrals = result.data or []
    total_conversions = sum(
        1 for r in referrals if (r.get("referred") or {}).get("total_orders", 0) > 0
    )
    total_earned = sum(r.get("commission_total") or 0 for r in referrals)
    return {"referrals": referrals, "total_conversions": total_conversions, "total_earned": total_earned}


@router.get("/{mother_id}/orders", summary="Get mother's order history")
async def get_mother_orders(mother_id: str):
    """Returns order history for a mother."""
    supabase = get_supabase()
    result = (
        supabase.table("orders")
        .select("*")
        .eq("mother_id", mother_id)
        .order("created_at", desc=True)
        .execute()
    )
    orders = result.data or []
    total_spent = sum(o.get("total_amount") or 0 for o in orders if o.get("status") != "cancelled")
    return {"orders": orders, "total_orders": len(orders), "total_spent": total_spent}
