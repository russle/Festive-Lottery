// AI 服務封裝 (支援 Gemini 與 OpenAI)
import type { AIConfig } from '../types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

let aiConfig: AIConfig = {
    provider: 'gemini',
    geminiKey: '',
    openaiKey: '',
};

/** 更新 AI 設定 */
export const setAIConfig = (config: AIConfig): void => {
    aiConfig = { ...config };
    console.log('[AI] Config updated:', { provider: config.provider, hasGeminiKey: !!config.geminiKey, hasOpenaiKey: !!config.openaiKey });
};

/** 通用內容生成 */
export const generateContent = async (prompt: string): Promise<string> => {
    const { provider, geminiKey, openaiKey } = aiConfig;
    const apiKey = provider === 'gemini' ? geminiKey : openaiKey;

    if (!apiKey) {
        console.warn(`[AI] ${provider} API key not set`);
        return '福星高照，財源廣進！';
    }

    console.log(`[AI] Calling ${provider} API...`);

    try {
        if (provider === 'gemini') {
            const response = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`[AI] Gemini API Error ${response.status}:`, errorData);
                return '福星高照，財源廣進！';
            }

            const data = await response.json();
            const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '福星高照，財源廣進！';
            console.log('[AI] Gemini response:', result);
            return result;
        } else {
            // OpenAI 支援
            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 100,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`[AI] OpenAI API Error ${response.status}:`, errorData);
                return '福星高照，財源廣進！';
            }

            const data = await response.json();
            const result = data.choices?.[0]?.message?.content || '福星高照，財源廣進！';
            console.log('[AI] OpenAI response:', result);
            return result;
        }
    } catch (error) {
        console.error(`[AI] ${provider} Network Error:`, error);
        return '連線繁忙，好運馬上到！';
    }
};

/** 生成獎項介紹 */
export const generatePrizeIntro = async (prizeName: string): Promise<string> => {
    const prompt = `你是一位喜氣洋洋的尾牙主持人。現在要抽出的獎項是「${prizeName}」。請用充滿吉祥話、大吉大利、喜慶的語氣介紹它，讓大家覺得抽到會發大財。繁體中文，30字內。`;
    return generateContent(prompt);
};

/** 生成得獎者祝賀詞 */
export const generateWinnerComment = async (
    winnerName: string,
    dept: string,
    prizeName: string
): Promise<string> => {
    const prompt = `你是財神爺。${dept} 的 ${winnerName} 獲得了「${prizeName}」。請送上一句超吉利的祝賀詞，例如步步高升、財源滾滾。繁體中文，25字內。`;
    return generateContent(prompt);
};

