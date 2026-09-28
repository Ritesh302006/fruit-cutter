import React, { useState } from 'react';
import { GameStats } from '../game/types';
import { Award, Check, Film, Heart, Home, RotateCcw, Share2, Sparkles, Trophy } from 'lucide-react';
import { sounds } from '../game/sound';
import { AdBanner } from './AdBanner';

interface GameOverModalProps {
  stats: GameStats;
  canRevive?: boolean;
  onWatchAdToRevive?: () => void;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  canRevive = false,
  onWatchAdToRevive,
  onPlayAgain,
  onHome,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    sounds.playClick();
    const shareText = `🍉 I scored ${stats.score.toLocaleString()} points with a max combo of x${stats.maxCombo} in Food Slice (${stats.mode.toUpperCase()})! Can you beat my score?`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Food Slice Mobile Game',
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-white text-center relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* New High Score Celebratory Banner */}
        {stats.isNewHighScore ? (
          <div className="mb-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-game font-extrabold text-xs shadow-lg shadow-amber-500/30 animate-pulse">
            <Trophy className="w-4 h-4 fill-current" />
            <span>🏆 NEW HIGH SCORE!</span>
          </div>
        ) : (
          <div className="mb-2 text-xs font-bold font-game uppercase tracking-widest text-slate-400">
            {stats.mode} Mode
          </div>
        )}

        <h1 className="text-3xl font-extrabold font-game tracking-wider text-rose-500 drop-shadow-[0_2px_12px_rgba(244,63,94,0.6)]">
          GAME OVER
        </h1>

        {/* Score Display Card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-inner flex flex-col gap-3">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 font-game">
              SCORE
            </div>
            <div className="text-4xl font-extrabold font-game text-white tracking-wide mt-0.5">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-700/50">
            <div className="p-2 rounded-xl bg-slate-900/60">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-game">
                BEST
              </div>
              <div className="text-lg font-bold font-game text-white">
                {stats.bestScore.toLocaleString()}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/60">
              <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider font-game">
                COMBO
              </div>
              <div className="text-lg font-bold font-game text-white">
                x{stats.maxCombo}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
            <span>🍉 {stats.slicedCount} fruits sliced</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          {/* Watch Ad to Revive Button */}
          {canRevive && onWatchAdToRevive && stats.mode !== 'timeAttack' && (
            <button
              onClick={() => {
                sounds.playClick();
                onWatchAdToRevive();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 font-game font-extrabold text-white text-sm shadow-lg shadow-orange-500/40 flex items-center justify-center gap-2 active:scale-95 transition animate-pulse"
            >
              <Film className="w-4 h-4" />
              <span>WATCH AD TO REVIVE (+1 ❤️)</span>
            </button>
          )}

          <button
            onClick={() => {
              sounds.playClick();
              onPlayAgain();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 font-game font-extrabold text-white text-base shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <RotateCcw className="w-5 h-5" />
            <span>🔄 PLAY AGAIN</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                onHome();
              }}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 font-game font-bold text-slate-300 hover:text-white text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Home className="w-4 h-4" />
              <span>🏠 MAIN MENU</span>
            </button>

            <button
              onClick={handleShare}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 font-game font-bold text-slate-300 hover:text-white text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-sky-400" />
                  <span>SHARE SCORE</span>
                </>
              )}
            </button>
          </div>

          {/* AdSense Ad Unit */}
          <AdBanner className="mt-2" />
        </div>
      </div>
    </div>
  );
};
