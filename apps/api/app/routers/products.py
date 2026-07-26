"""Products API Router"""
from fastapi import APIRouter
from typing import Optional

from ..lib.supabase import get_supabase

router = APIRouter()

CATEGORIES = ["baby-care", "maternal-health", "household", "child-development"]


@router.get("/")
async def list_products(category: Optional[str] = None, limit: int = 24, offset: int = 0):
    supabase = get_supabase()
    query = (
        supabase.table("products")
        .select("*", count="exact")
        .eq("in_stock", True)
        .order("created_at", desc=True)
    )
    if category:
        query = query.eq("category", category)
    result = query.range(offset, offset + max(limit, 1) - 1).execute()
    return {"products": result.data, "total": result.count or 0}


@router.get("/categories")
async def list_categories():
    supabase = get_supabase()
    counts = {}
    for category in CATEGORIES:
        result = (
            supabase.table("products")
            .select("id", count="exact")
            .eq("category", category)
            .eq("in_stock", True)
            .execute()
        )
        counts[category] = result.count or 0
    return {"categories": [{"id": c, "count": counts[c]} for c in CATEGORIES]}
