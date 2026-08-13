from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Config vía variables de entorno / .env. Todo tiene un default
    razonable para que la app arranque sin infraestructura externa."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./gym.db"

    # Clave para firmar/verificar el JWT de sesión (cookie httpOnly).
    # Generá una propia para cualquier uso real:
    #   python -c "import secrets; print(secrets.token_hex(32))"
    jwt_secret: str = "dev-only-secret-change-me-0123456789abcdef"
    jwt_algorithm: str = "HS256"
    session_max_age_seconds: int = 60 * 60 * 24 * 30  # 30 días

    # Orígenes permitidos para el frontend (Vite dev server / preview).
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]

    # true solo si la app corre detrás de HTTPS real.
    cookie_secure: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
