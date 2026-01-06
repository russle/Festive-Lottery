// 傳統邊角裝飾元件
import React from 'react';
import { Flower2 } from 'lucide-react';

interface OrnamentCornerProps {
    className?: string;
    rotate?: string;
}

export const OrnamentCorner: React.FC<OrnamentCornerProps> = ({
    className = '',
    rotate = '',
}) => {
    return (
        <div className={`absolute w-32 h-32 opacity-80 ${className} ${rotate}`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-transparent" />
            <div className="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-amber-500 to-transparent" />
            <div className="absolute top-4 left-4 w-4 h-4 border border-amber-300 rounded-full animate-pulse" />
            <div className="absolute top-8 left-8 w-2 h-2 bg-red-500 rounded-full" />
            <Flower2
                className="absolute top-0 left-0 text-amber-500/50 -translate-x-1/2 -translate-y-1/2"
                size={64}
            />
        </div>
    );
};

export default OrnamentCorner;
