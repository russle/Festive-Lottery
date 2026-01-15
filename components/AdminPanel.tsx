// 管理面板元件 (重構後的主容器)
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { useLotteryContext } from '../contexts/LotteryContext';

// 引入拆分後的子元件
import { EmployeeTab, PrizeTab, WinnerTab, BGMTab, SettingsTab } from './admin';

interface AdminPanelProps {
    onClose: () => void;
}

type TabType = 'employees' | 'prizes' | 'winners' | 'bgm' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<TabType>('employees');
    const lottery = useLotteryContext();

    const switchTab = (tab: TabType) => {
        soundManager.play('click');
        setActiveTab(tab);
    };

    const tabs: { key: TabType; label: string }[] = [
        { key: 'employees', label: `👥 員工清單 (${lottery.employees.length})` },
        { key: 'prizes', label: `🎁 獎品清單 (${lottery.prizes.length})` },
        { key: 'winners', label: `🏆 中獎名單 (${lottery.winners.length})` },
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
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${activeTab === tab.key
                                ? 'text-amber-300 bg-amber-500/10 border-b-2 border-amber-500'
                                : 'text-amber-400/50 hover:text-amber-300 hover:bg-amber-500/5'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#1a0510]/30">
                    {activeTab === 'employees' && (
                        <EmployeeTab />
                    )}
                    {activeTab === 'prizes' && (
                        <PrizeTab />
                    )}
                    {activeTab === 'winners' && (
                        <WinnerTab />
                    )}
                    {activeTab === 'bgm' && (
                        <BGMTab />
                    )}
                    {activeTab === 'settings' && (
                        <SettingsTab />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
