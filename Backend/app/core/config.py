from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "local"
    DATA_PATH: str = "C:\APCS\Challenges\AIC2025\Data2"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()