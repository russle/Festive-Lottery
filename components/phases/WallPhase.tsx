// 榮譽榜階段元件 (目前改為純背景圖顯示)
import React from 'react';

export const WallPhase: React.FC = () => {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center p-4 animate-fade-in relative">
            {/* 背景美圖 */}
            <div className="w-full max-w-5xl h-full flex items-center justify-center">
                <img
                    src="/image_bg.png"
                    alt="End of Event"
                    className="max-w-full max-h-full object-contain drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                />
            </div>

        </div>
    );
};

export default WallPhase;
