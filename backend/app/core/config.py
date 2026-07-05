from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    GEMINI_API_KEY: str = ""
    DATABASE_URL: str = "sqlite:///./data/memoryverse.db"
    SECRET_KEY: str = "default-secret-key-change-in-production"
    UPLOAD_DIR: str = "./uploads"
    CHROMA_PERSIST_DIR: str = "./chroma_data"
    GEMINI_MODEL: str = "gemini-2.5-flash"


settings = Settings()
