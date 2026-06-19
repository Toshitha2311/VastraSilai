from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.models import User, Order, Customer, Payment, Notification, CustomerUser
from app.schemas import (
    CustomerDashboardResponse, OrderResponse, NotificationResponse,
    TailorShopResponse, CustomerTailorDetailsResponse, CustomerUserResponse
)
from app.auth import require_customer, get_current_customer_user

router = APIRouter(prefix="/customer", tags=["Customer Portal"])

@router.get("/dashboard", response_model=CustomerDashboardResponse)
def get_customer_dashboard(
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db)
):
    # Find all customer profiles across different tailors matching the logged in customer's phone or name (case-insensitive)
    from sqlalchemy import func
    customers = db.query(Customer).filter(
        Customer.phone == current_user.phone
    ).all()
    
    if not customers:
        return CustomerDashboardResponse(orders=[], pending_balance=0.0, notifications=[])
        
    customer_ids = [c.id for c in customers]
    
    # Query all orders for these customer profiles
    orders = db.query(Order).filter(Order.customer_id.in_(customer_ids)).order_by(Order.delivery_date.asc()).all()
    
    # Attach customer objects, tailor names, and payments eagerly
    order_responses = []
    total_pending_balance = 0.0
    
    for o in orders:
        cust = db.query(Customer).filter(Customer.id == o.customer_id).first()
        o.customer = cust
        
        # Fetch tailor details
        tailor = db.query(User).filter(User.id == o.tailor_id).first()
        if tailor:
            o.tailor_name = tailor.shop_name or tailor.name
        else:
            o.tailor_name = "Tailor"
            
        total_pending_balance += o.balance_amount
        order_responses.append(o)
        
    # Query all notifications for this customer
    notifications = db.query(Notification).filter(
        Notification.customer_id.in_(customer_ids)
    ).order_by(Notification.sent_at.desc()).all()
    
    notif_list = []
    for n in notifications:
        notif_list.append({
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "sent_at": n.sent_at.isoformat(),
            "status": n.status
        })

    return {
        "orders": order_responses,
        "pending_balance": total_pending_balance,
        "notifications": notif_list
    }

@router.get("/me", response_model=CustomerUserResponse)
def get_customer_me(
    current_user: CustomerUser = Depends(get_current_customer_user)
):
    return current_user

@router.get("/tailors", response_model=List[TailorShopResponse])
def get_tailor_shops(
    current_user: CustomerUser = Depends(get_current_customer_user),
    db: Session = Depends(get_db)
):
    tailors = db.query(User).filter(User.role == "tailor").all()
    return tailors

@router.get("/tailor/{tailor_id}", response_model=CustomerTailorDetailsResponse)
def get_customer_tailor_details(
    tailor_id: int,
    current_user: CustomerUser = Depends(get_current_customer_user),
    db: Session = Depends(get_db)
):
    tailor = db.query(User).filter(User.id == tailor_id, User.role == "tailor").first()
    if not tailor:
        raise HTTPException(status_code=404, detail="Tailor shop not found")
        
    customer = db.query(Customer).filter(
        Customer.tailor_id == tailor_id,
        Customer.phone == current_user.phone
    ).first()
    
    if not customer:
        return CustomerTailorDetailsResponse(
            is_registered=False,
            customer_name=None,
            measurements=None,
            orders=[],
            payments=[],
            notifications=[]
        )
        
    measurements = customer.measurements
    orders = db.query(Order).filter(Order.customer_id == customer.id).order_by(Order.delivery_date.asc()).all()
    
    # Eagerly load tailor names & payments
    order_ids = [o.id for o in orders]
    payments = db.query(Payment).filter(Payment.order_id.in_(order_ids)).all() if order_ids else []
    
    for o in orders:
        o.tailor_name = tailor.shop_name or tailor.name
        o.customer = customer
        o.payments = [p for p in payments if p.order_id == o.id]
        
    notifications = db.query(Notification).filter(
        Notification.customer_id == customer.id
    ).order_by(Notification.sent_at.desc()).all()
    
    return CustomerTailorDetailsResponse(
        is_registered=True,
        customer_name=customer.name,
        measurements=measurements,
        orders=orders,
        payments=payments,
        notifications=notifications
    )
