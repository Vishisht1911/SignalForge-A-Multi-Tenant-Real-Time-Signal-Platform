from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Job, User
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/{job_id}")
def get_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.tenant_id == current_user.tenant_id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "id": job.id,
        "status": job.status,
        "result": job.result,
        "error": job.error
    }
