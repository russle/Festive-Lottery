// 管理面板元件
import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, Check, AlertTriangle, Music, Play, Pause, Volume2, Settings as SettingsIcon, ExternalLink, Cloud, RefreshCw, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Employee, Prize, Winner, AIConfig } from '../types';
import { FileUploader } from './FileUploader';
import { DataPreview } from './DataPreview';
import {
    parseEmployees,
    parsePrizes,
    validateEmployees,
    validatePrizes,
    generateSampleEmployeesExcel,
    generateSamplePrizesExcel,
    exportToExcelBuffer,
} from '../utils/dataParser';

import { soundManager } from '../utils/sound';
import { saveBGMFile, loadBGMFile } from '../utils/db';
import { cloudLotteryAPI } from '../api/lottery';

interface AdminPanelProps {
    currentEmployees: Employee[];
    currentPrizes: Prize[];
    winners: Winner[];
    onUpdateEmployees: (employees: Employee[]) => void;
    onUpdatePrizes: (prizes: Prize[]) => void;
    aiConfig: AIConfig;
    onUpdateAIConfig: (config: AIConfig) => void;
    onResetAll: () => void;
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
    currentEmployees,
    currentPrizes,
    winners,
    onUpdateEmployees,
    onUpdatePrizes,
    aiConfig,
    onUpdateAIConfig,
    onResetAll,
    onClose,
}) => {
    const [pendingEmployees, setPendingEmployees] = useState<Employee[] | null>(null);
    const [pendingPrizes, setPendingPrizes] = useState<Prize[] | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'employees' | 'prizes' | 'winners' | 'bgm' | 'settings'>('employees');

    const switchTab = (tab: 'employees' | 'prizes' | 'winners' | 'bgm' | 'settings') => {
        soundManager.play('click');
        setActiveTab(tab);
    };
    const [bgmFileName, setBgmFileName] = useState<string | null>(null);
    const [isBgmPlaying, setIsBgmPlaying] = useState(false);
    const [volume, setVolume] = useState(soundManager.getBGMVolume() * 100);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
        const buffer = type === 'employees'
            ? generateSampleEmployeesExcel()
            : generateSamplePrizesExcel();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = type === 'employees' ? 'employees_sample.xlsx' : 'prizes_sample.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportWinners = () => {
        if (winners.length === 0) return;

        const headers = ['獎項編號', '獎項名稱', '員工編號', '姓名', '部門', '獲獎時間'];
        const rows = winners.map(w => {
            const prize = currentPrizes.find(p => p.id === w.prizeId);
            const time = new Date(w.timestamp).toLocaleString();
            return [w.prizeId, prize?.name || '未知', w.employee.id, w.employee.name, w.employee.dept, time];
        });

        const data = [headers, ...rows];
        const buffer = exportToExcelBuffer(data);
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `winners_report_${new Date().getTime()}.xlsx`;
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
                    <button
                        onClick={() => switchTab('settings')}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'settings'
                            ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-500/10'
                            : 'text-amber-400/50 hover:text-amber-300'
                            }`}
                    >
                        ⚙️ 系統設定
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
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
                                下載範例 Excel
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
                                description="支援 CSV 或 Excel (.xlsx, .xls) 格式，需包含獎品名稱，可選填數量與每輪抽幾人"
                                onFileContent={handlePrizesFile}
                                onError={(err) => setErrors([err])}
                            />

                            {/* Download Sample */}
                            <button
                                onClick={() => downloadSample('prizes')}
                                className="flex items-center gap-2 text-amber-400/60 hover:text-amber-300 text-sm"
                            >
                                <Download size={14} />
                                下載範例 Excel
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
                                    className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download size={16} />
                                    導出 Excel 報表
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

                    {activeTab === 'settings' && (
                        <div className="space-y-8">
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-amber-300 font-bold border-b border-amber-500/20 pb-2">
                                    <SettingsIcon size={20} />
                                    <h3>AI 吉祥話設定 (Google Gemini)</h3>
                                </div>
                                <p className="text-sm text-amber-200/60 leading-relaxed">
                                    啟用後可在抽獎前生成獎項介紹，抽中後生成個人祝賀詞。需提供有效的 Google Gemini API Key。
                                </p>
                                <div className="space-y-4">
                                    <div className="flex bg-black/40 p-1 rounded-lg border border-amber-500/20">
                                        <button
                                            onClick={() => onUpdateAIConfig({ ...aiConfig, provider: 'gemini' })}
                                            className={`flex-1 py-1 text-xs rounded-md transition-all ${aiConfig.provider === 'gemini'
                                                ? 'bg-amber-500/20 text-amber-300 shadow-sm'
                                                : 'text-amber-500/40 hover:text-amber-400'
                                                }`}
                                        >
                                            Google Gemini
                                        </button>
                                        <button
                                            onClick={() => onUpdateAIConfig({ ...aiConfig, provider: 'openai' })}
                                            className={`flex-1 py-1 text-xs rounded-md transition-all ${aiConfig.provider === 'openai'
                                                ? 'bg-amber-500/20 text-amber-300 shadow-sm'
                                                : 'text-amber-500/40 hover:text-amber-400'
                                                }`}
                                        >
                                            OpenAI
                                        </button>
                                    </div>

                                    {aiConfig.provider === 'gemini' ? (
                                        <div className="space-y-2">
                                            <label className="text-xs text-amber-400/80 font-medium">Gemini API Key</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    value={aiConfig.geminiKey}
                                                    onChange={(e) => onUpdateAIConfig({ ...aiConfig, geminiKey: e.target.value })}
                                                    placeholder="在此輸入 Gemini API Key"
                                                    className="flex-1 bg-black/40 border border-amber-500/30 rounded-lg px-4 py-2 text-amber-100 placeholder:text-amber-900/40 focus:outline-none focus:border-amber-400 transition-colors"
                                                />
                                                <a
                                                    href="https://aistudio.google.com/app/apikey"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-amber-400/60 hover:text-amber-300 transition-colors whitespace-nowrap"
                                                >
                                                    <ExternalLink size={14} />
                                                    獲取
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-xs text-amber-400/80 font-medium">OpenAI API Key</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    value={aiConfig.openaiKey}
                                                    onChange={(e) => onUpdateAIConfig({ ...aiConfig, openaiKey: e.target.value })}
                                                    placeholder="在此輸入 OpenAI API Key (sk-...)"
                                                    className="flex-1 bg-black/40 border border-amber-500/30 rounded-lg px-4 py-2 text-amber-100 placeholder:text-amber-900/40 focus:outline-none focus:border-amber-400 transition-colors"
                                                />
                                                <a
                                                    href="https://platform.openai.com/api-keys"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-amber-400/60 hover:text-amber-300 transition-colors whitespace-nowrap"
                                                >
                                                    <ExternalLink size={14} />
                                                    獲取
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-amber-600">金鑰僅儲存於本地瀏覽器。OpenAI 模型預設使用 gpt-4o-mini。</p>
                                </div>

                            </section>

                            <section className="space-y-4 pt-4 border-t border-amber-500/10">
                                <div className="flex items-center gap-2 text-sky-300 font-bold">
                                    <Cloud size={20} />
                                    <h3>雲端同步 (Cloudflare D1)</h3>
                                </div>
                                <p className="text-sm text-amber-200/60 leading-relaxed">
                                    將本地資料同步到雲端，讓多台裝置可以共享相同的員工與獎項名單。
                                </p>
                                <div className="p-4 bg-sky-900/10 border border-sky-500/20 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-sky-300">員工：{currentEmployees.length} 人</p>
                                            <p className="text-xs text-sky-300">獎項：{currentPrizes.length} 項</p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                setIsSyncing(true);
                                                setSyncStatus('idle');
                                                try {
                                                    await cloudLotteryAPI.syncEmployees(currentEmployees);
                                                    await cloudLotteryAPI.syncPrizes(currentPrizes);
                                                    setSyncStatus('success');
                                                } catch {
                                                    setSyncStatus('error');
                                                }
                                                setIsSyncing(false);
                                            }}
                                            disabled={isSyncing}
                                            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-white text-xs px-4 py-2 rounded border border-sky-500/30 transition-colors"
                                        >
                                            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                                            {isSyncing ? '同步中...' : '同步到雲端'}
                                        </button>
                                    </div>
                                    {syncStatus === 'success' && (
                                        <p className="text-xs text-green-400 flex items-center gap-1">
                                            <Check size={14} /> 同步成功！
                                        </p>
                                    )}
                                    {syncStatus === 'error' && (
                                        <p className="text-xs text-red-400 flex items-center gap-1">
                                            <AlertTriangle size={14} /> 同步失敗，請檢查網路連線
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section className="space-y-4 pt-4 border-t border-amber-500/10">
                                <div className="flex items-center gap-2 text-purple-300 font-bold">
                                    <QrCode size={20} />
                                    <h3>QR Code 中獎查詢</h3>
                                </div>
                                <p className="text-sm text-amber-200/60 leading-relaxed">
                                    將此 QR Code 投影或列印，讓參與者描描即可查詢自己的中獎結果。
                                </p>
                                <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-white p-3 rounded-xl">
                                            <QRCodeSVG
                                                value={`${window.location.origin}/check`}
                                                size={120}
                                                level="H"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-xs text-purple-300 break-all">
                                                {window.location.origin}/check
                                            </p>
                                            <button
                                                onClick={() => {
                                                    const svg = document.querySelector('.qr-code-container svg');
                                                    if (!svg) return;
                                                    const svgData = new XMLSerializer().serializeToString(svg);
                                                    const canvas = document.createElement('canvas');
                                                    canvas.width = 400;
                                                    canvas.height = 400;
                                                    const ctx = canvas.getContext('2d');
                                                    const img = new Image();
                                                    img.onload = () => {
                                                        if (ctx) {
                                                            ctx.fillStyle = 'white';
                                                            ctx.fillRect(0, 0, 400, 400);
                                                            ctx.drawImage(img, 0, 0, 400, 400);
                                                            const pngUrl = canvas.toDataURL('image/png');
                                                            const a = document.createElement('a');
                                                            a.href = pngUrl;
                                                            a.download = 'qrcode-lottery-check.png';
                                                            a.click();
                                                        }
                                                    };
                                                    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                                                }}
                                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 rounded transition-colors"
                                            >
                                                <Download size={14} />
                                                下載 QR Code
                                            </button>
                                        </div>
                                    </div>
                                    <div className="qr-code-container hidden">
                                        <QRCodeSVG
                                            value={`${window.location.origin}/check`}
                                            size={400}
                                            level="H"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 pt-4 border-t border-amber-500/10">
                                <div className="flex items-center gap-2 text-red-400 font-bold">
                                    <Trash2 size={20} />
                                    <h3>危險區域</h3>
                                </div>
                                <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl space-y-3">
                                    <p className="text-xs text-red-300/70">此動作將清除所有已儲存的員工、獎項、中獎名單與 BGM 設定，並恢復為預設值。</p>
                                    <button
                                        onClick={() => {
                                            if (confirm('確定要清除所有資料並重置系統嗎？此動作無法復原。')) {
                                                onResetAll();
                                                onClose();
                                            }
                                        }}
                                        className="bg-red-900/40 hover:bg-red-800 text-red-200 text-xs px-4 py-2 rounded border border-red-500/30 transition-colors"
                                    >
                                        重置系統資料
                                    </button>
                                </div>
                            </section>
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
