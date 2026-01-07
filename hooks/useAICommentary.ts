// AI 吉祥話生成 Hook
import { useState, useCallback } from 'react';
import type { Prize, Winner, AIConfig } from '../types';
import { generatePrizeIntro, generateWinnerComment, setAIConfig } from '../api/ai';
import { saveAIConfig, loadAIConfig } from '../utils/storage';

export interface UseAICommentaryReturn {
    aiCommentary: string;
    isAiLoading: boolean;
    aiConfig: AIConfig;
    generatePrizeAI: (currentPrize: Prize | undefined) => Promise<void>;
    generateWinnerAI: (lastWinner: Winner | undefined, currentPrize: Prize | undefined) => Promise<void>;
    updateAIConfig: (config: AIConfig) => void;
    clearCommentary: () => void;
}

export const useAICommentary = (): UseAICommentaryReturn => {
    const [aiCommentary, setAiCommentary] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiConfig, setAIConfigState] = useState<AIConfig>(() => {
        const saved = loadAIConfig();
        if (saved) {
            setAIConfig(saved);
            return saved;
        }
        return {
            provider: 'gemini',
            geminiKey: '',
            openaiKey: '',
        };
    });

    const generatePrizeAI = useCallback(async (currentPrize: Prize | undefined) => {
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
    }, [isAiLoading, aiCommentary]);

    const generateWinnerAI = useCallback(async (lastWinner: Winner | undefined, currentPrize: Prize | undefined) => {
        if (isAiLoading) return;
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
    }, [isAiLoading]);

    const updateAIConfig = useCallback((config: AIConfig) => {
        setAIConfigState(config);
        saveAIConfig(config);
        setAIConfig(config);
    }, []);

    const clearCommentary = useCallback(() => {
        setAiCommentary('');
    }, []);

    return {
        aiCommentary,
        isAiLoading,
        aiConfig,
        generatePrizeAI,
        generateWinnerAI,
        updateAIConfig,
        clearCommentary,
    };
};

export default useAICommentary;
