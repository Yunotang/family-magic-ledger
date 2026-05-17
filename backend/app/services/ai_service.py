from google import genai
from ..core.config import settings
from PIL import Image
import json
import re

def get_ai_client():
    key = settings.GOOGLE_API_KEY.strip()
    if not key or "貼在這邊" in key:
        return None
    try:
        return genai.Client(api_key=key, http_options={'api_version': 'v1'})
    except Exception:
        return None

async def analyze_receipt_with_ai(image_path: str):
    client = get_ai_client()
    if not client: return None
    
    model_name = settings.AI_MODEL_NAME if settings.AI_MODEL_NAME else "gemini-2.0-flash"
    
    try:
        print(f"[AI Debug] >>> 正在使用 {model_name} 辨識收據 <<<")
        img = Image.open(image_path)
        if max(img.size) > 2000:
            img.thumbnail((2000, 2000))
        
        prompt = "Parse this receipt. Return ONLY JSON: {\"detected_amount\": float, \"detected_date\": \"YYYY-MM-DD\", \"suggested_category\": \"Food/Transport/Housing/Entertainment/Other\", \"description\": \"Chinese description\"}"
        
        response = client.models.generate_content(model=model_name, contents=[prompt, img])
        return _parse_ai_json(response.text)
    except Exception as e:
        print(f"[AI Debug] AI 異常: {e}")
        return None

async def analyze_text_with_ai(user_text: str):
    client = get_ai_client()
    if not client: return None
    
    model_name = settings.AI_MODEL_NAME if settings.AI_MODEL_NAME else "gemini-2.0-flash"
    
    try:
        print(f"[AI Debug] >>> 正在使用 {model_name} 解析文字: {user_text} <<<")
        prompt = f"User said: \"{user_text}\". Extract financial info. Return ONLY JSON: {{\"detected_amount\": float, \"detected_date\": \"YYYY-MM-DD\", \"suggested_category\": \"Food/Transport/Housing/Entertainment/Other\", \"description\": \"Summary in Chinese\"}}. If no date, use today's date."
        
        response = client.models.generate_content(model=model_name, contents=prompt)
        return _parse_ai_json(response.text)
    except Exception as e:
        print(f"[AI Debug] AI 文字解析異常: {e}")
        return None

async def analyze_finances_with_ai(finance_data: dict):
    client = get_ai_client()
    if not client: return "AI 服務尚未配置，無法提供分析。"
    
    model_name = settings.AI_MODEL_NAME if settings.AI_MODEL_NAME else "gemini-2.0-flash"
    
    try:
        data_str = json.dumps(finance_data, ensure_ascii=False)
        prompt = f"""
        你是一位專業的家庭理財顧問。以下是該家庭本月的支出數據（JSON 格式）：
        {data_str}
        
        請根據這些數據，提供 3 點具體的分析與建議：
        1. 支出分佈評核（哪個類別佔比異常？）。
        2. 消費行為觀察（是否有衝動購物或重複支出？）。
        3. 具體的省錢魔法建議。
        
        請使用親切、幽默且富有「魔法感」的語氣，並使用繁體中文回傳。
        """
        
        print(f"[AI Debug] >>> 正在生成財務分析報告 <<<")
        response = client.models.generate_content(model=model_name, contents=prompt)
        return response.text if response.text else "AI 暫時無法解讀這些數據。"
    except Exception as e:
        print(f"[AI Debug] 財務分析異常: {e}")
        return "召喚 AI 顧問失敗，請稍後再試。"

def _parse_ai_json(text):
    if not text: return None
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group())
            amt_raw = data.get("detected_amount") or data.get("total_amount") or data.get("amount") or 0
            try:
                amt = float(str(amt_raw).replace('$', '').replace(',', '').strip())
            except:
                amt = 0.0
            
            return {
                "detected_amount": amt,
                "detected_date": data.get("detected_date") or data.get("date"),
                "suggested_category": data.get("suggested_category") or data.get("category") or "Other",
                "description": data.get("description") or "AI 辨識結果"
            }
        except:
            return None
    return None
