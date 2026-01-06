// 管理面板元件
import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, Check, AlertTriangle, Music, Play, Pause, Volume2 } from 'lucide-react';
import type { Employee, Prize, Winner } from '../types';
import { FileUploader } from './FileUploader';
import { DataPreview } from './DataPreview';
import {
    parseEmployees,
    parsePrizes,
    validateEmployees,
    validatePrizes,
    generateSampleEmployeesCSV,
    generateSamplePrizesCSV,
} from '../utils/dataParser';

import { soundManager } from '../utils/sound';
import { saveBGMFile, loadBGMFile } from '../utils/db';

interface AdminPanelProps {
    currentEmployees: Employee[];
    currentPrizes: Prize[];
    winners: Winner[];
    onUpdateEmployees: (employees: Employee[]) => void;
    onUpdatePrizes: (prizes: Prize[]) => void;
    onResetAll: () => void;
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
    currentEmployees,
    currentPrizes,
    winners,
    onUpdateEmployees,
    onUpdatePrizes,
    onResetAll,
    onClose,
}) => {
    const [pendingEmployees, setPendingEmployees] = useState<Employee[] | null>(null);
    const [pendingPrizes, setPendingPrizes] = useState<Prize[] | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'employees' | 'prizes' | 'winners' | 'bgm'>('employees');

    const switchTab = (tab: 'employees' | 'prizes' | 'winners' | 'bgm') => {
        soundManager.play('click');
        setActiveTab(tab);
    };
    const [bgmFileName, setBgmFileName] = useState<string | null>(null);
    const [isBgmPlaying, setIsBgmPlaying] = useState(false);
    const [volume, setVolume] = useState(soundManager.getBGMVolume() * 100);

    // 載入儲存的 BGM
    useEffect(() => {
        const initBGM = async () => {
            const savedFile = await loadBGMFile();
            if (savedFile) {
                soundManager.setBGM(savedFile);
                if (savedFile instanceof File) {
                    setBgmFileName(savedFile.name);
                } else {
                    setBgmFileName('已儲存的音樂');
                }
            }
        };
        initBGM();
    }, []);

    const handleBGMFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await saveBGMFile(file);
                soundManager.setBGM(file);
                setBgmFileName(file.name);
                setIsBgmPlaying(true);
                soundManager.playBGM();
            } catch (err) {
                setErrors(['儲存音樂檔案失敗 (IndexedDB 錯誤)']);
            }
        }
    };

    const toggleBGM = () => {
        if (isBgmPlaying) {
            soundManager.pauseBGM();
        } else {
            soundManager.playBGM();
        }
        setIsBgmPlaying(!isBgmPlaying);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setVolume(val);
        soundManager.setBGMVolume(val / 100);
    };


    const handleEmployeesFile = (content: string | ArrayBuffer) => {
        try {
            const employees = parseEmployees(content);
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

    const handlePrizesFile = (content: string | ArrayBuffer) => {
        try {
            const prizes = parsePrizes(content);
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

    const exportWinners = () => {
        if (winners.length === 0) return;

        const headers = '獎項編號,獎項名稱,員工編號,姓名,部門,獲獎時間\n';
        const rows = winners.map(w => {
            const prize = currentPrizes.find(p => p.id === w.prizeId);
            const time = new Date(w.timestamp).toLocaleString();
            return `${w.prizeId},${prize?.name || '未知'},${w.employee.id},${w.employee.name},${w.employee.dept},${time}`;
        }).join('\n');

        const content = headers + rows;
        const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `winners_report_${new Date().getTime()}.csv`;
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
                        onClick={() => switchTab('employees')}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'employees'
                            ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-500/10'
                            : 'text-amber-400/50 hover:text-amber-300'
                            }`}
                    >
                        👥 員工清單 ({currentEmployees.length})
                    </button>
                    <button
                        onClick={() => switchTab('prizes')}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'prizes'
                            ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-500/10'
                            : 'text-amber-400/50 hover:text-amber-300'
                            }`}
                    >
                        🎁 獎品清單 ({currentPrizes.length})
                    </button>
                    <button
                        onClick={() => switchTab('winners')}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'winners'
                            ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-500/10'
                            : 'text-amber-400/50 hover:text-amber-300'
                            }`}
                    >
                        🏆 中獎名單 ({winners.length})
                    </button>
                    <button
                        onClick={() => switchTab('bgm')}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'bgm'
                            ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-500/10'
                            : 'text-amber-400/50 hover:text-amber-300'
                            }`}
                    >
                        🎵 背景音樂
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
                                description="支援 CSV 或 Excel (.xlsx, .xls) 格式，需包含編號、姓名與部門欄位"
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
                                description="支援 CSV 或 Excel (.xlsx, .xls) 格式，需包含獎品名稱"
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

                    {activeTab === 'winners' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-amber-300 font-medium">中獎統計數據</h3>
                                <button
                                    onClick={exportWinners}
                                    disabled={winners.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <Download size={14} />
                                    導出中獎名單 (CSV)
                                </button>
                            </div>

                            {winners.length > 0 ? (
                                <div className="bg-black/30 rounded-xl overflow-hidden border border-amber-500/20">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-amber-900/30 border-b border-amber-500/20">
                                                    <th className="px-4 py-2 text-left text-amber-300">獎項</th>
                                                    <th className="px-4 py-2 text-left text-amber-300">員工編號</th>
                                                    <th className="px-4 py-2 text-left text-amber-300">姓名</th>
                                                    <th className="px-4 py-2 text-left text-amber-300">部門</th>
                                                    <th className="px-4 py-2 text-right text-amber-300">獲獎時間</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {winners.map((w, i) => {
                                                    const prize = currentPrizes.find(p => p.id === w.prizeId);
                                                    return (
                                                        <tr key={i} className={i % 2 === 0 ? 'bg-black/10' : ''}>
                                                            <td className="px-4 py-2 text-amber-100/90">{prize?.name || '未知'}</td>
                                                            <td className="px-4 py-2 text-amber-200/60 font-mono">{w.employee.id}</td>
                                                            <td className="px-4 py-2 text-white font-medium">{w.employee.name}</td>
                                                            <td className="px-4 py-2 text-amber-200/60">{w.employee.dept}</td>
                                                            <td className="px-4 py-2 text-right text-amber-500/50 text-xs">
                                                                {new Date(w.timestamp).toLocaleTimeString()}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-black/20 rounded-2xl border border-dashed border-amber-500/10">
                                    <p className="text-amber-500/30">尚無中獎紀錄</p>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'bgm' && (
                        <div className="space-y-8 py-4">
                            <div className="bg-black/30 border border-amber-500/20 rounded-2xl p-8 text-center space-y-6">
                                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-amber-500/20">
                                    <Music className="text-amber-400 w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-amber-300">背景音樂設定</h3>
                                    <p className="text-amber-200/50 text-sm">上傳 MP3 或音訊檔案作為抽獎活動的背景音樂</p>
                                </div>

                                <div className="flex flex-col items-center gap-4">
                                    <input
                                        type="file"
                                        id="bgm-upload"
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={handleBGMFile}
                                    />
                                    <label
                                        htmlFor="bgm-upload"
                                        className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl cursor-pointer transition-all shadow-lg hover:shadow-amber-500/20"
                                    >
                                        選擇音樂檔案
                                    </label>
                                    {bgmFileName && (
                                        <p className="text-green-400 flex items-center gap-2 text-sm">
                                            <Check size={14} /> 已載入: {bgmFileName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {bgmFileName && (
                                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={toggleBGM}
                                                className="w-12 h-12 bg-amber-400 text-amber-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                                            >
                                                {isBgmPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
                                            </button>
                                            <div>
                                                <p className="text-amber-200 font-medium">現正播放</p>
                                                <p className="text-amber-500/70 text-sm">{bgmFileName}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm text-amber-200/60">
                                            <div className="flex items-center gap-2">
                                                <Volume2 size={16} />
                                                <span>音量調節</span>
                                            </div>
                                            <span>{volume}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
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
