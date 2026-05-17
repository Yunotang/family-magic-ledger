from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.api import auth, households, transactions, ocr, reports, ai_chat
from app.core.config import settings
from app.core.logging import global_exception_handler
import os

# 初始化資料庫模型
Base.metadata.create_all(bind=engine)

# 建立 FastAPI 實例，整合專業配置
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="專為家庭設計的透明化 AI 記帳系統系統"
)

# 註冊全域異常處理器
app.add_exception_handler(Exception, global_exception_handler)

# 靜態文件服務配置
if not os.path.exists("static"):
    os.makedirs("static")
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS 跨域設定 (專業版：建議生產環境限縮來源)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康檢查端點
@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "healthy", "version": settings.PROJECT_VERSION}

@app.get("/", include_in_schema=False)
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

# 路由模組化註冊
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(households.router, prefix=f"{settings.API_V1_STR}/households", tags=["Households"])
app.include_router(transactions.router, prefix=f"{settings.API_V1_STR}/transactions", tags=["Transactions"])
app.include_router(ocr.router, prefix=f"{settings.API_V1_STR}/ocr", tags=["AI OCR"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Statistics & Reports"])
app.include_router(ai_chat.router, prefix=f"{settings.API_V1_STR}/ai-chat", tags=["AI Chat"])
