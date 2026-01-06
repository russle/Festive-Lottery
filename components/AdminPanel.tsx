// 管理面板元件
import React, { useState } from 'react';
import { X, Download, Trash2, Check, AlertTriangle } from 'lucide-react';
import type { Employee, Prize } from '../types';
import { FileUploader } from './FileUploader';
import { DataPreview } from './DataPreview';
import {
    parseEmployeesCSV,
    parsePrizesCSV,
    validateEmployees,
    validatePrizes,
    generateSampleEmployeesCSV,
    generateSamplePrizesCSV,
} from '../utils/csvParser';

interface AdminPanelProps {
    currentEmployees: Employee[];
    currentPrizes: Prize[];
    onUpdateEmployees: (employees: Employee[]) => void;
    onUpdatePrizes: (prizes: Prize[]) => void;
    onResetAll: () => void;
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
    currentEmployees,
    currentPrizes,
    onUpdateEmployees,
    onUpdatePrizes,
    onResetAll,
    onClose,
}) => {
    const [pendingEmployees, setPendingEmployees] = useState<Employee[] | null>(null);
    const [pendingPrizes, setPendingPrizes] = useState<Prize[] | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'employees' | 'prizes'>('employees');

    const handleEmployeesFile = (content: string) => {
        try {
            const employees = parseEmployeesCSV(content);
            const validation = validateEmployees(employees);

            if (!validation.valid) {
                setErrors(validation.errors);
                setPendingEmployees(null);
                return;
            }

            setErrors([]);
            setPendingEmployees(employees);
        } catch (error) {
            setErrors([error instanceof Error ? error.message : '解析失敗']);
            setPendingEmployees(null);
        }
    };

    const handlePrizesFile = (content: string) => {
        try {
            const prizes = parsePrizesCSV(content);
            const validation = validatePrizes(prizes);

            if (!validation.valid) {
                setErrors(validation.errors);
                setPendingPrizes(null);
                return;
            }

            setErrors([]);
            setPendingPrizes(prizes);
        } catch (error) {
            setErrors([error instanceof Error ? error.message : '解析失敗']);
            setPendingPrizes(null);
        }
    };

    const handleConfirmEmployees = () => {
        if (pendingEmployees) {
            onUpdateEmployees(pendingEmployees);
            setPendingEmployees(null);
        }
    };

    const handleConfirmPrizes = () => {
        if (pendingPrizes) {
            onUpdatePrizes(pendingPrizes);
            setPendingPrizes(null);
        }
    };

    const downloadSample = (type: 'employees' | 'prizes') => {
        const content = type === 'employees'
            ? generateSampleEmployeesCSV()
            : generateSamplePrizesCSV();
        const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = type === 'employees' ? 'employees_sample.csv' : 'prizes_sample.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-[#2a0a12] to-[#1a0510] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20">
                    <h2 className="text-2xl font-bold text-amber-300">📋 資料管理</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-amber-500/20">
                    <button
                        onClick={() => setActiveTab('employees')}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'employees'
                                ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-500/10'
                                : 'text-amber-400/50 hover:text-amber-300'
                            }`}
                    >
                        👥 員工清單 ({currentEmployees.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('prizes')}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'prizes'
                                ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-500/10'
                                : 'text-amber-400/50 hover:text-amber-300'
                            }`}
                    >
                        🎁 獎品清單 ({currentPrizes.length})
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Error Messages */}
                    {errors.length > 0 && (
                        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-red-300 mb-2">
                                <AlertTriangle size={18} />
                                <span className="font-medium">解析錯誤</span>
                            </div>
                            <ul className="text-red-200/80 text-sm list-disc list-inside space-y-1">
                                {errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {activeTab === 'employees' && (
                        <>
                            <FileUploader
                                label="上傳員工清單"
                                description="CSV 格式，需包含 id, name, dept 欄位"
                                onFileContent={handleEmployeesFile}
                                onError={(err) => setErrors([err])}
                            />

                            {/* Download Sample */}
                            <button
                                onClick={() => downloadSample('employees')}
                                className="flex items-center gap-2 text-amber-400/60 hover:text-amber-300 text-sm"
                            >
                                <Download size={14} />
                                下載範例 CSV
                            </button>

                            {/* Pending Preview */}
                            {pendingEmployees && (
                                <div className="space-y-4">
                                    <DataPreview type="employees" employees={pendingEmployees} />
                                    <button
                                        onClick={handleConfirmEmployees}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-xl transition-all"
                                    >
                                        <Check size={18} />
                                        確認匯入 {pendingEmployees.length} 筆員工資料
                                    </button>
                                </div>
                            )}

                            {/* Current Data */}
                            {!pendingEmployees && currentEmployees.length > 0 && (
                                <DataPreview type="employees" employees={currentEmployees} />
                            )}
                        </>
                    )}

                    {activeTab === 'prizes' && (
                        <>
                            <FileUploader
                                label="上傳獎品清單"
                                description="CSV 格式，需包含 name 欄位，可選 id, icon, count, type"
                                onFileContent={handlePrizesFile}
                                onError={(err) => setErrors([err])}
                            />

                            {/* Download Sample */}
                            <button
                                onClick={() => downloadSample('prizes')}
                                className="flex items-center gap-2 text-amber-400/60 hover:text-amber-300 text-sm"
                            >
                                <Download size={14} />
                                下載範例 CSV
                            </button>

                            {/* Pending Preview */}
                            {pendingPrizes && (
                                <div className="space-y-4">
                                    <DataPreview type="prizes" prizes={pendingPrizes} />
                                    <button
                                        onClick={handleConfirmPrizes}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-xl transition-all"
                                    >
                                        <Check size={18} />
                                        確認匯入 {pendingPrizes.length} 筆獎品資料
                                    </button>
                                </div>
                            )}

                            {/* Current Data */}
                            {!pendingPrizes && currentPrizes.length > 0 && (
                                <DataPreview type="prizes" prizes={currentPrizes} />
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-amber-500/20 bg-black/20">
                    <button
                        onClick={onResetAll}
                        className="flex items-center gap-2 text-red-400/70 hover:text-red-300 text-sm transition-colors"
                    >
                        <Trash2 size={14} />
                        重置所有資料
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
                    >
                        完成
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
