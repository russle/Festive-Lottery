# Festive Lottery - 2026 紫氣東來・尾牙盛典

這是一個基於 **React 18**、**TypeScript** 和 **Tailwind CSS** 開發的節慶抽獎系統，專為大型企業年終活動、尾牙或春酒設計。

## 🌟 特色功能

- **模組化架構**：易於擴展與維護。
- **動態資料管理**：支援透過 CSV 或 Excel (.xlsx, .xls) 上傳員工名單與獎項清單。
- **AI 吉祥話**：整合 Google Gemini API，生成喜慶的獎項介紹與得獎祝賀。
- **手機模擬查獎**：內建手機端查詢介面模擬器。
- **資料持久化**：使用 LocalStorage 儲存資料，重新整理頁面不丟失。
- **視覺效果**：動態粒子背景、金色漸層文字與節慶裝飾。

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
| count | 數量 (預設 1) |
| type | 類型 (`single` 或 `batch`) |

## 🛠 技術棧

- **Core**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **AI**: Google Gemini API

## 📝 授權

此專案僅供開發展示與學習使用。
