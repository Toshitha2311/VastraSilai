from fastapi import FastAPI
from app.routers import auth

app = FastAPI(title="VastraSilai AI Backend")

app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "VastraSilai AI Backend Running 🚀"}