import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "UniFleet Intelligent AGV/AMR Fleet Manager"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "unifleet_hackathon_super_secret_key_2026"

    # Database
    POSTGRES_USER: str = "unifleet"
    POSTGRES_PASSWORD: str = "unifleet_secret_pass"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "unifleet_db"
    DATABASE_URL: str = "postgresql+asyncpg://unifleet:unifleet_secret_pass@localhost:5432/unifleet_db"
    FALLBACK_DATABASE_URL: str = "sqlite+aiosqlite:///./unifleet_fallback.db"

    # MQTT
    MQTT_BROKER_HOST: str = "localhost"
    MQTT_BROKER_PORT: int = 1883
    MQTT_CLIENT_ID: str = "unifleet_brain_core"

    # Broadcast & Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WEBSOCKET_BROADCAST_INTERVAL_MS: int = 250

    # Logic
    LOW_BATTERY_THRESHOLD: float = 20.0

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
