// 管理面板元件 (重構後的主容器)
import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Employee, Prize, Winner, AIConfig } from '../types';
import { soundManager } from '../utils/sound';

// 引入拆分後的子元件
import { EmployeeTab, PrizeTab, WinnerTab, BGMTab, SettingsTab } from './admin';

interface AdminPanelProps {
    currentEmployees: Employee[];
    currentPrizes: Prize[];
    winners: Winner[];
    onUpdateEmployees: (employees: Employee[]) => void;
    onUpdatePrizes: (prizes: Prize[]) => void;
    aiConfig: AIConfig;
    onUpdateAIConfig: (config: AIConfig) => void;
    onResetAll: () => void;
    onResetEmployees: () => void;
    onResetPrizes: () => void;
    onResetWinners: () => void;
    onResetBGM: () => void;
    customLogo?: string | null;
    onUpdateCustomLogo?: (logo: string) => void;
    onResetCustomLogo?: () => void;
    eventTitle?: string;
    onUpdateEventTitle?: (title: string) => void;
    eventSubtitle?: string;
    onUpdateEventSubtitle?: (subtitle: string) => void;
    onClose: () => void;
}

type TabType = 'employees' | 'prizes' | 'winners' | 'bgm' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({
    currentEmployees,
    currentPrizes,
    winners,
    onUpdateEmployees,
    onUpdatePrizes,
    aiConfig,
    onUpdateAIConfig,
    onResetAll,
    onResetEmployees,
    onResetPrizes,
    onResetWinners,
    onResetBGM,
    customLogo,
    onUpdateCustomLogo,
    onResetCustomLogo,
    eventTitle,
    onUpdateEventTitle,
    eventSubtitle,
    onUpdateEventSubtitle,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('employees');

    const switchTab = (tab: TabType) => {
        soundManager.play('click');
        setActiveTab(tab);
    };

    const tabs: { key: TabType; label: string }[] = [
        { key: 'employees', label: `👥 員工清單 (${currentEmployees.length})` },
        { key: 'prizes', label: `🎁 獎品清單 (${currentPrizes.length})` },
        { key: 'winners', label: `🏆 中獎名單 (${winners.length})` },
        { key: 'bgm', label: '🎵 背景音樂' },
        { key: 'settings', label: '⚙️ 系統設定' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-b from-[#2a0a12] to-[#1a0510] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20">
                    <h2 className="text-2xl font-bold text-amber-300">📋 資料管理</h2>
                    <button
                        onClick={(e) => { e.preventDefault(); onClose(); }}
                        className="p-2 text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-amber-500/20">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => switchTab(tab.key)}
                            className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === tab.key
                                ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-500/10'
                                : 'text-amber-400/50 hover:text-amber-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {activeTab === 'employees' && (
                        <EmployeeTab
                            currentEmployees={currentEmployees}
                            onUpdateEmployees={onUpdateEmployees}
                            onResetEmployees={onResetEmployees}
                        />
                    )}

                    {activeTab === 'prizes' && (
                        <PrizeTab
                            currentPrizes={currentPrizes}
                            winners={winners}
                            onUpdatePrizes={onUpdatePrizes}
                            onResetPrizes={onResetPrizes}
                        />
                    )}

                    {activeTab === 'winners' && (
                        <WinnerTab
                            winners={winners}
                            currentPrizes={currentPrizes}
                            onResetWinners={onResetWinners}
                        />
                    )}

                    {activeTab === 'bgm' && (
                        <BGMTab onResetBGM={onResetBGM} />
                    )}

                    {activeTab === 'settings' && (
                        <SettingsTab
                            aiConfig={aiConfig}
                            onUpdateAIConfig={onUpdateAIConfig}
                            currentEmployees={currentEmployees}
                            currentPrizes={currentPrizes}
                            winners={winners}
                            customLogo={customLogo}
                            onUpdateCustomLogo={onUpdateCustomLogo}
                            onResetCustomLogo={onResetCustomLogo}
                            eventTitle={eventTitle}
                            onUpdateEventTitle={onUpdateEventTitle}
                            eventSubtitle={eventSubtitle}
                            onUpdateEventSubtitle={onUpdateEventSubtitle}
                            onResetAll={onResetAll}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-amber-500/20 bg-black/20">
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
