import React from 'react';
import { TileItemData } from '../types/game';
import { CosmicCardFrame, CosmicCardImage } from './CosmicCards';

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
      <CosmicCardFrame
        type={tile.type}
        isCovered={tile.isCovered}
        isHinted={isHinted}
        className={`h-full w-full ${isClickable ? 'hover:-translate-y-0.5' : ''} ${isHinted ? 'animate-pulse' : ''}`}
      >
        <CosmicCardImage type={tile.type} isCovered={tile.isCovered} />
      </CosmicCardFrame>
    </div>
  );
};
