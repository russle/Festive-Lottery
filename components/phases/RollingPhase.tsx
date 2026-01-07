// 滾動抽選階段元件
import React from 'react';
import { Gem } from 'lucide-react';

interface RollingPhaseProps {
    rollingName: string;
    onStop: () => void;
}

export const RollingPhase: React.FC<RollingPhaseProps> = ({ rollingName, onStop }) => {
    return (
        <div className="w-full max-w-5xl text-center">
            <div className="mb-8 flex justify-center gap-3 text-amber-400 font-bold tracking-[0.3em] animate-pulse items-center">
                <Gem size={20} />
                尋找幸運之星
                <Gem size={20} />
            </div>

            <div className="relative bg-red-950/60 border-y-4 border-amber-500/50 backdrop-blur-md p-16 overflow-hidden rounded-2xl shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-amber-500/10 to-transparent" />
                <div className={`relative font-black text-white tracking-tight drop-shadow-md whitespace-nowrap ${rollingName.length > 3 ? 'text-5xl md:text-7xl' : 'text-7xl md:text-9xl'}`}>
                    {rollingName}
                </div>
            </div>

            <div className="mt-12">
                <button
                    onClick={onStop}
                    className="px-16 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-red-900 font-black text-2xl rounded-full shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all transform hover:scale-105"
                >
                    開 獎
                </button>
            </div>
        </div>
    );
};

export default RollingPhase;
