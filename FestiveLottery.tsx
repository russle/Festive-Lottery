import { useState, lazy, Suspense } from 'react';

// 匯入自訂 Hook
import { useLotteryContext } from './contexts/LotteryContext';

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
  const lottery = useLotteryContext();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#2a0a12] font-sans text-amber-50 selection:bg-amber-500/30">
      <FestiveBackground />

      {/* 裝飾角落 */}
      <OrnamentCorner position="top-left" />
      <OrnamentCorner position="top-right" />
      <OrnamentCorner position="bottom-left" />
      <OrnamentCorner position="bottom-right" />

      {/* 活動標題與自定義 Logo */}
      {/* 活動標題與自定義 Logo */}
      <div className="absolute top-8 left-8 flex items-center gap-4 md:gap-6 z-10 pointer-events-none">
        {lottery.customLogo && (
          <div className="relative group">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md animate-pulse" />
            <img
              src={lottery.customLogo}
              alt="Event Logo"
              className="relative h-16 w-16 md:h-20 md:w-20 rounded-full object-cover border-2 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-fade-in"
            />
          </div>
        )}
        <div className="flex flex-col items-start drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <h1 className="text-amber-400/90 text-2xl md:text-3xl tracking-[0.15em] font-bold uppercase animate-tracking-in-expand whitespace-nowrap">
            {lottery.eventTitle}
          </h1>
          <p className="text-amber-200/70 text-base md:text-xl mt-2 tracking-[0.3em] font-medium">
            {lottery.eventSubtitle}
          </p>
        </div>
      </div>

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

      {/* 設置開關 */}
      <button
        onClick={() => setShowControls(true)}
        className="absolute bottom-6 right-6 z-20 text-amber-500/20 hover:text-amber-500/80 transition-all hover:rotate-90"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
      </button>

      {/* 管理面板 Overlay */}
      {showAdmin && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm text-amber-500">載入中...</div>}>
          <AdminPanel onClose={() => setShowAdmin(false)} />
        </Suspense>
      )}

      {/* 設定面板 */}
      <SettingsPanel
        show={showControls}
        onClose={() => setShowControls(false)}
        onOpenAdmin={() => setShowAdmin(true)}
      />

    </div>
  );
}