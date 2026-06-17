from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth
from app.routers import tailors
from app.routers import customers
from app.routers import measurements
from app.routers import orders
from app.routers import payments
from app.routers import notifications
from app.routers import analytics
from app.routers import dashboard

app = FastAPI(
    title="VastraSilai AI Backend",
    description=(
        "🪡 Complete backend for VastraSilai – a smart tailor management system. "
        "Features: customer management, measurements, orders, payments, "
        "WhatsApp chatbot, revenue analytics, delivery scheduling & multilingual support."
    ),
    version="1.0.0",
    contact={
        "name": "VastraSilai Support",
        "email": "support@vastrasilai.com",
    },
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROUTERS ────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(tailors.router)
app.include_router(customers.router)
app.include_router(measurements.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(notifications.router)
app.include_router(analytics.router)
app.include_router(dashboard.router)


# ── HEALTH CHECK ───────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def home():
    return {
        "message": "VastraSilai AI Backend Running 🚀",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }