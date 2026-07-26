"""
Metrics API Router
Serves all nine IyaLife Phase Zero metrics.
Commercial health + Mission health — both required.

Definitions mirror apps/admin/src/hooks/useMetrics.ts so the API and the
admin dashboard never disagree on what a metric means.
"""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional

from ..lib.supabase import get_supabase

router = APIRouter()


class CommercialMetrics(BaseModel):
    repeat_purchase_rate:     Optional[float] = None   # %
    gross_margin_per_order:   Optional[float] = None   # ₦
    referral_activation_rate: Optional[float] = None   # %
    referral_conversion_rate: Optional[float] = None   # %


class MissionMetrics(BaseModel):
    mother_onboarding_rate:    Optional[int]   = None   # count/period
    satisfaction_index:        Optional[float] = None   # avg of 1-5 scores
    success_stories_captured:  Optional[int]   = None   # count/period
    value_exchanges_recorded:  Optional[int]   = None   # count/period
    community_engagement_rate: Optional[float] = None   # %


class MetricsSummary(BaseModel):
    period:     str
    commercial: CommercialMetrics
    mission:    MissionMetrics


def _period_start(period: str) -> datetime:
    now = datetime.now(timezone.utc)
    if period == "current_quarter":
        quarter_month = (now.month - 1) // 3 * 3 + 1
        return now.replace(month=quarter_month, day=1, hour=0, minute=0, second=0, microsecond=0)
    if period == "ytd":
        return now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def _pct(numerator: int, denominator: int) -> Optional[float]:
    if denominator == 0:
        return None
    return round(numerator / denominator * 1000) / 10


def _iso(dt: datetime) -> str:
    return dt.isoformat()


def _parse(ts: str) -> datetime:
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


async def _compute(period: str) -> MetricsSummary:
    supabase = get_supabase()
    now = datetime.now(timezone.utc)
    period_start = _period_start(period)
    since_60d = now - timedelta(days=60)
    since_30d = now - timedelta(days=30)
    since_7d = now - timedelta(days=7)

    # Repeat purchase rate — among mothers who ordered in the last 60 days,
    # what share ordered more than once.
    orders_60d = (
        supabase.table("orders").select("mother_id").gte("created_at", _iso(since_60d)).execute()
    ).data or []
    order_counts: dict[str, int] = {}
    for row in orders_60d:
        order_counts[row["mother_id"]] = order_counts.get(row["mother_id"], 0) + 1
    purchasing_mothers = len(order_counts)
    repeat_mothers = sum(1 for c in order_counts.values() if c > 1)
    repeat_purchase_rate = _pct(repeat_mothers, purchasing_mothers)

    # Gross margin per order — avg order value * 15% Phase Zero default margin
    all_orders = (supabase.table("orders").select("total_amount").execute()).data or []
    order_totals = [o.get("total_amount") or 0 for o in all_orders]
    gross_margin_per_order = round(sum(order_totals) / len(order_totals) * 0.15, 2) if order_totals else None

    # Referral activation rate — referred someone within 30 days of their own signup
    eligible_mothers = (
        supabase.table("mothers").select("id, created_at").lte("created_at", _iso(since_30d)).execute()
    ).data or []
    all_referrals = (
        supabase.table("referrals").select("referrer_id, referred_id, created_at").execute()
    ).data or []
    referrals_by_referrer: dict[str, list[str]] = {}
    for r in all_referrals:
        referrals_by_referrer.setdefault(r["referrer_id"], []).append(r["created_at"])

    activated = 0
    for m in eligible_mothers:
        dates = referrals_by_referrer.get(m["id"])
        if not dates:
            continue
        cutoff = _parse(m["created_at"]) + timedelta(days=30)
        if any(_parse(d) <= cutoff for d in dates):
            activated += 1
    referral_activation_rate = _pct(activated, len(eligible_mothers))

    # Referral conversion rate — referred mothers who went on to order
    referred_ids = {r["referred_id"] for r in all_referrals}
    ordering_mother_ids = {
        o["mother_id"] for o in (supabase.table("orders").select("mother_id").execute().data or [])
    }
    converted = len(referred_ids & ordering_mother_ids)
    referral_conversion_rate = _pct(converted, len(referred_ids))

    onboarding_count = (
        supabase.table("mothers").select("id", count="exact").gte("created_at", _iso(period_start)).execute()
    ).count or 0

    scores = [
        s["score"] for s in (supabase.table("satisfaction_scores").select("score").execute().data or [])
    ]
    satisfaction_index = round(sum(scores) / len(scores), 1) if scores else None

    success_stories_count = (
        supabase.table("success_stories").select("id", count="exact").gte("created_at", _iso(period_start)).execute()
    ).count or 0

    orders_period = (
        supabase.table("orders").select("id", count="exact").gte("created_at", _iso(period_start)).execute()
    ).count or 0
    referrals_period = (
        supabase.table("referrals").select("id", count="exact").gte("created_at", _iso(period_start)).execute()
    ).count or 0
    value_exchanges = orders_period + referrals_period + success_stories_count

    active_count = (
        supabase.table("mothers").select("id", count="exact").gte("last_seen", _iso(since_7d)).execute()
    ).count or 0
    total_count = (supabase.table("mothers").select("id", count="exact").execute()).count or 0
    community_engagement_rate = _pct(active_count, total_count)

    return MetricsSummary(
        period=period,
        commercial=CommercialMetrics(
            repeat_purchase_rate=repeat_purchase_rate,
            gross_margin_per_order=gross_margin_per_order,
            referral_activation_rate=referral_activation_rate,
            referral_conversion_rate=referral_conversion_rate,
        ),
        mission=MissionMetrics(
            mother_onboarding_rate=onboarding_count,
            satisfaction_index=satisfaction_index,
            success_stories_captured=success_stories_count,
            value_exchanges_recorded=value_exchanges,
            community_engagement_rate=community_engagement_rate,
        ),
    )


@router.get("/summary", response_model=MetricsSummary)
async def get_metrics_summary(
    period: str = Query("current_month", description="current_month | current_quarter | ytd"),
):
    """
    Returns all nine IyaLife metrics for the requested period.
    Commercial and mission metrics returned together —
    neither is sufficient without the other.
    """
    return await _compute(period)


@router.get("/commercial", response_model=CommercialMetrics)
async def get_commercial_metrics(period: str = Query("current_month")):
    """Returns commercial health metrics only."""
    return (await _compute(period)).commercial


@router.get("/mission", response_model=MissionMetrics)
async def get_mission_metrics(period: str = Query("current_month")):
    """Returns mission health metrics only."""
    return (await _compute(period)).mission


class SuccessStoryCreate(BaseModel):
    mother_id:   str
    description: str
    category:    str   # "referral_income" | "healthcare_resource" | "community_support" | "other"


@router.post("/success-stories", status_code=201)
async def record_success_story(data: SuccessStoryCreate):
    """
    Records a verified mother success story.
    Mission evidence — not marketing material.
    """
    supabase = get_supabase()
    result = supabase.table("success_stories").insert({
        "mother_id":   data.mother_id,
        "description": data.description,
        "category":    data.category,
        "verified":    True,
    }).execute()
    return {"message": "Success story recorded", "story": result.data[0] if result.data else None}
