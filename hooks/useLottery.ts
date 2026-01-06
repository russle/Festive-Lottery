// 抽獎邏輯自訂 Hook
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Phase, Employee, Prize, Winner, Joiner } from '../types';
import { lotteryAPI } from '../api/lottery';
import { generatePrizeIntro, generateWinnerComment } from '../api/gemini';
import { DEFAULT_CONFIG } from '../constants';
import {
    saveEmployees, loadEmployees,
    savePrizes, loadPrizes,
    saveWinners, loadWinners,
    clearAllData
} from '../utils/storage';
import { soundManager } from '../utils/sound';

export interface UseLotteryReturn {
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
    currentBatchWinners: Employee[];
    participantCount: number;
    joiners: Joiner[];
    aiCommentary: string;
    isAiLoading: boolean;
    soundEnabled: boolean;

    // Actions
    setPhase: (phase: Phase) => void;
    setSoundEnabled: (enabled: boolean) => void;
    startCountdown: () => void;
    startRolling: () => void;
    stopRolling: () => void;
    nextPrize: () => void;
    resetAll: () => void;
    resetCurrentPrize: () => void;
    generatePrizeAI: () => void;
    generateWinnerAI: () => void;

    // 動態資料更新
    updateEmployees: (employees: Employee[]) => void;
    updatePrizes: (prizes: Prize[]) => void;
    clearStoredData: () => void;
}

export const useLottery = (): UseLotteryReturn => {
    const [phase, setPhase] = useState<Phase>('standby');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [prizes, setPrizes] = useState<Prize[]>([]);
    const [winners, setWinners] = useState<Winner[]>([]);
    const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
    const [currentRollingName, setCurrentRollingName] = useState('準備好運');
    const [countdown, setCountdown] = useState(DEFAULT_CONFIG.countdownSeconds);
    const [batchRevealedCount, setBatchRevealedCount] = useState(0);
    const [currentBatchWinners, setCurrentBatchWinners] = useState<Employee[]>([]);
    const [participantCount, setParticipantCount] = useState(0);
    const [joiners, setJoiners] = useState<Joiner[]>([]);
    const [aiCommentary, setAiCommentary] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const rollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const currentPrize = prizes[currentPrizeIndex];

    // 初始化載入資料（優先從本地載入）
    useEffect(() => {
        const loadData = async () => {
            // 先嘗試從本地儲存載入
            const storedEmployees = loadEmployees();
            const storedPrizes = loadPrizes();
            const storedWinners = loadWinners();

            if (storedEmployees && storedEmployees.length > 0) {
                setEmployees(storedEmployees);
            } else {
                // 從 API 載入預設資料
                const empRes = await lotteryAPI.getEmployees();
                if (empRes.success && empRes.data) setEmployees(empRes.data);
            }

            if (storedPrizes && storedPrizes.length > 0) {
                setPrizes(storedPrizes);
            } else {
                const prizeRes = await lotteryAPI.getPrizes();
                if (prizeRes.success && prizeRes.data) setPrizes(prizeRes.data);
            }

            if (storedWinners && storedWinners.length > 0) {
                setWinners(storedWinners);
            }
        };
        loadData();
    }, []);

    // 中獎紀錄變更時自動儲存
    useEffect(() => {
        if (winners.length > 0) {
            saveWinners(winners);
        }
    }, [winners]);

    // 切換獎項時清空 AI 評語
    useEffect(() => {
        setAiCommentary('');
    }, [currentPrizeIndex]);

    // Join 模式模擬加入者
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

    // 批量揭曉自動遞進
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (phase === 'batch_reveal' && batchRevealedCount < currentBatchWinners.length) {
            timer = setTimeout(() => {
                setBatchRevealedCount(prev => prev + 1);
            }, DEFAULT_CONFIG.batchRevealDelayMs);
        }
        return () => clearTimeout(timer);
    }, [phase, batchRevealedCount, currentBatchWinners]);

    const getEligibleEmployees = useCallback(() => {
        const winnerIds = new Set(winners.map(w => w.employee.id));
        return employees.filter(e => !winnerIds.has(e.id));
    }, [winners, employees]);

    const startCountdown = useCallback(() => {
        if (phase !== 'standby' && phase !== 'join' && phase !== 'completed') return;

        const eligible = getEligibleEmployees();
        if (eligible.length < (currentPrize?.count || 1)) {
            console.warn('候選人不足！');
            return;
        }

        setPhase('countdown');
        setCountdown(DEFAULT_CONFIG.countdownSeconds);
        setAiCommentary('');
        soundManager.play('click');
        soundManager.play('countdown', true); // 循環播放倒數音效

        let count = DEFAULT_CONFIG.countdownSeconds;
        const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(timer);
                startRollingInternal();
            }
        }, 1000);
    }, [phase, currentPrize, getEligibleEmployees]);

    const startRollingInternal = () => {
        soundManager.stop('countdown');
        soundManager.play('rolling', true);
        setPhase('rolling');
    };

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

    // 當進入 rolling 階段時啟動滾動
    useEffect(() => {
        if (phase === 'rolling') {
            startRolling();
        }
        return () => {
            if (rollingIntervalRef.current) {
                clearInterval(rollingIntervalRef.current);
            }
        };
    }, [phase, startRolling]);

    const stopRolling = useCallback(() => {
        if (phase !== 'rolling' || !currentPrize) return;
        soundManager.stop('rolling');
        soundManager.play('win');
        if (rollingIntervalRef.current) clearInterval(rollingIntervalRef.current);

        const eligible = getEligibleEmployees();
        const countToDraw = currentPrize.type === 'batch' ? currentPrize.count : 1;
        const newWinners = [...eligible].sort(() => 0.5 - Math.random()).slice(0, countToDraw);

        const winnerRecords: Winner[] = newWinners.map(w => ({
            prizeId: currentPrize.id,
            employee: w,
            timestamp: Date.now(),
        }));

        setWinners(prev => [...prev, ...winnerRecords]);

        if (currentPrize.type === 'batch') {
            setCurrentBatchWinners(newWinners);
            setBatchRevealedCount(0);
            setPhase('batch_reveal');
        } else {
            setCurrentRollingName(newWinners[0]?.name || '');
            setPhase('reveal');
        }
    }, [phase, currentPrize, getEligibleEmployees]);

    const nextPrize = useCallback(() => {
        soundManager.play('click');
        if (currentPrizeIndex < prizes.length - 1) {
            setCurrentPrizeIndex(prev => prev + 1);
            setPhase('standby');
        } else {
            setPhase('wall');
        }
    }, [currentPrizeIndex, prizes.length]);

    const resetAll = useCallback(() => {
        setCurrentPrizeIndex(0);
        setWinners([]);
        setPhase('standby');
        setAiCommentary('');
        setParticipantCount(0);
        setJoiners([]);
        saveWinners([]); // 清空儲存的中獎紀錄
    }, []);

    const resetCurrentPrize = useCallback(() => {
        if (!currentPrize) return;
        setWinners(prev => prev.filter(w => w.prizeId !== currentPrize.id));
        setPhase('standby');
    }, [currentPrize]);

    const generatePrizeAI = useCallback(async () => {
        if (!currentPrize) return;
        setIsAiLoading(true);
        setAiCommentary('');
        const text = await generatePrizeIntro(currentPrize.name);
        setAiCommentary(text);
        setIsAiLoading(false);
    }, [currentPrize]);

    const generateWinnerAI = useCallback(async () => {
        const lastWinner = winners[winners.length - 1];
        if (!lastWinner || !currentPrize) return;
        setIsAiLoading(true);
        setAiCommentary('');
        const text = await generateWinnerComment(
            lastWinner.employee.name,
            lastWinner.employee.dept,
            currentPrize.name
        );
        setAiCommentary(text);
        setIsAiLoading(false);
    }, [winners, currentPrize]);

    // 動態更新員工資料
    const updateEmployees = useCallback((newEmployees: Employee[]) => {
        setEmployees(newEmployees);
        saveEmployees(newEmployees);
        // 重置相關狀態
        setWinners([]);
        setCurrentPrizeIndex(0);
        setPhase('standby');
    }, []);

    // 動態更新獎品資料
    const updatePrizes = useCallback((newPrizes: Prize[]) => {
        setPrizes(newPrizes);
        savePrizes(newPrizes);
        // 重置相關狀態
        setWinners([]);
        setCurrentPrizeIndex(0);
        setPhase('standby');
    }, []);

    // 清除所有儲存的資料
    const clearStoredData = useCallback(() => {
        clearAllData();
        // 重新載入預設資料
        lotteryAPI.getEmployees().then(res => {
            if (res.success && res.data) setEmployees(res.data);
        });
        lotteryAPI.getPrizes().then(res => {
            if (res.success && res.data) setPrizes(res.data);
        });
        setWinners([]);
        setCurrentPrizeIndex(0);
        setPhase('standby');
    }, []);

    return {
        phase,
        employees,
        prizes,
        winners,
        currentPrizeIndex,
        currentPrize,
        currentRollingName,
        countdown,
        batchRevealedCount,
        currentBatchWinners,
        participantCount,
        joiners,
        aiCommentary,
        isAiLoading,
        soundEnabled,
        setPhase,
        setSoundEnabled: (enabled: boolean) => {
            setSoundEnabled(enabled);
            soundManager.setEnabled(enabled);
        },
        startCountdown,
        startRolling,
        stopRolling,
        nextPrize,
        resetAll,
        resetCurrentPrize,
        generatePrizeAI,
        generateWinnerAI,
        updateEmployees,
        updatePrizes,
        clearStoredData,
    };
};

export default useLottery;
