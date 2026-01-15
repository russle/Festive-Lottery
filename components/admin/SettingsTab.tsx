// 系統設定 Tab (AI, Cloud, Logo, Danger Zone)
import React, { useState } from 'react';
import { Settings as SettingsIcon, ExternalLink, Cloud, RefreshCw, Trash2, Upload, Timer } from 'lucide-react';
import { cloudLotteryAPI } from '../../api/lottery';
import { loadApiUrl, saveApiUrl, loadHostId, saveHostId } from '../../utils/storage';
import { useLotteryContext } from '../../contexts/LotteryContext';

export const SettingsTab: React.FC = () => {
    const lottery = useLotteryContext();
    const [apiUrl, setApiUrlState] = useState(loadApiUrl() || '');
    const [hostId, setHostIdState] = useState(loadHostId());
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
    const [syncMessage, setSyncMessage] = useState('');

    const handleSaveSettings = () => {
        let urlToSave = apiUrl.trim();
        if (urlToSave && !urlToSave.startsWith('http://') && !urlToSave.startsWith('https://')) {
            urlToSave = 'https://' + urlToSave;
            setApiUrlState(urlToSave);
        }
        urlToSave = urlToSave.replace(/\/+$/, '');
        setApiUrlState(urlToSave);
        saveApiUrl(urlToSave);

        const trimmedHostId = hostId.trim() || 'default';
        setHostIdState(trimmedHostId);
        saveHostId(trimmedHostId);

        alert('設定已儲存');
    };

    const handleManualSync = async () => {
        setSyncStatus('syncing');
        setSyncMessage('');
        try {
            const empRes = await cloudLotteryAPI.syncEmployees(lottery.employees);
            if (!empRes.success) {
                throw new Error(`同步員工資料失敗: ${empRes.error || '未知錯誤'}`);
            }

            const prizeRes = await cloudLotteryAPI.syncPrizes(lottery.prizes);
            if (!prizeRes.success) {
                throw new Error(`同步獎品資料失敗: ${prizeRes.error || '未知錯誤'}`);
            }

            await cloudLotteryAPI.resetWinners();
            for (const winner of lottery.winners) {
                await cloudLotteryAPI.saveWinner(winner);
            }

            setSyncStatus('success');
            setSyncMessage(`同步完成！員工 ${lottery.employees.length} 筆、獎品 ${lottery.prizes.length} 筆、中獎 ${lottery.winners.length} 筆`);
        } catch (error: unknown) {
            setSyncStatus('error');
            const message = error instanceof Error ? error.message : '同步失敗';
            setSyncMessage(message);
            console.error('Manual sync failed:', error);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* 雲端同步設定 */}
            <section className="bg-black/30 border border-amber-500/20 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-amber-500/10 pb-4">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                        <Cloud className="text-amber-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-amber-300 font-bold text-lg">雲端同步伺服器</h3>
                        <p className="text-amber-500/40 text-xs">設定 Cloudflare Workers 的後端網址以同步中獎資料</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm text-amber-200/70 block px-1">Worker API 網址</label>
                        <input
                            type="text"
                            placeholder="https://lottery-worker.yourname.workers.dev"
                            value={apiUrl}
                            onChange={(e) => setApiUrlState(e.target.value)}
                            className="w-full bg-[#1a0510] border border-amber-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-amber-200/70 block px-1">Host ID (活動識別碼)</label>
                        <input
                            type="text"
                            placeholder="2026-event-01"
                            value={hostId}
                            onChange={(e) => setHostIdState(e.target.value)}
                            className="w-full bg-[#1a0510] border border-amber-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                        onClick={handleSaveSettings}
                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95"
                    >
                        儲存伺服器設定
                    </button>
                    <button
                        onClick={handleManualSync}
                        disabled={syncStatus === 'syncing' || !apiUrl}
                        className="flex-1 border border-amber-500/40 hover:bg-amber-500/10 text-amber-400 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={18} className={syncStatus === 'syncing' ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                        立即手動上傳所有資料
                    </button>
                </div>

                {syncMessage && (
                    <div className={`p-4 rounded-xl border ${syncStatus === 'success' ? 'bg-green-900/20 border-green-500/50 text-green-300' : 'bg-red-900/20 border-red-500/50 text-red-300'
                        } text-sm`}>
                        {syncMessage}
                    </div>
                )}
            </section>

            {/* AI 設定部分 */}
            <section className="bg-black/30 border border-amber-500/20 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-amber-500/10 pb-4">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <ExternalLink className="text-purple-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-amber-300 font-bold text-lg">AI 評語設定</h3>
                        <p className="text-amber-500/40 text-xs">設定 Gemini 或 OpenAI API 以產生趣味的中獎評語</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-4 p-1 bg-[#1a0510] rounded-xl border border-amber-500/10">
                        <button
                            onClick={() => lottery.updateAIConfig({ ...lottery.aiConfig, provider: 'gemini' })}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${lottery.aiConfig.provider === 'gemini' ? 'bg-amber-500 text-red-900 shadow-md' : 'text-amber-500/50 hover:text-amber-400'
                                }`}
                        >
                            Google Gemini
                        </button>
                        <button
                            onClick={() => lottery.updateAIConfig({ ...lottery.aiConfig, provider: 'openai' })}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${lottery.aiConfig.provider === 'openai' ? 'bg-amber-500 text-red-900 shadow-md' : 'text-amber-500/50 hover:text-amber-400'
                                }`}
                        >
                            OpenAI
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-amber-200/70 block px-1">
                            {lottery.aiConfig.provider === 'gemini' ? 'Google AI Studio API Key' : 'OpenAI API Key'}
                        </label>
                        <input
                            type="password"
                            placeholder={lottery.aiConfig.provider === 'gemini' ? '輸入 Gemini API Key' : '輸入 OpenAI API Key'}
                            value={lottery.aiConfig.provider === 'gemini' ? lottery.aiConfig.geminiKey : lottery.aiConfig.openaiKey}
                            onChange={(e) => {
                                const newConfig = { ...lottery.aiConfig };
                                if (lottery.aiConfig.provider === 'gemini') newConfig.geminiKey = e.target.value;
                                else newConfig.openaiKey = e.target.value;
                                lottery.updateAIConfig(newConfig);
                            }}
                            className="w-full bg-[#1a0510] border border-amber-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 font-mono text-sm"
                        />
                        <p className="text-amber-500/30 text-[10px] px-1">
                            {lottery.aiConfig.provider === 'gemini' ? (
                                <span>API Key 僅儲存於本地瀏覽器。可於 <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline hover:text-amber-400">Google AI Studio</a> 免費取得。</span>
                            ) : (
                                <span>API Key 僅儲存於本地瀏覽器。</span>
                            )}
                        </p>
                    </div>
                </div>
            </section>

            {/* 視覺自定義設定 */}
            <section className="bg-black/30 border border-amber-500/20 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-amber-500/10 pb-4">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                        <Upload className="text-amber-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-amber-300 font-bold text-lg">視覺自定義</h3>
                        <p className="text-amber-500/40 text-xs">設定活動標題、副標題與 Logo</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-amber-200/70 block px-1">活動主標題</label>
                            <input
                                type="text"
                                value={lottery.eventTitle}
                                onChange={(e) => lottery.updateEventTitle(e.target.value)}
                                className="w-full bg-[#1a0510] border border-amber-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-amber-200/70 block px-1">活動副標題</label>
                            <input
                                type="text"
                                value={lottery.eventSubtitle}
                                onChange={(e) => lottery.updateEventSubtitle(e.target.value)}
                                className="w-full bg-[#1a0510] border border-amber-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm text-amber-200/70 block px-1">企業 Logo 上傳</label>
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-black/40 border-2 border-dashed border-amber-500/20 rounded-2xl flex items-center justify-center overflow-hidden">
                                {lottery.customLogo ? (
                                    <img src={lottery.customLogo} alt="Preview" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <SettingsIcon className="text-amber-500/20" size={32} />
                                )}
                            </div>
                            <div className="flex-1 space-y-3">
                                <input
                                    type="file"
                                    id="logo-upload"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => lottery.updateCustomLogo(reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <div className="flex gap-2">
                                    <label htmlFor="logo-upload" className="flex-1 bg-amber-900/30 border border-amber-500/40 text-amber-300 py-2 rounded-lg text-center cursor-pointer hover:bg-amber-900/50 transition-all text-sm font-medium">
                                        選取圖檔
                                    </label>
                                    {lottery.customLogo && (
                                        <button onClick={lottery.resetCustomLogo} className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-all">
                                            重設
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] text-amber-500/40 px-1">推薦正方形或長方形透明背景 PNG (最大 1MB)</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-amber-200/70 block px-1 flex items-center gap-2">
                            <Timer size={14} /> 抽獎倒數時間 (秒)
                        </label>
                        <div className="flex gap-4">
                            {[1, 3, 5, 8].map((sec) => (
                                <button
                                    key={sec}
                                    onClick={() => lottery.setCountdownDuration(sec)}
                                    className={`flex-1 py-3 rounded-xl border transition-all font-bold ${lottery.countdownDuration === sec
                                        ? 'bg-amber-500 border-amber-500 text-red-900 shadow-lg'
                                        : 'bg-black/20 border-amber-500/20 text-amber-500/50 hover:border-amber-500/40 hover:text-amber-400'
                                        }`}
                                >
                                    {sec} 秒
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 進階設定 / 危險區域 */}
            <section className="bg-red-900/5 border border-red-900/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <Trash2 className="text-red-500/60" size={18} />
                    <h3 className="text-red-300 font-bold">進階操作 / 危險區域</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => {
                            if (window.confirm('確定要初始化整個抽獎系統嗎？這會刪除所有本地端與雲端的員工、獎品及中獎資料。')) {
                                lottery.clearStoredData();
                            }
                        }}
                        className="flex-1 py-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-900/40 transition-all text-sm font-bold active:scale-95"
                    >
                        完全初始化系統 (重置所有資料)
                    </button>
                    <button
                        onClick={() => {
                            const data = {
                                employees: lottery.employees,
                                prizes: lottery.prizes,
                                winners: lottery.winners,
                                config: {
                                    eventTitle: lottery.eventTitle,
                                    eventSubtitle: lottery.eventSubtitle,
                                    countdownDuration: lottery.countdownDuration
                                }
                            };
                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `lottery_backup_${new Date().toISOString().slice(0, 10)}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="flex-1 py-3 border border-amber-500/20 text-amber-500/60 rounded-xl hover:bg-amber-500/5 transition-all text-sm font-medium"
                    >
                        導出備份 JSON
                    </button>
                </div>
            </section>
        </div>
    );
};

export default SettingsTab;
