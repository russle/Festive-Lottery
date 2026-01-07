// 抽獎 API 介面層 (支援雲端 + 本地混合模式)
import type { Employee, Prize, Winner, ApiResponse } from '../types';
import { MOCK_EMPLOYEES, MOCK_PRIZES, getMockWinners, addMockWinner, clearMockWinners } from './mockData';

/** 雲端 API 網址 */
const CLOUD_API_URL = 'https://festive-lottery-api.hihi831.workers.dev';

/** API 介面定義 */
export interface LotteryAPI {
    getEmployees(): Promise<ApiResponse<Employee[]>>;
    getPrizes(): Promise<ApiResponse<Prize[]>>;
    getWinners(): Promise<ApiResponse<Winner[]>>;
    saveWinner(winner: Winner): Promise<ApiResponse<void>>;
    resetWinners(): Promise<ApiResponse<void>>;
    syncEmployees(employees: Employee[]): Promise<ApiResponse<void>>;
    syncPrizes(prizes: Prize[]): Promise<ApiResponse<void>>;
}

/** 模擬網路延遲 */
const simulateDelay = (ms: number = 100): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/** Mock API 實作 (本地模式) */
export const mockLotteryAPI: LotteryAPI = {
    async getEmployees(): Promise<ApiResponse<Employee[]>> {
        await simulateDelay();
        return { success: true, data: MOCK_EMPLOYEES };
    },

    async getPrizes(): Promise<ApiResponse<Prize[]>> {
        await simulateDelay();
        return { success: true, data: MOCK_PRIZES };
    },

    async getWinners(): Promise<ApiResponse<Winner[]>> {
        await simulateDelay();
        return { success: true, data: getMockWinners() };
    },

    async saveWinner(winner: Winner): Promise<ApiResponse<void>> {
        await simulateDelay();
        addMockWinner(winner);
        return { success: true };
    },

    async resetWinners(): Promise<ApiResponse<void>> {
        await simulateDelay();
        clearMockWinners();
        return { success: true };
    },

    async syncEmployees(): Promise<ApiResponse<void>> {
        return { success: true };
    },

    async syncPrizes(): Promise<ApiResponse<void>> {
        return { success: true };
    },
};

/** 雲端 API 實作 */
export const cloudLotteryAPI: LotteryAPI = {
    async getEmployees(): Promise<ApiResponse<Employee[]>> {
        try {
            const res = await fetch(`${CLOUD_API_URL}/api/employees`);
            const json = await res.json();
            return { success: json.success, data: json.data || [] };
        } catch (error) {
            console.error('[Cloud API] getEmployees failed:', error);
            return { success: false, error: String(error) };
        }
    },

    async getPrizes(): Promise<ApiResponse<Prize[]>> {
        try {
            const res = await fetch(`${CLOUD_API_URL}/api/prizes`);
            const json = await res.json();
            return { success: json.success, data: json.data || [] };
        } catch (error) {
            console.error('[Cloud API] getPrizes failed:', error);
            return { success: false, error: String(error) };
        }
    },

    async getWinners(): Promise<ApiResponse<Winner[]>> {
        try {
            const res = await fetch(`${CLOUD_API_URL}/api/winners`);
            const json = await res.json();
            // 轉換格式：雲端返回的是展開的資料，需轉換回 Winner 格式
            const winners: Winner[] = (json.data || []).map((w: any) => ({
                prizeId: w.prizeId,
                employee: {
                    id: w.employeeId,
                    name: w.employeeName,
                    dept: w.employeeDept,
                },
                timestamp: new Date(w.timestamp).getTime(),
            }));
            return { success: json.success, data: winners };
        } catch (error) {
            console.error('[Cloud API] getWinners failed:', error);
            return { success: false, error: String(error) };
        }
    },

    async saveWinner(winner: Winner): Promise<ApiResponse<void>> {
        try {
            const res = await fetch(`${CLOUD_API_URL}/api/winners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prizeId: winner.prizeId,
                    employeeId: winner.employee.id,
                }),
            });
            const json = await res.json();
            return { success: json.success };
        } catch (error) {
            console.error('[Cloud API] saveWinner failed:', error);
            return { success: false, error: String(error) };
        }
    },

    async resetWinners(): Promise<ApiResponse<void>> {
        try {
            const res = await fetch(`${CLOUD_API_URL}/api/winners`, { method: 'DELETE' });
            const json = await res.json();
            return { success: json.success };
        } catch (error) {
            console.error('[Cloud API] resetWinners failed:', error);
            return { success: false, error: String(error) };
        }
    },

    async syncEmployees(employees: Employee[]): Promise<ApiResponse<void>> {
        try {
            const res = await fetch(`${CLOUD_API_URL}/api/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employees }),
            });
            const json = await res.json();
            console.log(`[Cloud API] Synced ${json.count || 0} employees`);
            return { success: json.success };
        } catch (error) {
            console.error('[Cloud API] syncEmployees failed:', error);
            return { success: false, error: String(error) };
        }
    },

    async syncPrizes(prizes: Prize[]): Promise<ApiResponse<void>> {
        try {
            const res = await fetch(`${CLOUD_API_URL}/api/prizes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prizes }),
            });
            const json = await res.json();
            console.log(`[Cloud API] Synced ${json.count || 0} prizes`);
            return { success: json.success };
        } catch (error) {
            console.error('[Cloud API] syncPrizes failed:', error);
            return { success: false, error: String(error) };
        }
    },
};

/** 混合模式 API (優先雲端，失敗時回退本地) */
export const hybridLotteryAPI: LotteryAPI = {
    async getEmployees() {
        const cloudResult = await cloudLotteryAPI.getEmployees();
        if (cloudResult.success && cloudResult.data && cloudResult.data.length > 0) {
            return cloudResult;
        }
        console.log('[Hybrid API] Falling back to local for getEmployees');
        return mockLotteryAPI.getEmployees();
    },

    async getPrizes() {
        const cloudResult = await cloudLotteryAPI.getPrizes();
        if (cloudResult.success && cloudResult.data && cloudResult.data.length > 0) {
            return cloudResult;
        }
        console.log('[Hybrid API] Falling back to local for getPrizes');
        return mockLotteryAPI.getPrizes();
    },

    async getWinners() {
        const cloudResult = await cloudLotteryAPI.getWinners();
        if (cloudResult.success) {
            return cloudResult;
        }
        console.log('[Hybrid API] Falling back to local for getWinners');
        return mockLotteryAPI.getWinners();
    },

    async saveWinner(winner: Winner) {
        // 同時儲存到雲端和本地
        const cloudResult = await cloudLotteryAPI.saveWinner(winner);
        addMockWinner(winner); // 本地也保存一份
        return cloudResult.success ? cloudResult : { success: true };
    },

    async resetWinners() {
        await cloudLotteryAPI.resetWinners();
        clearMockWinners();
        return { success: true };
    },

    async syncEmployees(employees: Employee[]) {
        return cloudLotteryAPI.syncEmployees(employees);
    },

    async syncPrizes(prizes: Prize[]) {
        return cloudLotteryAPI.syncPrizes(prizes);
    },
};

/** 
 * 預設使用混合模式 API
 * - 優先從雲端獲取資料
 * - 雲端不可用時自動回退到本地
 * - 資料更新會同時同步到雲端
 */
export const lotteryAPI: LotteryAPI = hybridLotteryAPI;

/** 直接使用雲端 API (用於手動同步) */
export { CLOUD_API_URL };

