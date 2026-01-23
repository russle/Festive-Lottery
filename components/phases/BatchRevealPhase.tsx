// 批量揭曉階段元件
import React from 'react';
import { Sparkles, SkipForward, ChevronLeft } from 'lucide-react';
import { useLotteryContext } from '../../contexts/LotteryContext';

export const BatchRevealPhase: React.FC = () => {
    const lottery = useLotteryContext();
    const { currentPrize, currentBatchWinners, batchRevealedCount, currentPrizeIndex } = lottery;
    const allRevealed = batchRevealedCount >= currentBatchWinners.length;

    if (!currentPrize) return null;

    const winnerCount = currentBatchWinners.length;
    const gridCols = winnerCount === 10 ? 'xl:grid-cols-5' : 'xl:grid-cols-6';

    return (
        <div className="w-full max-w-7xl px-4 z-20 mt-16">
            <h2 className="text-center text-4xl font-bold text-amber-300 mb-8 tracking-widest drop-shadow-md">
                ✦ {currentPrize.name} 得獎名單 ✦
            </h2>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gridCols} gap-6 xl:gap-4 py-4 px-2`}>
                {currentBatchWinners.map((winner, idx) => (
                    <div
                        key={`${winner.employee.id}-${idx}`}
                        className={`
                            relative bg-red-900/40 border-2 border-amber-500/40 p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center min-h-[180px] md:min-h-[220px] overflow-hidden group
                            transition-all duration-700 transform
                            ${idx < batchRevealedCount ? 'opacity-100 scale-100 translate-y-0 shadow-2xl' : 'opacity-0 scale-90 translate-y-10'}
                        `}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent" />
                        <div className={`font-bold text-white mb-2 z-10 whitespace-nowrap ${winner.employee.name.length > 3 ? 'text-4xl' : 'text-5xl'}`}>{winner.employee.name}</div>
                        <div className="text-xl md:text-2xl text-amber-300 z-10 font-medium">{winner.employee.dept}</div>
                        <div className="absolute top-2 right-2 text-amber-500/10">
                            <Sparkles size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {allRevealed && (
                <div className="mt-8 flex gap-6 justify-center items-center">
                    {currentPrizeIndex > 0 && (
                        <button
                            onClick={lottery.previousPrize}
                            className="text-amber-400/60 hover:text-amber-300 flex items-center gap-2 transition-colors font-medium tracking-wide"
                        >
                            <ChevronLeft size={20} /> 上一獎項
                        </button>
                    )}
                    <button
                        onClick={lottery.nextPrize}
                        className="text-amber-400/60 hover:text-amber-300 flex items-center gap-2 transition-colors font-medium tracking-wide"
                    >
                        繼續下一個獎項 <SkipForward size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default BatchRevealPhase;
