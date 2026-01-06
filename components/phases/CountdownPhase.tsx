// 倒數階段元件
import React from 'react';

interface CountdownPhaseProps {
    countdown: number;
}

export const CountdownPhase: React.FC<CountdownPhaseProps> = ({ countdown }) => {
    return (
        <div className="relative flex items-center justify-center">
            <div className="absolute w-[450px] h-[450px] border-[3px] border-amber-500/30 rounded-full animate-ping [animation-duration:1.5s]" />
            <div className="absolute w-[350px] h-[350px] border-[2px] border-red-500/50 rounded-full animate-ping [animation-duration:1s]" />
            <div
                key={countdown}
                className="text-[250px] font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-scale-in"
            >
                {countdown}
            </div>
        </div>
    );
};

export default CountdownPhase;
