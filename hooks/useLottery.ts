import { useState, useEffect, useCallback } from 'react';
import type { Phase, Employee, Prize, Winner, Joiner, AIConfig } from '../types';
import { lotteryAPI } from '../api/lottery';
import {
    loadEmployees, saveEmployees, clearEmployees,
    saveWinners,
    loadCountdownDuration, saveCountdownDuration,
    clearAllData,
} from '../utils/storage';
import { soundManager } from '../utils/sound';
import { loadBGMFile, clearBGM } from '../utils/db';

// 引入拆分後的子 Hooks
import { useEventBranding, UseEventBrandingReturn } from './useEventBranding';
import { useAICommentary, UseAICommentaryReturn } from './useAICommentary';
import { usePrizeManager } from './usePrizeManager';
import { useRollingLogic } from './useRollingLogic';
import { useCloudSync } from './useCloudSync';

export interface UseLotteryReturn extends UseEventBrandingReturn, Omit<UseAICommentaryReturn, 'generatePrizeAI' | 'generateWinnerAI' | 'clearCommentary'> {
    // State
    phase: Phase;
    employees: Employee[];
    prizes: Prize[];
    winners: Winner[];
    currentPrizeIndex: number;
    currentPrize: Prize | undefined;
    currentRollingName: string;
    countdown: number;
    batchRevealedCount: number;
    currentBatchWinners: Winner[];
    participantCount: number;
    joiners: Joiner[];
    soundEnabled: boolean;
    bgmEnabled: boolean;
    aiConfig: AIConfig;
    countdownDuration: number;

    // Actions
    setPhase: (phase: Phase) => void;
    setSoundEnabled: (enabled: boolean) => void;
    setBGMEnabled: (enabled: boolean) => void;
    startCountdown: () => void;
    startRolling: () => void;
    stopRolling: () => void;
    nextPrize: () => void;
    previousPrize: () => void;
    resetAll: () => void;
    resetCurrentPrize: () => void;
    generatePrizeAI: () => void;
    generateWinnerAI: () => void;

    // 動態資料更新
    updateEmployees: (employees: Employee[]) => void;
    updatePrizes: (prizes: Prize[]) => void;
    clearStoredData: () => void;
    updateAIConfig: (config: AIConfig) => void;
    setCountdownDuration: (seconds: number) => void;
    resetEmployees: () => void;
    resetPrizes: () => void;
    resetWinners: () => void;
    resetBGM: () => void;
}

export const useLottery = (options: { enableRemote?: boolean } = {}): UseLotteryReturn => {
    const { enableRemote = true } = options;

    // ========================================================================
    // Sub-hooks (組合模式)
    // ========================================================================
    const branding = useEventBranding();
    const ai = useAICommentary();
    const prizeManager = usePrizeManager();

    // Employees state remains in main hook for shared access
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [bgmEnabled, setBGMEnabledState] = useState(true);
    const [countdownDuration, setCountdownDurationState] = useState(loadCountdownDuration());

    // 輔助邏輯
    const getEligibleEmployees = useCallback(() => {
        const winnerIds = new Set(prizeManager.winners.map(w => w.employee.id));
        return employees.filter(e => !winnerIds.has(e.id));
    }, [prizeManager.winners, employees]);

    const getCountToDraw = useCallback(() => {
        if (!prizeManager.currentPrize) return 0;
        const prizeWinners = prizeManager.winners.filter(w => w.prizeId === prizeManager.currentPrize!.id);
        const remaining = prizeManager.currentPrize!.count - prizeWinners.length;
        if (remaining <= 0) return 0;

        const target = prizeManager.currentPrize!.countPerRound || (prizeManager.currentPrize!.type === 'batch' ? prizeManager.currentPrize!.count : 1);
        return Math.min(target, remaining, 10);
    }, [prizeManager.currentPrize, prizeManager.winners]);

    const rolling = useRollingLogic(
        employees,
        countdownDuration,
        getEligibleEmployees,
        getCountToDraw,
        (records: Winner[]) => prizeManager.setWinners(prev => [...prev, ...records]),
        () => ai.clearCommentary()
    );

    useCloudSync(prizeManager.winners);

    // ========================================================================
    // Initialization
    // ========================================================================
    useEffect(() => {
        const loadInitialData = async () => {
            const storedEmployees = loadEmployees();
            setEmployees(storedEmployees ?? []);

            const savedBGM = await loadBGMFile();
            if (savedBGM) soundManager.setBGM(savedBGM);
        };
        loadInitialData();
    }, []);

    // 切換獎項時清空 AI 評語
    useEffect(() => {
        ai.clearCommentary();
    }, [prizeManager.currentPrizeIndex, ai]);

    // ========================================================================
    // Actions Wrapper
    // ========================================================================
    const updateEmployees = useCallback((newEmployees: Employee[]) => {
        setEmployees(newEmployees);
        saveEmployees(newEmployees);
        prizeManager.setWinners([]);
        prizeManager.setCurrentPrizeIndex(0);
        rolling.setPhase('standby');
    }, [prizeManager, rolling]);

    const setCountdownDuration = useCallback((seconds: number) => {
        setCountdownDurationState(seconds);
        saveCountdownDuration(seconds);
    }, []);

    const resetEmployees = useCallback(() => {
        clearEmployees();
        lotteryAPI.resetEmployees();
        setEmployees([]);
        prizeManager.setWinners([]);
        saveWinners([]);
    }, [prizeManager]);

    const clearStoredData = useCallback(() => {
        clearAllData();
        lotteryAPI.resetWinners();
        setEmployees([]);
        prizeManager.setPrizes([]);
        prizeManager.setWinners([]);
        prizeManager.setCurrentPrizeIndex(0);
        rolling.setPhase('standby');
        console.log('[Reset] All data cleared (local + cloud)');
    }, [prizeManager, rolling]);

    // ========================================================================
    // Keyboard Remote Control
    // ========================================================================
    useEffect(() => {
        if (!enableRemote) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

            const isNextAction = [
                'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp',
                'ArrowRight', 'ArrowLeft', 'Enter', ' '
            ].includes(e.key);

            if (isNextAction) {
                e.preventDefault();
                switch (rolling.phase) {
                    case 'standby': case 'join': case 'completed':
                        rolling.startCountdown();
                        break;
                    case 'rolling':
                        rolling.stopRolling(prizeManager.currentPrize?.id ?? 0);
                        break;
                    case 'reveal': case 'batch_reveal':
                        prizeManager.nextPrize(rolling.phase, rolling.setPhase);
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enableRemote, rolling, prizeManager]);

    // ========================================================================
    // Return Object
    // ========================================================================
    return {
        ...prizeManager,
        ...rolling,
        ...branding,
        employees,
        soundEnabled,
        bgmEnabled,
        countdownDuration,
        aiConfig: ai.aiConfig,
        aiCommentary: ai.aiCommentary,
        isAiLoading: ai.isAiLoading,
        updateAIConfig: ai.updateAIConfig,

        setPhase: rolling.setPhase,
        setSoundEnabled: (enabled: boolean) => {
            setSoundEnabled(enabled);
            soundManager.setEnabled(enabled);
        },
        setBGMEnabled: (enabled: boolean) => {
            setBGMEnabledState(enabled);
            soundManager.setBGMEnabled(enabled);
        },
        startRolling: rolling.startRolling,
        stopRolling: () => rolling.stopRolling(prizeManager.currentPrize?.id ?? 0),
        resetAll: () => {
            prizeManager.resetWinnersData();
            rolling.setPhase('standby');
            ai.clearCommentary();
        },
        resetCurrentPrize: () => prizeManager.resetCurrentPrize(rolling.setPhase),
        nextPrize: () => prizeManager.nextPrize(rolling.phase, rolling.setPhase),
        previousPrize: () => prizeManager.previousPrize(rolling.setPhase),
        generatePrizeAI: () => ai.generatePrizeAI(prizeManager.currentPrize),
        generateWinnerAI: () => ai.generateWinnerAI(prizeManager.winners[prizeManager.winners.length - 1], prizeManager.currentPrize),
        updateEmployees,
        updatePrizes: prizeManager.updatePrizes,
        resetEmployees,
        resetPrizes: prizeManager.resetPrizes,
        resetWinners: prizeManager.resetWinnersData,
        resetBGM: clearBGM,
        clearStoredData,
        setCountdownDuration,
    };
};

export default useLottery;
