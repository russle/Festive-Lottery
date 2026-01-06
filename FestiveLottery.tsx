// FestiveLottery 主程式入口
// 模組化版本 - 2026 紫氣東來・尾牙盛典抽獎系統

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';

// 匯入自訂 Hook
import { useLottery } from './hooks/useLottery';

// 匯入元件
import {
  FestiveBackground,
  OrnamentCorner,
  SettingsPanel,
  MobileCheckSimulator,
  AdminPanel,
  StandbyPhase,
  JoinPhase,
  CountdownPhase,
  RollingPhase,
  RevealPhase,
  BatchRevealPhase,
  WallPhase,
} from './components';

// 匯入常數
import { DEFAULT_CONFIG } from './constants';

export default function FestiveLottery() {
  const lottery = useLottery();
  const [showControls, setShowControls] = useState(false);
  const [showMobileCheck, setShowMobileCheck] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // 鍵盤事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (lottery.phase === 'standby' || lottery.phase === 'join') {
          lottery.startCountdown();
        } else if (lottery.phase === 'rolling') {
          lottery.stopRolling();
        } else if (lottery.phase === 'reveal' || lottery.phase === 'batch_reveal') {
          lottery.nextPrize();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lottery.phase, lottery.startCountdown, lottery.stopRolling, lottery.nextPrize]);

  const lastWinner = lottery.winners[lottery.winners.length - 1];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#2a0a12] font-sans text-amber-50 selection:bg-amber-500/30">
      <FestiveBackground />

      {/* 手機查獎模擬器 Overlay */}
      {showMobileCheck && (
        <MobileCheckSimulator
          winners={lottery.winners}
          prizes={lottery.prizes}
          onClose={() => setShowMobileCheck(false)}
        />
      )}

      {/* 管理面板 Overlay */}
      {showAdmin && (
        <AdminPanel
          currentEmployees={lottery.employees}
          currentPrizes={lottery.prizes}
          winners={lottery.winners}
          onUpdateEmployees={lottery.updateEmployees}
          onUpdatePrizes={lottery.updatePrizes}
          aiConfig={lottery.aiConfig}
          onUpdateAIConfig={lottery.updateAIConfig}
          onResetAll={lottery.clearStoredData}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {/* 傳統邊框裝飾 */}
      <div className="absolute inset-6 border-2 border-amber-500/30 rounded-3xl z-20 pointer-events-none">
        <OrnamentCorner className="top-0 left-0" />
        <OrnamentCorner className="top-0 right-0" rotate="rotate-90" />
        <OrnamentCorner className="bottom-0 right-0" rotate="rotate-180" />
        <OrnamentCorner className="bottom-0 left-0" rotate="-rotate-90" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-center z-30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-red-900 shadow-lg shadow-amber-500/50 animate-bounce-slow">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-100 drop-shadow-md">
              {DEFAULT_CONFIG.eventYear} {DEFAULT_CONFIG.eventName}
            </h1>
            <span className="text-[10px] md:text-sm text-amber-400/80 tracking-[0.5em] font-light hidden md:block">
              PROSPERITY GALA
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-amber-300/80 mb-1 tracking-widest uppercase">Current Prize</div>
          <div className="text-sm md:text-xl font-bold text-white bg-red-900/40 px-4 py-1 md:px-6 md:py-2 rounded-full border border-amber-500/50 backdrop-blur-sm">
            {lottery.currentPrize?.name || '載入中...'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative w-full h-full flex flex-col items-center justify-center z-20 px-4 pt-16">
        {/* STANDBY */}
        {lottery.phase === 'standby' && lottery.currentPrize && (
          <StandbyPhase
            prize={lottery.currentPrize}
            aiCommentary={lottery.aiCommentary}
            isAiLoading={lottery.isAiLoading}
            onStart={lottery.startCountdown}
            onGenerateAI={lottery.generatePrizeAI}
          />
        )}

        {/* JOIN MODE */}
        {lottery.phase === 'join' && (
          <JoinPhase
            joiners={lottery.joiners}
            participantCount={lottery.participantCount}
            onStart={lottery.startCountdown}
            onOpenMobileCheck={() => setShowMobileCheck(true)}
          />
        )}

        {/* COUNTDOWN */}
        {lottery.phase === 'countdown' && (
          <CountdownPhase countdown={lottery.countdown} />
        )}

        {/* ROLLING */}
        {lottery.phase === 'rolling' && (
          <RollingPhase
            rollingName={lottery.currentRollingName}
            onStop={lottery.stopRolling}
          />
        )}

        {/* REVEAL (Single) */}
        {lottery.phase === 'reveal' && (
          <RevealPhase
            winner={lastWinner}
            aiCommentary={lottery.aiCommentary}
            isAiLoading={lottery.isAiLoading}
            onGenerateWinnerComment={lottery.generateWinnerAI}
            onNext={lottery.nextPrize}
          />
        )}

        {/* BATCH REVEAL */}
        {lottery.phase === 'batch_reveal' && lottery.currentPrize && (
          <BatchRevealPhase
            prize={lottery.currentPrize}
            batchWinners={lottery.currentBatchWinners}
            revealedCount={lottery.batchRevealedCount}
            onNext={lottery.nextPrize}
          />
        )}

        {/* WALL */}
        {lottery.phase === 'wall' && (
          <WallPhase
            winners={lottery.winners}
            prizes={lottery.prizes}
            onReset={lottery.resetAll}
            onOpenMobileCheck={() => setShowMobileCheck(true)}
          />
        )}
      </main>

      {/* Settings Panel */}
      {showControls && (
        <SettingsPanel
          show={showControls}
          onClose={() => setShowControls(false)}
          soundEnabled={lottery.soundEnabled}
          onToggleSound={() => lottery.setSoundEnabled(!lottery.soundEnabled)}
          onSetPhase={lottery.setPhase}
          onResetCurrentPrize={lottery.resetCurrentPrize}
          onOpenMobileCheck={() => setShowMobileCheck(true)}
          onOpenAdmin={() => setShowAdmin(true)}
        />
      )}

      {/* Settings Button */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed bottom-4 right-4 p-3 bg-red-900/80 border border-amber-500/30 rounded-full text-amber-400 hover:text-white hover:bg-red-800 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all z-50"
        >
          <Settings size={20} />
        </button>
      )}

      {/* Global Inline Styles (for animations not easily extracted) */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
        
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

        @keyframes pop-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: pop-in 0.4s ease-out forwards; }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }

        @keyframes float-up {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          10% { opacity: 1; transform: translateY(-20px) scale(1); }
          100% { transform: translateY(-300px) scale(1); opacity: 0; }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #b45309; border-radius: 10px; }
      `}</style>
    </div>
  );
}