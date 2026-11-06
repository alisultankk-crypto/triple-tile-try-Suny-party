import React from 'react';
import { RotateCcw, Shuffle, X, Zap } from 'lucide-react';
import { Language, TileType } from '../types/game';
import { CAMPAIGN_TILE_TYPES, CosmicCardImage, getCardMeta } from './CosmicCards';

export type BoosterPurchase = 'undo' | 'shuffle' | 'extract';

export const SHOP_PRICES: Record<BoosterPurchase, number> = {
  undo: 80,
  shuffle: 100,
  extract: 120,
};

export const EXTRA_SLOT_PRICE = 5000;
export const MEOW_CARD_PRICE = 75;

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  gold: number;
  extraSlotOwned: boolean;
  unlockedMeows: TileType[];
  lang: Language;
  onBuyBooster: (booster: BoosterPurchase) => void;
  onBuyExtraSlot: () => void;
  onBuyMeow: (type: TileType) => void;
}

const BOOSTER_ITEMS = [
  { id: 'undo', labelRu: 'Отмена ×2', labelEn: 'Undo ×2', icon: RotateCcw },
  { id: 'shuffle', labelRu: 'Перемешать ×1', labelEn: 'Shuffle ×1', icon: Shuffle },
  { id: 'extract', labelRu: 'Вынуть ×1', labelEn: 'Extract ×1', icon: Zap },
] as const;

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  gold,
  extraSlotOwned,
  unlockedMeows,
  lang,
  onBuyBooster,
  onBuyExtraSlot,
  onBuyMeow,
}) => {
  if (!isOpen) return null;
  const isRu = lang === 'ru';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-md">
      <section className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-3xl border-2 border-amber-400/50 bg-slate-950 p-4 text-white shadow-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-amber-200">{isRu ? 'Магазин' : 'Shop'}</h2>
            <p className="text-sm font-bold text-yellow-300">🪙 {gold.toLocaleString()}</p>
          </div>
          <button onClick={onClose} aria-label={isRu ? 'Закрыть' : 'Close'} className="rounded-xl p-2 text-slate-300 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-2">
          {BOOSTER_ITEMS.map(({ id, labelRu, labelEn, icon: Icon }) => {
            const price = SHOP_PRICES[id];
            return (
              <button
                key={id}
                onClick={() => onBuyBooster(id)}
                disabled={gold < price}
                className="flex items-center justify-between rounded-2xl border border-cyan-500/30 bg-slate-900 px-3 py-3 text-left transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-cyan-300" />
                  <span className="font-bold">{isRu ? labelRu : labelEn}</span>
                </span>
                <span className="font-black text-yellow-300">🪙 {price}</span>
              </button>
            );
          })}
          <button
            onClick={onBuyExtraSlot}
            disabled={extraSlotOwned || gold < EXTRA_SLOT_PRICE}
            className="flex items-center justify-between rounded-2xl border-2 border-amber-400/70 bg-gradient-to-r from-amber-950 to-slate-900 px-3 py-4 text-left transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>
              <span className="block font-black text-amber-200">{isRu ? '+1 слот лотка' : '+1 tray slot'}</span>
              <span className="text-xs text-slate-300">
                {extraSlotOwned
                  ? isRu ? 'Уже куплено' : 'Already purchased'
                  : isRu ? 'Постоянное улучшение' : 'Permanent upgrade'}
              </span>
            </span>
            <span className="font-black text-yellow-300">{extraSlotOwned ? '✓' : `🪙 ${EXTRA_SLOT_PRICE.toLocaleString()}`}</span>
          </button>
        </div>
        <div className="mt-5 border-t border-cyan-500/20 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-black text-fuchsia-200">{isRu ? 'Звуки артефактов' : 'Artifact sounds'}</h3>
            <span className="text-xs text-slate-400">{isRu ? 'Открой магический звук для каждой карты' : 'Unlock a unique magic chime for each card'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CAMPAIGN_TILE_TYPES.map((type) => {
              const meta = getCardMeta(type);
              const owned = unlockedMeows.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => onBuyMeow(type)}
                  disabled={owned || gold < MEOW_CARD_PRICE}
                  title={meta.name}
                  className="flex min-w-0 items-center gap-2 border border-fuchsia-500/25 bg-black p-2 text-left transition hover:border-fuchsia-300 disabled:cursor-default disabled:opacity-55"
                >
                  <CosmicCardImage type={type} />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold">{meta.name}</span>
                    <span className={`block text-[10px] font-black ${owned ? 'text-emerald-300' : 'text-yellow-300'}`}>
                      {owned ? (isRu ? 'Куплено' : 'Unlocked') : `🪙 ${MEOW_CARD_PRICE}`}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
