from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.documents import router as documents_router
from app.core.config import settings

app = FastAPI(title=settings.app_name, version="0.1.0", description="ProofPocket ownership intelligence API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(documents_router)


@app.get("/")
async def root():
    return {"name": "ProofPocket API", "status": "running", "version": "0.1.0"}


@app.get("/api/v1/health")
async def health():
    return {
        "status": "healthy",
        "environment": settings.environment,
        "bharatcode_configured": bool(settings.bharatcode_api_key),
        "supabase_configured": bool(settings.supabase_url and settings.supabase_service_role_key),
    }
