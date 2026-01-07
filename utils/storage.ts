// 本地儲存工具
import type { Employee, Prize, Winner, AIConfig } from '../types';

const STORAGE_KEYS = {
    EMPLOYEES: 'festive_lottery_employees',
    PRIZES: 'festive_lottery_prizes',
    WINNERS: 'festive_lottery_winners',
    CONFIG: 'festive_lottery_config',
    AI_CONFIG: 'festive_lottery_ai_config',
};

/**
 * 儲存員工資料
 */
export const saveEmployees = (employees: Employee[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    } catch (error) {
        console.error('儲存員工資料失敗:', error);
    }
};

/**
 * 載入員工資料
 */
export const loadEmployees = (): Employee[] | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('載入員工資料失敗:', error);
        return null;
    }
};

/**
 * 儲存獎品資料
 */
export const savePrizes = (prizes: Prize[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
    } catch (error) {
        console.error('儲存獎品資料失敗:', error);
    }
};

/**
 * 載入獎品資料
 */
export const loadPrizes = (): Prize[] | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PRIZES);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('載入獎品資料失敗:', error);
        return null;
    }
};

/**
 * 儲存中獎紀錄
 */
export const saveWinners = (winners: Winner[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.WINNERS, JSON.stringify(winners));
    } catch (error) {
        console.error('儲存中獎紀錄失敗:', error);
    }
};

/**
 * 載入中獎紀錄
 */
export const loadWinners = (): Winner[] | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.WINNERS);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('載入中獎紀錄失敗:', error);
        return null;
    }
};

/**
 * 清除所有資料
 */
export const clearAllData = (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
};

/**
 * 清除員工資料
 */
export const clearEmployees = (): void => {
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
};

/**
 * 清除獎品資料
 */
export const clearPrizes = (): void => {
    localStorage.removeItem(STORAGE_KEYS.PRIZES);
};

/**
 * 清除中獎紀錄
 */
export const clearWinners = (): void => {
    localStorage.removeItem(STORAGE_KEYS.WINNERS);
};

/**
 * 檢查是否有已儲存的資料
 */
export const hasStoredData = (): boolean => {
    return !!(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) ||
        localStorage.getItem(STORAGE_KEYS.PRIZES));
};
/**
 * 儲存 AI 設定
 */
export const saveAIConfig = (config: AIConfig): void => {
    localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(config));
};

/**
 * 載入 AI 設定
 */
export const loadAIConfig = (): AIConfig | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

