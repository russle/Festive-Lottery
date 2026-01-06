// 音效工具
import { SOUND_ASSETS } from '../constants';

type SoundType = keyof typeof SOUND_ASSETS;

class SoundManager {
    private audios: Partial<Record<SoundType, HTMLAudioElement>> = {};
    private enabled: boolean = true;

    constructor() {
        // 預加載音效
        if (typeof window !== 'undefined') {
            Object.entries(SOUND_ASSETS).forEach(([key, url]) => {
                const audio = new Audio(url);
                audio.preload = 'auto';
                this.audios[key as SoundType] = audio;
            });
        }
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopAll();
        }
    }

    play(type: SoundType, loop: boolean = false) {
        if (!this.enabled) return;

        const audio = this.audios[type];
        if (audio) {
            audio.currentTime = 0;
            audio.loop = loop;
            audio.play().catch(err => console.warn('Audio play failed:', err));
        }
    }

    stop(type: SoundType) {
        const audio = this.audios[type];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    stopAll() {
        Object.values(this.audios).forEach(audio => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }
}

export const soundManager = new SoundManager();
