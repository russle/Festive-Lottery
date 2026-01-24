// 設定面板元件
import React from 'react';
import { X, Volume2, VolumeX, Database, Music } from 'lucide-react';
import { useLotteryContext } from '../contexts/LotteryContext';

interface SettingsPanelProps {
    show: boolean;
    onClose: () => void;
    onOpenAdmin?: () => void;
    onShowController?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    show,
    onClose,
    onOpenAdmin,
    onShowController,
}) => {
    const lottery = useLotteryContext();

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
                                onOpenAdmin?.();
                                onClose();
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                        >
                            <Database size={14} />
                            📋 資料管理（上傳清單）
                        </button>
                    )}

                    {/* iPad 遠端控制按鈕 */}
                    {onShowController && (
                        <button
                            onClick={() => {
                                onShowController?.();
                                onClose();
                            }}
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                        >
                            <Music size={14} />
                            📱 iPad 遠端控制 QR
                        </button>
                    )}

                    {/* 音效開關 */}
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-amber-200/60">音效</span>
                        <button onClick={() => lottery.setSoundEnabled(!lottery.soundEnabled)} className="text-amber-400">
                            {lottery.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                    </div>

                    {/* BGM 開關 */}
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-amber-200/60">背景音樂</span>
                        <button onClick={() => lottery.setBGMEnabled(!lottery.bgmEnabled)} className="text-amber-400">
                            {lottery.bgmEnabled ? <Music size={16} /> : <VolumeX size={16} />}
                        </button>
                    </div>

                    {/* 模式切換 */}
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-amber-200/60">模式切換</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => lottery.setPhase('standby')}
                                className="text-xs bg-amber-900/30 border border-amber-500/20 px-2 py-1 text-amber-300 rounded hover:bg-amber-900/50"
                            >
                                主
                            </button>
                            <button
                                onClick={() => lottery.setPhase('join')}
                                className="text-xs bg-amber-900/30 border border-amber-500/20 px-2 py-1 text-amber-300 rounded hover:bg-amber-900/50"
                            >
                                集氣
                            </button>
                            <button
                                onClick={() => lottery.setPhase('wall')}
                                className="text-xs bg-amber-900/30 border border-amber-500/20 px-2 py-1 text-amber-300 rounded hover:bg-amber-900/50"
                            >
                                榜
                            </button>
                        </div>
                    </div>

                    {/* 重抽按鈕 */}
                    <button
                        onClick={() => {
                            if (window.confirm('確定要重抽此獎嗎？\n這將會清除目前獎項的所有中獎名單！')) {
                                lottery.resetCurrentPrize();
                            }
                        }}
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
