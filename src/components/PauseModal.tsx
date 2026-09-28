import React from 'react';
import { Home, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../game/sound';

interface PauseModalProps {
  score: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  score,
  isMuted,
  onToggleMute,
  onResume,
  onRestart,
  onHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xs rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-white text-center">
        <div className="text-3xl mb-1">⏸️</div>
        <h2 className="text-2xl font-extrabold font-game text-white tracking-wide">GAME PAUSED</h2>
        <p className="text-xs text-amber-400 font-game font-bold mt-1">CURRENT SCORE: {score.toLocaleString()}</p>

        <div className="mt-6 space-y-3">
          {/* Resume */}
          <button
            onClick={() => {
              sounds.playClick();
              onResume();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 font-game font-extrabold text-white text-base shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>RESUME</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sounds.playClick();
              onRestart();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 font-game font-bold text-slate-200 text-sm flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 font-game font-bold text-slate-200 text-sm flex items-center justify-center gap-2 active:scale-95 transition"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>SOUND: OFF</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>SOUND: ON</span>
              </>
            )}
          </button>

          {/* Main Menu */}
          <button
            onClick={() => {
              sounds.playClick();
              onHome();
            }}
            className="w-full py-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 font-game font-semibold text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
