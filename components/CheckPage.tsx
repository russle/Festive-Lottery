// 中獎查詢頁面 (手機用戶掃描 QR Code 後進入)
import React, { useState } from 'react';
import { Search, PartyPopper, Frown } from 'lucide-react';
import { CLOUD_API_URL } from '../api/lottery';

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

    const handleCheck = async () => {
        if (!employeeId.trim()) {
            setError('請輸入員工編號');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch(`${CLOUD_API_URL}/api/check/${encodeURIComponent(employeeId.trim())}`);
            const json = await res.json();
            setResult(json);
        } catch (err) {
            setError('查詢失敗，請檢查網路連線');
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
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-amber-900 to-yellow-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* 標題 */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-amber-200 mb-2">🎊 中獎查詢</h1>
                    <p className="text-amber-300/70 text-sm">輸入您的員工編號查詢中獎結果</p>
                </div>

                {/* 查詢表單 */}
                <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-amber-500/30 p-6 shadow-2xl">
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="請輸入員工編號"
                            className="flex-1 bg-black/40 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-100 placeholder:text-amber-700 focus:outline-none focus:border-amber-400 text-center text-lg"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleCheck}
                            disabled={isLoading}
                            className="bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
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
                            <p className="text-amber-300">查詢中...</p>
                        </div>
                    )}

                    {/* 中獎結果 */}
                    {result && result.hasWon && (
                        <div className="text-center py-6 space-y-4">
                            <div className="text-6xl animate-bounce">🎉</div>
                            <h2 className="text-2xl font-bold text-amber-200 flex items-center justify-center gap-2">
                                <PartyPopper className="text-yellow-400" />
                                恭喜中獎！
                                <PartyPopper className="text-yellow-400" />
                            </h2>
                            <div className="space-y-3 mt-4">
                                {result.data.map((record, index) => (
                                    <div
                                        key={index}
                                        className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 rounded-xl p-4"
                                    >
                                        <div className="text-4xl mb-2">{record.prizeIcon}</div>
                                        <p className="text-xl font-bold text-amber-100">{record.prizeName}</p>
                                        <p className="text-xs text-amber-400/60 mt-1">
                                            {new Date(record.timestamp).toLocaleString('zh-TW')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-amber-300/80 text-sm mt-4">
                                請攜帶員工證至櫃台領獎 🏆
                            </p>
                        </div>
                    )}

                    {/* 未中獎 */}
                    {result && !result.hasWon && (
                        <div className="text-center py-8 space-y-4">
                            <Frown size={64} className="mx-auto text-amber-500/40" />
                            <h2 className="text-xl text-amber-300">很遺憾，尚未中獎</h2>
                            <p className="text-amber-400/60 text-sm">
                                別灰心，後續還有更多大獎等你來抽！🍀
                            </p>
                        </div>
                    )}
                </div>

                {/* 底部資訊 */}
                <p className="text-center text-amber-500/40 text-xs mt-6">
                    © 2026 尾牙抽獎系統
                </p>
            </div>
        </div>
    );
};

export default CheckPage;
