from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional
from ..database import get_db
from ..models import User, Candle, IdempotencyKey
from ..schemas import CandleBulkCreate
from ..dependencies import get_current_user

router = APIRouter()

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_candles(
    request: CandleBulkCreate,
    current_user: User = Depends(get_current_user),
    idempotency_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if idempotency_key:
        existing = db.query(IdempotencyKey).filter(
            IdempotencyKey.key == idempotency_key,
            IdempotencyKey.tenant_id == current_user.tenant_id
        ).first()
        if existing:
            return existing.response
    
    candles_to_insert = []
    for c in request.candles:
        candles_to_insert.append(Candle(tenant_id=current_user.tenant_id, **c.model_dump()))
    
    inserted = 0
    duplicates = 0
    
    try:
        db.bulk_save_objects(candles_to_insert)
        db.commit()
        inserted = len(candles_to_insert)
    except IntegrityError:
        db.rollback()
        for candle in candles_to_insert:
            try:
                db.add(candle)
                db.commit()
                inserted += 1
            except IntegrityError:
                db.rollback()
                duplicates += 1
    
    response = {"inserted": inserted, "duplicates": duplicates, "total": len(request.candles)}
    
    if idempotency_key:
        db.add(IdempotencyKey(key=idempotency_key, tenant_id=current_user.tenant_id, response=response))
        db.commit()
    
    return response