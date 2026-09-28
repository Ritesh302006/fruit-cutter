import React, { useState } from 'react';
import { BladeStyle, GameMode } from '../game/types';
import { Award, BookOpen, Clock, Flame, Heart, Infinity as InfinityIcon, Play, ShieldAlert, Sparkles, Trophy, Volume2, VolumeX } from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { AdBanner } from './AdBanner';
import { sounds } from '../game/sound';

interface StartScreenProps {
  bestScore: number;
  selectedMode: GameMode;
  selectedBlade: BladeStyle;
  isMuted: boolean;
  onSelectMode: (mode: GameMode) => void;
  onOpenBladeModal: () => void;
  onOpenHowToPlay: () => void;
  onToggleMute: () => void;
  onStartGame: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  bestScore,
  selectedMode,
  selectedBlade,
  isMuted,
  onSelectMode,
  onOpenBladeModal,
  onOpenHowToPlay,
  onToggleMute,
  onStartGame,
}) => {
  const [showModeSelector, setShowModeSelector] = useState(false);

  const modes: { id: GameMode; name: string; icon: string; desc: string }[] = [
    {
      id: 'classic',
      name: 'CLASSIC',
      icon: '❤️',
      desc: '3 lives. Slice all fruits, avoid bombs! Missed fruit costs a life.',
    },
    {
      id: 'timeAttack',
      name: 'TIME ATTACK',
      icon: '⏱️',
      desc: '60 seconds frenzy. Rapid spawning. Bombs deduct 10 seconds!',
    },
    {
      id: 'endless',
      name: 'ENDLESS',
      icon: '♾️',
      desc: 'No timer. Relaxed flow, endless scaling speed. Avoid bombs!',
    },
  ];

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between pt-safe pb-safe px-5 text-white select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <PWAInstallButton compact={true} />

        <div className="flex items-center gap-2 ml-auto">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            aria-label="Toggle Sound"
            className="w-10 h-10 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-lg active:scale-90 hover:bg-slate-800 transition"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Blade Dojo */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenBladeModal();
            }}
            aria-label="Blade Dojo"
            className="w-10 h-10 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-lg active:scale-90 hover:bg-slate-800 transition"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero & Logo Center */}
      <div className="flex flex-col items-center justify-center my-auto text-center py-4">
        {/* Animated 3D Watermelon Icon */}
        <div className="relative mb-3 group cursor-pointer animate-float-subtle">
          <div className="text-7xl filter drop-shadow-[0_10px_20px_rgba(244,63,94,0.4)]">
            🍉
          </div>
          {/* Subtle sliced glimmer */}
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-rose-500/20 to-amber-500/20 rounded-full blur-xl -z-10 opacity-70" />
        </div>

        {/* Title */}
        <h1 className="text-5xl xs:text-6xl font-extrabold font-game tracking-wider bg-gradient-to-b from-white via-amber-200 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          FOOD SLICE
        </h1>

        {/* Subtitle */}
        <p className="mt-1 text-sm font-semibold italic text-emerald-400/90 tracking-wide font-game">
          Slice it. Combo it. Master it.
        </p>

        {/* Best Score Badge */}
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 backdrop-blur-md shadow-lg shadow-black/40">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold font-game tracking-wide text-slate-200">
            Best Score: <span className="text-amber-400 font-extrabold">{bestScore.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Bottom Actions & Mode Selectors */}
      <div className="flex flex-col gap-3 max-w-sm mx-auto w-full mb-2">
        {/* Large PLAY Button */}
        <button
          onClick={() => {
            sounds.playClick();
            sounds.playSlice(1.3);
            onStartGame();
          }}
          className="w-full py-4 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 font-game font-extrabold text-white text-xl tracking-wider shadow-xl shadow-emerald-500/40 border border-emerald-400/30 flex items-center justify-center gap-2.5 active:scale-95 hover:brightness-110 transition duration-150 animate-pulse-glow"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>▶ PLAY</span>
        </button>

        {/* Mode Selector Toggle Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setShowModeSelector(!showModeSelector);
          }}
          className="w-full py-2.5 px-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-700/80 font-game font-bold text-sm text-slate-200 flex items-center justify-between active:scale-95 transition"
        >
          <div className="flex items-center gap-2">
            <span>🎮 MODE:</span>
            <span className="text-amber-400 uppercase font-extrabold tracking-wider">
              {selectedMode}
            </span>
          </div>
          <span className="text-xs text-slate-400">CHANGE ▾</span>
        </button>

        {/* Mode selector panel (when expanded) */}
        {showModeSelector && (
          <div className="p-2.5 rounded-2xl bg-slate-900/95 border border-slate-700 space-y-1.5 animate-in slide-in-from-top-2 duration-150">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  sounds.playClick();
                  onSelectMode(m.id);
                  setShowModeSelector(false);
                }}
                className={`w-full p-2.5 rounded-xl text-left flex items-start gap-2.5 transition ${
                  selectedMode === m.id
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-white'
                    : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span className="text-lg">{m.icon}</span>
                <div>
                  <div className="font-game font-bold text-xs">{m.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Additional Buttons: GAME MODES & HOW TO PLAY */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              setShowModeSelector(!showModeSelector);
            }}
            className="py-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 font-game font-bold text-xs text-slate-300 flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Award className="w-4 h-4 text-sky-400" />
            <span>GAME MODES</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenHowToPlay();
            }}
            className="py-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 font-game font-bold text-xs text-slate-300 flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>HOW TO PLAY</span>
          </button>
        </div>

        {/* Google AdSense Banner */}
        <AdBanner className="mt-1" />
      </div>
    </div>
  );
};
