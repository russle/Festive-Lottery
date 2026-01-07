// 獎品清單管理 Tab
import React from 'react';
import { Download, Trash2, Check, Plus } from 'lucide-react';
import type { Prize, Winner, PrizeType } from '../../types';
import { FileUploader } from '../FileUploader';
import { DataPreview } from '../DataPreview';
import {
    parsePrizes,
    validatePrizes,
    generateSamplePrizesExcel,
} from '../../utils/dataParser';

interface PrizeTabProps {
    currentPrizes: Prize[];
    winners: Winner[];
    onUpdatePrizes: (prizes: Prize[]) => void;
    onResetPrizes: () => void;
}

export const PrizeTab: React.FC<PrizeTabProps> = ({
    currentPrizes,
    winners,
    onUpdatePrizes,
    onResetPrizes,
}) => {
    const [pendingPrizes, setPendingPrizes] = React.useState<Prize[] | null>(null);
    const [errors, setErrors] = React.useState<string[]>([]);

    // Manual prize entry state
    const [newPrizeName, setNewPrizeName] = React.useState('');
    const [newPrizeCount, setNewPrizeCount] = React.useState<number | ''>(1);
    const [newPrizeCountPerRound, setNewPrizeCountPerRound] = React.useState<number>(1);
    const [newPrizeIcon, setNewPrizeIcon] = React.useState('🎁');
    const [newPrizeType, setNewPrizeType] = React.useState<PrizeType>('single');

    const handlePrizesFile = async (content: string | ArrayBuffer) => {
        setErrors([]);
        try {
            const prizes = await parsePrizes(content);
            const validation = validatePrizes(prizes);
            if (!validation.valid) {
                setErrors(validation.errors);
                return;
            }
            setPendingPrizes(prizes);
        } catch (e: any) {
            setErrors([e.message || '解析檔案失敗']);
        }
    };

    const handleImportPrizes = () => {
        if (pendingPrizes) {
            onUpdatePrizes(pendingPrizes);
            setPendingPrizes(null);
            setErrors([]);
        }
    };

    const handleAddPrize = () => {
        if (!newPrizeName.trim()) {
            setErrors(['請輸入獎項名稱']);
            return;
        }
        const count = typeof newPrizeCount === 'number' ? newPrizeCount : 1;
        const countPerRound = Math.min(newPrizeCountPerRound, 12, count);

        const newPrize: Prize = {
            id: currentPrizes.length > 0 ? Math.max(...currentPrizes.map(p => p.id)) + 1 : 1,
            name: newPrizeName.trim(),
            icon: newPrizeIcon || '🎁',
            count: count,
            type: countPerRound > 1 ? 'batch' : newPrizeType,
            countPerRound: countPerRound,
        };

        onUpdatePrizes([...currentPrizes, newPrize]);

        // Reset form
        setNewPrizeName('');
        setNewPrizeCount(1);
        setNewPrizeCountPerRound(1);
        setNewPrizeIcon('🎁');
        setNewPrizeType('single');
        setErrors([]);
    };

    const downloadSample = () => {
        const buffer = generateSamplePrizesExcel();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_prizes.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-4">
                    <ul className="text-red-200/80 text-sm list-disc list-inside space-y-1">
                        {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            <FileUploader
                label="上傳獎品清單"
                description="支援 CSV 或 Excel (.xlsx, .xls) 格式，需包含獎品名稱，可選填數量與每輪抽幾人"
                onFileContent={handlePrizesFile}
                onError={(err) => setErrors([err])}
            />

            {/* Manual Prize Entry */}
            <div className="bg-black/30 border border-amber-500/20 rounded-xl p-4 space-y-4">
                <h3 className="text-amber-300 font-medium flex items-center gap-2">
                    <Plus size={16} /> 手動新增獎項
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="獎項名稱 (Example: 特獎 - iPhone 16)"
                        value={newPrizeName}
                        onChange={(e) => setNewPrizeName(e.target.value)}
                        className="bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-white placeholder:text-amber-500/30 focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="總數量"
                            value={newPrizeCount}
                            onChange={(e) => setNewPrizeCount(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-1/2 bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-white placeholder:text-amber-500/30 focus:outline-none focus:border-amber-500"
                        />
                        <div className="w-1/2 relative">
                            <input
                                type="number"
                                placeholder="每輪抽幾人"
                                value={newPrizeCountPerRound}
                                onChange={(e) => setNewPrizeCountPerRound(Number(e.target.value))}
                                className="w-full bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-white placeholder:text-amber-500/30 focus:outline-none focus:border-amber-500"
                            />
                            <span className="absolute right-2 top-2 text-xs text-amber-500/50 pointer-events-none">/ 輪</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="圖示 (Emoji / URL)"
                            value={newPrizeIcon}
                            onChange={(e) => setNewPrizeIcon(e.target.value)}
                            className="w-1/3 bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-white placeholder:text-amber-500/30 focus:outline-none focus:border-amber-500 text-center"
                        />
                        <select
                            value={newPrizeType}
                            onChange={(e) => setNewPrizeType(e.target.value as PrizeType)}
                            className="w-2/3 bg-black/40 border border-amber-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                        >
                            <option value="single">單人揭曉 (Single)</option>
                            <option value="batch">多人揭曉 (Batch)</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={handleAddPrize}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={16} />
                            加入清單
                        </button>
                    </div>
                </div>
            </div>

            {/* Download Sample */}
            <button
                onClick={downloadSample}
                className="flex items-center gap-2 text-amber-400/60 hover:text-amber-300 text-sm"
            >
                <Download size={14} />
                下載範例 Excel
            </button>

            {/* Pending Preview */}
            {pendingPrizes && (
                <div className="space-y-4">
                    <DataPreview type="prizes" prizes={pendingPrizes} />
                    <button
                        onClick={handleImportPrizes}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-xl transition-all"
                    >
                        <Check size={18} />
                        確認匯入 {pendingPrizes.length} 筆獎品資料
                    </button>
                </div>
            )}

            {/* Current Data */}
            {!pendingPrizes && currentPrizes.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-amber-300 font-medium">目前的獎品名單</h3>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('確定要清除所有獎品資料嗎？這也會清除中獎紀錄。')) {
                                    onResetPrizes();
                                }
                            }}
                            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            <Trash2 size={16} />
                            清除獎項
                        </button>
                    </div>
                    <DataPreview type="prizes" prizes={currentPrizes} winners={winners} />
                </div>
            )}
        </>
    );
};

export default PrizeTab;
