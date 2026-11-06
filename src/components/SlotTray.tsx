import React from 'react';
import { TileItemData, Language } from '../types/game';
import { CosmicCardImage, getCardMeta } from './CosmicCards';

interface SlotTrayProps {
  slots: TileItemData[];
  maxSlots?: number;
  matchingIds?: string[];
  lang?: Language;
}

export const SlotTray: React.FC<SlotTrayProps> = ({
  slots,
  maxSlots = 7,
  matchingIds = [],
  lang = 'ru',
}) => {
  const isDanger = slots.length >= maxSlots - 1;

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-xl px-2">
      {/* 7-Slot Quantum Hextech Tray */}
      <div
        className={`relative flex items-center justify-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-2xl border-2 transition-all duration-200 shadow-2xl backdrop-blur-md w-full ${
          isDanger
            ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)] ring-2 ring-rose-400 animate-pulse'
            : 'bg-slate-950/85 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
        }`}
      >
        {Array.from({ length: maxSlots }).map((_, idx) => {
          const tile = slots[idx];
          const isMatching = tile && matchingIds.includes(tile.id);
          const meta = tile ? getCardMeta(tile.type) : null;

          return (
            <div
              key={idx}
              className="relative flex-1 max-w-[58px] aspect-[4/5] rounded-md flex items-center justify-center bg-black border border-cyan-500/20 shadow-inner"
            >
              {tile && (
                <div
                  className={`relative w-full h-full rounded-lg flex items-center justify-center bg-black border-2 shadow-md transform transition-all duration-150 ${
                    isMatching
                      ? 'scale-110 bg-amber-400/40 border-yellow-300 shadow-[0_0_20px_rgba(250,204,21,1)] animate-bounce'
                      : 'scale-100'
                  }`}
                  style={{
                    borderColor: meta ? meta.accentColor : '#38bdf8',
                    backgroundColor: '#030303',
                  }}
                >
                  <CosmicCardImage type={tile.type} isCovered={false} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Slots Counter Badge */}
      <div className="mt-1 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-bold text-slate-300 shadow-md">
        <span className="text-cyan-400 font-mono text-[10px] sm:text-[11px]">
          {lang === 'ru' ? 'СТАЗИС-СЛОТЫ:' : 'STASIS SLOTS:'}
        </span>
        <span
          className={`font-mono tabular-nums ${
            isDanger ? 'text-rose-400 font-black animate-pulse' : 'text-emerald-400 font-bold'
          }`}
        >
          {slots.length} / {maxSlots}
        </span>
      </div>
    </div>
  );
};
