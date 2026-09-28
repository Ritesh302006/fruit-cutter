import React from 'react';
import { GameMode } from '../game/types';
import { Heart, Pause, Trophy, Volume2, VolumeX, Zap } from 'lucide-react';
import { sounds } from '../game/sound';

interface HUDProps {
  score: number;
  bestScore: number;
  combo: number;
  lives: number;
  maxLives: number;
  mode: GameMode;
  timeLeft: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  bestScore,
  combo,
  lives,
  maxLives,
  mode,
  timeLeft,
  isMuted,
  onToggleMute,
  onPause,
}) => {
  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none z-20 flex flex-col justify-between pt-safe px-4 select-none">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: Score & Best */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400/90 font-game">
              Score
            </span>
            {combo > 1 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-game font-bold text-xs shadow-lg shadow-orange-500/40 animate-bounce">
                <Zap className="w-3 h-3 fill-current text-yellow-200" />
                x{combo}
              </span>
            )}
          </div>
          <div className="font-game text-3xl font-extrabold text-white tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {score.toLocaleString()}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 drop-shadow">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>BEST {bestScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Center: Mode Indicator or Timer */}
        <div className="flex flex-col items-center">
          {mode === 'timeAttack' ? (
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-2xl border font-game font-extrabold text-lg shadow-xl backdrop-blur-md transition-all ${
                timeLeft <= 10
                  ? 'bg-rose-500/30 border-rose-500 text-rose-400 animate-pulse scale-105'
                  : 'bg-slate-900/60 border-slate-700/80 text-white'
              }`}
            >
              <span>⏱️</span>
              <span>{timeLeft}s</span>
            </div>
          ) : (
            <div className="px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
              {mode}
            </div>
          )}
        </div>

        {/* Right: Controls & Lives */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Sound Toggle */}
            <button
              onClick={() => {
                sounds.playClick();
                onToggleMute();
              }}
              aria-label="Toggle Sound"
              className="w-10 h-10 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-lg active:scale-90 hover:bg-slate-850 transition"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Pause Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onPause();
              }}
              aria-label="Pause Game"
              className="w-10 h-10 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-lg active:scale-90 hover:bg-slate-850 transition"
            >
              <Pause className="w-4 h-4 fill-current text-white" />
            </button>
          </div>

          {/* Lives (Classic & Endless mode) */}
          {mode !== 'timeAttack' && (
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-white/10 backdrop-blur-sm">
              {Array.from({ length: maxLives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 transition-all duration-300 ${
                    i < lives
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] scale-100'
                      : 'text-slate-600 fill-slate-800 scale-90 opacity-40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
