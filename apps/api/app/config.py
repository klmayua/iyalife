"""
IyaLife API Configuration
All secrets loaded from environment — never hardcoded.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    environment:  str  = "development"
    secret_key:   str  = "change-me-in-production"
    debug:        bool = False

    # Supabase
    supabase_url:          str = ""
    supabase_anon_key:     str = ""
    supabase_service_key:  str = ""

    # Paystack
    paystack_secret_key: str = ""
    paystack_public_key: str = ""

    # CORS
    allowed_origins: list[str] = [
        "http://localhost:4321",   # Astro web dev
        "http://localhost:5173",   # React admin dev
        "https://iyalife.com",
        "https://admin.iyalife.com",
    ]

    # Messaging
    whatsapp_token:   str = ""
    telegram_bot_token: str = ""


settings = Settings()
