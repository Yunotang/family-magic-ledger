# 家庭透明化記帳系統 (MVP) 軟體設計文件 (SDD) V1

## 文件資訊
| 項目 | 內容 |
|------|------|
| 文件版本 | 1.1 (V1 正式版) |
| 建立日期 | 2026年5月16日 |
| 對應 PRD 版本 | 1.1 (V1) |
| 文件狀態 | 已核准並完成實作 |

---

## 2. 技術架構 (V1 最終選型)

### 2.1 技術棧
| 層級 | 技術選擇 | 具體版本/細節 |
|------|----------|---------------|
| 前端框架 | React (Vite) | 18.x (使用 HashRouter) |
| 後端框架 | FastAPI | >= 0.115.0 |
| 資料庫 | SQLite | `family_finance.db` |
| ORM | SQLAlchemy | 2.0.28 |
| 安全加密 | Passlib + Bcrypt | **Bcrypt == 4.0.1** (重要：解決相容性) |
| OCR 引擎 | Tesseract OCR | pytesseract (本地路徑配置) |
| 狀態管理 | React useState | 輕量化實作 |

### 2.3 實作目錄結構
```text
D:\PRDSDD\20260516_2_Home/
├── backend/
│   ├── app/
│   │   ├── api/            # auth.py, households.py, transactions.py, ocr.py, reports.py
│   │   ├── core/           # config.py (settings), security.py (JWT)
│   │   ├── models/         # models.py (SQLAlchemy Models)
│   │   ├── schemas/        # schemas.py (Pydantic DTOs)
│   │   ├── services/       # ocr_service.py
│   │   └── database.py     # SQLAlchemy 引擎設定
│   ├── static/uploads/     # 存放收據圖片
│   ├── main.py             # 入口與靜態路徑掛載
│   ├── .env                # 機敏設定
│   └── requirements.txt    # 鎖定版本
├── magic-ledger-app/
│   ├── src/
│   │   ├── pages/          # Login, Register, Dashboard, AIScanner, etc.
│   │   ├── utils/          # api.ts (apiFetch 封裝)
│   │   └── App.tsx         # 路由與 ProtectedRoute
│   └── .env.local          # 前端 API Key 配置
└── backend/family_finance.db # 自動生成之資料庫
```

---

## 3. 資料設計 (V1)

### 3.1 核心資料表 (SQLAlchemy)
- **Transaction.amount**: 使用 `Numeric(10, 2)` 確保金額精度。
- **Transaction.is_public**: Boolean 標記，用於隱私隔離。
- **Household.invite_code**: 8 字元 UUID 片段，設定為 `unique=True`。

---

## 5. API 規格 (V1 實作清單)

### 5.1 Auth 模組
- `POST /api/v1/auth/register`: 註冊新帳號。
- `POST /api/v1/auth/login`: 獲取 JWT Token。

### 5.2 Household 模組
- `POST /api/v1/households`: 建立家庭。
- `GET /api/v1/households/me`: 獲取目前所屬家庭 (404 表示無家庭)。
- `POST /api/v1/households/join/{invite_code}`: 加入現有家庭。

### 5.3 Transaction 模組
- `GET /api/v1/transactions`: 獲取過濾後的交易清單 (依權限)。
- `POST /api/v1/transactions`: 新增帳務 (支援負數金額代表支出)。

### 5.4 OCR & Reports
- `POST /api/v1/ocr/upload`: 圖片上傳與文字解析。
- `GET /api/v1/reports/summary`: 支出分類與總額彙整。

---

## 6. 安全性決策紀錄
1.  **JWT 存儲**：前端存儲於 `localStorage`，透過 `apiFetch` 攔截器自動注入 Header。
2.  **密碼加固**：後端強制使用 `bcrypt` 進行 Salted Hashing。
3.  **隱私隔離**：後端在 SQL 查詢階段即透過 `filter` 限制 `is_public` 權限，非應用程式層級過濾。
4.  **CORS**：開發階段設定為 `allow_origins=["*"]`，建議生產環境限縮。
5.  **相容性**：鎖定 `bcrypt==4.0.1` 以規避 `passlib` 的 `__about__` 屬性錯誤。
