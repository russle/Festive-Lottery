// 單獎揭曉階段元件
import React from 'react';
import { PartyPopper, Gem, SkipForward } from 'lucide-react';
import type { Winner } from '../../types';

interface RevealPhaseProps {
    winner: Winner | undefined;
    aiCommentary: string;
    isAiLoading: boolean;
    onGenerateWinnerComment: () => void;
    onNext: () => void;
}

export const RevealPhase: React.FC<RevealPhaseProps> = ({
    winner,
    aiCommentary,
    isAiLoading,
    onGenerateWinnerComment,
    onNext,
}) => {
    if (!winner) return null;

    return (
        <div className="text-center w-full relative max-w-5xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-amber-500/30 to-transparent blur-3xl -z-10 animate-pulse" />

            <div className="mb-4 text-3xl text-amber-300 font-medium tracking-[0.5em] uppercase flex items-center justify-center gap-4">
                <PartyPopper className="animate-bounce" />
                恭喜得獎
                <PartyPopper className="animate-bounce" />
            </div>

            <div className="animate-pop-in">
                <h2 className="text-[100px] md:text-[130px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-200 to-amber-500 drop-shadow-[0_10px_0_rgba(180,83,9,0.5)]">
                    {winner.employee.name}
                </h2>
                <div className="text-5xl text-red-200 font-bold mt-6 bg-red-900/60 inline-block px-12 py-3 rounded-full border border-amber-500/30">
                    {winner.employee.dept}
                </div>
            </div>

            {/* AI Comment */}
            <div className="mt-12 min-h-[120px] flex flex-col items-center justify-center">
                {!aiCommentary && !isAiLoading && (
                    <button
                        onClick={onGenerateWinnerComment}
                        className="text-amber-200/80 hover:text-white border border-amber-500/30 px-6 py-2 rounded-full text-sm hover:bg-amber-900/30 transition-all flex items-center gap-2"
                    >
                        <Gem size={14} />
                        聽聽財神爺怎麼說
                    </button>
                )}
                {aiCommentary && (
                    <div className="relative max-w-3xl bg-red-950/80 border border-amber-500/40 p-8 rounded-2xl shadow-xl animate-fade-in-up">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-red-900 text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                            財神開示
                        </div>
                        <p className="text-2xl text-amber-100 font-medium">"{aiCommentary}"</p>
                    </div>
                )}
            </div>

            <div className="mt-10">
                <button
                    onClick={onNext}
                    className="text-amber-400/60 hover:text-amber-300 flex items-center gap-2 mx-auto transition-colors font-medium tracking-wide"
                >
                    繼續下一個獎項 <SkipForward size={20} />
                </button>
            </div>
        </div>
    );
};

export default RevealPhase;
