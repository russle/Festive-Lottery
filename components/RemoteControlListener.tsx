import { useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../src/firebase';
import { useLotteryContext } from '../contexts/LotteryContext';

const RemoteControlListener = () => {
    const lottery = useLotteryContext();

    useEffect(() => {
        const commandRef = ref(db, 'lottery_control/command');

        // 監聽指令變化
        const unsubscribe = onValue(commandRef, (snapshot) => {
            const command = snapshot.val();
            if (!command) return;

            console.log('[RemoteControl] Received command:', command);

            // 根據指令執行對應動作
            switch (command) {
                case 'START_COUNTDOWN':
                    if (lottery.phase === 'standby' || lottery.phase === 'join' || lottery.phase === 'completed') {
                        lottery.startCountdown();
                    }
                    break;
                case 'STOP_ROLLING':
                    if (lottery.phase === 'rolling') {
                        lottery.stopRolling();
                    }
                    break;
                case 'NEXT_PRIZE':
                    if (lottery.phase === 'reveal' || lottery.phase === 'batch_reveal') {
                        lottery.nextPrize();
                    }
                    break;
                default:
                    console.warn('[RemoteControl] Unknown command:', command);
            }

            // 執行完畢後清除指令，避免重複執行
            set(commandRef, null);
        });

        return () => unsubscribe();
    }, [lottery]);

    return null; // 無 UI 組件
};

export default RemoteControlListener;
