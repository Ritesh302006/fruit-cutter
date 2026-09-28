import React, { useCallback, useEffect, useState } from 'react';
import { BladeStyle, GameMode, GameStats } from './game/types';
import { GameCanvas } from './game/GameCanvas';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { BladeModal } from './components/BladeModal';
import { OfflineIndicator } from './pwa/OfflineIndicator';
import { sounds } from './game/sound';
import { Maximize2, Minimize2, Smartphone } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [mode, setMode] = useState<GameMode>('classic');
  const [bladeStyle, setBladeStyle] = useState<BladeStyle>('katana');
  const [isPaused, setIsPaused] = useState(false);
  const [isBladeModalOpen, setIsBladeModalOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [isDesktopFrame, setIsDesktopFrame] = useState(true);

  // Active game session statistics
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    bestScore: 0,
    lives: 3,
    maxLives: 3,
    combo: 0,
    maxCombo: 0,
    slicedCount: 0,
    mode: 'classic',
    timeLeft: 60,
    isGameOver: false,
    isPaused: false,
    isNewHighScore: false,
    missedFoods: 0,
  });

  // Unique game key to cleanly mount a fresh canvas instance on restart
  const [gameSessionKey, setGameSessionKey] = useState<number>(1);

  // Load initial high score & blade from localStorage
  useEffect(() => {
    const savedBlade = localStorage.getItem('food_slice_blade') as BladeStyle;
    if (savedBlade && ['katana', 'flame', 'neon', 'rainbow'].includes(savedBlade)) {
      setBladeStyle(savedBlade);
    }

    const savedBest = localStorage.getItem(`food_slice_best_${mode}`);
    const best = savedBest ? parseInt(savedBest, 10) : 0;
    setStats((prev) => ({ ...prev, bestScore: best, mode }));
  }, [mode]);

  const handleSelectMode = (newMode: GameMode) => {
    setMode(newMode);
    const savedBest = localStorage.getItem(`food_slice_best_${newMode}`);
    const best = savedBest ? parseInt(savedBest, 10) : 0;
    setStats((prev) => ({
      ...prev,
      mode: newMode,
      bestScore: best,
      lives: newMode === 'timeAttack' ? 1 : 3,
      timeLeft: newMode === 'timeAttack' ? 60 : 0,
    }));
  };

  const handleSelectBlade = (blade: BladeStyle) => {
    setBladeStyle(blade);
    localStorage.setItem('food_slice_blade', blade);
    setIsBladeModalOpen(false);
  };

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleStartGame = () => {
    setGameSessionKey((k) => k + 1);
    setIsPaused(false);
    setGameState('playing');
    setStats((prev) => ({
      ...prev,
      score: 0,
      combo: 0,
      maxCombo: 0,
      slicedCount: 0,
      lives: mode === 'timeAttack' ? 1 : 3,
      timeLeft: mode === 'timeAttack' ? 60 : 0,
      isGameOver: false,
      isNewHighScore: false,
    }));
  };

  const handleRestart = () => {
    handleStartGame();
  };

  const handleHome = () => {
    setIsPaused(false);
    setGameState('start');
    const savedBest = localStorage.getItem(`food_slice_best_${mode}`);
    const best = savedBest ? parseInt(savedBest, 10) : 0;
    setStats((prev) => ({
      ...prev,
      score: 0,
      combo: 0,
      bestScore: best,
      isGameOver: false,
    }));
  };

  const handleStatsUpdate = useCallback((partial: Partial<GameStats>) => {
    setStats((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleGameOver = useCallback((finalStats: GameStats) => {
    setStats(finalStats);
    setGameState('gameover');
  }, []);

  const handleComboAnnounce = useCallback((combo: number, bonus: number) => {
    // Canvas handles floating visuals and sound triggers
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden select-none touch-none">
      <OfflineIndicator />

      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-black pointer-events-none" />

      {/* Desktop Responsive Phone Container or Fullscreen Mobile */}
      <main
        className={`relative w-full h-full flex flex-col overflow-hidden transition-all duration-300 ${
          isDesktopFrame
            ? 'sm:max-w-[430px] sm:max-h-[920px] sm:h-[94vh] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_20px_rgba(30,41,59,0.5)]'
            : 'max-w-none h-full'
        }`}
      >
        {/* Dynamic Island / Notch on Desktop Phone Preview */}
        <div className="hidden sm:flex absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 items-center justify-center pointer-events-none border border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 mr-2" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
        </div>

        {/* Game Canvas Container */}
        <div className="relative w-full h-full overflow-hidden bg-stone-950">
          <GameCanvas
            key={gameSessionKey}
            mode={mode}
            bladeStyle={bladeStyle}
            isPaused={isPaused || gameState !== 'playing'}
            onStatsUpdate={handleStatsUpdate}
            onGameOver={handleGameOver}
            onComboAnnounce={handleComboAnnounce}
          />

          {/* In-Game HUD (During Gameplay) */}
          {gameState === 'playing' && (
            <HUD
              score={stats.score}
              bestScore={stats.bestScore}
              combo={stats.combo}
              lives={stats.lives}
              maxLives={stats.maxLives}
              mode={mode}
              timeLeft={stats.timeLeft}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onPause={() => setIsPaused(true)}
            />
          )}

          {/* Start Screen */}
          {gameState === 'start' && (
            <StartScreen
              bestScore={stats.bestScore}
              selectedMode={mode}
              selectedBlade={bladeStyle}
              isMuted={isMuted}
              onSelectMode={handleSelectMode}
              onOpenBladeModal={() => setIsBladeModalOpen(true)}
              onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
              onToggleMute={handleToggleMute}
              onStartGame={handleStartGame}
            />
          )}

          {/* Pause Modal */}
          {isPaused && gameState === 'playing' && (
            <PauseModal
              score={stats.score}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onResume={() => setIsPaused(false)}
              onRestart={() => {
                setIsPaused(false);
                handleRestart();
              }}
              onHome={handleHome}
            />
          )}

          {/* Game Over Modal */}
          {gameState === 'gameover' && (
            <GameOverModal
              stats={stats}
              onPlayAgain={handleRestart}
              onHome={handleHome}
            />
          )}

          {/* Blade Dojo Modal */}
          {isBladeModalOpen && (
            <BladeModal
              currentBlade={bladeStyle}
              onSelectBlade={handleSelectBlade}
              onClose={() => setIsBladeModalOpen(false)}
            />
          )}

          {/* How To Play Modal */}
          {isHowToPlayOpen && (
            <HowToPlayModal onClose={() => setIsHowToPlayOpen(false)} />
          )}
        </div>
      </main>

      {/* Desktop Frame / Fullscreen toggle bar (visible only on large screens) */}
      <footer className="hidden sm:flex items-center gap-3 mt-3 z-30 text-xs text-slate-400">
        <button
          onClick={() => setIsDesktopFrame(!isDesktopFrame)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:text-white transition"
        >
          {isDesktopFrame ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen Window</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone Frame (9:16)</span>
            </>
          )}
        </button>
        <span className="text-slate-500">•</span>
        <span>Mobile-First Portrait 9:16</span>
      </footer>
    </div>
  );
}
