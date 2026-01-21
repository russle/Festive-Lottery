// 批量揭曉階段元件
import React from 'react';
import { Sparkles, SkipForward, ChevronLeft } from 'lucide-react';
import { useLotteryContext } from '../../contexts/LotteryContext';

export const BatchRevealPhase: React.FC = () => {
    const lottery = useLotteryContext();
    const { currentPrize, currentBatchWinners, batchRevealedCount, currentPrizeIndex } = lottery;
    const allRevealed = batchRevealedCount >= currentBatchWinners.length;

    if (!currentPrize) return null;

    return (
        <div className="w-full max-w-7xl px-4 z-20 mt-16">
            <h2 className="text-center text-4xl font-bold text-amber-300 mb-8 tracking-widest drop-shadow-md">
                ✦ {currentPrize.name} 得獎名單 ✦
            </h2>

            <div className="flex flex-wrap justify-center gap-8">
                {currentBatchWinners.map((winner, idx) => (
                    <div
                        key={`${winner.employee.id}-${idx}`}
                        className={`
              relative bg-red-900/40 border-2 border-amber-500/40 p-10 rounded-2xl flex flex-col items-center justify-center min-h-[240px] overflow-hidden group
              w-full sm:w-[calc(50%-2rem)] md:w-[calc(33.33%-2rem)] xl:w-[calc(20%-2rem)]
              transition-all duration-700 transform
              ${idx < batchRevealedCount ? 'opacity-100 scale-100 translate-y-0 shadow-2xl' : 'opacity-0 scale-90 translate-y-10'}
            `}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent" />
                        <div className={`font-bold text-white mb-3 z-10 whitespace-nowrap ${winner.employee.name.length > 3 ? 'text-5xl' : 'text-6xl'}`}>{winner.employee.name}</div>
                        <div className="text-3xl text-amber-300 z-10 font-medium">{winner.employee.dept}</div>
                        <div className="absolute top-3 right-3 text-amber-500/20">
                            <Sparkles size={32} />
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
