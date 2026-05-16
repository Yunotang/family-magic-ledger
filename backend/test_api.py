# 家庭透明化記帳系統 (MVP) 測試指南

本文件提供一套完整的測試流程，用於驗證系統的後端 API 與前端功能是否運作正常。

---

## 1. 後端 API 自動化測試腳本
建立一個 `backend/test_api.py` 檔案，可用於快速測試後端核心流程。

```python
import requests
import uuid
import random

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_full_workflow():
    # 1. 註冊測試
    email = f"magic_{uuid.uuid4().hex[:6]}@test.com"
    password = "testpassword123"
    print(f"[*] 正在測試註冊: {email}")
    reg_res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "username": "測試法師",
        "password": password
    })
    assert reg_res.status_code == 200, "註冊失敗"

    # 2. 登入測試
    print("[*] 正在測試登入...")
    login_res = requests.post(f"{BASE_URL}/auth/login", data={
        "username": email,
        "password": password
    })
    assert login_res.status_code == 200, "登入失敗"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. 建立家庭測試
    print("[*] 正在測試建立家庭...")
    hh_res = requests.post(f"{BASE_URL}/households", headers=headers, json={
        "name": "我們的測試魔法屋"
    })
    assert hh_res.status_code == 200, "建立家庭失敗"
    invite_code = hh_res.json()["invite_code"]
    print(f"[+] 家庭建立成功! 邀請碼: {invite_code}")

    # 4. 新增帳務測試
    print("[*] 正在測試新增帳務...")
    tx_res = requests.post(f"{BASE_URL}/transactions", headers=headers, json={
        "amount": -150.50,
        "category": "Food",
        "is_public": True,
        "description": "測試晚餐",
        "trans_date": "2026-05-16T12:00:00Z"
    })
    assert tx_res.status_code == 200, "新增帳務失敗"

    # 5. 查詢帳務測試
    print("[*] 正在測試查詢帳務...")
    list_res = requests.get(f"{BASE_URL}/transactions", headers=headers)
    assert len(list_res.json()) >= 1, "查詢結果數量不符"
    print("[+] 帳務查詢成功!")

    print("\n[✅] 所有後端核心流程測試通過!")

if __name__ == "__main__":
    try:
        test_full_workflow()
    except Exception as e:
        print(f"\n[❌] 測試失敗: {e}")
```

---

## 2. 手動測試清單 (前端驗證)

### A. 初始啟動流程
- [ ] **註冊功能**：確認填入 Email、名稱、密碼後能成功導向登入頁面。
- [ ] **登入功能**：填入正確帳密，確認能進入儀表板。
- [ ] **建立家庭**：新帳號進入儀表板後，是否出現「建立我的魔法家庭」按鈕？點擊後輸入名稱是否成功重新整理並顯示餘額？

### B. 帳務管理 (CRUD)
- [ ] **快速記帳**：點擊下方的「＋」號，使用虛擬鍵盤輸入金額，選擇「公帳」，確認儲存後跳轉至明細頁。
- [ ] **私帳隔離**：建立一筆「私帳」，確認這筆帳在明細中帶有「個人」圖示。
- [ ] **明細呈現**：確認明細頁面顯示正確的日期、類別、金額與付款人。

### C. AI OCR 辨識 (關鍵功能)
- [ ] **圖片上傳**：點擊「AI 掃描」，上傳一張包含金額與日期的收據圖片。
- [ ] **辨識解析**：確認系統是否自動抓取出「金額」與「日期」？
- [ ] **儲存驗證**：點擊「施法完畢，儲存！」，確認該筆資料出現在交易清單中。

### D. 統計報表
- [ ] **圓餅圖與趨勢**：進入報表頁面，確認「本月支出」總額是否與實際記帳金額相符？確認類別比例是否正確？

---

## 3. 如何執行自動化測試
1. 確保後端 `uvicorn` 正在運行。
2. 確保虛擬環境已啟動。
3. 執行：`python test_api.py` (需先安裝 `pip install requests`)
