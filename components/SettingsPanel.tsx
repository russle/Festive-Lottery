// 設定面板元件
import React from 'react';
import { X, Volume2, VolumeX, Smartphone, Database } from 'lucide-react';
import type { Phase } from '../types';

interface SettingsPanelProps {
    show: boolean;
    onClose: () => void;
    soundEnabled: boolean;
    onToggleSound: () => void;
    onSetPhase: (phase: Phase) => void;
    onResetCurrentPrize: () => void;
    onOpenMobileCheck: () => void;
    onOpenAdmin?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    show,
    onClose,
    soundEnabled,
    onToggleSound,
    onSetPhase,
    onResetCurrentPrize,
    onOpenMobileCheck,
    onOpenAdmin,
}) => {
    if (!show) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 transition-transform">
            <div className="bg-[#2a0a12]/95 border border-amber-500/40 p-4 w-64 rounded-xl shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-amber-900/50 pb-2">
                    <span className="text-amber-400 font-bold">後台設置</span>
                    <button onClick={onClose}>
                        <X size={16} className="text-amber-600 hover:text-amber-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* 資料管理按鈕 */}
                    {onOpenAdmin && (
                        <button
                            onClick={() => {
                                onOpenAdmin();
                                onClose();
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                        >
                            <Database size={14} />
                            📋 資料管理（上傳清單）
                        </button>
                    )}

                    {/* 手機模擬器按鈕 */}
                    <button
                        onClick={() => {
                            onOpenMobileCheck();
                            onClose();
                        }}
                        className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                    >
                        <Smartphone size={14} />
                        開啟手機查獎模擬器
                    </button>

                    {/* 音效開關 */}
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-amber-200/60">音效</span>
                        <button onClick={onToggleSound} className="text-amber-400">
                            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                    </div>

                    {/* 模式切換 */}
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-amber-200/60">模式切換</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onSetPhase('standby')}
                                className="text-xs bg-amber-900/30 border border-amber-500/20 px-2 py-1 text-amber-300 rounded hover:bg-amber-900/50"
                            >
                                主
                            </button>
                            <button
                                onClick={() => onSetPhase('join')}
                                className="text-xs bg-amber-900/30 border border-amber-500/20 px-2 py-1 text-amber-300 rounded hover:bg-amber-900/50"
                            >
                                集氣
                            </button>
                            <button
                                onClick={() => onSetPhase('wall')}
                                className="text-xs bg-amber-900/30 border border-amber-500/20 px-2 py-1 text-amber-300 rounded hover:bg-amber-900/50"
                            >
                                榜
                            </button>
                        </div>
                    </div>

                    {/* 重抽按鈕 */}
                    <button
                        onClick={onResetCurrentPrize}
                        className="w-full border border-red-800 text-red-400 text-xs py-2 rounded hover:bg-red-900/30 transition-colors"
                    >
                        重抽此獎
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;

