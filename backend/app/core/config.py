import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # 專案資訊
    PROJECT_NAME: str = "Family Magic Ledger"
    PROJECT_VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # 安全性配置
    # 注意：在生產環境中應使用更長且隨機的密鑰
    SECRET_KEY: str = "DEFAULT_MAGIC_SECRET_KEY_CHANGE_ME"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 小時
    
    # 資料庫配置
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./family_finance.db"
    
    # 外部服務 (Google AI)
    # 核心安全：金鑰絕不硬編碼在程式碼中，強制從環境變數讀取
    GOOGLE_API_KEY: str
    AI_MODEL_NAME: str = "gemini-2.0-flash"
    
    # 本地 OCR
    TESSERACT_CMD: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    UPLOAD_DIR: str = "static/uploads"

    # Pydantic Settings 配置
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore" # 忽略多餘的環境變數
    )

settings = Settings()

# 確保目錄存在
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
