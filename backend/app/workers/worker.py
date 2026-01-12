
import redis, json, time, numpy as np
from app.database import SessionLocal
from app.models.signal import Signal, Job

r = redis.Redis(host="redis", port=6379)

def ema(prices, n):
    w=np.exp(np.linspace(-1.,0.,n))
    w/=w.sum()
    return np.convolve(prices,w,mode='valid')[-1]

while True:
    job_raw=r.brpop("jobs", timeout=5)
    if not job_raw:
        continue
    payload=json.loads(job_raw[1])
    job_id=payload["job_id"]
    tenant=payload["tenant_id"]

    db=SessionLocal()
    job=db.get(Job, job_id)
    job.status="RUNNING"
    db.commit()

    prices=np.random.rand(100)*100
    fast=ema(prices,10)
    slow=ema(prices,30)

    action="BUY" if fast>slow else "SELL"
    confidence=abs(fast-slow)/fast

    sig=Signal(
        tenant_id=tenant,
        symbol="BTC",
        action=action,
        confidence=min(confidence,1.0),
        features=json.dumps({"ema_fast":fast,"ema_slow":slow})
    )
    db.add(sig)
    job.status="SUCCESS"
    db.commit()

    r.delete("latest:"+tenant)
