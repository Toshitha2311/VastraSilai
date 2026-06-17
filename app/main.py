from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import (
    analytics,
    auth,
    customers,
    dashboard,
    measurements,
    notifications,
    orders,
    payments,
    tailors,
)

app = FastAPI(
    title="VastraSilai AI Backend",
    description="Production-ready backend for the VastraSilai tailoring management app.",
    version="1.0.0",
)

# Allow all origins by default for development. Lock this down to your
# actual frontend domain(s) before going to production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {exc}"},
    )


app.include_router(auth.router)
app.include_router(tailors.router)
app.include_router(customers.router)
app.include_router(measurements.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(notifications.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)


@app.get("/")
def home():
    return {"message": "VastraSilai AI Backend Running 🚀"}
