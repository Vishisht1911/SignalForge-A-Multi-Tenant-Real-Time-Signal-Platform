from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import logging
import json
from datetime import datetime
from app.seed import seed_data


import redis
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine

# 🔥 IMPORT MODELS (REQUIRED FOR TABLE CREATION)
from app.models import User, Job, Signal, Candle


from app.routes import auth, candles, signals, jobs

# -------------------------------------------------
# Logging
# -------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}'
)
logger = logging.getLogger(__name__)

# -------------------------------------------------
# App
# -------------------------------------------------
app = FastAPI(title="Signal Platform API", version="1.0.0")

# -------------------------------------------------
# CORS
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# CREATE TABLES (AUTO)
# -------------------------------------------------
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    seed_data()

# -------------------------------------------------
# Middleware
# -------------------------------------------------
@app.middleware("http")
async def add_process_time(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    process_time = time.time() - start
    response.headers["X-Process-Time"] = str(process_time)
    logger.info(json.dumps({
        "method": request.method,
        "path": request.url.path,
        "status": response.status_code,
        "time": process_time
    }))
    return response

# -------------------------------------------------
# Global Exception Handler
# -------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(json.dumps({
        "error": str(exc),
        "path": request.url.path
    }))
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# -------------------------------------------------
# Health Check
# -------------------------------------------------
@app.get("/health")
async def health():
    health_status = {
        "status": "healthy",
        "database": "unknown",
        "redis": "unknown",
        "timestamp": datetime.utcnow().isoformat()
    }

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        health_status["database"] = "healthy"
    except Exception as e:
        health_status["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    try:
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        health_status["redis"] = "healthy"
    except Exception as e:
        health_status["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"

    return JSONResponse(
        content=health_status,
        status_code=200 if health_status["status"] == "healthy" else 503
    )

# -------------------------------------------------
# Routes
# -------------------------------------------------
app.include_router(auth.router, prefix="/v1/auth", tags=["auth"])
app.include_router(candles.router, prefix="/v1/candles", tags=["candles"])
app.include_router(signals.router, prefix="/v1/signals", tags=["signals"])
app.include_router(jobs.router, prefix="/v1/jobs", tags=["jobs"])

# -------------------------------------------------
# Root
# -------------------------------------------------
@app.get("/")
async def root():
    return {"message": "Signal Platform API", "version": "1.0.0"}



