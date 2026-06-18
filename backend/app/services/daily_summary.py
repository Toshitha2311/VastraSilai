"""
Daily summary generator — builds the morning WhatsApp message for each tailor.
"""
from datetime import datetime, timezone
from app.supabase_client import supabase
from app.services.whatsapp import send_whatsapp_message
import logging

logger = logging.getLogger(__name__)


def build_daily_summary(tailor: dict, client) -> str:
    """Build a formatted daily summary message for a tailor."""
    today = datetime.now(timezone.utc).strftime("%d %b %Y")
    name = tailor["name"]
    tailor_id = tailor["tailor_id"]

    # Get customers
    custs = client.table("Customers").select("customer_id, customer_name, phone").eq("tailor_id", tailor_id).execute()
    customer_ids = [c["customer_id"] for c in (custs.data or [])]
    total_customers = len(customer_ids)

    if not customer_ids:
        return (
            f"🪡 Good Morning, {name}!\n\n"
            f"📊 Daily Overview — {today}\n"
            f"No customers yet. Add your first customer today!\n\n"
            f"Have a great day! 🪡"
        )

    # Get orders
    orders = client.table("Orders").select("order_id, cloth_type, delivery_date, status, customer_id").in_("customer_id", customer_ids).execute()
    all_orders = orders.data or []
    order_ids = [o["order_id"] for o in all_orders]

    # Order stats
    pending = [o for o in all_orders if o["status"] == "pending"]
    in_progress = [o for o in all_orders if o["status"] == "in_progress"]
    ready = [o for o in all_orders if o["status"] == "ready"]

    # Today's deliveries
    today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    todays_deliveries = [o for o in all_orders if o.get("delivery_date") == today_date and o["status"] in ("pending", "in_progress", "ready")]

    # Customer name lookup
    cust_map = {c["customer_id"]: c["customer_name"] for c in (custs.data or [])}

    # Payment stats
    total_revenue = collected = pending_dues = 0
    if order_ids:
        pmts = client.table("Payments").select("total_amount, advance_amount, remaining_amount").in_("order_id", order_ids).execute()
        total_revenue = sum(p["total_amount"] for p in (pmts.data or []))
        collected = sum(p["advance_amount"] for p in (pmts.data or []))
        pending_dues = sum(p["remaining_amount"] or 0 for p in (pmts.data or []))

    # Build message
    msg = f"🪡 Good Morning, {name}!\n\n"
    msg += f"📊 Daily Overview — {today}\n"
    msg += f"━━━━━━━━━━━━━━━━━━━━\n"
    msg += f"👥 Customers: {total_customers}\n"
    msg += f"📦 Orders: {len(all_orders)} total\n"
    msg += f"   🟡 Pending: {len(pending)}\n"
    msg += f"   🔵 In Progress: {len(in_progress)}\n"
    msg += f"   🟢 Ready: {len(ready)}\n"
    msg += f"━━━━━━━━━━━━━━━━━━━━\n"
    msg += f"💰 Revenue: ₹{total_revenue:,.0f}\n"
    msg += f"   ✅ Collected: ₹{collected:,.0f}\n"
    msg += f"   ⏳ Pending: ₹{pending_dues:,.0f}\n"

    if todays_deliveries:
        msg += f"\n📦 Today's Deliveries ({len(todays_deliveries)}):\n"
        for i, o in enumerate(todays_deliveries, 1):
            cname = cust_map.get(o["customer_id"], "Unknown")
            msg += f"   {i}. {cname} — {o['cloth_type']}\n"
    else:
        msg += f"\n📦 No deliveries due today\n"

    msg += f"\nHave a great day! 🪡"
    return msg


def send_daily_summaries():
    """
    Send daily summary WhatsApp message to ALL tailors.
    Call this from a scheduler every morning.
    """
    logger.info("Starting daily summary dispatch...")

    # Get all tailors
    tailors = supabase.table("Tailors").select("tailor_id, name, phone, email").execute()

    results = []
    for tailor in (tailors.data or []):
        try:
            summary = build_daily_summary(tailor, supabase)
            result = send_whatsapp_message(tailor["phone"], summary)
            results.append({
                "tailor": tailor["name"],
                "phone": tailor["phone"],
                "status": result["status"],
                "message_preview": summary[:150],
            })
            logger.info(f"Summary sent to {tailor['name']}: {result['status']}")
        except Exception as e:
            logger.error(f"Failed for {tailor['name']}: {str(e)}")
            results.append({"tailor": tailor["name"], "status": "error", "error": str(e)})

    logger.info(f"Daily summaries complete: {len(results)} tailors processed")
    return results
