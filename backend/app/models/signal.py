
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    JSON,
    Index,
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Signal(Base):
    __tablename__ = "signals"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    symbol = Column(String(50), nullable=False)
    timeframe = Column(String(10), nullable=False)
    action = Column(String(10), nullable=False)
    confidence = Column(Float, nullable=False)
    features = Column(JSON, nullable=False)
    veto_reasons = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    tenant = relationship("Tenant", back_populates="signals")
    __table_args__ = (
        Index('idx_signal_tenant_created', 'tenant_id', 'created_at'),
        Index('idx_signal_tenant_symbol', 'tenant_id', 'symbol', 'timeframe'),
    )