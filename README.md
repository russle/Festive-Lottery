# Festive Lottery - 2026 紫氣東來・尾牙盛典

[English Version Below](#english-version)

這是一個基於 **React 18**、**TypeScript** 和 **Tailwind CSS** 開發的高級節慶抽獎系統，專為企業年終活動、尾牙或春酒設計。

範例：https://festive-lottery.pages.dev/

## 🌟 特色功能

- **先進架構**：採用 **Context API** 進行全域狀態管理，實現高效的資料流向並徹底消除 Props Drilling。
- **組合式 Hook 設計**：將業務邏輯拆分為獨立的子 Hook（獎項管理、滾動邏輯、雲端同步），大幅提升代碼可讀性與維護性。
- **效能優化**：實作組件 **懶加載 (Lazy Loading)** 與代碼分割，確保流暢的用戶體驗。
- **多機支援 (Multi-Host)**：支援多台抽獎主機共用同一個雲端 Worker，透過 `Host ID` 進行資料隔離。
- **動態資料管理**：支援 CSV 或 Excel (.xlsx, .xls) 快速匯入員工與獎項。
- **AI 吉祥話**：整合 Google Gemini / OpenAI API，智慧生成風趣的獎項介紹與得獎祝賀。
- **QR Code 查獎**：中獎資料即時同步雲端，員工可掃碼即時查詢（自動帶入主機參數）。
- **遠端遙控支援**：適配實體簡報器 (PPT Clicker)，無需游標操作即可掌控全場。
- **視覺美學**：動態粒子背景、玻璃擬態 UI、金色漸層文字，專為高清大螢幕優化。

## 🏗️ 技術架構

系統採用模組化設計，核心邏輯高度解耦：

### 1. 全域狀態中心 (Context)
- `LotteryContext`: 統一管理抽獎階段 (`phase`)、員工、獎項、中獎紀錄及設定。

### 2. 業務邏輯模組 (Custom Hooks)
- `usePrizeManager`: 處理獎項增刪改查、中獎判定與本地持久化。
- `useRollingLogic`: 驅動抽獎動畫引擎、倒數計時與音效控制。
- `useCloudSync`: 自動化與 Cloudflare D1 後端進行中獎同步。
- `useAICommentary`: 封裝 AI 生成介面。

### 3. 動態渲染流程
- 系統依據抽獎階段 (`standby` -> `join` -> `countdown` -> `rolling` -> `reveal` -> `wall`) 自動切換專屬視圖組件。

## 💡 使用模式

### 1. 本地離線模式
- **即插即用**：無需後端，資料直接儲存於瀏覽器 LocalStorage。
- **資料安全**：適合對內部名單高度敏感的場景。

### 2. 雲端同步模式
- **設定 Host ID**：在「系統設定」中配置 Worker URL 與識別碼，即可開啟全場即時查獎。
- **QR Code 下載**：自動產生帶有 host 參數的查獎連結，便於印製桌卡或投影。

## 🎲 抽獎算法
系統嚴格遵循公平隨機原則，採用 **Fisher-Yates Shuffle (洗牌演算法)** 並結合現代瀏覽器安全特性：
1. **加密級隨機數 (CSPRNG)**：使用 `window.crypto.getRandomValues()` 代替傳統的 `Math.random()`，確保隨機來源具備密碼學等級的不可預測性。
2. **Fisher-Yates 洗牌**：採用標準的 $O(n)$ 洗牌演算法，保證名單中的每一種排列組合出現機率均等。
3. **動態過濾**：自動排除已中獎者，並即時驗證剩餘候選人數量是否足夠。

## 🚀 快速開始

### 安裝與啟動
```bash
npm install
npm run dev
```

### 生產環境構建
```bash
npm run build
```

## 🛠 技術棧
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Hooks & State**: Context API, Custom Hooks Palette
- **API Integration**: Cloudflare Workers, Fetch API (Retries Support)
- **Data Handling**: XLSX.js, LocalStorage DB Utility
- **AI**: Gemini Pro / GPT-4o-mini

## 📝 授權
此專案基於 **Apache License 2.0** 授權。

---

<div id="english-version"></div>

# Festive Lottery - 2026 Premium Year-End Celebration

A high-end, festival-themed lottery system built with **React 18**, **TypeScript**, and **Tailwind CSS**, specifically designed for corporate annual dinners, year-end parties, or spring banquets.

Demo: https://festive-lottery.pages.dev/

## 🌟 Key Features

- **Advanced Architecture**: Utilizes **Context API** for global state management, ensuring efficient data flow and eliminating prop drilling.
- **Composable Hook Design**: Business logic is decoupled into independent sub-hooks (Prize Management, Rolling Logic, Cloud Sync), dramatically improving readability and maintainability.
- **Performance Optimization**: Implements **Lazy Loading** and Code Splitting for a seamless user experience.
- **Multi-Host Support**: Allows multiple lottery instances to share a single cloud Worker, with data isolation via `Host ID`.
- **Dynamic Data Management**: Supports fast import of employees and prizes via CSV or Excel (.xlsx, .xls).
- **AI Blessings**: Integrated with Google Gemini / OpenAI APIs to intelligently generate witty prize introductions and winner congratulations.
- **QR Code Inquiry**: Real-time cloud sync and QR code scanning for employees to check their winning status instantly (auto-injecting host parameters).
- **Remote Control Support**: Compatible with physical presentation clickers (PPT Clicker) and remote iPad controls for mouse-free operation.
- **Visual Excellence**: Features dynamic particle backgrounds, glassmorphism UI, and gold gradient typography, optimized for high-definition large screens.

## 🏗️ Technical Architecture

The system adopts a modular design with highly decoupled core logic:

### 1. Global State (Context)
- `LotteryContext`: Centralized management of phases (`standby`, etc.), employees, prizes, winners, and settings.

### 2. Business Logic (Custom Hooks)
- `usePrizeManager`: Handles prize CRUD operations, winning logic, and local persistence.
- `useRollingLogic`: Powers the animation engine, countdowns, and sound effects.
- `useCloudSync`: Automates synchronization of winners with the Cloudflare D1 backend.
- `useAICommentary`: Encapsulates AI generation interfaces.

### 3. Dynamic Rendering Workflow
- The system automatically switches between specialized view components based on the current phase (`standby` -> `join` -> `countdown` -> `rolling` -> `reveal` -> `wall`).

## 💡 Usage Modes

### 1. Local Offline Mode
- **Plug & Play**: No backend required; data is stored directly in the browser's LocalStorage.
- **Data Privacy**: Ideal for scenarios where internal employee lists are highly sensitive.

### 2. Cloud Sync Mode
- **Host ID Configuration**: Configure the Worker URL and ID in "System Settings" to enable real-time inquiry.
- **QR Code Downloads**: Automatically generates inquiry links with host parameters, perfect for printing on table cards or projecting on screen.

## 🎲 Lottery Algorithm
The system strictly follows fair randomization principles using the **Fisher-Yates Shuffle** combined with modern browser security features:
1. **Cryptographically Secure Random Numbers (CSPRNG)**: Uses `window.crypto.getRandomValues()` instead of `Math.random()` to ensure cryptographic-level unpredictability.
2. **Fisher-Yates Shuffle**: Implements the standard $O(n)$ algorithm to guarantee equal probability for every possible list permutation.
3. **Dynamic Filtering**: Automatically excludes previous winners and validates remaining candidate counts in real-time.

## 🚀 Quick Start

### Installation & Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

## 🛠 Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Hooks & State**: Context API, Custom Hooks Palette
- **API Integration**: Cloudflare Workers, Fetch API (with retry support)
- **Data Handling**: XLSX.js, LocalStorage DB Utility
- **AI**: Gemini Pro / GPT-4o-mini

## 📝 License
This project is licensed under the **Apache License 2.0**.
