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
        # 嘗試強制使用 v1 版本 API，解決 v1beta 找不到模型的問題
        return genai.Client(
            api_key=key,
            http_options={'api_version': 'v1'}
        )
    except Exception as e:
        print(f"[AI Debug] Client 初始化失敗: {e}")
        return None

async def analyze_receipt_with_ai(image_path: str):
    client = get_ai_client()
    if not client: return None
    
    # 根據您的 API 權限，優先嘗試 2.0 或 2.5 系列
    model_name = settings.AI_MODEL_NAME if settings.AI_MODEL_NAME else "gemini-2.0-flash"
    
    try:
        print(f"[AI Debug] >>> 啟動最強辨識模式 (Model: {model_name}) <<<")
        img = Image.open(image_path)
        
        # 優化圖片大小
        if max(img.size) > 2000:
            img.thumbnail((2000, 2000))

        prompt = "Parse this receipt. Return ONLY JSON: {\"detected_amount\": float, \"detected_date\": \"YYYY-MM-DD\", \"suggested_category\": \"Food/Transport/Housing/Entertainment/Other\", \"description\": \"Summary in Traditional Chinese\"}"

        response = client.models.generate_content(
            model=model_name,
            contents=[prompt, img]
        )
        
        text = response.text
        if text:
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                data = json.loads(match.group())
                # 金額校正
                amt_raw = data.get("detected_amount") or data.get("total_amount") or 0
                try:
                    amt = float(str(amt_raw).replace('$', '').replace(',', '').strip())
                except:
                    amt = 0.0
                
                result = {
                    "detected_amount": amt,
                    "detected_date": data.get("detected_date") or data.get("date"),
                    "suggested_category": data.get("suggested_category") or data.get("category") or "Other",
                    "description": data.get("description") or "AI 辨識結果"
                }
                print(f"[AI Debug] ✅ 成功辨識！金額: {result['detected_amount']}")
                return result
                
    except Exception as e:
        print(f"[AI Debug] ❌ 辨識失敗 ({model_name}): {str(e)}")
        # 如果還是 404，嘗試列出可用模型供參考
        try:
            print("[AI Debug] 正在查詢您的 API Key 支援的模型清單...")
            models = client.models.list()
            available = [m.name for m in models]
            print(f"[AI Debug] 可用模型: {available}")
        except:
            pass
            
    return None
