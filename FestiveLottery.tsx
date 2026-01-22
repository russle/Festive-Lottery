import { useState, lazy, Suspense } from 'react';
import { Settings, QrCode, X, ChevronRight, ChevronLeft, Github } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// 匯入自訂 Hook
import { useLotteryContext } from './contexts/LotteryContext';
import { loadApiUrl } from './utils/storage';

// 匯入元件
import {
  FestiveBackground,
  OrnamentCorner,
  SettingsPanel,
  StandbyPhase,
  JoinPhase,
  CountdownPhase,
  RollingPhase,
  RevealPhase,
  BatchRevealPhase,
  WallPhase,
} from './components';

// 懶加載大型元件
const AdminPanel = lazy(() => import('./components/AdminPanel'));

export default function FestiveLottery() {
  const [showControls, setShowControls] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const lottery = useLotteryContext();

  const currentPrizeWinnersCount = lottery.currentPrize
    ? lottery.winners.filter(w => w.prizeId === lottery.currentPrize!.id).length
    : 0;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#2a0a12] font-sans text-amber-50 selection:bg-amber-500/30">
      <FestiveBackground />

      {/* 裝飾角落 */}
      <OrnamentCorner position="top-left" />
      <OrnamentCorner position="top-right" />
      <OrnamentCorner position="bottom-left" />
      <OrnamentCorner position="bottom-right" />

      {/* Header Area */}
      <header className="absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-start z-30 pointer-events-none">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-4">
          {lottery.customLogo ? (
            <img
              src={lottery.customLogo}
              alt="Logo"
              className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-lg animate-fade-in"
            />
          ) : (
            <div className="w-12 h-12 md:w-16 md:h-16 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse">
              <svg className="w-8 h-8 text-red-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
          )}

          <div className="flex flex-col">
            <h1 className="text-xl md:text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-100 drop-shadow-md whitespace-nowrap">
              {lottery.eventTitle}
            </h1>
            <span className="text-[10px] md:text-sm text-amber-400/80 tracking-[0.5em] font-light hidden md:block">
              {lottery.eventSubtitle}
            </span>
          </div>
        </div>

        {/* Right: Current Prize */}
        {lottery.currentPrize && (
          <div className="flex flex-col items-center pointer-events-auto animate-slide-in-right">
            <div className="text-xs text-amber-300/80 mb-1 tracking-widest uppercase">目前抽獎獎項</div>
            <div className="text-sm md:text-xl font-bold text-white bg-red-900/40 px-4 py-1 md:px-6 md:py-2 rounded-full border border-amber-500/50 backdrop-blur-sm flex items-center gap-2 shadow-lg">
              {lottery.currentPrizeIndex > 0 && (
                <button
                  onClick={lottery.previousPrize}
                  className="p-1 hover:bg-amber-500/20 rounded-full transition-colors text-amber-200 hover:text-white"
                  title="切換至上一個獎項"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <span>{lottery.currentPrize.name}</span>
              <span className="text-amber-300 text-sm md:text-lg font-mono">
                ({currentPrizeWinnersCount} / {lottery.currentPrize.count})
              </span>
              <button
                onClick={lottery.nextPrize}
                className="p-1 hover:bg-amber-500/20 rounded-full transition-colors text-amber-200 hover:text-white"
                title="切換至下一個獎項"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </header>


      {/* 主抽獎區域 */}
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 md:px-10">
        {lottery.phase === 'standby' && <StandbyPhase />}
        {lottery.phase === 'join' && <JoinPhase />}
        {lottery.phase === 'countdown' && <CountdownPhase />}
        {lottery.phase === 'rolling' && <RollingPhase />}
        {lottery.phase === 'reveal' && <RevealPhase />}
        {lottery.phase === 'batch_reveal' && <BatchRevealPhase />}
        {lottery.phase === 'wall' && <WallPhase />}
      </main>


      {/* 管理面板 Overlay */}
      {showAdmin && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm text-amber-500">載入中...</div>}>
          <AdminPanel onClose={() => setShowAdmin(false)} />
        </Suspense>
      )}

      {/* 設定面板 */}
      {showControls && (
        <SettingsPanel
          show={showControls}
          onClose={() => setShowControls(false)}
          onOpenAdmin={() => setShowAdmin(true)}
        />
      )}

      {/* Floating Action Buttons (QR Code & Settings) */}
      {!showControls && (
        <div className="fixed bottom-4 right-4 z-50 flex gap-4">
          {/* GitHub Link - Only visible when Admin Panel is open */}
          {showAdmin && (
            <a
              href="https://github.com/russle/Festive-Lottery"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-gray-900/80 border border-gray-500/30 rounded-full text-gray-300 hover:text-white hover:bg-gray-800 hover:shadow-[0_0_15px_rgba(156,163,175,0.4)] transition-all transform hover:scale-105"
              title="GitHub Repository"
            >
              <Github size={20} />
            </a>
          )}

          {/* Public QR Code Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="p-3 bg-purple-900/80 border border-purple-500/30 rounded-full text-purple-300 hover:text-white hover:bg-purple-800 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all transform hover:scale-105"
            title="顯示查獎 QR Code"
          >
            <QrCode size={20} />
          </button>

          {/* Admin Settings Button */}
          <button
            onClick={() => setShowControls(true)}
            className="p-3 bg-red-900/80 border border-amber-500/30 rounded-full text-amber-400 hover:text-white hover:bg-red-800 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105 hover:rotate-90"
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
          </div>
        </div>
      )}

      {/* Global Inline Styles (for specific animations) */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.5s ease-out forwards; }
      `}</style>

    </div>
  );
}