# Festive Lottery - 2026 紫氣東來・尾牙盛典

這是一個基於 **React 18**、**TypeScript** 和 **Tailwind CSS** 開發的節慶抽獎系統，專為大型企業年終活動、尾牙或春酒設計。

## 🌟 特色功能

- **模組化架構**：易於擴展與維護。
- **動態資料管理**：支援透過 CSV 或 Excel (.xlsx, .xls) 上傳員工名單與獎項清單。
- **AI 吉祥話**：整合 Google Gemini API，生成喜慶的獎項介紹與得獎祝賀。
- **手機模擬查獎**：內建手機端查詢介面模擬器。
- **資料持久化**：使用 LocalStorage 儲存資料，重新整理頁面不丟失。
- **視覺效果**：動態粒子背景、金色漸層文字與節慶裝飾。

## 💡 系統功能說明
本系統支援兩種運作模式，依據您的需求選擇：

### 1. 抽獎功能 (本地模式)
- **無需伺服器**：下載程式碼後，直接在電腦上執行即可使用。
- **資料安全**：所有名單與中獎紀錄僅儲存於該電腦的瀏覽器中 (LocalStorage)。
- **適用場景**：活動現場僅有一台主控電腦，且不需要讓員工自行查獎。

### 2. QR Code 查獎功能 (雲端模式)
- **需部署至 Cloudflare**：若需要讓員工掃碼查獎，需將本專案部署至 Cloudflare Pages，並綁定 D1 資料庫。
- **後台手動設定**：每家公司(或每次活動)擁有獨立的 Worker，請在「後台管理 > 雲端同步設定」中輸入各自的 Worker 網址，確保資料獨立。
- **即時同步**：主控台抽出的結果會即時同步到雲端，員工掃描 QR Code 即可看到最新中獎狀態。
- **適用場景**：希望提供員工手機查獎功能的活動。

## 🚀 快速開始

### 前置準備
請確保您的環境已安裝 [Node.js](https://nodejs.org/)。

### 安裝依賴
```bash
npm install
```

### 啟動開發伺服器
```bash
npm run dev
```
啟動後請訪問：`http://localhost:5173/`

## 📋 資料格式 (CSV / Excel)

您可以透過後台設定面板上傳自定義資料。建議優先使用 Excel 確保編碼相容性。

### 員工名單 (employees.xlsx / .csv)
| 欄位 | 說明 |
| --- | --- |
| id | 員工編號 (必填) |
| name | 姓名 (必填) |
| dept | 部門 |

### 獎項清單 (prizes.xlsx / .csv)
| 欄位 | 說明 |
| --- | --- |
| name | 獎品名稱 (必填) |
| icon | Emoji 圖示 (預設 🎁) |
| count | 總數量 (預設 1) |
| type | 類型 (`single` 或 `batch`) |
| countPerRound | 每輪抽取人數 (預設與總量相同) |


## 🛠 技術棧

- **Core**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **AI**: Google Gemini API

## 📝 授權

此專案基於 **Apache License 2.0** 授權。詳細內容請參閱專案授權條款。

