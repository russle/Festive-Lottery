// 資料預覽表格元件
import { Users, Gift, CheckCircle2 } from 'lucide-react';
import type { Employee, Prize, Winner } from '../types';

interface DataPreviewProps {
    type: 'employees' | 'prizes';
    employees?: Employee[];
    prizes?: Prize[];
    winners?: Winner[];
    maxRows?: number;
}

export const DataPreview: React.FC<DataPreviewProps> = ({
    type,
    employees = [],
    prizes = [],
    winners = [],
    maxRows = 10,
}) => {
    if (type === 'employees' && employees.length === 0) return null;
    if (type === 'prizes' && prizes.length === 0) return null;

    const data = type === 'employees' ? employees : prizes;
    const displayData = data.slice(0, maxRows);
    const hasMore = data.length > maxRows;

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-3">
                {type === 'employees' ? (
                    <Users size={18} className="text-amber-400" />
                ) : (
                    <Gift size={18} className="text-amber-400" />
                )}
                <span className="text-amber-300 font-medium">
                    {type === 'employees' ? '員工清單' : '獎品清單'}
                    <span className="text-amber-400/60 ml-2">({data.length} 筆)</span>
                </span>
            </div>

            <div className="bg-black/30 rounded-xl overflow-hidden border border-amber-500/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-amber-900/30 border-b border-amber-500/20">
                                {type === 'employees' ? (
                                    <>
                                        <th className="px-4 py-2 text-left text-amber-300">編號</th>
                                        <th className="px-4 py-2 text-left text-amber-300">姓名</th>
                                        <th className="px-4 py-2 text-left text-amber-300">部門</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-4 py-2 text-left text-amber-300">圖示</th>
                                        <th className="px-4 py-2 text-left text-amber-300">獎品名稱</th>
                                        <th className="px-4 py-2 text-center text-amber-300">進度</th>
                                        <th className="px-4 py-2 text-center text-amber-300">每輪</th>
                                        <th className="px-4 py-2 text-center text-amber-300">狀態</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {type === 'employees' ? (
                                (displayData as Employee[]).map((emp, i) => (
                                    <tr key={emp.id} className={i % 2 === 0 ? 'bg-black/10' : ''}>
                                        <td className="px-4 py-2 text-amber-100/80">{emp.id}</td>
                                        <td className="px-4 py-2 text-white">{emp.name}</td>
                                        <td className="px-4 py-2 text-amber-200/60">{emp.dept}</td>
                                    </tr>
                                ))
                            ) : (
                                (displayData as Prize[]).map((prize, i) => {
                                    const prizeWinners = winners.filter(w => w.prizeId === prize.id);
                                    const isFinished = prizeWinners.length >= prize.count;

                                    return (
                                        <tr key={prize.id} className={i % 2 === 0 ? 'bg-black/10' : ''}>
                                            <td className="px-4 py-2 text-2xl">{prize.icon}</td>
                                            <td className="px-4 py-2 text-white">
                                                {prize.name}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <span className={isFinished ? 'text-green-400 font-bold' : 'text-amber-300'}>
                                                    {prizeWinners.length} / {prize.count}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center text-amber-100/70">{prize.countPerRound}</td>
                                            <td className="px-4 py-2 text-center">
                                                {isFinished ? (
                                                    <span className="flex items-center justify-center gap-1 text-green-400 text-xs font-bold bg-green-500/20 px-2 py-1 rounded">
                                                        <CheckCircle2 size={12} />
                                                        已抽完
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-500/40 text-xs italic">進行中</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {hasMore && (
                    <div className="px-4 py-2 text-center text-amber-400/50 text-sm border-t border-amber-500/10">
                        還有 {data.length - maxRows} 筆資料...
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataPreview;
