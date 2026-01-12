from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://signals_user:signals_pass@localhost:5432/signals_db"
    REDIS_URL: str = "redis://redis:6379/0"
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440
    
    class Config:
        env_file = ".env"

settings = Settings()