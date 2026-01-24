import { useState } from 'react';
import { ref, set } from 'firebase/database';
import { db } from './firebase';
import { Play, Square, FastForward, Settings } from 'lucide-react';

const Controller = () => {
    const [status, setStatus] = useState<string>('準備就緒');

    const sendCommand = async (command: string, label: string) => {
        try {
            setStatus(`正在傳送: ${label}...`);
            await set(ref(db, 'lottery_control/command'), command);
            setStatus(`指令已傳送: ${label}`);
            setTimeout(() => setStatus('準備就緒'), 2000);
        } catch (error) {
            console.error('傳送指令失敗:', error);
            setStatus('傳送失敗');
        }
    };

    return (
        <div className="min-h-screen bg-[#1a050a] text-amber-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="mb-12 text-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-100 mb-2">
                    抽獎控制器 (iPad)
                </h1>
                <div className={`text-sm ${status.includes('失敗') ? 'text-red-400' : 'text-amber-400/60'}`}>
                    狀態: {status}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 w-full max-w-md">
                <button
                    onClick={() => sendCommand('START_COUNTDOWN', '開始抽獎')}
                    className="flex items-center justify-center gap-4 py-10 bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] active:scale-95 transition-transform border border-white/10"
                >
                    <Play size={40} fill="currentColor" />
                    <span className="text-2xl font-bold tracking-widest">開始抽獎 / 倒數</span>
                </button>

                <button
                    onClick={() => sendCommand('STOP_ROLLING', '停止滾動')}
                    className="flex items-center justify-center gap-4 py-10 bg-gradient-to-br from-red-600 to-rose-900 rounded-3xl shadow-[0_10px_30px_rgba(244,63,94,0.3)] active:scale-95 transition-transform border border-white/10"
                >
                    <Square size={40} fill="currentColor" />
                    <span className="text-2xl font-bold tracking-widest">停止滾動</span>
                </button>

                <button
                    onClick={() => sendCommand('NEXT_PRIZE', '下一個獎項')}
                    className="flex items-center justify-center gap-4 py-10 bg-gradient-to-br from-amber-500 to-orange-700 rounded-3xl shadow-[0_10px_30px_rgba(245,158,11,0.3)] active:scale-95 transition-transform border border-white/10"
                >
                    <FastForward size={40} fill="currentColor" />
                    <span className="text-2xl font-bold tracking-widest">下一個獎項 / 確認</span>
                </button>
            </div>

            <div className="mt-16 text-amber-500/30 flex items-center gap-2">
                <Settings size={16} className="animate-spin-slow" />
                <span className="text-xs tracking-tighter uppercase font-light">Festive Lottery Remote Control</span>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow { animation: spin-slow 8s linear infinite; }
            `}</style>
        </div>
    );
};

export default Controller;
