// 中獎查詢頁面 (手機用戶掃描 QR Code 後進入)
import React, { useState } from 'react';
import { Search, PartyPopper, Frown } from 'lucide-react';
import { loadApiUrl, saveApiUrl, loadHostId, saveHostId } from '../utils/storage';

interface WinRecord {
    prizeName: string;
    prizeIcon: string;
    timestamp: string;
    employeeName: string;
    employeeDept: string;
}

interface CheckResult {
    success: boolean;
    hasWon: boolean;
    data: WinRecord[];
}

export const CheckPage: React.FC = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CheckResult | null>(null);
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

    const handleCheck = async () => {
        if (!employeeId.trim()) {
            setError('請輸入員工編號');
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-fuchsia-900 to-rose-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* 標題 */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-fuchsia-200 mb-2">🎊 中獎查詢</h1>
                    <p className="text-fuchsia-300/70 text-sm">輸入您的員工編號查詢中獎結果</p>
                </div>

                {/* 查詢表單 */}
                <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-fuchsia-500/30 p-6 shadow-2xl">
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="請輸入員工編號"
                            className="flex-1 bg-black/40 border border-fuchsia-500/30 rounded-xl px-4 py-3 text-fuchsia-100 placeholder:text-fuchsia-700 focus:outline-none focus:border-fuchsia-400 text-center text-lg"
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
                </div>

                {/* 底部資訊 */}
                <p className="text-center text-fuchsia-500/40 text-xs mt-6">
                    © 2026 尾牙抽獎系統
                </p>
            </div>
        </div>
    );
};

export default CheckPage;
