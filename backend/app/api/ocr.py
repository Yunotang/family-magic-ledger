from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import shutil
import os
import uuid
from ..services import ocr_service
from ..core.config import settings
from .auth import get_current_user
from ..models import models

router = APIRouter()

@router.post("/upload")
async def upload_receipt(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    ocr_result = ocr_service.perform_ocr(file_path)
    
    if not ocr_result:
        # Fallback or error
        return {
            "image_url": f"/static/uploads/{unique_filename}",
            "detected_amount": 0.0,
            "detected_date": None,
            "suggested_category": "Other"
        }
        
    return {
        "image_url": f"/static/uploads/{unique_filename}",
        **ocr_result
    }
