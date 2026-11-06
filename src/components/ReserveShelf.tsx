import React from 'react';
import { TileItemData, Language } from '../types/game';
import { CosmicCardFrame, CosmicCardImage } from './CosmicCards';

interface ReserveShelfProps {
  tiles: TileItemData[];
  onTileClick: (tile: TileItemData) => void;
  lang?: Language;
}

export const ReserveShelf: React.FC<ReserveShelfProps> = ({
  tiles,
  onTileClick,
  lang = 'ru',
}) => {
  if (tiles.length === 0) return null;

  return (
    <div className="flex flex-col items-center mb-2 select-none">
      <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-3 py-0.5 rounded-full mb-1 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
        {lang === 'ru'
          ? '⚡ КВАНТОВЫЙ РЕЗЕРВ (нажми, чтобы вернуть в слот)'
          : '⚡ QUANTUM RESERVE (click to return to slot)'}
      </div>
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border-2 border-indigo-500/40 shadow-2xl">
        {tiles.map((tile) => {
          return (
            <div
              key={tile.id}
              onClick={() => onTileClick(tile)}
              className="w-12 h-14 sm:w-14 sm:h-16 cursor-pointer transition-all hover:-translate-y-1 active:translate-y-0 active:scale-95"
            >
              <CosmicCardFrame type={tile.type} className="h-full w-full">
                <CosmicCardImage type={tile.type} isCovered={false} />
              </CosmicCardFrame>
            </div>
          );
        })}
      </div>
    </div>
  );
};
