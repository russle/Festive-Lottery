// QR Code 集氣階段元件
import React from 'react';
import { QrCode, Users } from 'lucide-react';
import type { Joiner } from '../../types';
import { GoldenText } from '../GoldenText';
import { QR_CONFIG } from '../../constants';

interface JoinPhaseProps {
    joiners: Joiner[];
    participantCount: number;
    onStart: () => void;
}

export const JoinPhase: React.FC<JoinPhaseProps> = ({
    joiners,
    participantCount,
    onStart,
}) => {
    return (
        <div className="text-center w-full max-w-4xl flex flex-col items-center animate-fade-in-up relative">
            {/* 模擬氣泡動畫 */}
            {joiners.map(j => (
                <div
                    key={j.id}
                    className="absolute bottom-0 bg-gradient-to-r from-amber-500 to-yellow-300 text-red-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg pointer-events-none"
                    style={{
                        left: `${j.x}%`,
                        animation: `float-up ${j.animationDuration}s linear forwards`,
                    }}
                >
                    <span className="mr-1">✨</span> {j.name} 加入了集氣！
                </div>
            ))}

            <div className="mb-6">
                <GoldenText text="掃碼集氣・累積好運" size="text-5xl md:text-7xl" />
                <p className="text-amber-300/80 mt-2 text-xl tracking-widest">
                    請拿出手機掃描螢幕上的 QR Code
                </p>
            </div>

            {/* QR Code */}
            <div
                className="relative p-4 bg-white rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.5)] border-4 border-amber-500/50 mb-8"
            >
                <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=${QR_CONFIG.size}x${QR_CONFIG.size}&data=${encodeURIComponent(QR_CONFIG.joinUrl)}&color=581c87&bgcolor=fff`}
                    alt="QR Code"
                    className="w-64 h-64 md:w-80 md:h-80 rounded-lg"
                />
                <div className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-2 border-2 border-amber-400 shadow-lg animate-bounce">
                    <QrCode size={24} />
                </div>
            </div>

            {/* 連線人數 */}
            <div className="flex items-center gap-4 bg-red-950/60 px-8 py-3 rounded-full border border-amber-500/30 mb-8">
                <Users className="text-amber-400" />
                <span className="text-2xl text-white font-bold">目前連線人數：</span>
                <span className="text-4xl text-amber-300 font-mono font-bold">
                    {120 + participantCount}
                </span>
            </div>

            {/* 開始按鈕 */}
            <button
                onClick={onStart}
                className="px-12 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-2xl rounded-full shadow-lg transition-all z-20"
            >
                集氣完成・開始抽獎
            </button>
        </div>
    );
};

export default JoinPhase;
