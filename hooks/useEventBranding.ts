// 活動品牌識別管理 Hook (Logo & Title)
import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_CONFIG } from '../constants';
import {
    saveCustomLogo, loadCustomLogo, clearCustomLogo,
    saveEventTitle, loadEventTitle,
    saveEventSubtitle, loadEventSubtitle,
} from '../utils/storage';

export interface UseEventBrandingReturn {
    customLogo: string | null;
    eventTitle: string;
    eventSubtitle: string;
    updateCustomLogo: (logoData: string) => void;
    resetCustomLogo: () => void;
    updateEventTitle: (title: string) => void;
    updateEventSubtitle: (subtitle: string) => void;
}

export const useEventBranding = (): UseEventBrandingReturn => {
    const [customLogo, setCustomLogo] = useState<string | null>(null);
    const [eventTitle, setEventTitle] = useState(`${DEFAULT_CONFIG.eventYear} ${DEFAULT_CONFIG.eventName}`);
    const [eventSubtitle, setEventSubtitle] = useState('年終聯歡晚會');

    // 初始化載入設定
    useEffect(() => {
        const savedLogo = loadCustomLogo();
        if (savedLogo) setCustomLogo(savedLogo);

        const savedTitle = loadEventTitle();
        if (savedTitle) setEventTitle(savedTitle);

        const savedSubtitle = loadEventSubtitle();
        if (savedSubtitle) setEventSubtitle(savedSubtitle);
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

    return {
        customLogo,
        eventTitle,
        eventSubtitle,
        updateCustomLogo,
        resetCustomLogo,
        updateEventTitle,
        updateEventSubtitle,
    };
};

export default useEventBranding;
