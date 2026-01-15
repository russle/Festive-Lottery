import { useState, useRef, useCallback, useEffect } from 'react';
import type { Phase, Employee, Winner, Joiner } from '../types';
import { DEFAULT_CONFIG } from '../constants';
import { soundManager } from '../utils/sound';

export const useRollingLogic = (
    employees: Employee[],
    countdownDuration: number,
    getEligibleEmployees: () => Employee[],
    getCountToDraw: () => number,
    onDraw: (winners: Winner[]) => void,
    onClearAI: () => void
) => {
    const [phase, setPhase] = useState<Phase>('standby');
    const [countdown, setCountdown] = useState(DEFAULT_CONFIG.countdownSeconds);
    const [currentRollingName, setCurrentRollingName] = useState('準備好運');
    const [batchRevealedCount, setBatchRevealedCount] = useState(0);
    const [currentBatchWinners, setCurrentBatchWinners] = useState<Winner[]>([]);
    const [participantCount, setParticipantCount] = useState(0);
    const [joiners, setJoiners] = useState<Joiner[]>([]);

    const rollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Join Phase Animation
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (phase === 'join' && employees.length > 0) {
            interval = setInterval(() => {
                const randomEmp = employees[Math.floor(Math.random() * employees.length)];
                const newJoiner: Joiner = {
                    id: Date.now().toString() + Math.random(),
                    name: randomEmp.name,
                    x: Math.random() * 80 + 10,
                    animationDuration: Math.random() * 3 + 2,
                };
                setJoiners(prev => [...prev.slice(-15), newJoiner]);
                setParticipantCount(prev => prev + 1);
                soundManager.play('join');
            }, 400);
        }
        return () => clearInterval(interval);
    }, [phase, employees]);

    // Batch Reveal Auto-progression
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (phase === 'batch_reveal' && batchRevealedCount < currentBatchWinners.length) {
            timer = setTimeout(() => {
                setBatchRevealedCount(prev => prev + 1);
            }, DEFAULT_CONFIG.batchRevealDelayMs);
        }
        return () => clearTimeout(timer);
    }, [phase, batchRevealedCount, currentBatchWinners]);

    const startRollingInternal = useCallback(() => {
        soundManager.stop('countdown');
        soundManager.play('rolling', true);
        setPhase('rolling');
    }, []);

    const startCountdown = useCallback(() => {
        if (phase !== 'standby' && phase !== 'join' && phase !== 'completed') return;

        const countToDraw = getCountToDraw();
        if (countToDraw === 0) {
            alert('此獎項已全數抽完！請切換至下一個獎項。');
            return;
        }

        const eligible = getEligibleEmployees();
        if (eligible.length < countToDraw) {
            alert(`候選人不足！\n目前可抽人數：${eligible.length} 人\n本輪需抽出：${countToDraw} 人\n請檢查是否所有人均已中獎。`);
            soundManager.stop('rolling');
            return;
        }

        setPhase('countdown');
        setCountdown(countdownDuration);
        onClearAI();
        soundManager.play('click');
        soundManager.play('countdown', true);

        let count = countdownDuration;
        const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(timer);
                startRollingInternal();
            }
        }, 1000);
    }, [phase, getEligibleEmployees, getCountToDraw, onClearAI, countdownDuration, startRollingInternal]);

    const startRolling = useCallback(() => {
        const eligible = getEligibleEmployees();
        if (rollingIntervalRef.current) clearInterval(rollingIntervalRef.current);

        rollingIntervalRef.current = setInterval(() => {
            const randomEmp = eligible[Math.floor(Math.random() * eligible.length)];
            if (randomEmp) {
                setCurrentRollingName(`${randomEmp.dept} ✦ ${randomEmp.name}`);
            }
        }, DEFAULT_CONFIG.rollingIntervalMs);
    }, [getEligibleEmployees]);

    const stopRolling = useCallback((currentPrizeId: number) => {
        if (phase !== 'rolling') return;
        soundManager.stop('rolling');
        soundManager.play('win');
        if (rollingIntervalRef.current) clearInterval(rollingIntervalRef.current);

        const eligible = getEligibleEmployees();
        const countToDraw = getCountToDraw();
        const winners = [...eligible].sort(() => 0.5 - Math.random()).slice(0, countToDraw);

        const winnerRecords: Winner[] = winners.map(w => ({
            prizeId: currentPrizeId,
            employee: w,
            timestamp: Date.now(),
        }));

        onDraw(winnerRecords);

        if (countToDraw > 1) {
            setCurrentBatchWinners(winnerRecords);
            setBatchRevealedCount(0);
            setPhase('batch_reveal');
        } else {
            setCurrentRollingName(winners[0]?.name || '');
            setPhase('reveal');
        }
    }, [phase, getEligibleEmployees, getCountToDraw, onDraw]);

    return {
        phase,
        setPhase,
        countdown,
        currentRollingName,
        setCurrentRollingName,
        batchRevealedCount,
        setBatchRevealedCount,
        currentBatchWinners,
        participantCount,
        setParticipantCount,
        joiners,
        setJoiners,
        startCountdown,
        startRolling,
        stopRolling,
        rollingIntervalRef
    };
};
