// 金色流光文字元件
import React from 'react';

interface GoldenTextProps {
    text: string;
    className?: string;
    size?: string;
}

export const GoldenText: React.FC<GoldenTextProps> = ({
    text,
    className = '',
    size = 'text-6xl',
}) => {
    return (
        <h2
            className={`
        ${size} font-black text-transparent bg-clip-text 
        bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 
        drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] 
        ${className}
      `}
        >
            {text}
        </h2>
    );
};

export default GoldenText;
