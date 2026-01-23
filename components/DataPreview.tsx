import { useState } from 'react';
import { Users, Gift, CheckCircle2, ChevronLeft, ChevronRight, Edit2, Save, X } from 'lucide-react';
import type { Prize, Employee, Winner } from '../types';

interface DataPreviewProps {
    type: 'employees' | 'prizes';
    employees?: Employee[];
    prizes?: Prize[];
    winners?: Winner[];
    pageSize?: number;
    onUpdatePrize?: (prize: Prize) => void;
}

export const DataPreview: React.FC<DataPreviewProps> = ({
    type,
    employees = [],
    prizes = [],
    winners = [],
    pageSize = 20,
    onUpdatePrize,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [editingPrizeId, setEditingPrizeId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<{ count: number; countPerRound: number }>({ count: 0, countPerRound: 0 });

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

    const handleStartEdit = (prize: Prize) => {
        setEditingPrizeId(prize.id);
        setEditValues({
            count: prize.count,
            countPerRound: prize.countPerRound || 1
        });
    };

    const handleSaveEdit = (prize: Prize) => {
        if (onUpdatePrize) {
            onUpdatePrize({
                ...prize,
                count: editValues.count,
                countPerRound: Math.min(editValues.countPerRound, editValues.count, 12)
            });
        }
        setEditingPrizeId(null);
    };

    const handleCancelEdit = () => {
        setEditingPrizeId(null);
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
                                        <th className="px-4 py-2 text-center text-amber-300">進度/總量</th>
                                        <th className="px-4 py-2 text-center text-amber-300">每輪人數</th>
                                        <th className="px-4 py-2 text-center text-amber-300">操作/狀態</th>
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
                                    const isEditing = editingPrizeId === prize.id;

                                    return (
                                        <tr key={prize.id} className={i % 2 === 0 ? 'bg-black/10' : ''}>
                                            <td className="px-4 py-2 text-2xl">{prize.icon}</td>
                                            <td className="px-4 py-2 text-white">
                                                {prize.name}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <span className="text-amber-500/50">{prizeWinners.length} /</span>
                                                        <input
                                                            type="number"
                                                            value={editValues.count}
                                                            onChange={(e) => setEditValues(prev => ({ ...prev, count: parseInt(e.target.value) || 0 }))}
                                                            className="w-16 bg-black/40 border border-amber-500/30 rounded px-1 py-0.5 text-center text-white focus:outline-none focus:border-amber-500"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className={isFinished ? 'text-green-400 font-bold' : 'text-amber-300'}>
                                                        {prizeWinners.length} / {prize.count}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-center text-amber-100/70">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        max={12}
                                                        min={1}
                                                        value={editValues.countPerRound}
                                                        onChange={(e) => setEditValues(prev => ({ ...prev, countPerRound: parseInt(e.target.value) || 1 }))}
                                                        className="w-14 bg-black/40 border border-amber-500/30 rounded px-1 py-0.5 text-center text-white focus:outline-none focus:border-amber-500"
                                                    />
                                                ) : (
                                                    prize.countPerRound
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-center group">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleSaveEdit(prize)}
                                                            className="p-1 text-green-400 hover:bg-green-500/20 rounded-full transition-colors"
                                                            title="儲存"
                                                        >
                                                            <Save size={16} />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="p-1 text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
                                                            title="取消"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        {isFinished ? (
                                                            <span className="flex items-center justify-center gap-1 text-green-400 text-xs font-bold bg-green-500/20 px-2 py-1 rounded">
                                                                <CheckCircle2 size={12} />
                                                                已完成
                                                            </span>
                                                        ) : (
                                                            <span className="text-amber-500/40 text-xs italic">進行中</span>
                                                        )}
                                                        <button
                                                            onClick={() => handleStartEdit(prize)}
                                                            className="p-1 text-amber-400/0 group-hover:text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all"
                                                            title="編輯獎項"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                    </div>
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
