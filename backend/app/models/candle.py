
from sqlalchemy import (
    Column,
    String,
    Integer,
    ForeignKey,
    DateTime,
    Float,
    Index,
    UniqueConstraint,
)
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime
from sqlalchemy.orm import relationship


class Candle(Base):
    __tablename__ = "candles"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    symbol = Column(String(50), nullable=False)
    timeframe = Column(String(10), nullable=False)
    ts = Column(DateTime, nullable=False)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    tenant = relationship("Tenant", back_populates="candles")
    __table_args__ = (
        UniqueConstraint('tenant_id', 'symbol', 'timeframe', 'ts', name='uq_candle_key'),
        Index('idx_candle_tenant_symbol_time', 'tenant_id', 'symbol', 'timeframe', 'ts'),
    )
