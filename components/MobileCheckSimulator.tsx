// 手機查獎模擬器元件
import React, { useState } from 'react';
import { ArrowLeft, Search, PartyPopper } from 'lucide-react';
import type { Winner, Prize } from '../types';

interface MobileCheckSimulatorProps {
    winners: Winner[];
    prizes: Prize[];
    onClose: () => void;
}

export const MobileCheckSimulator: React.FC<MobileCheckSimulatorProps> = ({
    winners,
    prizes,
    onClose,
}) => {
    const [inputId, setInputId] = useState('');
    const [result, setResult] = useState<{ found: boolean; data?: Winner } | null>(null);

    const handleCheck = () => {
        if (!inputId) return;
        const winner = winners.find(
            w => w.employee.id === inputId || w.employee.id === inputId.toUpperCase()
        );
        setResult(winner ? { found: true, data: winner } : { found: false });
    };

    const prizeInfo = result?.found && result.data
        ? prizes.find(p => p.id === result.data!.prizeId)
        : null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
            <div className="bg-[#2a0a12] w-full max-w-sm h-[80vh] max-h-[700px] rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden relative flex flex-col">
                {/* 手機劉海 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20" />

                {/* Header */}
                <div className="bg-gradient-to-r from-red-800 to-red-900 p-6 pt-12 text-center relative">
                    <button onClick={onClose} className="absolute top-12 left-4 text-white/70 hover:text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <h3 className="text-xl text-amber-400 font-bold tracking-widest">尾牙查獎系統</h3>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 flex flex-col items-center justify-start overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                    {!result ? (
                        <>
                            <div className="mt-8 mb-8 text-center">
                                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <Search size={40} className="text-amber-400" />
                                </div>
                                <h4 className="text-2xl text-white font-bold mb-2">幸運查詢</h4>
                                <p className="text-amber-200/60 text-sm">請輸入您的員工編號</p>
                            </div>

                            <div className="w-full space-y-4">
                                <input
                                    type="text"
                                    placeholder="例如: 888100"
                                    value={inputId}
                                    onChange={e => setInputId(e.target.value)}
                                    className="w-full bg-white/10 border border-amber-500/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 text-center text-lg focus:outline-none focus:border-amber-400 transition-colors"
                                />
                                <button
                                    onClick={handleCheck}
                                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-red-900 font-bold py-3 rounded-xl shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all"
                                >
                                    查詢結果
                                </button>
                                <div className="mt-4 text-center">
                                    <p className="text-xs text-gray-500">測試提示：試試輸入 888100 - 888120</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full flex flex-col items-center animate-pop-in">
                            {result.found ? (
                                <>
                                    <div className="w-full text-center py-8">
                                        <PartyPopper size={64} className="text-amber-400 mx-auto mb-4 animate-bounce" />
                                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 mb-2">
                                            恭喜中獎！
                                        </h2>
                                        <p className="text-white text-lg">您獲得了</p>
                                    </div>

                                    <div className="w-full bg-gradient-to-br from-red-900 to-red-800 border-2 border-amber-500/50 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(245,158,11,0.3)] relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.2),transparent)] animate-pulse" />
                                        <div className="text-6xl mb-4">{prizeInfo?.icon}</div>
                                        <div className="text-2xl font-bold text-amber-300 mb-2">{prizeInfo?.name}</div>
                                        <div className="text-sm text-red-200 bg-black/20 rounded-full px-3 py-1 inline-block">
                                            得獎者：{result.data?.employee.name}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-full text-center py-12">
                                        <div className="text-6xl mb-4 grayscale opacity-70">🤔</div>
                                        <h2 className="text-2xl font-bold text-gray-300 mb-2">很遺憾...</h2>
                                        <p className="text-gray-400 mb-8">目前尚未查詢到您的中獎紀錄</p>

                                        <div className="bg-white/5 rounded-xl p-4 text-sm text-gray-400">
                                            <p>別氣餒！大獎還在後頭！</p>
                                            <p>請確認 ID 是否輸入正確 ({inputId})</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                onClick={() => {
                                    setResult(null);
                                    setInputId('');
                                }}
                                className="mt-8 text-amber-400 underline decoration-amber-500/50 hover:text-white"
                            >
                                重新查詢
                            </button>
                        </div>
                    )}
                </div>

                {/* Home Bar */}
                <div className="h-6 w-full flex justify-center items-center pb-2">
                    <div className="w-1/3 h-1 bg-gray-600 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default MobileCheckSimulator;
