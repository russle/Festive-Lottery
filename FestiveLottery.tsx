// FestiveLottery 主程式入口
// 模組化版本 - 2026 紫氣東來・尾牙盛典抽獎系統

import { useEffect, useState } from 'react';
import { Settings, ChevronRight, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// 匯入自訂 Hook
import { useLottery } from './hooks/useLottery';
import { loadApiUrl } from './utils/storage';

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

export default function FestiveLottery() {
  const lottery = useLottery();
  const [showControls, setShowControls] = useState(false);
  const [showMobileCheck, setShowMobileCheck] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

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

  /* 計算目前獎項已抽人數 */
  const currentPrizeWinnersCount = lottery.currentPrize
    ? lottery.winners.filter(w => w.prizeId === lottery.currentPrize!.id).length
    : 0;

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
          onResetEmployees={lottery.resetEmployees}
          onResetPrizes={lottery.resetPrizes}
          onResetWinners={lottery.resetWinners}
          onResetBGM={lottery.resetBGM}
          customLogo={lottery.customLogo}
          onUpdateCustomLogo={lottery.updateCustomLogo}
          onResetCustomLogo={lottery.resetCustomLogo}
          eventTitle={lottery.eventTitle}
          onUpdateEventTitle={lottery.updateEventTitle}
          eventSubtitle={lottery.eventSubtitle}
          onUpdateEventSubtitle={lottery.updateEventSubtitle}
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
          {lottery.customLogo ? (
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50 overflow-hidden p-1">
              <img
                src={lottery.customLogo}
                alt="Logo"
                className="w-full h-auto object-contain"
              />
            </div>
          ) : (
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-red-900 shadow-lg shadow-amber-500/50 animate-bounce-slow">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl md:text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-100 drop-shadow-md">
              {lottery.eventTitle}
            </h1>
            <span className="text-[10px] md:text-sm text-amber-400/80 tracking-[0.5em] font-light hidden md:block">
              {lottery.eventSubtitle}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-amber-300/80 mb-1 tracking-widest uppercase">目前抽獎獎項</div>
          <div className="text-sm md:text-xl font-bold text-white bg-red-900/40 px-4 py-1 md:px-6 md:py-2 rounded-full border border-amber-500/50 backdrop-blur-sm flex items-center gap-2">
            <span>{lottery.currentPrize?.name || '載入中...'}</span>
            {lottery.currentPrize && (
              <span className="text-amber-300 text-sm md:text-lg">
                ({currentPrizeWinnersCount} / {lottery.currentPrize.count})
              </span>
            )}
            <button
              onClick={lottery.nextPrize}
              className="ml-2 p-1 hover:bg-amber-500/20 rounded-full transition-colors text-amber-200 hover:text-white"
              title="切換至下一個獎項"
            >
              <ChevronRight size={20} />
            </button>
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
        <div className="fixed bottom-4 right-4 z-50 flex gap-4">
          {/* Public QR Code Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="p-3 bg-purple-900/80 border border-purple-500/30 rounded-full text-purple-300 hover:text-white hover:bg-purple-800 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
            title="顯示查獎 QR Code"
          >
            <QrCode size={20} />
          </button>

          {/* Admin Settings Button */}
          <button
            onClick={() => setShowControls(true)}
            className="p-3 bg-red-900/80 border border-amber-500/30 rounded-full text-amber-400 hover:text-white hover:bg-red-800 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all"
          >
            <Settings size={20} />
          </button>
        </div>
      )}

      {/* QR Code Modal for Public */}
      {showQrModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-[#1a1025] border border-purple-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] max-w-sm w-full text-center space-y-6">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-purple-300/50 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                掃描查獎
              </h3>
              <p className="text-purple-200/60 text-sm">
                請使用手機掃描下方 QR Code<br />輸入工號查詢中獎狀態
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl inline-block shadow-xl">
              <QRCodeSVG
                value={`${window.location.origin}/check?api=${encodeURIComponent(loadApiUrl() || '')}`}
                size={200}
                level="Q"
                includeMargin={true}
              />
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
              <p className="text-xs text-purple-300/50 mb-1">或是輸入網址</p>
              <p className="text-sm font-mono text-purple-200 select-all">
                {window.location.host}/check
                {loadApiUrl() ? `?api=${encodeURIComponent(loadApiUrl()!)}` : ''}
              </p>
            </div>
          </div>
        </div>
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