import redis, json, uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Job, User
from app.dependencies import get_current_user
from app.config import settings

router = APIRouter()

@router.post("/generate")
def generate_signal(
    symbol: str = Query(...),
    timeframe: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_id = str(uuid.uuid4())

    job = Job(
        id=job_id,
        tenant_id=current_user.tenant_id,
        symbol=symbol,
        timeframe=timeframe,
        status="PENDING"
    )
    db.add(job)
    db.commit()

    r = redis.from_url(settings.REDIS_URL)
    r.lpush("signal_queue", json.dumps({
        "job_id": job_id,
        "tenant_id": current_user.tenant_id,
        "symbol": symbol,
        "timeframe": timeframe
    }))

    return {"job_id": job_id}
