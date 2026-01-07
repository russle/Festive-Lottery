// Mock 資料生成器
import type { Employee, Prize, Winner } from '../types';
import { DEPARTMENTS } from '../constants';

/** 生成模擬員工資料 */
export const generateMockEmployees = (count: number = 150): Employee[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `888${100 + i}`,
        name: `幸運星 ${String.fromCharCode(65 + (i % 26))}-${i}`,
        dept: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
        avatar: '/api/placeholder/100/100',
    }));
};

/** 預設員工資料 */
export const MOCK_EMPLOYEES: Employee[] = [];

/** 預設獎項資料 */
export const MOCK_PRIZES: Prize[] = [];

/** 模擬中獎紀錄 (初始為空) */
export let mockWinners: Winner[] = [];

/** 新增中獎紀錄 */
export const addMockWinner = (winner: Winner): void => {
    mockWinners = [...mockWinners, winner];
};

/** 清空中獎紀錄 */
export const clearMockWinners = (): void => {
    mockWinners = [];
};

/** 取得中獎紀錄 */
export const getMockWinners = (): Winner[] => [...mockWinners];
