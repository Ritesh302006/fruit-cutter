import React, { useEffect, useState } from 'react';
import { Heart, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { sounds } from '../game/sound';

interface RewardedAdModalProps {
  onRewardEarned: () => void;
  onClose: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  onRewardEarned,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // Attempt to push AdSense ad
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {}

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClaim = () => {
    sounds.playCombo(3);
    onRewardEarned();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl text-white text-center relative overflow-hidden flex flex-col justify-between min-h-[380px]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold font-game uppercase tracking-wider text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Rewarded Sponsor Ad</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-slate-800 text-[11px] font-mono text-slate-300">
            {secondsLeft > 0 ? `Reward in ${secondsLeft}s` : 'Reward Ready! 🎉'}
          </div>
        </div>

        {/* Ad Unit Center */}
        <div className="my-auto py-4">
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 min-h-[160px] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Google AdSense container */}
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', minHeight: '120px' }}
              data-ad-client="ca-pub-6182995643181216"
              data-ad-slot="1234567890"
              data-ad-format="rectangle"
              data-full-width-responsive="true"
            />

            {/* Video preview aesthetic */}
            <div className="mt-2 text-center">
              <div className="text-3xl mb-1">🍉✨</div>
              <div className="text-sm font-game font-bold text-white">Food Slice Mobile Sponsor</div>
              <div className="text-xs text-slate-400 mt-0.5">Thank you for supporting Food Slice!</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {canSkip ? (
            <button
              onClick={handleClaim}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 font-game font-extrabold text-white text-base shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Heart className="w-5 h-5 text-rose-300 fill-rose-300" />
              <span>CLAIM REVIVAL (+1 LIFE)</span>
            </button>
          ) : (
            <div className="w-full py-3 rounded-2xl bg-slate-800/80 text-slate-400 font-game font-bold text-xs flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>Watching ad to claim revive ({secondsLeft}s)...</span>
            </div>
          )}

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="mt-2 text-xs text-slate-500 hover:text-slate-300 font-game py-1"
          >
            No thanks, skip reward
          </button>
        </div>
      </div>
    </div>
  );
};
