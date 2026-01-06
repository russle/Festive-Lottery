// 榮譽榜階段元件
import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { Winner, Prize } from '../../types';

interface WallPhaseProps {
    winners: Winner[];
    prizes: Prize[];
    onReset: () => void;
    onOpenMobileCheck: () => void;
}

export const WallPhase: React.FC<WallPhaseProps> = ({
    winners,
    prizes,
    onReset,
    onOpenMobileCheck,
}) => {
    return (
        <div className="w-full max-w-6xl mx-auto h-[80vh] overflow-y-auto z-20 pr-4 custom-scrollbar">
            <div className="text-center mb-12 relative">
                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 mb-4">
                    🏆 榮譽風雲榜 🏆
                </h2>
                <p className="text-amber-400/60">恭喜所有獲得好運的同仁</p>

                {/* QR Code 快速入口 */}
                <div
                    className="absolute right-0 top-0 cursor-pointer group"
                    onClick={onOpenMobileCheck}
                >
                    <div className="bg-white p-2 rounded-lg shadow-lg transform transition-transform group-hover:scale-105">
                        <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=check&color=000&bgcolor=fff"
                            alt="Check QR"
                            className="w-20 h-20"
                        />
                        <div className="text-black text-[10px] font-bold text-center mt-1">掃碼查獎</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {prizes
                    .slice()
                    .reverse()
                    .map(prize => {
                        const prizeWinners = winners.filter(w => w.prizeId === prize.id);
                        if (prizeWinners.length === 0) return null;
                        return (
                            <div
                                key={prize.id}
                                className="bg-gradient-to-r from-red-900/40 to-purple-900/40 border border-amber-500/20 rounded-2xl p-8 relative overflow-hidden shadow-lg"
                            >
                                <div className="flex items-center gap-4 mb-6 border-b border-amber-500/20 pb-4">
                                    <span className="text-4xl">{prize.icon}</span>
                                    <h3 className="text-2xl font-bold text-amber-300">{prize.name}</h3>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {prizeWinners.map((w, i) => (
                                        <div
                                            key={i}
                                            className="bg-black/20 border border-amber-500/10 px-5 py-2 rounded-full flex items-center gap-3"
                                        >
                                            <span className="font-bold text-white">{w.employee.name}</span>
                                            <span className="text-xs text-amber-400/80">{w.employee.dept}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
            </div>

            <div className="mt-16 text-center pb-12">
                <button
                    onClick={onReset}
                    className="text-amber-500/50 hover:text-amber-500 flex items-center justify-center gap-2 mx-auto text-sm transition-colors"
                >
                    <RefreshCw size={14} />
                    重置活動
                </button>
            </div>
        </div>
    );
};

export default WallPhase;
