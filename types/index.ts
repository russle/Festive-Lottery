// FestiveLottery 型別定義

/** 抽獎階段 */
export type Phase =
    | 'standby'
    | 'join'
    | 'countdown'
    | 'rolling'
    | 'reveal'
    | 'batch_reveal'
    | 'completed'
    | 'wall';

/** 員工資料 */
export interface Employee {
    id: string;
    name: string;
    dept: string;
    avatar?: string;
}

/** 獎項類型 */
export type PrizeType = 'single' | 'batch';

/** 獎項資料 */
export interface Prize {
    id: number;
    name: string;
    icon: string;
    count: number;
    type: PrizeType;
    countPerRound?: number; // 每次抽幾個人
}

/** 中獎紀錄 */
export interface Winner {
    prizeId: number;
    employee: Employee;
    timestamp: number;
}

/** 集氣參與者 */
export interface Joiner {
    id: string;
    name: string;
    x: number;
    animationDuration: number;
}

/** API 回應狀態 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/** 抽獎設定 */
export interface LotteryConfig {
    eventName: string;
    eventYear: number;
    countdownSeconds: number;
    rollingIntervalMs: number;
    batchRevealDelayMs: number;
}

/** AI 設定 */
export type AIProvider = 'gemini' | 'openai';

export interface AIConfig {
    provider: AIProvider;
    geminiKey: string;
    openaiKey: string;
}

