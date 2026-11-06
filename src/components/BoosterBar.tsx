import React from 'react';
import { RotateCcw, Shuffle, Zap, Eye } from 'lucide-react';
import { BoostersState, Language } from '../types/game';
import { TRANSLATIONS } from '../i18n/translations';

interface BoosterBarProps {
  boosters: BoostersState;
  onUndo: () => void;
  onShuffle: () => void;
  onExtract: () => void;
  onHint: () => void;
  canUndo: boolean;
  canExtract: boolean;
  lang?: Language;
}

export const BoosterBar: React.FC<BoosterBarProps> = ({
  boosters,
  onUndo,
  onShuffle,
  onExtract,
  onHint,
  canUndo,
  canExtract,
  lang = 'ru',
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-4 my-2 select-none w-full max-w-lg px-2">
      {/* 1. Extract 3 to Shelf */}
      <button
        onClick={onExtract}
        disabled={!canExtract || boosters.extract <= 0}
        className={`group relative flex-1 flex flex-col items-center justify-center py-2 px-1.5 rounded-2xl border-2 transition-all active:scale-95 shadow-lg ${
          canExtract && boosters.extract > 0
            ? 'bg-gradient-to-b from-cyan-900 to-slate-950 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-125'
            : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
        }`}
        title={`${t.boosterExtractDesc} [1]`}
      >
        <Zap className="w-5 h-5 text-cyan-400 mb-0.5" />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1">
          {t.boosterExtract}
          <span className="hidden sm:inline-block px-1 rounded bg-cyan-950 text-cyan-300 text-[9px] font-mono border border-cyan-500/30">1</span>
        </span>
        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-cyan-500 text-slate-950 border border-white/20 shadow">
          {boosters.extract}
        </span>
      </button>

      {/* 2. Undo Move */}
      <button
        onClick={onUndo}
        disabled={!canUndo || boosters.undo <= 0}
        className={`group relative flex-1 flex flex-col items-center justify-center py-2 px-1.5 rounded-2xl border-2 transition-all active:scale-95 shadow-lg ${
          canUndo && boosters.undo > 0
            ? 'bg-gradient-to-b from-amber-900 to-slate-950 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:brightness-125'
            : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
        }`}
        title={`${t.boosterUndoDesc} [2]`}
      >
        <RotateCcw className="w-5 h-5 text-amber-400 mb-0.5" />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1">
          {t.boosterUndo}
          <span className="hidden sm:inline-block px-1 rounded bg-amber-950 text-amber-300 text-[9px] font-mono border border-amber-500/30">2</span>
        </span>
        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 border border-white/20 shadow">
          {boosters.undo}
        </span>
      </button>

      {/* 3. Shuffle Board */}
      <button
        onClick={onShuffle}
        disabled={boosters.shuffle <= 0}
        className={`group relative flex-1 flex flex-col items-center justify-center py-2 px-1.5 rounded-2xl border-2 transition-all active:scale-95 shadow-lg ${
          boosters.shuffle > 0
            ? 'bg-gradient-to-b from-purple-900 to-slate-950 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:brightness-125'
            : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
        }`}
        title={`${t.boosterShuffleDesc} [3]`}
      >
        <Shuffle className="w-5 h-5 text-purple-400 mb-0.5" />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1">
          {t.boosterShuffle}
          <span className="hidden sm:inline-block px-1 rounded bg-purple-950 text-purple-300 text-[9px] font-mono border border-purple-500/30">3</span>
        </span>
        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-purple-500 text-white border border-white/20 shadow">
          {boosters.shuffle}
        </span>
      </button>

      {/* 4. Oracle Hint */}
      <button
        onClick={onHint}
        className="group relative flex-1 flex flex-col items-center justify-center py-2 px-1.5 rounded-2xl border-2 transition-all active:scale-95 shadow-lg bg-gradient-to-b from-indigo-900 to-slate-950 border-indigo-400 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:brightness-125"
        title="Oracle Hint [4]"
      >
        <Eye className="w-5 h-5 text-indigo-400 mb-0.5" />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1">
          {lang === 'ru' ? 'Оракул' : 'Oracle'}
          <span className="hidden sm:inline-block px-1 rounded bg-indigo-950 text-indigo-300 text-[9px] font-mono border border-indigo-500/30">4</span>
        </span>
        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-yellow-400 text-slate-950 border border-white/20 shadow">
          ∞
        </span>
      </button>
    </div>
  );
};
