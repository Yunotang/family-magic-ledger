from fastapi import APIRouter, Depends, HTTPException, Body
from ..services import ai_service
from .auth import get_current_user
from ..models import models

router = APIRouter()

@router.post("/text")
async def analyze_text(
    payload: dict = Body(...),
    current_user: models.User = Depends(get_current_user)
):
    text = payload.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    ai_result = await ai_service.analyze_text_with_ai(text)
    
    if not ai_result:
        raise HTTPException(status_code=500, detail="AI failed to parse text")
        
    return ai_result
