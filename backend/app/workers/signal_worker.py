import redis, json, time
from datetime import datetime
from app.database import SessionLocal
from app.models import Job, Signal, Candle
from app.services.signal_engine import SignalEngine
from app.config import settings

def run():
    r = redis.from_url(settings.REDIS_URL)

    print("🚀 Signal worker started")

    while True:
        _, payload = r.brpop("signal_queue")
        data = json.loads(payload)

        db = SessionLocal()
        try:
            job = db.query(Job).filter(Job.id == data["job_id"]).first()
            if not job:
                continue

            job.status = "RUNNING"
            db.commit()

            candles = (
                db.query(Candle)
                .filter(
                    Candle.tenant_id == data["tenant_id"],
                    Candle.symbol == data["symbol"],
                    Candle.timeframe == data["timeframe"]
                )
                .order_by(Candle.ts.desc())
                .limit(50)
                .all()
            )

            if len(candles) < 50:
                raise ValueError("Not enough candles")

            engine = SignalEngine(list(reversed(candles)))
            result = engine.generate_signal()

            signal = Signal(
                tenant_id=data["tenant_id"],
                symbol=data["symbol"],
                timeframe=data["timeframe"],
                **result
            )

            db.add(signal)

            job.status = "SUCCESS"
            job.result = result
            job.error = None

            # 🔥 invalidate cache
            r.delete(f"latest_signal:{data['tenant_id']}:{data['symbol']}:{data['timeframe']}")

        except Exception as e:
            job.status = "FAILED"
            job.error = str(e)

        finally:
            job.updated_at = datetime.utcnow()
            db.commit()
            db.close()
