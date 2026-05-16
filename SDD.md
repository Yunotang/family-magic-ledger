# 家庭透明化記帳系統 (MVP) 軟體設計文件 (SDD)

## 文件資訊
| 項目 | 內容 |
|------|------|
| 文件版本 | 1.0 |
| 建立日期 | 2026年5月16日 |
| 對應 PRD 版本 | 1.0 |
| 文件狀態 | 已核准 |

---

## 1. 簡介

### 1.1 文件目的
本文件旨在為「家庭透明化記帳系統 (MVP)」提供詳盡的技術設計規格。此文件專為 **AI Coding Agent (如 Cursor, Claude Code)** 編寫，旨在使其能夠理解系統架構、資料結構、API 規格及實作邏輯，並依序生成高品質、可運行的程式碼。

### 1.2 專案概述
- **專案目標**：建立一個供家庭成員共同使用的透明化記帳工具。
- **核心功能摘要**：
    - 多人共同記帳與家庭群組管理。
    - 公帳/私帳標記機制，保障個人隱私同時確保公用開支透明。
    - AI OCR 收據自動辨識。
    - 視覺化財務統計報表。
- **預期使用者**：核心家庭成員（通常為 2-5 人）。

### 1.3 系統範圍
- **系統邊界**：本系統為一個全端單機/內部應用，不考慮分散式部署或高併發情境。
- **包含的功能**：使用者認證、家庭邀請、帳務 CRUD、圖片上傳、OCR 處理、統計圖表。
- **不包含的功能**：第三方支付整合、多貨幣即時匯率轉換、複雜的容器化部署 (Docker/K8s)。

### 1.4 術語與縮寫
| 術語 | 定義 |
|------|------|
| MVP | 最小可行性產品 (Minimum Viable Product) |
| OCR | 光學字元辨識 (Optical Character Recognition) |
| JWT | JSON Web Token，用於身份驗證 |
| ORM | 物件關係映射 (Object-Relational Mapping) |
| Pydantic | Python 的資料驗證與設定管理庫 |

---

## 2. 技術架構

### 2.1 技術選型總覽
| 層級 | 技術選擇 | 版本 | 選用理由 |
|------|----------|------|----------|
| 程式語言 | Python, TypeScript | 3.10+, 5.0+ | 強型別支援，利於 AI 生成程式碼的正確性。 |
| 前端框架 | React (Vite) | 18.x | 快速構建，社群資源豐富。 |
| 後端框架 | FastAPI | 0.100+ | 高性能、自動化文件、Python 型別標註友善。 |
| 資料庫 | SQLite | 3.x | 無需伺服器配置，單一檔案易於備份與管理。 |
| ORM | SQLAlchemy | 2.0+ | 成熟的資料庫抽象層。 |
| UI 元件庫 | Tailwind CSS + shadcn/ui | Latest | 快速構建美觀介面，AI 容易微調元件原始碼。 |
| OCR 庫 | Tesseract.js / Python-tesseract | - | 提供基礎辨識能力，可離線運作。 |

### 2.2 系統架構圖
```
┌─────────────────────────────────────────────────────────────┐
│                      用戶瀏覽器 (Chrome/Safari)                │
└─────────────────────────────────────────────────────────────┘
                              │ HTTP / JSON
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 前端應用 (React + Vite)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Auth Pages  │  │ Transaction │  │  Dashboard  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │ API Call
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 後端服務 (FastAPI + Python)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Auth Module │  │ Ledger Mod  │  │ OCR Module  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │ SQL (SQLAlchemy)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    資料庫 (SQLite 檔案)                      │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 目錄結構
```text
family-finance-root/
├── backend/                # FastAPI 專案目錄
│   ├── app/
│   │   ├── api/            # API 端點 (Routes)
│   │   ├── core/           # 設定、安全性 (JWT)
│   │   ├── models/         # SQLAlchemy 模型
│   │   ├── schemas/        # Pydantic 模型 (DTOs)
│   │   ├── services/       # 業務邏輯 (OCR, Stats)
│   │   └── database.py     # DB 連線設定
│   ├── static/             # 存放上傳的收據圖片
│   ├── main.py             # 程式進入點
│   └── requirements.txt
├── frontend/               # React (Vite) 專案目錄
│   ├── src/
│   │   ├── components/     # 共用 UI 元件 (shadcn)
│   │   ├── hooks/          # API 請求 (React Query)
│   │   ├── pages/          # 頁面級組件
│   │   ├── store/          # 狀態管理 (Zustand/Context)
│   │   └── utils/          # 格式化、常數
│   └── package.json
└── README.md
```

---

## 3. 資料設計

### 3.1 資料庫選型
- **選用資料庫**：SQLite
- **選用理由**：針對「家庭/個人內部工具」屬性，SQLite 提供零配置、易遷移、高效能的關聯式資料存取，且單一檔案 `family_finance.db` 方便非技術用戶備份。

### 3.2 實體關係圖 (ER Diagram)
```text
[Household] 1 ──── * [User]
    │
    └── 1 ──── * [Transaction]
                  │
[User] 1 ─────────┘ (Created by)
```

### 3.3 資料表設計

**Table: `households` (家庭)**
| 欄位名稱 | 資料型態 | 允許 NULL | 預設值 | 說明 | 約束 |
|----------|----------|-----------|--------|------|------|
| id | INTEGER | NO | AUTO | 主鍵 | PRIMARY KEY |
| name | VARCHAR | NO | - | 家庭名稱 | |
| invite_code | VARCHAR | NO | - | 唯一邀請碼 | UNIQUE |
| created_at | DATETIME | NO | NOW | 建立時間 | |

**Table: `users` (使用者)**
| 欄位名稱 | 資料型態 | 允許 NULL | 預設值 | 說明 | 約束 |
|----------|----------|-----------|--------|------|------|
| id | INTEGER | NO | AUTO | 主鍵 | PRIMARY KEY |
| household_id | INTEGER | YES | NULL | 所屬家庭 | FOREIGN KEY |
| email | VARCHAR | NO | - | 登入郵件 | UNIQUE |
| hashed_password | VARCHAR | NO | - | 加密密碼 | |
| username | VARCHAR | NO | - | 顯示名稱 | |
| avatar_url | VARCHAR | YES | NULL | 頭像路徑 | |

**Table: `transactions` (帳務記錄)**
| 欄位名稱 | 資料型態 | 允許 NULL | 預設值 | 說明 | 約束 |
|----------|----------|-----------|--------|------|------|
| id | INTEGER | NO | AUTO | 主鍵 | PRIMARY KEY |
| user_id | INTEGER | NO | - | 記錄者 | FOREIGN KEY |
| household_id | INTEGER | NO | - | 所屬家庭 | FOREIGN KEY |
| amount | DECIMAL | NO | 0.0 | 金額 | |
| category | VARCHAR | NO | - | 類別 (食衣住行等) | |
| is_public | BOOLEAN | NO | TRUE | 公帳/私帳 | |
| description | TEXT | YES | NULL | 備註 | |
| image_url | VARCHAR | YES | NULL | 收據圖片 | |
| trans_date | DATETIME | NO | NOW | 交易日期 | |
| created_at | DATETIME | NO | NOW | 系統時間 | |

---

## 4. 模組設計

### 4.1 模組總覽
| 模組名稱 | 職責 | 依賴 |
|----------|------|------|
| Auth Module | 處理使用者註冊、登入、JWT 核發 | users table |
| Ledger Module | 處理記帳資料的增刪查改 | transactions table |
| Household Module | 處理家庭組建、邀請碼生成、成員管理 | households table |
| OCR Service | 處理圖片上傳與文字辨識分析 | pytesseract/Tesseract |
| Stats Service | 彙整支出數據、計算公私帳分佈 | Ledger Module |

### 4.2 後端核心類別範例 (Pydantic Schema)

```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TransactionBase(BaseModel):
    amount: float
    category: str
    is_public: bool = True
    description: Optional[str] = None
    trans_date: datetime

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    user_id: int
    household_id: int
    image_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
```

---

## 5. 介面設計

### 5.1 使用者介面 (UI) 設計

**頁面清單：**
| 頁面名稱 | 路徑 | 功能說明 |
|----------|------|----------|
| 登入頁 | `/login` | 提供郵件/密碼登入 |
| 註冊頁 | `/register` | 建立帳號並選擇建立或加入家庭 |
| 儀表板 | `/dashboard` | 顯示本月支出摘要與公私帳圓餅圖 |
| 記帳清單 | `/transactions` | 條列所有記錄，支援篩選與分頁 |
| OCR 上傳頁 | `/ocr-upload` | 相機拍照或上傳圖片並啟動辨識 |

### 5.2 API 詳細規格 (部分)

**`POST /api/v1/transactions`**
- **功能**: 新增一筆記錄
- **請求參數 (JSON)**:
  ```json
  {
    "amount": 150.0,
    "category": "Food",
    "is_public": true,
    "description": "Family Dinner",
    "trans_date": "2026-05-16T18:00:00Z"
  }
  ```
- **回應**: 201 Created

**`POST /api/v1/ocr/upload`**
- **功能**: 上傳收據圖片進行辨識
- **請求格式**: `multipart/form-data`
- **回應格式**:
  ```json
  {
    "detected_amount": 1250,
    "detected_date": "2026-05-15",
    "suggested_category": "Shopping",
    "image_path": "/static/uploads/uuid.jpg"
  }
  ```

---

## 6. 安全設計
- **認證方式**: 使用 `OAuth2 with Password Bearer` 流，發放 **JWT (HS256)**。
- **密碼安全**: 使用 `passlib` 的 `bcrypt` 進行雜湊存儲，嚴禁明文。
- **授權控制**: 
    - 使用者只能查閱所屬家庭的 `is_public=true` 資料。
    - 使用者只能查閱、修改自己建立的 `is_public=false` 資料。
- **輸入驗證**: 所有後端進入點皆通過 Pydantic 強型別檢查，防止異常資料輸入。

---

## 7. 實作路徑 (Implementation Roadmap)

### 階段 1: 後端基礎架構建置
1. **步驟 1.1**: 初始化 Python 環境，安裝 `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `python-jose`, `passlib`。
2. **步驟 1.2**: 編寫 `backend/app/database.py` 建立 SQLite 連線池。
3. **步驟 1.3**: 編寫 `models.py` 實作 `User`, `Household`, `Transaction` 模型並執行 `Base.metadata.create_all()`。
4. **步驟 1.4**: 實作 Auth Service 與 API (註冊、登入、Token 獲取)。

### 階段 2: 帳務核心邏輯開發
1. **步驟 2.1**: 實作 Transaction CRUD 的 Service 層（業務邏輯處理）。
2. **步驟 2.2**: 實作 `GET /transactions`（含權限篩選邏輯：僅看所屬家庭資料）。
3. **步驟 2.3**: 實作 `POST /transactions`（手動輸入）。

### 階段 3: 前端 React 框架與 UI
1. **步驟 3.1**: 使用 `npm create vite@latest frontend -- --template react-ts` 初始化。
2. **步驟 3.2**: 安裝 `tailwindcss`, `shadcn/ui`, `lucide-react`, `axios`, `@tanstack/react-query`。
3. **步驟 3.3**: 實作登入與註冊頁面，處理 JWT 存儲於 LocalStorage/Cookie。
4. **步驟 3.4**: 實作主佈局 (Layout)，包含側邊欄與導航。

### 階段 4: AI OCR 功能實作
1. **步驟 4.1**: 後端安裝 `pytesseract` 並配置 `Tesseract` 引擎路徑。
2. **步驟 4.2**: 實作 `ocr_service.py`：解析圖片文字，使用正則表達式 (Regex) 提取金額。
3. **步驟 4.3**: 前端實作圖片上傳 UI 並串接後端辨識結果，顯示預覽畫面供用戶確認。

### 階段 5: 統計報表與優化
1. **步驟 5.1**: 後端實作 `GET /reports/summary` 計算各類別支出總額。
2. **步驟 5.2**: 前端整合 `recharts` 庫顯示圓餅圖。
3. **步驟 5.3**: 全系統錯誤處理優化 (Global Error Boundary)。

---

## 8. 交付與驗收準則
- **程式碼品質**：後端通過 `mypy` 型別檢查，前端無 `any` 類型。
- **功能完備**：符合 PRD 定義的公私帳切換與 OCR 辨識準確率 (英文/數字 > 80%)。
- **本地運行**：只需執行 `uvicorn main:app` 與 `npm run dev` 即可在本地環境完整運行。

---
**提示 AI Agent**: 
- 在實作資料庫模型時，請務必將 `transactions.amount` 設定為 `Numeric(10, 2)` 或在處理時保留精度。
- 所有 API 請求必須在 Header 中攜帶 `Authorization: Bearer <token>`。
- 前端應實作響應式設計，確保手機瀏覽器可以方便地進行拍照上傳。