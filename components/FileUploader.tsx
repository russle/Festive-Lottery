// 檔案上傳元件
import React, { useRef, useState, DragEvent } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploaderProps {
    accept?: string;
    label: string;
    description?: string;
    onFileContent: (content: string, fileName: string) => void;
    onError?: (error: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
    accept = '.csv',
    label,
    description,
    onFileContent,
    onError,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleFile = (file: File) => {
        if (!file.name.endsWith('.csv')) {
            setStatus('error');
            onError?.('請上傳 CSV 格式檔案');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setFileName(file.name);
            setStatus('success');
            onFileContent(content, file.name);
        };
        reader.onerror = () => {
            setStatus('error');
            onError?.('讀取檔案失敗');
        };
        reader.readAsText(file, 'UTF-8');
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div className="w-full">
            <label className="block text-amber-300 font-medium mb-2">{label}</label>
            {description && (
                <p className="text-amber-200/50 text-sm mb-3">{description}</p>
            )}
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragging
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-amber-500/30 hover:border-amber-400/50 hover:bg-amber-500/5'}
          ${status === 'success' ? 'border-green-500/50 bg-green-500/10' : ''}
          ${status === 'error' ? 'border-red-500/50 bg-red-500/10' : ''}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    className="hidden"
                />

                {status === 'idle' && (
                    <>
                        <Upload className="w-10 h-10 text-amber-400/60 mx-auto mb-3" />
                        <p className="text-amber-200/80">拖放檔案至此處</p>
                        <p className="text-amber-200/50 text-sm mt-1">或點擊選擇檔案</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                        <div className="flex items-center justify-center gap-2 text-green-300">
                            <FileText size={16} />
                            <span>{fileName}</span>
                        </div>
                        <p className="text-green-400/70 text-sm mt-1">檔案已載入</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                        <p className="text-red-300">上傳失敗</p>
                        <p className="text-red-400/70 text-sm mt-1">請重新選擇檔案</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default FileUploader;
