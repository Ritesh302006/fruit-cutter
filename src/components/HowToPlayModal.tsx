import React from 'react';
import { Award, Bomb, Flame, Hand, Heart, Sparkles, X } from 'lucide-react';
import { sounds } from '../game/sound';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍉</span>
            <h2 className="text-xl font-extrabold font-game text-emerald-400">HOW TO PLAY</h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          {/* Rule 1: Swipe to Slice */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-game font-bold text-emerald-300 text-sm">Swipe To Slice</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Drag your finger swiftly across flying foods to slice them in half. Do NOT tap—swipe through them!
              </p>
            </div>
          </div>

          {/* Rule 2: Combos */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-game font-bold text-amber-300 text-sm">Combos & Multipliers</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Slice 2 or more foods with one swipe or in rapid succession to unlock high combo bonuses!
              </p>
            </div>
          </div>

          {/* Rule 3: Bombs */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
              <Bomb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-game font-bold text-rose-400 text-sm">Avoid Bombs! 💣</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Slicing a bomb triggers an explosion. In Classic, you lose a life; in Time Attack, you lose 10 seconds!
              </p>
            </div>
          </div>

          {/* Modes summary */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 space-y-2 text-xs text-slate-300">
            <div className="font-game font-bold text-sky-400 flex items-center gap-1.5 text-sm">
              <Award className="w-4 h-4" /> Game Modes
            </div>
            <div>
              <strong className="text-white">Classic:</strong> 3 lives. Missing a fruit or slicing a bomb costs a life.
            </div>
            <div>
              <strong className="text-white">Time Attack:</strong> 60s clock. Rapid waves. Highest score wins!
            </div>
            <div>
              <strong className="text-white">Endless:</strong> Unlimited time. Missed fruits are free, but bombs are lethal!
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 font-game font-extrabold text-white text-base shadow-lg shadow-emerald-500/30 active:scale-95 transition"
        >
          Got It, Let's Slice!
        </button>
      </div>
    </div>
  );
};
