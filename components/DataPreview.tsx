// 資料預覽表格元件 (含分頁功能)
import { useState } from 'react';
import { Users, Gift, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Employee, Prize, Winner } from '../types';

interface DataPreviewProps {
    type: 'employees' | 'prizes';
    employees?: Employee[];
    prizes?: Prize[];
    winners?: Winner[];
    pageSize?: number;
}

export const DataPreview: React.FC<DataPreviewProps> = ({
    type,
    employees = [],
    prizes = [],
    winners = [],
    pageSize = 20,
}) => {
    const [currentPage, setCurrentPage] = useState(1);

    if (type === 'employees' && employees.length === 0) return null;
    if (type === 'prizes' && prizes.length === 0) return null;

    const data = type === 'employees' ? employees : prizes;
    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const displayData = data.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
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

                {/* 分頁資訊 */}
                {totalPages > 1 && (
                    <span className="text-amber-400/60 text-sm">
                        第 {currentPage} / {totalPages} 頁
                    </span>
                )}
            </div>

            <div className="bg-black/30 rounded-xl overflow-hidden border border-amber-500/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-amber-900/30 border-b border-amber-500/20">
                                {type === 'employees' ? (
                                    <>
                                        <th className="px-4 py-2 text-left text-amber-300 w-12">#</th>
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
                                        <td className="px-4 py-2 text-amber-500/50 text-xs">{startIndex + i + 1}</td>
                                        <td className="px-4 py-2 text-amber-100/80 font-mono">{emp.id}</td>
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

                {/* 分頁控制 */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-amber-500/10 bg-black/20">
                        <div className="text-amber-400/50 text-xs">
                            顯示第 {startIndex + 1} - {Math.min(endIndex, data.length)} 筆，共 {data.length} 筆
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                className="px-2 py-1 text-xs text-amber-400/60 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                首頁
                            </button>
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-1 text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* 頁碼按鈕 */}
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            className={`w-7 h-7 text-xs rounded transition-colors ${currentPage === pageNum
                                                    ? 'bg-amber-500 text-white font-bold'
                                                    : 'text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/10'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-1 text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="px-2 py-1 text-xs text-amber-400/60 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                末頁
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataPreview;
