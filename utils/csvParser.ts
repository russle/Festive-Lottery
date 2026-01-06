// CSV 解析工具
import type { Employee, Prize, PrizeType } from '../types';

/**
 * 解析 CSV 字串為二維陣列
 */
export const parseCSV = (content: string): string[][] => {
    const lines = content.trim().split(/\r?\n/);
    return lines.map(line => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    });
};

/**
 * 解析員工清單 CSV
 * 格式: id,name,dept
 */
export const parseEmployeesCSV = (content: string): Employee[] => {
    const rows = parseCSV(content);
    if (rows.length < 2) return [];

    // 取得標題列
    const headers = rows[0].map(h => h.toLowerCase());
    const idIndex = headers.findIndex(h => h === 'id' || h === '員工編號' || h === '編號');
    const nameIndex = headers.findIndex(h => h === 'name' || h === '姓名' || h === '名字');
    const deptIndex = headers.findIndex(h => h === 'dept' || h === 'department' || h === '部門');

    if (idIndex === -1 || nameIndex === -1) {
        throw new Error('CSV 格式錯誤：找不到必要欄位 (id, name)');
    }

    return rows.slice(1)
        .filter(row => row[idIndex] && row[nameIndex]) // 過濾空行
        .map(row => ({
            id: row[idIndex],
            name: row[nameIndex],
            dept: deptIndex !== -1 ? row[deptIndex] || '未分類' : '未分類',
        }));
};

/**
 * 解析獎品清單 CSV
 * 格式: id,name,icon,count,type
 */
export const parsePrizesCSV = (content: string): Prize[] => {
    const rows = parseCSV(content);
    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.toLowerCase());
    const idIndex = headers.findIndex(h => h === 'id' || h === '編號');
    const nameIndex = headers.findIndex(h => h === 'name' || h === '獎品名稱' || h === '名稱');
    const iconIndex = headers.findIndex(h => h === 'icon' || h === '圖示' || h === 'emoji');
    const countIndex = headers.findIndex(h => h === 'count' || h === '數量' || h === '份數');
    const typeIndex = headers.findIndex(h => h === 'type' || h === '類型' || h === '抽獎方式');

    if (nameIndex === -1) {
        throw new Error('CSV 格式錯誤：找不到必要欄位 (name)');
    }

    return rows.slice(1)
        .filter(row => row[nameIndex]) // 過濾空行
        .map((row, index) => {
            const count = countIndex !== -1 ? parseInt(row[countIndex]) || 1 : 1;
            const typeValue = typeIndex !== -1 ? row[typeIndex]?.toLowerCase() : '';
            const type: PrizeType = (typeValue === 'batch' || typeValue === '批量' || count > 1)
                ? 'batch'
                : 'single';

            return {
                id: idIndex !== -1 ? parseInt(row[idIndex]) || (index + 1) : index + 1,
                name: row[nameIndex],
                icon: iconIndex !== -1 ? row[iconIndex] || '🎁' : '🎁',
                count,
                type,
            };
        });
};

/**
 * 驗證員工資料
 */
export const validateEmployees = (employees: Employee[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const ids = new Set<string>();

    employees.forEach((emp, index) => {
        if (!emp.id) errors.push(`第 ${index + 1} 筆：缺少員工編號`);
        if (!emp.name) errors.push(`第 ${index + 1} 筆：缺少姓名`);
        if (ids.has(emp.id)) errors.push(`第 ${index + 1} 筆：員工編號 ${emp.id} 重複`);
        ids.add(emp.id);
    });

    return { valid: errors.length === 0, errors };
};

/**
 * 驗證獎品資料
 */
export const validatePrizes = (prizes: Prize[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    prizes.forEach((prize, index) => {
        if (!prize.name) errors.push(`第 ${index + 1} 筆：缺少獎品名稱`);
        if (prize.count < 1) errors.push(`第 ${index + 1} 筆：數量必須大於 0`);
    });

    return { valid: errors.length === 0, errors };
};

/**
 * 生成範例 CSV 內容
 */
export const generateSampleEmployeesCSV = (): string => {
    return `id,name,dept
888001,王小明,財富部
888002,李小華,聚寶部
888003,張大文,招財部
888004,陳美玲,納福部
888005,林志遠,興旺部`;
};

export const generateSamplePrizesCSV = (): string => {
    return `id,name,icon,count,type
1,SOGO禮券,🧧,10,batch
2,Apple Watch,⌚,5,batch
3,Dyson 吹風機,🎐,3,single
4,iPhone 16 Pro,📱,1,single
5,歐洲雙人遊,✈️,1,single`;
};
