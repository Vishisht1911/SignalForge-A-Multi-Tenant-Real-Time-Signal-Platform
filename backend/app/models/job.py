

from sqlalchemy import (
    Column,
    String,
    Integer,
    ForeignKey,
    DateTime,
    Text,
    JSON,
    Index,
)
from app.database import Base
from datetime import datetime


class Job(Base):
    __tablename__ = "jobs"
    id = Column(String(50), primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    status = Column(String(20), nullable=False, default="PENDING")
    symbol = Column(String(50), nullable=False)
    timeframe = Column(String(10), nullable=False)
    result = Column(JSON, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    __table_args__ = (Index('idx_job_tenant', 'tenant_id', 'created_at'),)
