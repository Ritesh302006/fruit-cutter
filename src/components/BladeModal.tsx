import React from 'react';
import { BLADE_THEMES, BladeStyle } from '../game/types';
import { Check, Sparkles, X } from 'lucide-react';
import { sounds } from '../game/sound';

interface BladeModalProps {
  currentBlade: BladeStyle;
  onSelectBlade: (blade: BladeStyle) => void;
  onClose: () => void;
}

export const BladeModal: React.FC<BladeModalProps> = ({
  currentBlade,
  onSelectBlade,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-extrabold font-game text-white">BLADE DOJO</h2>
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

        <p className="text-xs text-slate-400 mt-2">
          Choose your blade's glowing slice trail and spark effects:
        </p>

        <div className="mt-4 space-y-2.5">
          {Object.values(BLADE_THEMES).map((theme) => {
            const isSelected = currentBlade === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  sounds.playSlice(1.2);
                  onSelectBlade(theme.id);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg'
                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Color preview orb */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${theme.glowColor}, ${theme.sparkColor})`,
                    }}
                  >
                    <div
                      className="w-6 h-0.5 rounded-full rotate-45"
                      style={{ backgroundColor: theme.coreColor }}
                    />
                  </div>
                  <div>
                    <h3 className="font-game font-bold text-white text-sm">{theme.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{theme.description}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 font-game font-extrabold text-white text-base shadow-lg shadow-emerald-500/30 active:scale-95 transition"
        >
          Equip Blade
        </button>
      </div>
    </div>
  );
};
