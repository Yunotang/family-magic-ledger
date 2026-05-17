from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.api import auth, households, transactions, ocr, reports, ai_chat # Added ai_chat
import os

# Initialize Database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Family Magic Ledger API", version="1.0.0")

# Mount Static Files
if not os.path.exists("static"):
    os.makedirs("static")
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Family Magic Ledger API"}

# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(households.router, prefix="/api/v1/households", tags=["households"])
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])
app.include_router(ocr.router, prefix="/api/v1/ocr", tags=["ocr"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(ai_chat.router, prefix="/api/v1/ai-chat", tags=["ai-chat"])
