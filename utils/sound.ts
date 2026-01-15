// 音效工具
import { SOUND_ASSETS } from '../constants';

type SoundType = keyof typeof SOUND_ASSETS;

class SoundManager {
    private audios: Partial<Record<SoundType, HTMLAudioElement>> = {};
    private bgm: HTMLAudioElement | null = null;
    private enabled: boolean = true;
    private bgmEnabled: boolean = true;
    private bgmVolume: number = 0.5;

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

    setBGMEnabled(enabled: boolean) {
        this.bgmEnabled = enabled;
        if (!enabled) {
            this.pauseBGM();
        } else if (this.bgm) {
            this.playBGM();
        }
    }

    getBGMEnabled() {
        return this.bgmEnabled;
    }

    /** 背景音樂控制 */
    setBGM(source: string | File | Blob) {
        let wasPlaying = false;
        let currentTime = 0;

        if (this.bgm) {
            wasPlaying = !this.bgm.paused;
            currentTime = this.bgm.currentTime;
            this.bgm.pause();
            this.bgm = null;
        }

        const url = typeof source === 'string' ? source : URL.createObjectURL(source);
        this.bgm = new Audio(url);
        this.bgm.loop = true;
        this.bgm.volume = this.bgmVolume;

        // 如果之前在播放，恢復播放
        if (wasPlaying && this.bgmEnabled) {
            this.bgm.currentTime = currentTime;
            this.playBGM();
        }
    }

    playBGM() {
        if (!this.bgmEnabled || !this.bgm) return;
        this.bgm.play().catch(err => console.warn('BGM play failed:', err));
    }

    pauseBGM() {
        if (this.bgm) this.bgm.pause();
    }

    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
    }

    setBGMVolume(volume: number) {
        this.bgmVolume = volume;
        if (this.bgm) this.bgm.volume = volume;
    }

    getBGMVolume() {
        return this.bgmVolume;
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
