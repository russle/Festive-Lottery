# Festive Lottery - 2026 紫氣東來・尾牙盛典

這是一個基於 **React 18**、**TypeScript** 和 **Tailwind CSS** 開發的節慶抽獎系統，專為企業年終活動、尾牙或春酒設計。
範例：https://festive-lottery.pages.dev/

## 🌟 特色功能

- **多機支援 (Multi-Host)**：支援多台抽獎主機共用同一個雲端 Worker，透過 `Host ID` 進行資料隔離，互不干擾。
- **模組化架構**：易於擴展與維護，元件化設計。
- **動態資料管理**：支援透過 CSV 或 Excel (.xlsx, .xls) 上傳員工名單與獎項清單。
- **AI 吉祥話**：整合 Google Gemini / OpenAI API，生成喜慶的獎項介紹與得獎祝賀。
- **QR Code 查獎**：員工可掃碼即時查詢中獎狀態，二維碼自動帶入主機參數。
- **資料持久化**：使用 LocalStorage 儲存資料，重新整理頁面不丟失。
- **視覺效果**：動態粒子背景、金色漸層文字與節慶裝飾，優化後的 Tailwind 動效。
- **代碼品質**：全專案通過 ESLint 嚴格檢查，無 `any` 類型，確保系統穩定性。

## 💡 系統功能說明
本系統支援兩種運作模式，依據您的需求選擇：

### 1. 抽獎功能 (本地模式)
- **無需伺服器**：下載程式碼後，直接在電腦上執行即可使用。
- **資料安全**：所有名單與中獎紀錄僅儲存於該電腦的瀏覽器中 (LocalStorage)。

### 2. QR Code 查獎功能 (雲端模式)
- **支援多主機隔離**：您可以在「後台管理 > 雲端同步設定」中設定 **主機識別碼 (Host ID)**。不同的主機（例如 A 廳與 B 廳）使用同一個 Worker URL 也不會互相覆蓋中獎名單。
- **部署需求**：需將本專案部署至 Cloudflare Pages/Worker，並綁定 D1 資料庫。
- **自動帶參**：產生的 QR Code 會自動包含 `host` 參數，員工掃描後能對應到正確的主機名單。

## 🎲 抽獎機制說明 (公平性宣告)
本系統採用業界標準的 **亂數洗牌演算法 (Fisher-Yates Shuffle)** 變體：
1. **過濾**：系統先從總名單中剔除已中獎人員，鎖定符合資格的候選名單。
2. **洗牌**：使用 `Math.random()` 產生亂數，對候選名單進行隨機排序。
3. **抽取**：從打亂後的名單中，依據該獎項所需的數量，直接截取前 N 位作為得獎者。

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 啟動開發伺服器
```bash
npm run dev
```

### 程式碼檢查 (Lint)
```bash
npm run lint
```

## 📋 資料格式 (Excel)
建議優先使用 Excel 確保編碼相容性。您可以在後台直接下載範例檔案。

## 🛠 技術棧

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS (Custom Theme)
- **Build Tool**: Vite
- **Cloud**: Cloudflare (Pages, Workers, D1)
- **AI**: Google Gemini / OpenAI

## 📝 授權
此專案基於 **Apache License 2.0** 授權。



