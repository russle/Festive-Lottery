// 員工清單管理 Tab
import React from 'react';
import { Download, Trash2, Check } from 'lucide-react';
import type { Employee } from '../../types';
import { FileUploader } from '../FileUploader';
import { DataPreview } from '../DataPreview';
import { useLotteryContext } from '../../contexts/LotteryContext';
import {
    parseEmployees,
    validateEmployees,
    generateSampleEmployeesExcel,
} from '../../utils/dataParser';

export const EmployeeTab: React.FC = () => {
    const lottery = useLotteryContext();
    const [pendingEmployees, setPendingEmployees] = React.useState<Employee[] | null>(null);
    const [errors, setErrors] = React.useState<string[]>([]);

    const handleEmployeesFile = async (content: string | ArrayBuffer) => {
        setErrors([]);
        try {
            const employees = await parseEmployees(content);
            const validation = validateEmployees(employees);
            if (!validation.valid) {
                setErrors(validation.errors);
                return;
            }
            setPendingEmployees(employees);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : '解析檔案失敗';
            setErrors([message]);
        }
    };

    const handleImportEmployees = () => {
        if (pendingEmployees) {
            lottery.updateEmployees(pendingEmployees);
            setPendingEmployees(null);
            setErrors([]);
        }
    };

    const downloadSample = () => {
        const buffer = generateSampleEmployeesExcel();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_employees.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-4">
                    <ul className="text-red-200/80 text-sm list-disc list-inside space-y-1">
                        {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            <FileUploader
                label="上傳員工清單"
                description="支援 CSV 或 Excel (.xlsx, .xls) 格式，需包含編號、姓名與部門欄位"
                onFileContent={handleEmployeesFile}
                onError={(err) => setErrors([err])}
            />

            {/* Download Sample */}
            <button
                onClick={downloadSample}
                className="flex items-center gap-2 text-amber-400/60 hover:text-amber-300 text-sm"
            >
                <Download size={14} />
                下載範例 Excel
            </button>

            {/* Pending Preview */}
            {pendingEmployees && (
                <div className="space-y-4">
                    <DataPreview type="employees" employees={pendingEmployees} />
                    <button
                        onClick={handleImportEmployees}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-xl transition-all"
                    >
                        <Check size={18} />
                        確認匯入 {pendingEmployees.length} 筆員工資料
                    </button>
                </div>
            )}

            {/* Current Data */}
            {!pendingEmployees && lottery.employees.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-amber-300 font-medium">目前的員工名單</h3>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('確定要清除所有員工資料嗎？這也會清除中獎紀錄。')) {
                                    lottery.resetEmployees();
                                }
                            }}
                            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            <Trash2 size={16} />
                            清除員工
                        </button>
                    </div>
                    <DataPreview type="employees" employees={lottery.employees} />
                </div>
            )}
        </>
    );
};

export default EmployeeTab;
