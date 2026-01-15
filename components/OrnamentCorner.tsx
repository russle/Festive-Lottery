// 傳統邊角裝飾元件
import React from 'react';
import { Flower2 } from 'lucide-react';

interface OrnamentCornerProps {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const OrnamentCorner: React.FC<OrnamentCornerProps> = ({ position }) => {
    const positionClasses = {
        'top-left': 'top-0 left-0',
        'top-right': 'top-0 right-0 rotate-90',
        'bottom-left': 'bottom-0 left-0 -rotate-90',
        'bottom-right': 'bottom-0 right-0 rotate-180',
    };

    return (
        <div className={`absolute w-32 h-32 opacity-80 ${positionClasses[position]}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/50 to-transparent" />
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-amber-500/50 to-transparent" />
            <div className="absolute top-4 left-4 w-4 h-4 border border-amber-300/30 rounded-full animate-pulse" />
            <div className="absolute top-8 left-8 w-2 h-2 bg-red-500/40 rounded-full" />
            <Flower2
                className="absolute top-0 left-0 text-amber-500/40 -translate-x-1/2 -translate-y-1/2"
                size={48}
            />
        </div>
    );
};

export default OrnamentCorner;
