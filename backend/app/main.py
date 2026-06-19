"""Backend entrypoint for the VastraSilai FastAPI application.

This module configures middleware, registers routers, and provides a
simple health check endpoint. The commented scheduler code is available
for future WhatsApp daily summary support once credentials are added.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from contextlib import asynccontextmanager
# from apscheduler.schedulers.background import BackgroundScheduler
import logging

from app.routers import auth
from app.routers import tailors
from app.routers import customers
from app.routers import measurements
from app.routers import orders
from app.routers import payments
from app.routers import notifications
from app.routers import analytics
from app.routers import dashboard
# from app.services.daily_summary import send_daily_summaries  # WhatsApp daily summary (disabled — no credentials)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Scheduler: Daily summary at 8:00 AM IST (DISABLED — needs WHATSAPP_TOKEN) ─
# The scheduler is configured here so the app can later send WhatsApp daily
# summaries in the background. It is currently disabled until valid
# WhatsApp credentials are supplied.
# scheduler = BackgroundScheduler(timezone="Asia/Kolkata")
# scheduler.add_job(send_daily_summaries, "cron", hour=8, minute=0, id="daily_summary")
#
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     scheduler.start()
#     logger.info("🕐 Daily summary scheduler started (8:00 AM IST)")
#     yield
#     scheduler.shutdown()
#     logger.info("Scheduler stopped")


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
    # lifespan=lifespan,  # Uncomment when WhatsApp credentials are added
)

# ── CORS ───────────────────────────────────────────────────────────────────────
# For development, requests from any origin are allowed. In production,
# replace this with the application frontend origin(s) to improve security.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROUTERS ────────────────────────────────────────────────────────────────────
# Each router handles a distinct resource set for the tailoring app.
# The auth router is registered first so authentication endpoints are available
# before the protected resource routes are mounted.
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