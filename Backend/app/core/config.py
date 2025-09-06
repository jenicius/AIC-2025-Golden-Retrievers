from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "local"
    DATA_PATH: str = "C:\Learning\AIC2025\AIC-2025-Golden-Retrievers\Backend\Data"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()