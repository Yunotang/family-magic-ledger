import pytesseract
from PIL import Image
import re
from ..core.config import settings

pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

def perform_ocr(image_path: str):
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image, lang='eng+chi_tra') # Support Traditional Chinese
        
        # Simple extraction logic
        # Look for numbers that look like prices
        amounts = re.findall(r'(\d+(?:\.\d{2})?)', text)
        detected_amount = 0.0
        if amounts:
            # Usually the largest number in a receipt is the total, 
            # but this is a naive assumption.
            detected_amount = max([float(a) for a in amounts])
            
        # Look for date patterns (YYYY/MM/DD or YYYY-MM-DD)
        dates = re.findall(r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})', text)
        detected_date = None
        if dates:
            detected_date = dates[0]
            
        return {
            "raw_text": text,
            "detected_amount": detected_amount,
            "detected_date": detected_date,
            "suggested_category": "Shopping" # Default
        }
    except Exception as e:
        print(f"OCR Error: {e}")
        return None
