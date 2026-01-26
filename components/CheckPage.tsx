// 中獎查詢頁面 (手機用戶掃描 QR Code 後進入)
import React, { useState } from 'react';
import { Search, PartyPopper, Frown } from 'lucide-react';
import { loadApiUrl, saveApiUrl, loadHostId, saveHostId } from '../utils/storage';

interface WinRecord {
    prizeName: string;
    prizeIcon: string;
    timestamp: string;
    employeeId: string;
    employeeName: string;
    employeeDept: string;
}

interface CheckResult {
    success: boolean;
    hasWon: boolean;
    data: WinRecord[];
}

export const CheckPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'personal' | 'all'>('personal');
    const [employeeId, setEmployeeId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CheckResult | null>(null);
    const [allWinners, setAllWinners] = useState<WinRecord[]>([]);
    const [error, setError] = useState('');

    // 解析網址中的 API URL 與 Host ID 參數
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const apiUrlParam = params.get('api');
        if (apiUrlParam) {
            saveApiUrl(decodeURIComponent(apiUrlParam));
        }
        const hostIdParam = params.get('host');
        if (hostIdParam) {
            saveHostId(hostIdParam);
        }
    }, []);

    const fetchAllWinners = async () => {
        setIsLoading(true);
        setError('');
        try {
            const apiUrl = loadApiUrl();
            const hostId = loadHostId();
            if (!apiUrl) {
                setError('尚未設定雲端 API，請聯繫管理員');
                return;
            }
            const res = await fetch(`${apiUrl}/api/winners`, {
                headers: { 'X-Host-ID': hostId }
            });
            const json = await res.json();
            if (json.success) {
                setAllWinners(json.data);
            } else {
                setError('無法獲取中獎名單');
            }
        } catch (err: unknown) {
            console.error('Fetch all winners failed:', err);
            setError('獲取名單失敗，請檢查網路連線');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'all') {
            fetchAllWinners();
        }
    }, [activeTab]);

    const handleCheck = async () => {
        if (!employeeId.trim()) {
            setError('請輸入員工編號或姓名');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const apiUrl = loadApiUrl();
            const hostId = loadHostId();
            if (!apiUrl) {
                setError('尚未設定雲端 API，請聯繫管理員');
                return;
            }
            // Pass host as both header and query param for maximum compatibility
            const res = await fetch(`${apiUrl}/api/check/${encodeURIComponent(employeeId.trim())}?host=${encodeURIComponent(hostId)}`, {
                headers: { 'X-Host-ID': hostId }
            });
            const json = await res.json();
            setResult(json);
        } catch (err: unknown) {
            console.error('Check failed:', err);
            const message = err instanceof Error ? err.message : '請檢查網路連線';
            setError(`查詢失敗：${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCheck();
        }
    };

    // 分組中獎名單
    const groupedWinners = allWinners.reduce((acc, record) => {
        if (!acc[record.prizeName]) {
            acc[record.prizeName] = {
                icon: record.prizeIcon,
                winners: []
            };
        }
        acc[record.prizeName].winners.push(record);
        return acc;
    }, {} as Record<string, { icon: string; winners: WinRecord[] }>);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-fuchsia-900 to-rose-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md my-8">
                {/* 標題 */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-fuchsia-200 mb-2">🎊 尾牙抽獎管理</h1>
                    <p className="text-fuchsia-300/70 text-sm">即時查看您的中獎結果與完整名單</p>
                </div>

                {/* 分頁切換 */}
                <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-fuchsia-500/20">
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'personal' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-fuchsia-400 hover:text-fuchsia-200'}`}
                    >
                        個人查詢
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'all' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-fuchsia-400 hover:text-fuchsia-200'}`}
                    >
                        中獎總榜
                    </button>
                </div>

                <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-fuchsia-500/30 p-6 shadow-2xl overflow-hidden min-h-[300px]">
                    {activeTab === 'personal' ? (
                        <>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="輸入編號或姓名"
                                    className="flex-1 bg-black/40 border border-fuchsia-500/30 rounded-xl px-4 py-3 text-fuchsia-100 placeholder:text-fuchsia-700/50 focus:outline-none focus:border-fuchsia-400 text-center text-lg"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleCheck}
                                    disabled={isLoading}
                                    className="bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-fuchsia-800 text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <Search size={20} />
                                </button>
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm text-center mb-4">{error}</p>
                            )}

                            {isLoading && (
                                <div className="text-center py-8">
                                    <div className="animate-spin text-4xl mb-2">🎰</div>
                                    <p className="text-fuchsia-300">查詢中...</p>
                                </div>
                            )}

                            {/* 中獎結果 */}
                            {result && result.hasWon && (
                                <div className="text-center py-6 space-y-4">
                                    <div className="text-6xl animate-bounce">🎉</div>
                                    <h2 className="text-2xl font-bold text-fuchsia-200 flex items-center justify-center gap-2">
                                        <PartyPopper className="text-pink-400" />
                                        恭喜中獎！
                                        <PartyPopper className="text-pink-400" />
                                    </h2>
                                    <div className="space-y-3 mt-4">
                                        {result.data.map((record, index) => (
                                            <div
                                                key={index}
                                                className="bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 border border-fuchsia-400/40 rounded-xl p-4"
                                            >
                                                <div className="text-4xl mb-2">{record.prizeIcon}</div>
                                                <p className="text-xl font-bold text-fuchsia-100">{record.prizeName}</p>
                                                <p className="text-xs text-fuchsia-400/60 mt-1">
                                                    {new Date(record.timestamp.replace(' ', 'T') + 'Z').toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 未中獎 */}
                            {result && !result.hasWon && (
                                <div className="text-center py-8 space-y-4">
                                    <Frown size={64} className="mx-auto text-fuchsia-500/40" />
                                    <h2 className="text-xl text-fuchsia-300">很遺憾，尚未中獎</h2>
                                    <p className="text-fuchsia-400/60 text-sm">
                                        別灰心，後續還有更多大獎等你來抽！🍀
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6">
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin text-4xl mb-2">📋</div>
                                    <p className="text-fuchsia-300">名單讀取中...</p>
                                </div>
                            ) : Object.keys(groupedWinners).length > 0 ? (
                                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {Object.entries(groupedWinners).map(([prizeName, { icon, winners }]) => (
                                        <div key={prizeName} className="space-y-3">
                                            <div className="flex items-center gap-2 border-b border-fuchsia-500/20 pb-2">
                                                <span className="text-2xl">{icon}</span>
                                                <h3 className="font-bold text-fuchsia-200">{prizeName}</h3>
                                                <span className="text-xs bg-fuchsia-500/20 text-fuchsia-400 px-2 py-0.5 rounded-full">{winners.length} 人</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {winners.map((w, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                                                        <div>
                                                            <span className="text-fuchsia-100 font-medium">{w.employeeName}</span>
                                                            <span className="text-xs text-fuchsia-400/60 ml-2">{w.employeeDept}</span>
                                                        </div>
                                                        <span className="text-[10px] font-mono text-fuchsia-500/40">{w.employeeId}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-fuchsia-500/40">目前尚無中獎紀錄</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 底部資訊 */}
                <p className="text-center text-fuchsia-500/40 text-[10px] mt-8 uppercase tracking-[0.2em]">
                    © 2026 Festive Lottery System
                </p>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(217, 70, 239, 0.3); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default CheckPage;
