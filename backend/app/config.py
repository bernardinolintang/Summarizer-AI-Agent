import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    groq_api_key: str
    db_path: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "summaries.db")
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    rate_limit: str = "30/minute"
    max_file_size_mb: int = 20
    groq_model: str = "llama-3.3-70b-versatile"
    groq_max_tokens: int = 2000
    groq_temperature: float = 0.3

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
