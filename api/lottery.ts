// 抽獎 API 介面層 (支援雲端 + 本地混合模式)
import type { Employee, Prize, Winner, ApiResponse } from '../types';
import { MOCK_EMPLOYEES, MOCK_PRIZES, getMockWinners, addMockWinner, clearMockWinners } from './mockData';
import { loadApiUrl, loadHostId } from '../utils/storage';

/** 動態獲取雲端 API 網址 */
const getCloudApiUrl = () => loadApiUrl();

/** API 介面定義 */
export interface LotteryAPI {
    getEmployees(): Promise<ApiResponse<Employee[]>>;
    getPrizes(): Promise<ApiResponse<Prize[]>>;
    getWinners(): Promise<ApiResponse<Winner[]>>;
    saveWinner(winner: Winner): Promise<ApiResponse<void>>;
    saveWinners(winners: Winner[]): Promise<ApiResponse<void>>;
    resetWinners(): Promise<ApiResponse<void>>;
    resetEmployees(): Promise<ApiResponse<void>>;
    resetPrizes(): Promise<ApiResponse<void>>;
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

    async saveWinners(winners: Winner[]): Promise<ApiResponse<void>> {
        await simulateDelay();
        winners.forEach(w => addMockWinner(w));
        return { success: true };
    },

    async resetWinners(): Promise<ApiResponse<void>> {
        await simulateDelay();
        clearMockWinners();
        return { success: true };
    },

    async resetEmployees(): Promise<ApiResponse<void>> {
        await simulateDelay();
        clearMockWinners();
        return { success: true };
    },

    async resetPrizes(): Promise<ApiResponse<void>> {
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
            const url = getCloudApiUrl();
            if (!url) return { success: false, error: 'Cloud API URL not configured' };
            const res = await fetch(`${url}/api/employees`, {
                headers: { 'X-Host-ID': loadHostId() }
            });
            const json = await res.json();
            return { success: json.success, data: json.data || [] };
        } catch (error) {
            console.error('[Cloud API] getEmployees failed:', error);
            return { success: false, error: String(error) };
        }
    },

    async getPrizes(): Promise<ApiResponse<Prize[]>> {
        try {
            const url = getCloudApiUrl();
            if (!url) return { success: false, error: 'Cloud API URL not configured' };
            const res = await fetch(`${url}/api/prizes`, {
                headers: { 'X-Host-ID': loadHostId() }
            });
            const json = await res.json();
            return { success: json.success, data: json.data || [] };
        } catch (error) {
            console.error('[Cloud API] getPrizes failed:', error);
            return { success: false, error: String(error) };
        }
    },

    async getWinners(): Promise<ApiResponse<Winner[]>> {
        try {
            const url = getCloudApiUrl();
            if (!url) return { success: false, error: 'Cloud API URL not configured' };
            const res = await fetch(`${url}/api/winners`, {
                headers: { 'X-Host-ID': loadHostId() }
            });
            const json = await res.json();
            // 轉換格式：雲端返回的是展開的資料，需轉換回 Winner 格式
            interface CloudWinner {
                prizeId: number;
                employeeId: string;
                employeeName: string;
                employeeDept: string;
                timestamp: string | number;
            }
            const winners: Winner[] = (json.data || []).map((w: CloudWinner) => ({
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
        return this.saveWinners([winner]);
    },

    async saveWinners(winners: Winner[]): Promise<ApiResponse<void>> {
        try {
            const url = getCloudApiUrl();
            if (!url) return { success: false, error: 'Cloud API URL not configured' };
            const res = await fetch(`${url}/api/winners`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Host-ID': loadHostId()
                },
                body: JSON.stringify({
                    winners: winners.map(w => ({
                        prizeId: w.prizeId,
                        employeeId: w.employee.id,
                    }))
                }),
            });
            const json = await res.json();
            return { success: json.success, error: json.error };
        } catch (error) {
            console.error('[Cloud API] saveWinners failed:', error)
            return { success: false, error: String(error) };
        }
    },

    async resetWinners(): Promise<ApiResponse<void>> {
        try {
            const url = getCloudApiUrl();
            if (!url) return { success: false, error: 'Cloud API URL not configured' };
            const res = await fetch(`${url}/api/winners`, {
                method: 'DELETE',
                headers: { 'X-Host-ID': loadHostId() }
            });
            const json = await res.json();
            return { success: json.success, error: json.error };
        } catch (error) {
            console.error('[Cloud API] resetWinners failed:', error);
            return { success: false, error: String(error) };
        }
    },

    async resetEmployees(): Promise<ApiResponse<void>> {
        try {
            const url = getCloudApiUrl();
            if (!url) return { success: false, error: 'Cloud API URL not configured' };
            const res = await fetch(`${url}/api/employees`, {
                method: 'DELETE',
                headers: { 'X-Host-ID': loadHostId() }
            });
            const json = await res.json();
            console.log('[Cloud API] Employees cleared');
            return { success: json.success, error: json.error };
        } catch (error) {
            console.error('[Cloud API] resetEmployees failed:', error);
            return { success: false, error: String(error) };
        }
    },

    async resetPrizes(): Promise<ApiResponse<void>> {
        try {
            const url = getCloudApiUrl();
            if (!url) return { success: false, error: 'Cloud API URL not configured' };
            const res = await fetch(`${url}/api/prizes`, {
                method: 'DELETE',
                headers: { 'X-Host-ID': loadHostId() }
            });
            const json = await res.json();
            console.log('[Cloud API] Prizes cleared');
            return { success: json.success, error: json.error };
        } catch (error) {
            console.error('[Cloud API] resetPrizes failed:', error);
            return { success: false, error: String(error) };
        }
    },

    async syncEmployees(employees: Employee[]): Promise<ApiResponse<void>> {
        try {
            const url = getCloudApiUrl();
            if (!url) return { success: false, error: 'Cloud API URL not configured' };
            const res = await fetch(`${url}/api/employees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Host-ID': loadHostId()
                },
                body: JSON.stringify({ employees }),
            });
            const json = await res.json();
            console.log(`[Cloud API] Synced ${json.count || 0} employees`);
            return { success: json.success, error: json.error };
        } catch (error) {
            console.error('[Cloud API] syncEmployees failed:', error);
            return { success: false, error: String(error) };
        }
    },

    async syncPrizes(prizes: Prize[]): Promise<ApiResponse<void>> {
        try {
            const url = getCloudApiUrl();
            if (!url) return { success: false, error: 'Cloud API URL not configured' };
            const res = await fetch(`${url}/api/prizes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Host-ID': loadHostId()
                },
                body: JSON.stringify({ prizes }),
            });
            const json = await res.json();
            console.log(`[Cloud API] Synced ${json.count || 0} prizes`);
            return { success: json.success, error: json.error };
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
        return this.saveWinners([winner]);
    },

    async saveWinners(winners: Winner[]) {
        // 同時儲存到雲端和本地
        const cloudResult = await cloudLotteryAPI.saveWinners(winners);
        winners.forEach(w => addMockWinner(w)); // 本地也保存一份
        return cloudResult;
    },

    async resetWinners() {
        await cloudLotteryAPI.resetWinners();
        clearMockWinners();
        return { success: true };
    },

    async resetEmployees() {
        await cloudLotteryAPI.resetEmployees();
        clearMockWinners();
        return { success: true };
    },

    async resetPrizes() {
        await cloudLotteryAPI.resetPrizes();
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

/** 直接獲取目前配置的雲端 API 網址 (用於顯示 QR Code) */
export const getCurrentCloudApiUrl = () => getCloudApiUrl();

