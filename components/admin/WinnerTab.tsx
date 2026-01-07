// 中獎名單 Tab
import React from 'react';
import { Download, Trash2 } from 'lucide-react';
import type { Prize, Winner } from '../../types';
import { exportToExcelBuffer } from '../../utils/dataParser';

interface WinnerTabProps {
    winners: Winner[];
    currentPrizes: Prize[];
    onResetWinners: () => void;
}

export const WinnerTab: React.FC<WinnerTabProps> = ({
    winners,
    currentPrizes,
    onResetWinners,
}) => {
    const exportWinners = () => {
        if (winners.length === 0) return;

        const exportData: (string | number)[][] = [
            ['獎項', '員工編號', '姓名', '部門', '獲獎時間'],
            ...winners.map(w => {
                const prize = currentPrizes.find(p => p.id === w.prizeId);
                return [
                    prize?.name || '未知',
                    w.employee.id,
                    w.employee.name,
                    w.employee.dept,
                    new Date(w.timestamp).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
                ];
            })
        ];

        const buffer = exportToExcelBuffer(exportData);
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `winners_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-amber-300 font-medium">中獎統計數據</h3>
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (winners.length > 0 && window.confirm('確定要清除所有中獎紀錄嗎？此動作無法復原。')) {
                                onResetWinners();
                            }
                        }}
                        disabled={winners.length === 0}
                        className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 size={16} />
                        清除紀錄
                    </button>
                    <button
                        onClick={exportWinners}
                        disabled={winners.length === 0}
                        className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={16} />
                        導出 Excel 報表
                    </button>
                </div>
            </div>

            {winners.length > 0 ? (
                <div className="bg-black/30 rounded-xl overflow-hidden border border-amber-500/20">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-amber-900/30 border-b border-amber-500/20">
                                    <th className="px-4 py-2 text-left text-amber-300">獎項</th>
                                    <th className="px-4 py-2 text-left text-amber-300">員工編號</th>
                                    <th className="px-4 py-2 text-left text-amber-300">姓名</th>
                                    <th className="px-4 py-2 text-left text-amber-300">部門</th>
                                    <th className="px-4 py-2 text-right text-amber-300">獲獎時間</th>
                                </tr>
                            </thead>
                            <tbody>
                                {winners.map((w, i) => {
                                    const prize = currentPrizes.find(p => p.id === w.prizeId);
                                    return (
                                        <tr key={i} className={i % 2 === 0 ? 'bg-black/10' : ''}>
                                            <td className="px-4 py-2 text-amber-100/90">{prize?.name || '未知'}</td>
                                            <td className="px-4 py-2 text-amber-200/60 font-mono">{w.employee.id}</td>
                                            <td className="px-4 py-2 text-white font-medium">{w.employee.name}</td>
                                            <td className="px-4 py-2 text-amber-200/60">{w.employee.dept}</td>
                                            <td className="px-4 py-2 text-right text-amber-500/50 text-xs">
                                                {new Date(w.timestamp).toLocaleTimeString('zh-TW', { timeZone: 'Asia/Taipei' })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-black/20 rounded-2xl border border-dashed border-amber-500/10">
                    <p className="text-amber-500/30">尚無中獎紀錄</p>
                </div>
            )}
        </div>
    );
};

export default WinnerTab;
