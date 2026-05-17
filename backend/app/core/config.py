import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Family Magic Ledger"
    PROJECT_VERSION: str = "1.0.0"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "DEFAULT_SECRET")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
    
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    AI_MODEL_NAME: str = os.getenv("AI_MODEL_NAME", "gemini-1.5-flash")
    UPLOAD_DIR: str = "static/uploads"

settings = Settings()

# Ensure upload directory exists
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR)
