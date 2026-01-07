// 批量揭曉階段元件
import React from 'react';
import { Sparkles } from 'lucide-react';
import type { Employee, Prize } from '../../types';

interface BatchRevealPhaseProps {
    prize: Prize;
    batchWinners: Employee[];
    revealedCount: number;
    onNext: () => void;
}

export const BatchRevealPhase: React.FC<BatchRevealPhaseProps> = ({
    prize,
    batchWinners,
    revealedCount,
    onNext,
}) => {
    const allRevealed = revealedCount >= batchWinners.length;

    return (
        <div className="w-full max-w-7xl px-4 z-20">
            <h2 className="text-center text-4xl font-bold text-amber-300 mb-12 tracking-widest drop-shadow-md">
                ✦ {prize.name} 得獎名單 ✦
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {batchWinners.map((winner, idx) => (
                    <div
                        key={winner.id}
                        className={`
              relative bg-red-900/40 border border-amber-500/30 p-6 rounded-xl flex flex-col items-center justify-center min-h-[150px] overflow-hidden group
              transition-all duration-700 transform
              ${idx < revealedCount ? 'opacity-100 scale-100 translate-y-0 shadow-lg' : 'opacity-0 scale-90 translate-y-10'}
            `}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent" />
                        <div className={`font-bold text-white mb-2 z-10 whitespace-nowrap ${winner.name.length > 3 ? 'text-2xl' : 'text-3xl'}`}>{winner.name}</div>
                        <div className="text-lg text-amber-300 z-10">{winner.dept}</div>
                        <div className="absolute top-2 right-2 text-amber-500/20">
                            <Sparkles size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {allRevealed && (
                <div className="mt-12 flex justify-center">
                    <button
                        onClick={onNext}
                        className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-full shadow-lg transition-all"
                    >
                        繼續抽獎
                    </button>
                </div>
            )}
        </div>
    );
};

export default BatchRevealPhase;
