// 抽獎邏輯自訂 Hook
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Phase, Employee, Prize, Winner, Joiner, AIConfig } from '../types';
import { lotteryAPI } from '../api/lottery';
import { generatePrizeIntro, generateWinnerComment, setAIConfig } from '../api/ai';
import { DEFAULT_CONFIG } from '../constants';
import {
    savePrizes, loadPrizes,
    saveWinners, loadWinners,
    clearAllData, saveAIConfig, loadAIConfig,
    saveCustomLogo, loadCustomLogo, clearCustomLogo,
    saveEventTitle, loadEventTitle, saveEventSubtitle, loadEventSubtitle,
    saveEmployees, loadEmployees, clearEmployees,
    clearPrizes, clearWinners as storageClearWinners,
} from '../utils/storage';
import { soundManager } from '../utils/sound';
import { loadBGMFile } from '../utils/db';

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
    aiConfig: AIConfig;
    customLogo: string | null;
    eventTitle: string;
    eventSubtitle: string;

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
    updateAIConfig: (config: AIConfig) => void;
    clearStoredData: () => void;
    resetEmployees: () => void;
    resetPrizes: () => void;
    resetWinners: () => void;
    resetBGM: () => void;
    updateCustomLogo: (logoData: string) => void;
    resetCustomLogo: () => void;
    updateEventTitle: (title: string) => void;
    updateEventSubtitle: (subtitle: string) => void;
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
    const [aiConfig, setAIConfigState] = useState<AIConfig>({
        provider: 'gemini',
        geminiKey: '',
        openaiKey: '',
    });
    const [customLogo, setCustomLogo] = useState<string | null>(null);
    const [eventTitle, setEventTitle] = useState(`${DEFAULT_CONFIG.eventYear} ${DEFAULT_CONFIG.eventName}`);
    const [eventSubtitle, setEventSubtitle] = useState('年終聯歡晚會');

    const rollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const currentPrize = prizes[currentPrizeIndex];

    // 初始化載入資料（優先從本地載入）
    useEffect(() => {
        const loadData = async () => {
            // 先嘗試從本地儲存載入
            const storedEmployees = loadEmployees();
            const storedPrizes = loadPrizes();
            const storedWinners = loadWinners();

            if (storedEmployees !== null) {
                setEmployees(storedEmployees);
            } else {
                // 初次使用，預設為空
                setEmployees([]);
            }

            if (storedPrizes !== null) {
                setPrizes(storedPrizes);
            } else {
                setPrizes([]);
            }

            if (storedWinners !== null) {
                setWinners(storedWinners);
            } else {
                setWinners([]);
            }

            // 載入 BGM
            const savedBGM = await loadBGMFile();
            if (savedBGM) {
                soundManager.setBGM(savedBGM);
            }

            // 載入 AI 設定
            const savedAIConfig = loadAIConfig();
            if (savedAIConfig) {
                setAIConfigState(savedAIConfig);
                setAIConfig(savedAIConfig);
            }

            // 載入 Custom Logo
            const savedLogo = loadCustomLogo();
            if (savedLogo) {
                setCustomLogo(savedLogo);
            }

            // 載入標題設定
            const savedTitle = loadEventTitle();
            if (savedTitle) setEventTitle(savedTitle);

            const savedSubtitle = loadEventSubtitle();
            if (savedSubtitle) setEventSubtitle(savedSubtitle);
        };
        loadData();
    }, []);

    // 中獎紀錄變更時自動儲存到本地及雲端
    const lastSyncedCount = useRef(0);
    useEffect(() => {
        if (winners.length > 0) {
            saveWinners(winners);

            // 只同步新增的中獎者到雲端
            const newWinners = winners.slice(lastSyncedCount.current);
            if (newWinners.length > 0) {
                console.log(`[Auto-Sync] Syncing ${newWinners.length} new winner(s) to cloud...`);
                newWinners.forEach(winner => {
                    lotteryAPI.saveWinner(winner).then(res => {
                        if (res.success) {
                            console.log(`[Auto-Sync] Winner ${winner.employee.name} synced successfully`);
                        }
                    });
                });
                lastSyncedCount.current = winners.length;
            }
        } else {
            // 清空時重置計數
            lastSyncedCount.current = 0;
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

    const getCountToDraw = useCallback(() => {
        if (!currentPrize) return 0;
        const prizeWinners = winners.filter(w => w.prizeId === currentPrize.id);
        const remaining = currentPrize.count - prizeWinners.length;
        if (remaining <= 0) return 0;

        const target = currentPrize.countPerRound || (currentPrize.type === 'batch' ? currentPrize.count : 1);
        // 單次抽獎上限限制為 12 人
        return Math.min(target, remaining, 12);
    }, [currentPrize, winners]);

    const startCountdown = useCallback(() => {
        if (phase !== 'standby' && phase !== 'join' && phase !== 'completed') return;

        const eligible = getEligibleEmployees();
        const countToDraw = getCountToDraw();
        if (countToDraw === 0) {
            alert('此獎項已全數抽完！請切換至下一個獎項。');
            return;
        }

        if (eligible.length < countToDraw) {
            alert(`候選人不足！\n目前可抽人數：${eligible.length} 人\n本輪需抽出：${countToDraw} 人\n請檢查是否所有人均已中獎。`);
            console.warn('候選人不足或獎項已抽完！');
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
        const countToDraw = getCountToDraw();
        const newWinners = [...eligible].sort(() => 0.5 - Math.random()).slice(0, countToDraw);

        const winnerRecords: Winner[] = newWinners.map(w => ({
            prizeId: currentPrize.id,
            employee: w,
            timestamp: Date.now(),
        }));

        setWinners(prev => [...prev, ...winnerRecords]);

        if (countToDraw > 1) {
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

        // 檢查當前獎項是否還有剩餘
        const prizeWinners = winners.filter(w => w.prizeId === currentPrize?.id);
        const isCurrentFinished = currentPrize && prizeWinners.length >= currentPrize.count;

        if (!isCurrentFinished) {
            // 還有剩餘，停留在當前獎項進行下一輪
            setPhase('standby');
            return;
        }

        if (currentPrizeIndex < prizes.length - 1) {
            setCurrentPrizeIndex(prev => prev + 1);
            setPhase('standby');
        } else {
            setPhase('wall');
        }
    }, [currentPrizeIndex, prizes.length, winners, currentPrize]);

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
        // 防抖：如果正在載入或已有結果，不重複調用
        if (isAiLoading) return;
        if (aiCommentary && aiCommentary !== '福星高照，財源廣進！') return;
        if (!currentPrize) return;

        setIsAiLoading(true);
        setAiCommentary('');
        try {
            const text = await generatePrizeIntro(currentPrize.name);
            setAiCommentary(text);
        } catch (error: any) {
            console.error('AI Gen Error:', error);
            setAiCommentary('福星高照，財源廣進！');
            alert(`AI 生成失敗：${error.message}`);
        } finally {
            setIsAiLoading(false);
        }
    }, [currentPrize, isAiLoading, aiCommentary]);

    const generateWinnerAI = useCallback(async () => {
        // 防抖：如果正在載入，不重複調用
        if (isAiLoading) return;

        const lastWinner = winners[winners.length - 1];
        if (!lastWinner || !currentPrize) return;

        setIsAiLoading(true);
        setAiCommentary('');
        try {
            const text = await generateWinnerComment(
                lastWinner.employee.name,
                lastWinner.employee.dept,
                currentPrize.name
            );
            setAiCommentary(text);
        } catch (error: any) {
            console.error('AI Gen Error:', error);
            setAiCommentary('福星高照，財源廣進！');
            alert(`AI 生成失敗：${error.message}`);
        } finally {
            setIsAiLoading(false);
        }
    }, [winners, currentPrize, isAiLoading]);

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


    // 清除單項資料
    const resetEmployees = useCallback(() => {
        clearEmployees();
        lotteryAPI.resetEmployees(); // 清除雲端資料
        setEmployees([]);
        setWinners([]);
        saveWinners([]);
        lastSyncedCount.current = 0;
    }, []);

    const resetPrizes = useCallback(() => {
        clearPrizes();
        lotteryAPI.resetPrizes(); // 清除雲端資料
        setPrizes([]);
        setWinners([]);
        saveWinners([]);
        lastSyncedCount.current = 0;
    }, []);

    const resetWinnersData = useCallback(() => {
        storageClearWinners();
        lotteryAPI.resetWinners();
        lastSyncedCount.current = 0;
        setWinners([]);
    }, []);

    const resetBGM = useCallback(() => {
        // 因 BGM 是在 IndexedDB，需要調用 db.ts 的清除
        import('../utils/db').then(({ clearBGM }) => {
            clearBGM();
        });
    }, []);

    const updateCustomLogo = useCallback((logoData: string) => {
        setCustomLogo(logoData);
        saveCustomLogo(logoData);
    }, []);

    const resetCustomLogo = useCallback(() => {
        setCustomLogo(null);
        clearCustomLogo();
    }, []);

    const updateEventTitle = useCallback((title: string) => {
        setEventTitle(title);
        saveEventTitle(title);
    }, []);

    const updateEventSubtitle = useCallback((subtitle: string) => {
        setEventSubtitle(subtitle);
        saveEventSubtitle(subtitle);
    }, []);

    // 清除所有儲存的資料 (重置為空狀態)
    const clearStoredData = useCallback(() => {
        clearAllData();
        // 清除雲端中獎紀錄
        lotteryAPI.resetWinners();
        // 重置同步計數
        lastSyncedCount.current = 0;

        // 全部設為空，不再載入 mock
        setEmployees([]);
        setPrizes([]);
        setWinners([]);

        setCurrentPrizeIndex(0);
        setPhase('standby');
        console.log('[Reset] All data cleared (local + cloud)');
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
        aiConfig,
        customLogo,
        eventTitle,
        eventSubtitle,
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
        resetEmployees,
        resetPrizes,
        resetWinners: resetWinnersData,
        resetBGM,
        updateCustomLogo,
        resetCustomLogo,
        updateEventTitle,
        updateEventSubtitle,
        updateAIConfig: (config: AIConfig) => {
            setAIConfigState(config);
            saveAIConfig(config);
            setAIConfig(config);
        },
        clearStoredData,
    };
};

export default useLottery;
