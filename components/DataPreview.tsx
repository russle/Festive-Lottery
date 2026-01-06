// 資料預覽表格元件
import React from 'react';
import { Users, Gift } from 'lucide-react';
import type { Employee, Prize } from '../types';

interface DataPreviewProps {
    type: 'employees' | 'prizes';
    employees?: Employee[];
    prizes?: Prize[];
    maxRows?: number;
}

export const DataPreview: React.FC<DataPreviewProps> = ({
    type,
    employees = [],
    prizes = [],
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
                                        <th className="px-4 py-2 text-center text-amber-300">數量</th>
                                        <th className="px-4 py-2 text-center text-amber-300">類型</th>
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
                                (displayData as Prize[]).map((prize, i) => (
                                    <tr key={prize.id} className={i % 2 === 0 ? 'bg-black/10' : ''}>
                                        <td className="px-4 py-2 text-2xl">{prize.icon}</td>
                                        <td className="px-4 py-2 text-white">{prize.name}</td>
                                        <td className="px-4 py-2 text-center text-amber-300">{prize.count}</td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${prize.type === 'batch'
                                                    ? 'bg-blue-500/20 text-blue-300'
                                                    : 'bg-purple-500/20 text-purple-300'
                                                }`}>
                                                {prize.type === 'batch' ? '批量抽' : '單獎抽'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
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
