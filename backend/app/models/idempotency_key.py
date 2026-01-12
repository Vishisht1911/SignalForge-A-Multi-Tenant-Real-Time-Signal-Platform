from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from app.database import Base

class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(255), unique=True, nullable=False, index=True)
    tenant_id = Column(Integer, nullable=False)
    response = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)