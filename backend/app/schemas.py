from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CandleCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=50)
    timeframe: str = Field(..., pattern="^(1m|5m|15m|1h|4h|1d)$")
    ts: datetime
    open: float = Field(..., gt=0)
    high: float = Field(..., gt=0)
    low: float = Field(..., gt=0)
    close: float = Field(..., gt=0)
    volume: float = Field(..., ge=0)

class CandleBulkCreate(BaseModel):
    candles: List[CandleCreate] = Field(..., min_length=1, max_length=1000)

class SignalResponse(BaseModel):
    id: int
    symbol: str
    timeframe: str
    action: str
    confidence: float
    features: Dict[str, Any]
    veto_reasons: Optional[List[str]] = None
    created_at: datetime
    class Config:
        from_attributes = True

class JobResponse(BaseModel):
    id: str
    status: str
    symbol: str
    timeframe: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class SignalHistoryResponse(BaseModel):
    signals: List[SignalResponse]
    total: int
    page: int
    page_size: int