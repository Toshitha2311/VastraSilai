import uvicorn
from app.config import settings

if __name__ == "__main__":
    import os
    is_prod = os.getenv("RENDER") is not None or os.getenv("ENVIRONMENT") == "production"
    print(f"Starting VastraSilai AI Backend server on {settings.HOST}:{settings.PORT} (Production: {is_prod})...")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=not is_prod
    )
