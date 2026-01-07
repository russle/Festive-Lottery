# Festive Lottery - 2026 紫氣東來・尾牙盛典

這是一個基於 **React 18**、**TypeScript** 和 **Tailwind CSS** 開發的節慶抽獎系統，專為大型企業年終活動、尾牙或春酒設計。

## 🌟 特色功能

- **模組化架構**：易於擴展與維護，元件化設計。
- **動態資料管理**：支援透過 CSV 或 Excel (.xlsx, .xls) 上傳員工名單與獎項清單。
- **AI 吉祥話**：整合 Google Gemini / OpenAI API，生成喜慶的獎項介紹與得獎祝賀。
- **QR Code 查獎**：員工可掃碼即時查詢中獎狀態 (需部署 Cloudflare Worker)。
- **資料持久化**：使用 LocalStorage 儲存資料，重新整理頁面不丟失。
- **視覺效果**：動態粒子背景、金色漸層文字與節慶裝飾。
- **穩定性保障**：內建 Error Boundary 機制，發生錯誤時優雅降級。

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

## 🎲 抽獎機制說明 (公平性宣告)
本系統採用業界標準的 **亂數洗牌演算法 (Fisher-Yates Shuffle)** 變體：
1. **過濾**：系統先從總名單中剔除已中獎人員，鎖定符合資格的候選名單。
2. **洗牌**：使用 `Math.random()` 產生亂數，對候選名單進行隨機排序。
3. **抽取**：從打亂後的名單中，依據該獎項所需的數量，直接截取前 N 位作為得獎者。
*註：程式碼開源透明，無任何後門或權重設定，確保每次抽獎皆為獨立隨機事件。*

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

| 類別 | 技術 |
|------|------|
| **Frontend** | React 18, TypeScript |
| **Styling** | Tailwind CSS |
| **Build Tool** | Vite |
| **Icons** | Lucide React |
| **AI Integration** | Google Gemini API, OpenAI API |
| **Cloud Backend** | Cloudflare Pages, Workers, D1 Database |
| **Data Parsing** | SheetJS (xlsx) |

## 📝 授權

此專案基於 **Apache License 2.0** 授權。詳細內容請參閱 [LICENSE](./LICENSE) 檔案。


