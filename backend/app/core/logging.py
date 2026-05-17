from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging

# 設置專業日誌格式
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("MagicLedger")

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"全域捕捉到異常: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "魔法系統發生內部錯誤，精靈正在修復中...", "error_type": type(exc).__name__}
    )
