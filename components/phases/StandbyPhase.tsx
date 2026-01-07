// 待機階段元件
import React from 'react';
import { Play, Sparkles, Wand2 } from 'lucide-react';
import type { Prize } from '../../types';
import { GoldenText } from '../GoldenText';

interface StandbyPhaseProps {
    prize: Prize;
    aiCommentary: string;
    isAiLoading: boolean;
    onStart: () => void;
    onGenerateAI: () => void;
}

export const StandbyPhase: React.FC<StandbyPhaseProps> = ({
    prize,
    aiCommentary,
    isAiLoading,
    onStart,
    onGenerateAI,
}) => {
    return (
        <div className="text-center w-full max-w-5xl animate-fade-in-up flex flex-col items-center">
            {/* 獎項圖示 */}
            <div className="relative inline-flex items-center justify-center mb-6 md:mb-10">
                <div className="absolute inset-0 bg-red-500/20 blur-[80px] animate-pulse" />
                <div className="absolute inset-0 bg-amber-500/10 blur-[40px]" />
                <div className="relative text-[100px] md:text-[140px] transform hover:scale-110 transition-transform duration-700 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                    {prize.icon}
                </div>
            </div>

            {/* 獎項名稱 */}
            <div className="space-y-4 md:space-y-6 mb-6 md:mb-8 flex flex-col items-center">
                <GoldenText text={prize.name} size="text-5xl md:text-7xl lg:text-8xl" />

                <div className="flex items-center justify-center gap-4 md:gap-6 mt-4 md:mt-6">
                    <div className="h-[2px] w-8 md:w-16 bg-gradient-to-r from-transparent to-amber-500" />
                    <p className="text-lg md:text-2xl text-amber-200 font-medium tracking-[0.2em] bg-red-950/30 px-4 py-1 rounded">
                        {prize.type === 'batch' ? `福澤 ${prize.count} 位幸運兒` : '鴻運當頭・大獎降臨'}
                    </p>
                    <div className="h-[2px] w-8 md:w-16 bg-gradient-to-l from-transparent to-amber-500" />
                </div>

                {/* 開始按鈕 */}
                <button
                    onClick={onStart}
                    className="group relative px-12 py-4 mt-6 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold text-xl rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-all transform hover:-translate-y-1 z-50"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-full p-1">
                            <Play size={16} fill="currentColor" />
                        </div>
                        啟動好運
                    </div>
                </button>
            </div>

            {/* AI 吉祥話區塊 */}
            <div className="min-h-[80px] md:min-h-[100px] max-w-2xl mx-auto mb-4 md:mb-8 w-full">
                {!aiCommentary && !isAiLoading && (
                    <button
                        onClick={onGenerateAI}
                        className="group relative px-6 py-2 bg-red-900/30 hover:bg-red-900/50 rounded-full border border-amber-500/30 hover:border-amber-400 transition-all"
                    >
                        <span className="relative flex items-center gap-2 text-amber-300 text-sm tracking-wider">
                            <Sparkles size={16} className="text-yellow-400" />
                            AI 吉祥話
                        </span>
                    </button>
                )}
                {isAiLoading && (
                    <div className="flex items-center justify-center gap-3 text-amber-300 font-medium animate-pulse">
                        <Wand2 size={20} />
                        財神爺思考中...
                    </div>
                )}
                {aiCommentary && (
                    <div className="relative bg-gradient-to-r from-red-900/40 via-purple-900/40 to-red-900/40 p-4 md:p-6 rounded-xl border border-amber-500/20">
                        <p className="text-lg md:text-xl text-amber-100 font-medium leading-relaxed">
                            <span className="text-2xl text-amber-500 mr-2">❝</span>
                            {aiCommentary}
                            <span className="text-2xl text-amber-500 ml-2">❞</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StandbyPhase;
