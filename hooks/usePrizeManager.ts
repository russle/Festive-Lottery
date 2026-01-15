import { useState, useCallback, useMemo } from 'react';
import type { Prize, Winner } from '../types';
import {
    loadPrizes, savePrizes, clearPrizes,
    loadWinners, saveWinners, clearWinners as storageClearWinners
} from '../utils/storage';
import { lotteryAPI } from '../api/lottery';
import { soundManager } from '../utils/sound';

export const usePrizeManager = () => {
    const [prizes, setPrizes] = useState<Prize[]>(() => loadPrizes() ?? []);
    const [winners, setWinners] = useState<Winner[]>(() => loadWinners() ?? []);
    const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);

    const currentPrize = useMemo(() => prizes[currentPrizeIndex], [prizes, currentPrizeIndex]);

    const nextPrize = useCallback((_phase: string, setPhase: (p: any) => void) => {
        soundManager.play('click');
        const prizeWinners = winners.filter(w => w.prizeId === currentPrize?.id);
        const isCurrentFinished = currentPrize && prizeWinners.length >= currentPrize.count;

        if (!isCurrentFinished) {
            setPhase('standby');
            return;
        }

        if (currentPrizeIndex < prizes.length - 1) {
            setCurrentPrizeIndex(prev => prev + 1);
            setPhase('standby');
        } else {
            setPhase('wall');
        }
    }, [currentPrize, currentPrizeIndex, prizes.length, winners]);

    const previousPrize = useCallback((setPhase: (p: any) => void) => {
        soundManager.play('click');
        if (currentPrizeIndex > 0) {
            setCurrentPrizeIndex(prev => prev - 1);
            setPhase('standby');
        }
    }, [currentPrizeIndex]);

    const resetCurrentPrize = useCallback((setPhase: (p: any) => void) => {
        if (!currentPrize) return;
        setWinners(prev => prev.filter(w => w.prizeId !== currentPrize.id));
        setPhase('standby');
    }, [currentPrize]);

    const updatePrizes = useCallback((newPrizes: Prize[]) => {
        setPrizes(newPrizes);
        savePrizes(newPrizes);
    }, []);

    const resetPrizes = useCallback(() => {
        clearPrizes();
        lotteryAPI.resetPrizes();
        setPrizes([]);
        setWinners([]);
        saveWinners([]);
    }, []);

    const resetWinnersData = useCallback(() => {
        storageClearWinners();
        lotteryAPI.resetWinners();
        setWinners([]);
    }, []);

    return {
        prizes,
        setPrizes,
        winners,
        setWinners,
        currentPrizeIndex,
        setCurrentPrizeIndex,
        currentPrize,
        nextPrize,
        previousPrize,
        resetCurrentPrize,
        updatePrizes,
        resetPrizes,
        resetWinnersData
    };
};
