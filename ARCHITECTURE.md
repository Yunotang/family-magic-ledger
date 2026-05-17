# 專業架構與安全規範說明 (Architecture & Security)

## 1. 系統架構 (Professional Layering)
本專案採用現代全端分離架構，並在後端落實了層次分明的設計：

*   **API Layer (`app/api/`)**: 負責路由定義、參數校驗與 HTTP 響應。
*   **Service Layer (`app/services/`)**: 封裝業務邏輯 (如 AI 辨識、財務分析)，確保代碼可重用性。
*   **Data Layer (`app/models/`)**: 透過 SQLAlchemy 定義資料庫 Schema。
*   **Schema Layer (`app/schemas/`)**: 使用 Pydantic 進行 DTO (Data Transfer Object) 驗證。
*   **Core Layer (`app/core/`)**: 存放全域配置、安全性設定與日誌。

## 2. API Key 安全保護 (Security First)
針對機敏金鑰（如 Google API Key），我們實施了業界標準的保護機制：

### 核心原則：**後端代理 (Backend Proxying)**
*   **絕不暴露至前端**：所有與 Google AI 的通訊均由後端伺服器發起。前端僅上傳圖片至後端，後端再使用保存在伺服器環境變數中的 API Key 調用 AI。
*   **環境變數隔離**：金鑰僅存儲於 `backend/.env` 中，且該檔案已被納入 `.gitignore`，嚴禁提交至 Git 倉庫。
*   **強型別配置管理**：引入 `pydantic-settings`，在系統啟動時會自動驗證環境變數是否存在，防止因漏設金鑰導致執行期崩潰。

## 3. 生產環境部署建議
若要將此系統部署至雲端（如 AWS, GCP, Vercel）：

*   **Secret Management**: 建議使用雲端原生的秘密管理服務（如 AWS Secrets Manager 或 GitHub Secrets），不要依賴 `.env` 檔案。
*   **CORS 限縮**: 在 `main.py` 中，應將 `allow_origins=["*"]` 修改為您的正式網址。
*   **日誌監控**: 系統已建立 `global_exception_handler`，可輕鬆整合 Sentry 或 ELK 進行錯誤追蹤。

## 4. 容器化支援
專案根目錄提供了 `docker-compose.yml`，支援一鍵啟動完整的開發環境，實現環境一致性。
