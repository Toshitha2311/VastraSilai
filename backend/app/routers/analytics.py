from fastapi import APIRouter, Depends
from app.supabase_client import get_user_client
from app.auth_dependency import get_current_user
from collections import defaultdict

router = APIRouter(prefix="/analytics", tags=["Revenue Analytics"])


def _ids(client, tailor_id):
    custs = client.table("Customers").select("customer_id").eq("tailor_id", tailor_id).execute()
    cids = [c["customer_id"] for c in (custs.data or [])]
    if not cids: return [], []
    orders = client.table("Orders").select("order_id").in_("customer_id", cids).execute()
    return cids, [o["order_id"] for o in (orders.data or [])]

@router.get("/revenue/overview")
def revenue_overview(user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    cids, oids = _ids(client, user["tailor_id"])
    if not oids: return {"total_revenue": 0, "collected": 0, "pending_dues": 0, "total_orders": 0, "total_customers": len(cids)}
    pmts = client.table("Payments").select("total_amount, advance_amount, remaining_amount, payment_status").in_("order_id", oids).execute()
    return {"total_revenue": sum(p["total_amount"] for p in (pmts.data or [])), "collected": sum(p["advance_amount"] for p in (pmts.data or [])), "pending_dues": sum(p["remaining_amount"] or 0 for p in (pmts.data or [])), "total_orders": len(oids), "total_customers": len(cids), "paid_orders": sum(1 for p in (pmts.data or []) if p["payment_status"] == "paid")}

@router.get("/revenue/monthly")
def monthly_revenue(user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    _, oids = _ids(client, user["tailor_id"])
    if not oids: return {"monthly": []}
    pmts = client.table("Payments").select("advance_amount, total_amount, created_at").in_("order_id", oids).execute()
    monthly = defaultdict(lambda: {"collected": 0, "total": 0, "count": 0})
    for p in (pmts.data or []):
        if p["created_at"]:
            k = p["created_at"][:7]
            monthly[k]["collected"] += p["advance_amount"] or 0
            monthly[k]["total"] += p["total_amount"] or 0
            monthly[k]["count"] += 1
    return {"monthly": [{"month": k, **v} for k, v in sorted(monthly.items())]}

@router.get("/orders/status-breakdown")
def order_status_breakdown(user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    _, oids = _ids(client, user["tailor_id"])
    if not oids: return {"breakdown": {}}
    orders = client.table("Orders").select("status").in_("order_id", oids).execute()
    bd = defaultdict(int)
    for o in (orders.data or []): bd[o["status"]] += 1
    return {"breakdown": dict(bd)}

@router.get("/customers/top")
def top_customers(user=Depends(get_current_user), limit: int = 5):
    client = get_user_client(user["token"])
    custs = client.table("Customers").select("customer_id, customer_name, phone").eq("tailor_id", user["tailor_id"]).execute()
    if not custs.data: return {"top_customers": []}
    result = []
    for c in custs.data:
        ords = client.table("Orders").select("order_id").eq("customer_id", c["customer_id"]).execute()
        oids = [o["order_id"] for o in (ords.data or [])]
        spend = 0
        if oids:
            ps = client.table("Payments").select("advance_amount").in_("order_id", oids).execute()
            spend = sum(p["advance_amount"] or 0 for p in (ps.data or []))
        result.append({**c, "total_orders": len(oids), "total_spend": spend})
    result.sort(key=lambda x: x["total_spend"], reverse=True)
    return {"top_customers": result[:limit]}

@router.get("/orders/cloth-breakdown")
def cloth_breakdown(user=Depends(get_current_user)):
    client = get_user_client(user["token"])
    _, oids = _ids(client, user["tailor_id"])
    if not oids: return {"cloth_types": {}}
    orders = client.table("Orders").select("cloth_type").in_("order_id", oids).execute()
    bd = defaultdict(int)
    for o in (orders.data or []): bd[o["cloth_type"]] += 1
    return {"cloth_types": dict(bd)}
