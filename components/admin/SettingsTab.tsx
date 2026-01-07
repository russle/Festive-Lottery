// 系統設定 Tab (AI, Cloud, Logo, Danger Zone)
import React, { useState } from 'react';
import { Settings as SettingsIcon, ExternalLink, Cloud, RefreshCw, QrCode, Download, Trash2, Upload } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Employee, Prize, Winner, AIConfig } from '../../types';
import { cloudLotteryAPI } from '../../api/lottery';
import { loadApiUrl, saveApiUrl } from '../../utils/storage';

interface SettingsTabProps {
    aiConfig: AIConfig;
    onUpdateAIConfig: (config: AIConfig) => void;
    currentEmployees: Employee[];
    currentPrizes: Prize[];
    winners: Winner[];
    customLogo?: string | null;
    onUpdateCustomLogo?: (logo: string) => void;
    onResetCustomLogo?: () => void;
    eventTitle?: string;
    onUpdateEventTitle?: (title: string) => void;
    eventSubtitle?: string;
    onUpdateEventSubtitle?: (subtitle: string) => void;
    onResetAll: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
    aiConfig,
    onUpdateAIConfig,
    currentEmployees,
    currentPrizes,
    winners,
    customLogo,
    onUpdateCustomLogo,
    onResetCustomLogo,
    eventTitle,
    onUpdateEventTitle,
    eventSubtitle,
    onUpdateEventSubtitle,
    onResetAll,
}) => {
    const [apiUrl, setApiUrlState] = useState(loadApiUrl() || '');
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
    const [syncMessage, setSyncMessage] = useState('');

    const handleSaveApiUrl = () => {
        let urlToSave = apiUrl.trim();
        // Auto-prepend https:// if no protocol
        if (urlToSave && !urlToSave.startsWith('http://') && !urlToSave.startsWith('https://')) {
            urlToSave = 'https://' + urlToSave;
            setApiUrlState(urlToSave);
        }
        // Remove trailing slash
        urlToSave = urlToSave.replace(/\/+$/, '');
        setApiUrlState(urlToSave);
        saveApiUrl(urlToSave);
        alert('雲端 API 設定已儲存');
    };

    const handleManualSync = async () => {
        setSyncStatus('syncing');
        setSyncMessage('');
        try {
            // Sync employees
            const empRes = await cloudLotteryAPI.syncEmployees(currentEmployees);
            if (!empRes.success) {
                throw new Error(`同步員工資料失敗: ${empRes.error || '未知錯誤'}`);
            }

            // Sync prizes
            const prizeRes = await cloudLotteryAPI.syncPrizes(currentPrizes);
            if (!prizeRes.success) {
                throw new Error(`同步獎品資料失敗: ${prizeRes.error || '未知錯誤'}`);
            }

            // Sync winners
            await cloudLotteryAPI.resetWinners();
            for (const winner of winners) {
                await cloudLotteryAPI.saveWinner(winner);
            }

            setSyncStatus('success');
            setSyncMessage(`同步完成！員工 ${currentEmployees.length} 筆、獎品 ${currentPrizes.length} 筆、中獎 ${winners.length} 筆`);
        } catch (error: any) {
            setSyncStatus('error');
            setSyncMessage(error.message || '同步失敗');
            console.error('Manual sync failed:', error);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('檔案大小不能超過 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result !== 'string') return;

            // Resize if needed
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 400;
                let width = img.width;
                let height = img.height;

                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height / width) * maxSize;
                        width = maxSize;
                    } else {
                        width = (width / height) * maxSize;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                const resizedDataUrl = canvas.toDataURL('image/png');
                onUpdateCustomLogo?.(resizedDataUrl);
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-8">
            {/* AI Settings */}
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

            {/* Cloud Sync Settings */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Cloud size={20} />
                    <h3>雲端同步設定</h3>
                </div>
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-amber-300/70 block">Cloud API Endpoint URL</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={apiUrl}
                                onChange={(e) => setApiUrlState(e.target.value)}
                                placeholder="https://your-worker.workers.dev"
                                className="flex-1 bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-amber-500"
                            />
                            <button
                                onClick={handleSaveApiUrl}
                                className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded text-xs transition-colors"
                            >
                                儲存
                            </button>
                        </div>
                        <p className="text-[10px] text-amber-300/40">
                            填寫您自行部署的 Cloudflare Worker 網址。若留空則僅使用本地模式（無法查獎）。
                        </p>
                    </div>

                    {apiUrl && (
                        <div className="pt-2 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-amber-300/70 font-medium">數據手動同步</span>
                                <button
                                    onClick={handleManualSync}
                                    disabled={syncStatus === 'syncing'}
                                    className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-4 py-2 rounded-lg transition-colors text-xs disabled:opacity-50"
                                >
                                    <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                                    {syncStatus === 'syncing' ? '同步中...' : '同步資料到雲端'}
                                </button>
                            </div>
                            {syncMessage && (
                                <p className={`text-[10px] ${syncStatus === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                    {syncMessage}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* QR Code Section */}
            {apiUrl && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-purple-400 font-bold">
                        <QrCode size={20} />
                        <h3>掃碼查獎二維碼</h3>
                    </div>
                    <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="bg-white p-2 rounded-lg shadow-xl shrink-0">
                                <QRCodeSVG
                                    value={`${window.location.origin}/check?api=${encodeURIComponent(apiUrl)}`}
                                    size={160}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <div className="flex-1 space-y-3">
                                <p className="text-xs text-purple-200/70">
                                    將此 QR Code 公佈給參加者。他們可以掃描查詢自己的中獎狀態。
                                    查獎頁面網址為：
                                </p>
                                <div className="p-2 bg-black/40 rounded border border-purple-500/30">
                                    <p className="text-xs text-purple-300 break-all">
                                        {window.location.origin}/check?api={encodeURIComponent(apiUrl)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        const canvas = document.createElement('canvas');
                                        const svg = document.querySelector('.qr-code-section svg') as SVGElement;
                                        if (!svg) return;

                                        const svgData = new XMLSerializer().serializeToString(svg);
                                        const img = new Image();
                                        img.onload = () => {
                                            canvas.width = 400;
                                            canvas.height = 400;
                                            const ctx = canvas.getContext('2d');
                                            if (ctx) {
                                                ctx.fillStyle = 'white';
                                                ctx.fillRect(0, 0, 400, 400);
                                                ctx.drawImage(img, 0, 0, 400, 400);
                                                const link = document.createElement('a');
                                                link.download = 'lottery-check-qr.png';
                                                link.href = canvas.toDataURL('image/png');
                                                link.click();
                                            }
                                        };
                                        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                                    }}
                                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 rounded transition-colors"
                                >
                                    <Download size={14} />
                                    下載連結圖檔
                                </button>
                            </div>
                        </div>
                        <div className="qr-code-section hidden">
                            <QRCodeSVG value={`${apiUrl}/check`} size={400} level="H" />
                        </div>
                    </div>
                </section>
            )}

            {/* Logo & Branding Settings */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold border-b border-amber-500/20 pb-2">
                    <span className="text-xl">🖼️</span>
                    <h3>活動識別設定</h3>
                </div>
                <p className="text-sm text-amber-200/60 leading-relaxed">
                    自訂左上角的活動 Logo，支援透明背景圖片。
                </p>

                <div className="bg-black/30 border border-amber-500/20 rounded-2xl p-6 flex items-start gap-6">
                    {/* Logo Preview */}
                    <div className="shrink-0">
                        <div className="w-24 h-24 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative group">
                            <div className="absolute inset-0 opacity-20"
                                style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}></div>

                            {customLogo ? (
                                <img src={customLogo} alt="Logo Preview" className="w-full h-full object-contain relative z-10 p-2" />
                            ) : (
                                <span className="text-amber-500/30 text-xs relative z-10">預設 Logo</span>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                            <div className="flex gap-3">
                                <label className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-lg cursor-pointer transition-all shadow-md flex items-center gap-2">
                                    <Upload size={14} />
                                    上傳新圖片
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoUpload}
                                    />
                                </label>
                                {customLogo && (
                                    <button
                                        onClick={onResetCustomLogo}
                                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-bold rounded-lg transition-all border border-red-500/20 flex items-center gap-2"
                                    >
                                        <Trash2 size={14} />
                                        恢復預設
                                    </button>
                                )}
                            </div>
                            <div className="text-xs text-amber-500/50 space-y-1">
                                <p>• 建議比例：1:1 (正方形)</p>
                                <p>• 建議尺寸：200x200 像素以上</p>
                                <p>• 支援格式：PNG, SVG, JPG (推薦透明背景 PNG)</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-amber-500/10">
                            <div className="space-y-2">
                                <label className="text-xs text-amber-300 font-bold block">活動主標題</label>
                                <input
                                    type="text"
                                    value={eventTitle || ''}
                                    onChange={(e) => onUpdateEventTitle?.(e.target.value)}
                                    placeholder="例如：2026 紫氣東來・尾牙盛典"
                                    className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-400 font-bold tracking-wider"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-amber-300 font-bold block">活動副標題</label>
                                <input
                                    type="text"
                                    value={eventSubtitle || ''}
                                    onChange={(e) => onUpdateEventSubtitle?.(e.target.value)}
                                    placeholder="例如：年終聯歡晚會"
                                    className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-3 py-2 text-amber-100 text-sm focus:outline-none focus:border-amber-400 tracking-widest"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Danger Zone */}
            <section className="space-y-4 pt-4 border-t border-amber-500/10">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                    <Trash2 size={20} />
                    <h3>危險區域</h3>
                </div>
                <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl space-y-3">
                    <p className="text-xs text-red-300/70">此動作將清除所有已儲存的員工、獎項、中獎名單與 BGM 設定，並恢復為預設值。</p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('確定要清除所有資料並重置系統嗎？此動作無法復原。')) {
                                onResetAll();
                            }
                        }}
                        className="bg-red-900/40 hover:bg-red-800 text-red-200 text-xs px-4 py-2 rounded border border-red-500/30 transition-colors"
                    >
                        重置系統資料
                    </button>
                </div>
            </section>
        </div>
    );
};

export default SettingsTab;
