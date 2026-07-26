"""
Paystack webhook handler.

Verifies the webhook signature, then reacts to payment/transfer events by
updating orders, calculating Level 1 referral commission, and crediting the
referrer's pending earnings. Uses the service-role Supabase client — RLS is
bypassed here by design, since this endpoint acts on behalf of the platform,
not a single authenticated mother.
"""
import hashlib
import hmac
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Request

from ..config import settings
from ..lib.supabase import get_supabase

router = APIRouter()
logger = logging.getLogger("iyalife.webhooks")

DEFAULT_COMMISSION_RATE = 0.08  # Level 1 default — 8% of order amount


def _verify_signature(raw_body: bytes, signature: str | None) -> bool:
    if not signature:
        return False
    computed = hmac.new(
        settings.paystack_secret_key.encode("utf-8"),
        raw_body,
        hashlib.sha512,
    ).hexdigest()
    return hmac.compare_digest(computed, signature)


def _get_commission_rate(supabase, supplier_id: str | None) -> float:
    """Look up a supplier-specific commission rate if one exists, else default."""
    if not supplier_id:
        return DEFAULT_COMMISSION_RATE
    try:
        result = (
            supabase.table("supplier_rates")
            .select("rate")
            .eq("supplier_id", supplier_id)
            .single()
            .execute()
        )
        rate = result.data.get("rate") if result.data else None
        return float(rate) if rate is not None else DEFAULT_COMMISSION_RATE
    except Exception:
        # supplier_rates table may not exist yet in Phase Zero — fall back silently.
        return DEFAULT_COMMISSION_RATE


def _handle_charge_success(supabase, event_data: dict) -> None:
    reference = event_data.get("reference")
    amount_kobo = event_data.get("amount", 0)
    amount = amount_kobo / 100  # Paystack sends amounts in kobo

    if not reference:
        logger.warning("charge.success event missing reference — skipping")
        return

    order_result = (
        supabase.table("orders")
        .select("id, mother_id, status")
        .eq("paystack_reference", reference)
        .single()
        .execute()
    )
    order = order_result.data
    if not order:
        logger.warning("charge.success: no order found for reference %s", reference)
        return

    if order["status"] == "confirmed":
        logger.info("Order %s already confirmed — ignoring duplicate webhook", order["id"])
        return

    supabase.table("orders").update({"status": "confirmed"}).eq("id", order["id"]).execute()

    mother_id = order["mother_id"]
    mother_result = (
        supabase.table("mothers")
        .select("id, referred_by_code, total_orders")
        .eq("id", mother_id)
        .single()
        .execute()
    )
    mother = mother_result.data

    if mother and mother.get("referred_by_code"):
        referrer_result = (
            supabase.table("mothers")
            .select("id, pending_earnings")
            .eq("referral_code", mother["referred_by_code"])
            .single()
            .execute()
        )
        referrer = referrer_result.data

        if referrer:
            rate = _get_commission_rate(supabase, None)
            commission_amount = round(amount * rate, 2)

            supabase.table("commission_events").insert({
                "order_id": order["id"],
                "referrer_id": referrer["id"],
                "referred_id": mother_id,
                "level": 1,
                "rate": rate,
                "amount": commission_amount,
                "status": "confirmed",
            }).execute()

            new_pending = (referrer.get("pending_earnings") or 0) + commission_amount
            supabase.table("mothers").update(
                {"pending_earnings": new_pending}
            ).eq("id", referrer["id"]).execute()

    if mother:
        supabase.table("mothers").update(
            {"total_orders": (mother.get("total_orders") or 0) + 1}
        ).eq("id", mother_id).execute()

    logger.info("charge.success processed for order %s (reference %s)", order["id"], reference)


def _handle_transfer_success(supabase, event_data: dict) -> None:
    reference = event_data.get("reference")
    if not reference:
        logger.warning("transfer.success event missing reference — skipping")
        return

    supabase.table("commission_payouts").update(
        {"status": "paid"}
    ).eq("paystack_ref", reference).execute()

    logger.info("transfer.success processed for reference %s", reference)


@router.post("/paystack")
async def paystack_webhook(request: Request):
    raw_body = await request.body()
    signature = request.headers.get("x-paystack-signature")

    timestamp = datetime.now(timezone.utc).isoformat()

    if not _verify_signature(raw_body, signature):
        logger.warning("[%s] Rejected Paystack webhook — invalid signature", timestamp)
        # Paystack requires a fast 200 regardless, so we don't leak verification
        # failures to the caller — just don't process the event.
        return {"status": "ignored"}

    payload = await request.json()
    event = payload.get("event")
    event_data = payload.get("data", {})

    logger.info("[%s] Paystack webhook received: %s", timestamp, event)

    supabase = get_supabase()

    try:
        if event == "charge.success":
            _handle_charge_success(supabase, event_data)
        elif event == "transfer.success":
            _handle_transfer_success(supabase, event_data)
        else:
            logger.info("Unhandled Paystack event type: %s", event)
    except Exception:
        logger.exception("Error processing Paystack webhook event %s", event)

    # Paystack requires a fast 200 OK regardless of internal outcome.
    return {"status": "received"}
