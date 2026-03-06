from fastapi import FastAPI
from api.routers import scans, findings
from fastapi.middleware.cors import CORSMiddleware
from api.core.config import settings
from api.core.database import engine, Base
from api.models import Account, Finding, Scan
from api.routers import dashboard
from api.routers import accounts
from api.routers import auth
from api.models.user import User


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Multi-cloud security scanner with posture telemetry"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(scans.router)
app.include_router(findings.router)
app.include_router(dashboard.router)
app.include_router(accounts.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {
        "message" : "CloudSecure API 2.0",
        "docs" : "/docs",
        "health" : "/health"
    }

@app.get("/health")
def health():
    return {
        "status" : "healthy",
        "version" : settings.VERSION
    }


