"""Orders API Router"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Optional

from ..lib.supabase import get_supabase

router = APIRouter()


class OrderCreate(BaseModel):
    mother_id:          str
    items:              list[dict[str, Any]]
    total_amount:       float
    paystack_reference: Optional[str] = None
    delivery_name:      Optional[str] = None
    delivery_phone:     Optional[str] = None
    delivery_address:   Optional[str] = None
    coupon_code:        Optional[str] = None


@router.get("/")
async def list_orders(status: Optional[str] = None, limit: int = 50, offset: int = 0):
    supabase = get_supabase()
    query = supabase.table("orders").select("*", count="exact").order("created_at", desc=True)
    if status:
        query = query.eq("status", status)
    result = query.range(offset, offset + max(limit, 1) - 1).execute()
    return {"orders": result.data, "total": result.count or 0}


@router.post("/", status_code=201)
async def create_order(data: OrderCreate):
    supabase = get_supabase()
    result = supabase.table("orders").insert({
        "mother_id":          data.mother_id,
        "items":              data.items,
        "total_amount":       data.total_amount,
        "paystack_reference": data.paystack_reference,
        "delivery_name":      data.delivery_name,
        "delivery_phone":     data.delivery_phone,
        "delivery_address":   data.delivery_address,
        "coupon_code":        data.coupon_code,
        "status":             "pending",
    }).execute()
    return {"message": "Order created", "order": result.data[0] if result.data else None}
