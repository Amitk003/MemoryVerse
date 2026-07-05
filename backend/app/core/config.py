from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    DATABASE_URL: str = "sqlite:///./memoryverse.db"
    SECRET_KEY: str = "default-secret-key-change-in-production"
    UPLOAD_DIR: str = "./uploads"
    CHROMA_PERSIST_DIR: str = "./chroma_data"
    GEMINI_MODEL: str = "gemini-2.5-flash"

    class Config:
        env_file = ".env"


settings = Settings()
