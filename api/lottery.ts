// 抽獎 API 介面層
import type { Employee, Prize, Winner, ApiResponse } from '../types';
import { MOCK_EMPLOYEES, MOCK_PRIZES, getMockWinners, addMockWinner, clearMockWinners } from './mockData';

/** API 介面定義 */
export interface LotteryAPI {
    getEmployees(): Promise<ApiResponse<Employee[]>>;
    getPrizes(): Promise<ApiResponse<Prize[]>>;
    getWinners(): Promise<ApiResponse<Winner[]>>;
    saveWinner(winner: Winner): Promise<ApiResponse<void>>;
    resetWinners(): Promise<ApiResponse<void>>;
}

/** 模擬網路延遲 */
const simulateDelay = (ms: number = 100): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/** Mock API 實作 */
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
};

/** 真實 API 實作 (未來擴充用) */
export const createRealAPI = (baseUrl: string): LotteryAPI => ({
    async getEmployees(): Promise<ApiResponse<Employee[]>> {
        try {
            const res = await fetch(`${baseUrl}/api/employees`);
            const data = await res.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    },

    async getPrizes(): Promise<ApiResponse<Prize[]>> {
        try {
            const res = await fetch(`${baseUrl}/api/prizes`);
            const data = await res.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    },

    async getWinners(): Promise<ApiResponse<Winner[]>> {
        try {
            const res = await fetch(`${baseUrl}/api/winners`);
            const data = await res.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    },

    async saveWinner(winner: Winner): Promise<ApiResponse<void>> {
        try {
            await fetch(`${baseUrl}/api/winners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(winner),
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    },

    async resetWinners(): Promise<ApiResponse<void>> {
        try {
            await fetch(`${baseUrl}/api/winners`, { method: 'DELETE' });
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    },
});

/** 預設使用 Mock API */
export const lotteryAPI: LotteryAPI = mockLotteryAPI;
