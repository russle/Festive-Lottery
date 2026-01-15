import { useRef, useEffect } from 'react';
import type { Winner } from '../types';
import { lotteryAPI } from '../api/lottery';
import { saveWinners } from '../utils/storage';

export const useCloudSync = (winners: Winner[]) => {
    const lastSyncedCount = useRef(0);

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

    return {
        lastSyncedCount
    };
};
