import pandas as pd
from typing import List, Dict, Any
from app.models import Candle


class SignalEngine:
    def __init__(self):
        pass

    def generate_signal(self, candles: List[Candle]) -> Dict[str, Any]:
        if not candles or len(candles) < 50:
            return {
                "action": "HOLD",
                "confidence": 0.0,
                "features": {},
                "veto_reasons": ["Insufficient candles (need >= 50)"],
            }

        df = self._to_dataframe(candles)
        features = self._calculate_features(df)
        veto_reasons = []

        # Volatility veto
        if features["atr"] > features["atr_ma"] * 2:
            veto_reasons.append("High volatility detected")

        # EMA crossover logic
        if features["ema_fast"] > features["ema_slow"]:
            action = "BUY"
            confidence = min(
                0.95,
                0.6
                + (features["ema_fast"] - features["ema_slow"])
                / features["ema_slow"],
            )
        elif features["ema_fast"] < features["ema_slow"]:
            action = "SELL"
            confidence = min(
                0.95,
                0.6
                + (features["ema_slow"] - features["ema_fast"])
                / features["ema_fast"],
            )
        else:
            action = "HOLD"
            confidence = 0.5

        # Apply veto
        if veto_reasons:
            action = "HOLD"
            confidence = 0.0

        return {
            "action": action,
            "confidence": float(confidence),
            "features": features,
            "veto_reasons": veto_reasons if veto_reasons else None,
        }

    def _to_dataframe(self, candles: List[Candle]) -> pd.DataFrame:
        data = [
            {
                "ts": c.ts,
                "open": c.open,
                "high": c.high,
                "low": c.low,
                "close": c.close,
                "volume": c.volume,
            }
            for c in candles
        ]

        return pd.DataFrame(data).sort_values("ts")

    def _calculate_features(self, df: pd.DataFrame) -> Dict[str, float]:
        df = df.copy()

        df["ema_fast"] = df["close"].ewm(span=12).mean()
        df["ema_slow"] = df["close"].ewm(span=26).mean()

        df["tr"] = df[["high", "low", "close"]].apply(
            lambda x: max(
                x["high"] - x["low"],
                abs(x["high"] - x["close"]),
                abs(x["low"] - x["close"]),
            ),
            axis=1,
        )

        df["atr"] = df["tr"].rolling(14).mean()
        df["atr_ma"] = df["atr"].rolling(20).mean()

        latest = df.iloc[-1]

        return {
            "ema_fast": float(latest["ema_fast"]),
            "ema_slow": float(latest["ema_slow"]),
            "atr": float(latest["atr"]),
            "atr_ma": float(latest["atr_ma"]),
            "last_close": float(latest["close"]),
        }
