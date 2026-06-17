from fastapi import FastAPI
from app.routers import auth

app = FastAPI(
    title="VastraSilai AI Backend"
)

app.include_router(auth.router)


@app.get("/")
def home():
    return {
        "message": "VastraSilai AI Backend Running 🚀"
    }