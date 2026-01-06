// FestiveLottery 常數定義
import type { Prize, LotteryConfig } from '../types';

/** 預設抽獎設定 */
export const DEFAULT_CONFIG: LotteryConfig = {
    eventName: '紫氣東來・尾牙盛典',
    eventYear: 2026,
    countdownSeconds: 5,
    rollingIntervalMs: 40,
    batchRevealDelayMs: 600,
};

/** 預設獎項列表 */
export const DEFAULT_PRIZES: Prize[] = [
    { id: 1, name: '開運紅包 - SOGO 禮券', icon: '🧧', count: 10, type: 'batch' },
    { id: 2, name: '富貴手環 - Apple Watch', icon: '⌚', count: 5, type: 'batch' },
    { id: 3, name: '春風得意 - Dyson', icon: '🎐', count: 3, type: 'single' },
    { id: 4, name: '吉星高照 - iPhone 16 Pro', icon: '📱', count: 1, type: 'single' },
    { id: 5, name: '環遊世界 - 歐洲雙人遊', icon: '✈️', count: 1, type: 'single' },
];

/** 部門列表 */
export const DEPARTMENTS = ['財富部', '聚寶部', '招財部', '納福部', '興旺部'];

/** 主題色彩 */
export const THEME_COLORS = {
    primary: '#b45309',      // 琥珀金
    secondary: '#7c2d12',    // 深紅
    accent: '#fbbf24',       // 亮金
    background: '#2a0a12',   // 深紅黑
    text: '#fef3c7',         // 淡金
};

/** 動畫時間常數 (ms) */
export const ANIMATION_DURATIONS = {
    fadeIn: 800,
    scaleIn: 500,
    popIn: 400,
    floatUp: 3000,
    bounceSlowCycle: 3000,
};

/** QR Code 設定 */
export const QR_CONFIG = {
    size: 300,
    joinUrl: 'https://example.com/join-event',
    checkUrl: 'https://example.com/check-result',
};
