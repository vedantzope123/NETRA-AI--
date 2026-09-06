import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.audit import AuditLogMiddleware
from app.db.session import init_db
from app.db.seed_synthetic_data import seed_database
from app.api.v1 import auth, cases, upload, graph, alerts, assistant, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize SQLite DB and seed synthetic data
    init_db()
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Netra+ — Explainable Criminal Network Analysis System (MHA Problem Statement 26189)",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Audit Logger Middleware
app.add_middleware(AuditLogMiddleware)

# Include API v1 Routers (All 17 exact endpoints from spec)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(cases.router, prefix=settings.API_V1_STR)
app.include_router(upload.router, prefix=settings.API_V1_STR)
app.include_router(graph.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": "NETRA - Explainable Criminal Network Analysis",
        "mha_problem_statement": "26189 (NCRB, Women Safety Division)",
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "synthetic_data": True
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
