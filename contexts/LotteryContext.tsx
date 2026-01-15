import React, { createContext, useContext, ReactNode } from 'react';
import { useLottery, UseLotteryReturn } from '../hooks/useLottery';

const LotteryContext = createContext<UseLotteryReturn | undefined>(undefined);

export const LotteryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const lottery = useLottery();
    return (
        <LotteryContext.Provider value={lottery}>
            {children}
        </LotteryContext.Provider>
    );
};

export const useLotteryContext = () => {
    const context = useContext(LotteryContext);
    if (!context) {
        throw new Error('useLotteryContext must be used within a LotteryProvider');
    }
    return context;
};
