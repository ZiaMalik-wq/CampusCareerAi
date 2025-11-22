# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Campus Career AI"
    DATABASE_URL: str
    SECRET_KEY: str
    
    # NEW FIELDS FOR JWT
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # Token expires in 30 mins

    class Config:
        env_file = ".env"

settings = Settings()