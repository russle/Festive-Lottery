// 抽獎邏輯自訂 Hook (重構後 - 使用組合模式)
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Phase, Employee, Prize, Winner, Joiner } from '../types';
import { lotteryAPI } from '../api/lottery';
import { DEFAULT_CONFIG } from '../constants';
import {
    savePrizes, loadPrizes,
    saveWinners, loadWinners,
    clearAllData,
    saveEmployees, loadEmployees, clearEmployees,
    clearPrizes, clearWinners as storageClearWinners,
} from '../utils/storage';
import { soundManager } from '../utils/sound';
import { loadBGMFile } from '../utils/db';

// 引入拆分後的子 Hooks
import { useEventBranding, UseEventBrandingReturn } from './useEventBranding';
import { useAICommentary, UseAICommentaryReturn } from './useAICommentary';

// ============================================================================
// Types
// ============================================================================

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
    currentBatchWinners: Employee[];
    participantCount: number;
    joiners: Joiner[];
    soundEnabled: boolean;
    bgmEnabled: boolean;

    // Actions
    setPhase: (phase: Phase) => void;
    setSoundEnabled: (enabled: boolean) => void;
    setBGMEnabled: (enabled: boolean) => void;
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
    resetEmployees: () => void;
    resetPrizes: () => void;
    resetWinners: () => void;
    resetBGM: () => void;
}

// ============================================================================
// Main Hook
// ============================================================================

export const useLottery = (options: { enableRemote?: boolean } = {}): UseLotteryReturn => {
    const { enableRemote = true } = options;
    // ========================================================================
    // Sub-hooks (組合模式)
    // ========================================================================
    const branding = useEventBranding();
    const ai = useAICommentary();

    // ========================================================================
    // Core Lottery State
    // ========================================================================
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
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [bgmEnabled, setBGMEnabledState] = useState(true);

    const rollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastSyncedCount = useRef(0);

    const currentPrize = prizes[currentPrizeIndex];

    // ========================================================================
    // Data Loading (初始化)
    // ========================================================================
    useEffect(() => {
        const loadData = async () => {
            const storedEmployees = loadEmployees();
            const storedPrizes = loadPrizes();
            const storedWinners = loadWinners();

            setEmployees(storedEmployees ?? []);
            setPrizes(storedPrizes ?? []);
            setWinners(storedWinners ?? []);

            const savedBGM = await loadBGMFile();
            if (savedBGM) soundManager.setBGM(savedBGM);
        };
        loadData();
    }, []);

    // ========================================================================
    // Auto-sync Winners to Cloud
    // ========================================================================
    useEffect(() => {
        if (winners.length > 0) {
            saveWinners(winners);

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
            lastSyncedCount.current = 0;
        }
    }, [winners]);

    // 切換獎項時清空 AI 評語
    useEffect(() => {
        ai.clearCommentary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPrizeIndex]);

    // ========================================================================
    // Join Phase Animation
    // ========================================================================
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

    // ========================================================================
    // Batch Reveal Auto-progression
    // ========================================================================
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (phase === 'batch_reveal' && batchRevealedCount < currentBatchWinners.length) {
            timer = setTimeout(() => {
                setBatchRevealedCount(prev => prev + 1);
            }, DEFAULT_CONFIG.batchRevealDelayMs);
        }
        return () => clearTimeout(timer);
    }, [phase, batchRevealedCount, currentBatchWinners]);

    // ========================================================================
    // Core Lottery Logic
    // ========================================================================
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
        return Math.min(target, remaining, 10);
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
            return;
        }

        setPhase('countdown');
        setCountdown(DEFAULT_CONFIG.countdownSeconds);
        ai.clearCommentary();
        soundManager.play('click');
        soundManager.play('countdown', true);

        let count = DEFAULT_CONFIG.countdownSeconds;
        const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(timer);
                startRollingInternal();
            }
        }, 1000);
    }, [phase, getEligibleEmployees, getCountToDraw, ai]);

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
    }, [phase, currentPrize, getEligibleEmployees, getCountToDraw]);

    const nextPrize = useCallback(() => {
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
    }, [currentPrizeIndex, prizes.length, winners, currentPrize]);

    // ========================================================================
    // Reset Functions
    // ========================================================================
    const resetAll = useCallback(() => {
        soundManager.play('click');
        setCurrentPrizeIndex(0);
        setWinners([]);
        setPhase('standby');
        ai.clearCommentary();
        setParticipantCount(0);
        setJoiners([]);
        saveWinners([]);
    }, [ai]);

    const resetCurrentPrize = useCallback(() => {
        if (!currentPrize) return;
        setWinners(prev => prev.filter(w => w.prizeId !== currentPrize.id));
        setPhase('standby');
    }, [currentPrize]);

    // ========================================================================
    // Data Update Functions
    // ========================================================================
    const updateEmployees = useCallback((newEmployees: Employee[]) => {
        setEmployees(newEmployees);
        saveEmployees(newEmployees);
        setWinners([]);
        setCurrentPrizeIndex(0);
        setPhase('standby');
    }, []);

    const updatePrizes = useCallback((newPrizes: Prize[]) => {
        setPrizes(newPrizes);
        savePrizes(newPrizes);
        // 不自動重置中獎記錄，允許新增獎項時保留已抽獎結果
        // 如果需要重置，用戶可以手動使用 resetAll() 或 resetWinners()
    }, []);

    const resetEmployees = useCallback(() => {
        clearEmployees();
        lotteryAPI.resetEmployees();
        setEmployees([]);
        setWinners([]);
        saveWinners([]);
        lastSyncedCount.current = 0;
    }, []);

    const resetPrizes = useCallback(() => {
        clearPrizes();
        lotteryAPI.resetPrizes();
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
        import('../utils/db').then(({ clearBGM }) => {
            clearBGM();
        });
    }, []);

    const clearStoredData = useCallback(() => {
        clearAllData();
        lotteryAPI.resetWinners();
        lastSyncedCount.current = 0;
        setEmployees([]);
        setPrizes([]);
        setWinners([]);
        setCurrentPrizeIndex(0);
        setPhase('standby');
        console.log('[Reset] All data cleared (local + cloud)');
    }, []);

    // ========================================================================
    // Keyboard Remote Control (實體簡報器支援)
    // ========================================================================
    useEffect(() => {
        if (!enableRemote) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // 排除輸入框，避免干擾打字
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                return;
            }

            // [N26 專屬優化] 諾為 N26 常見模式為送出 Tab/Enter 或 ArrowUp/Down
            // - Tab: 回復預設行為 (移動游標)
            // - 方向鍵/Page鍵: 直接觸發抽獎
            const isNextAction = [
                'PageDown', 'PageUp',
                'ArrowDown', 'ArrowUp',
                'ArrowRight', 'ArrowLeft',
                'Enter', ' '
            ].includes(e.key);

            // 排除簡報器可能送出的標點符號 (如 B 鍵, 句點 ., 或 Escape)
            const isDebugKey = ['b', '.', 'Escape', 'F5'].includes(e.key);

            if (isNextAction || isDebugKey) {
                // 強制攔截所有可能導致焦點跳動或捲動的預設行為
                e.preventDefault();
                console.log(`[Remote Control] Key: "${e.key}" | Phase: ${phase}`);

                if (isDebugKey) return;

                switch (phase) {
                    case 'standby':
                    case 'join':
                    case 'completed':
                        startCountdown();
                        break;
                    case 'rolling':
                        stopRolling();
                        break;
                    case 'reveal':
                    case 'batch_reveal':
                        nextPrize();
                        break;
                    case 'countdown':
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enableRemote, phase, startCountdown, stopRolling, nextPrize]);

    // ========================================================================
    // AI Generation Wrappers (使用組合 Hook)
    // ========================================================================
    const generatePrizeAI = useCallback(() => {
        ai.generatePrizeAI(currentPrize);
    }, [currentPrize, ai]);

    const generateWinnerAI = useCallback(() => {
        const lastWinner = winners[winners.length - 1];
        ai.generateWinnerAI(lastWinner, currentPrize);
    }, [winners, currentPrize, ai]);

    // ========================================================================
    // Return (組合所有 Hooks 的狀態與方法)
    // ========================================================================
    return {
        // Core state
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
        soundEnabled,
        bgmEnabled,

        // From branding hook
        ...branding,

        // From AI hook (selected)
        aiCommentary: ai.aiCommentary,
        isAiLoading: ai.isAiLoading,
        aiConfig: ai.aiConfig,
        updateAIConfig: ai.updateAIConfig,

        // Actions
        setPhase,
        setSoundEnabled: (enabled: boolean) => {
            setSoundEnabled(enabled);
            soundManager.setEnabled(enabled);
        },
        setBGMEnabled: (enabled: boolean) => {
            setBGMEnabledState(enabled);
            soundManager.setBGMEnabled(enabled);
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
        clearStoredData,
    };
};

export default useLottery;
