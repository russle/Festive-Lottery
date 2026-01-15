// 背景音樂設定 Tab
import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, Volume2, Check, Trash2 } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { saveBGMFile, loadBGMFile } from '../../utils/db';
import { useLotteryContext } from '../../contexts/LotteryContext';

export const BGMTab: React.FC = () => {
    const lottery = useLotteryContext();
    const [bgmFileName, setBgmFileName] = useState<string | null>(null);
    const [isBgmPlaying, setIsBgmPlaying] = useState(false);
    const [volume, setVolume] = useState(soundManager.getBGMVolume() * 100);

    // 載入儲存的 BGM
    useEffect(() => {
        const initBGM = async () => {
            const savedFile = await loadBGMFile();
            if (savedFile) {
                soundManager.setBGM(savedFile);
                if (savedFile instanceof File) {
                    setBgmFileName(savedFile.name);
                } else {
                    setBgmFileName('已儲存的音樂');
                }
            }
        };
        initBGM();
    }, []);

    const handleBGMFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            soundManager.setBGM(file);
            setBgmFileName(file.name);
            await saveBGMFile(file);
        }
    };

    const toggleBGM = () => {
        if (isBgmPlaying) {
            soundManager.pauseBGM();
        } else {
            soundManager.playBGM();
        }
        setIsBgmPlaying(!isBgmPlaying);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value);
        setVolume(newVolume);
        soundManager.setBGMVolume(newVolume / 100);
    };

    const handleResetBGM = () => {
        if (window.confirm('確定要清除已上傳的背景音樂嗎？')) {
            lottery.resetBGM();
            setBgmFileName(null);
            setIsBgmPlaying(false);
        }
    };

    return (
        <div className="space-y-8 py-4">
            <div className="bg-black/30 border border-amber-500/20 rounded-2xl p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-amber-500/20">
                    <Music className="text-amber-400 w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-amber-300">背景音樂設定</h3>
                    <p className="text-amber-200/50 text-sm">上傳 MP3 或音訊檔案作為抽獎活動的背景音樂</p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <input
                        type="file"
                        id="bgm-upload"
                        accept="audio/*"
                        className="hidden"
                        onChange={handleBGMFile}
                    />
                    <label
                        htmlFor="bgm-upload"
                        className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl cursor-pointer transition-all shadow-lg hover:shadow-amber-500/20"
                    >
                        選擇音樂檔案
                    </label>
                    {bgmFileName && (
                        <p className="text-green-400 flex items-center gap-2 text-sm">
                            <Check size={14} /> 已載入: {bgmFileName}
                        </p>
                    )}
                </div>
            </div>

            {bgmFileName && (
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleBGM}
                                className="w-12 h-12 bg-amber-500 text-red-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-amber-500/20"
                            >
                                {isBgmPlaying ? <Pause size={24} /> : <Play size={24} />}
                            </button>
                            <div>
                                <h4 className="text-amber-200 font-medium">{bgmFileName}</h4>
                                <p className="text-amber-500/40 text-xs">正在預覽背景音樂</p>
                            </div>
                        </div>
                        <button
                            onClick={handleResetBGM}
                            className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="刪除音樂"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs text-amber-500/60">
                            <span className="flex items-center gap-1"><Volume2 size={12} /> 音量</span>
                            <span>{Math.round(volume)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-full h-1.5 bg-amber-900/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BGMTab;
