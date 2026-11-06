import React from 'react';
import { TileItemData } from '../types/game';
import { CosmicCardImage, getCardMeta } from './CosmicCards';

interface TileItemProps {
  tile: TileItemData;
  onClick?: (tile: TileItemData) => void;
  style?: React.CSSProperties;
  className?: string;
  isHinted?: boolean;
}

export const TileItem: React.FC<TileItemProps> = ({
  tile,
  onClick,
  style,
  className = '',
  isHinted = false,
}) => {
  const isClickable = !tile.isCovered && !tile.inSlot && !tile.inShelf;
  const meta = getCardMeta(tile.type);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isClickable && onClick) {
      onClick(tile);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={style}
      className={`absolute w-12 h-14 rounded-lg transition-all duration-150 select-none ${
        isClickable
          ? 'cursor-pointer hover:-translate-y-1 active:translate-y-0 active:scale-95 z-20'
          : 'cursor-not-allowed pointer-events-none'
      } ${className}`}
    >
      {/* 3D Cosmic Hextech Tile Chassis */}
      <div
        className={`relative w-full h-full rounded-lg flex items-center justify-center border-2 transition-all duration-200 ${
          isClickable
            ? isHinted
              ? 'bg-black border-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.9)] ring-2 ring-yellow-400 animate-pulse'
              : 'bg-black border-[#64748b] shadow-[0_4px_0_#020617,0_8px_16px_rgba(56,189,248,0.18)] hover:border-[#38bdf8] hover:shadow-[0_4px_0_#020617,0_10px_22px_rgba(56,189,248,0.36)]'
            : 'bg-black border-[#334155] shadow-[0_3px_0_#020617]'
        }`}
        style={{
          borderColor: isClickable && !isHinted ? meta.accentColor : undefined,
          backgroundColor: '#030303',
          boxShadow: isClickable && !isHinted ? `0 4px 0 #030712, 0 6px 14px ${meta.glowColor}` : undefined,
        }}
      >
        <div
          className={`transform transition-transform ${
            isClickable ? 'scale-100' : 'scale-95'
          }`}
        >
          <CosmicCardImage type={tile.type} isCovered={tile.isCovered} />
        </div>

        {/* Dimming Layer when covered by higher tiles */}
        {tile.isCovered && (
          <div className="absolute inset-0 rounded-lg bg-slate-950/70 backdrop-blur-[0.5px]" />
        )}
      </div>
    </div>
  );
};
