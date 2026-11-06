import React from 'react';
import { MagicEffectType, TileType } from '../types/game';

interface CardMeta {
  name: string;
  accentColor: string;
  glowColor: string;
  magic: MagicEffectType;
  kind: number;
  variant: number;
}

const TYPES: TileType[] = [
  'yasuo', 'ahri', 'jinx', 'teemo', 'garen', 'zed', 'blitzcrank', 'vi', 'ashe', 'darius', 'asol', 'lux', 'heimer', 'katarina',
  'nebula', 'comet', 'satellite', 'ufo', 'moon', 'sun', 'mars', 'saturn', 'blackhole', 'galaxy', 'astronaut', 'rocket', 'telescope',
  'meteor', 'starship', 'crystal', 'portal', 'rover', 'aurora', 'pulsar', 'quasar', 'stardust', 'eclipse', 'probe', 'spacewhale',
  'cosmicflower', 'ringworld', 'constellation',
];

const CARD_NAMES = [
  'Клинок ветра', 'Магический амулет', 'Банка искр', 'Лесная руна', 'Золотой щит', 'Теневой сюрикен',
  'Медный голем', 'Перчатка грома', 'Ледяной лук', 'Боевой топор', 'Звёздный глобус', 'Призма света',
  'Часовой механизм', 'Рубиновый кинжал', 'Туманная сфера', 'Падающая звезда', 'Орбитальный ключ', 'Лунный эликсир',
  'Серебряная маска', 'Солнечный идол', 'Красный кристалл', 'Кольцо планет', 'Пустотный осколок', 'Астральный фолиант',
  'Шлем странника', 'Ракетный модуль', 'Дальний окуляр', 'Метеоритный молот', 'Корабль в бутылке',
  'Кристалл портала', 'Врата измерений', 'Рунный вездеход', 'Северное сияние', 'Пульсарный жезл',
  'Квазарный кубок', 'Звёздная пыль', 'Затменный диск', 'Поисковый зонд', 'Космическая раковина',
  'Зачарованный цветок', 'Кольцо миров', 'Карта созвездий',
];

const COLORS = [
  '#47e0c1', '#ff7b55', '#ffcf44', '#a7e35b', '#f1c96a', '#bd79ff', '#42d8ee',
  '#ff5e8a', '#71b9ff', '#e88a4d', '#a793ff', '#f5ec9a', '#62d1a5', '#ff566c',
  '#61d8e8', '#ffd260', '#7eb8ff', '#d2a4ff', '#d5e5ff', '#ff9b45', '#ef5448',
  '#64cfcb', '#ce71ff', '#f0d477', '#a9dbef', '#ff8b57', '#89cafa', '#f29253',
  '#a2d5ff', '#73e6d2', '#ce8dff', '#9cda6b', '#f48acb', '#f6c55f', '#89aaff',
  '#e88d73', '#8cd5ee', '#bbadff', '#ffbe66', '#78e1be', '#dd83f2', '#f3e18b',
];

const EFFECTS: MagicEffectType[] = ['wind', 'arcane', 'fire', 'frost', 'starlight', 'void'];

export const CAMPAIGN_TILE_TYPES = TYPES;

export const CARD_METAS = Object.fromEntries(
  TYPES.map((type, index) => {
    const accentColor = COLORS[index];
    return [
      type,
      {
        name: CARD_NAMES[index],
        accentColor,
        glowColor: `${accentColor}88`,
        magic: EFFECTS[index % EFFECTS.length],
        kind: index % 14,
        variant: Math.floor(index / 14),
      } satisfies CardMeta,
    ];
  })
) as Record<TileType, CardMeta>;

export const CAT_CARD_METAS = CARD_METAS;

export function getCardMeta(type: TileType): CardMeta {
  return CARD_METAS[type];
}

export const CosmicCardFrame: React.FC<{
  type: TileType;
  children: React.ReactNode;
  className?: string;
  isCovered?: boolean;
  isHinted?: boolean;
  isMatching?: boolean;
}> = ({
  type,
  children,
  className = '',
  isCovered = false,
  isHinted = false,
  isMatching = false,
}) => {
  const meta = getCardMeta(type);
  const frameColor = isHinted ? '#fde047' : isMatching ? '#fef08a' : meta.accentColor;
  return (
    <div
      className={`relative overflow-hidden rounded-[12px] p-[2px] transition-all duration-200 ${className}`}
      style={{
        background: `linear-gradient(145deg, #f8edc8 0%, ${frameColor} 24%, #25324a 55%, color-mix(in srgb, ${frameColor} 72%, white) 100%)`,
        boxShadow: isHinted
          ? '0 0 18px rgba(250,204,21,.75), inset 0 0 0 1px rgba(255,255,255,.55)'
          : isMatching
            ? '0 0 20px rgba(250,204,21,.85)'
            : `0 5px 0 #02040b, 0 8px 16px color-mix(in srgb, ${meta.accentColor} 42%, transparent)`,
      }}
    >
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] border border-white/10"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, color-mix(in srgb, ${meta.accentColor} 28%, #242034) 0%, #171521 48%, #090a12 100%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-x-1 top-[3px] h-px bg-gradient-to-r from-transparent via-white/65 to-transparent" />
        <div className="pointer-events-none absolute left-[4px] top-[4px] h-1 w-1 rounded-full bg-white/80 shadow-[0_0_5px_rgba(255,255,255,.8)]" />
        <div
          className="pointer-events-none absolute bottom-[4px] right-[4px] h-1 w-1 rounded-full"
          style={{ backgroundColor: meta.accentColor, boxShadow: `0 0 6px ${meta.accentColor}` }}
        />
        <div className={isCovered ? 'scale-95 opacity-45 grayscale-[0.2]' : 'drop-shadow-[0_4px_5px_rgba(0,0,0,.7)]'}>
          {children}
        </div>
        {isCovered && <div className="absolute inset-0 rounded-[10px] bg-slate-950/60" />}
      </div>
    </div>
  );
};

function RelicArtwork({ meta, index, gradientId }: { meta: CardMeta; index: number; gradientId: string }) {
  const color = `url(#${gradientId})`;
  const dark = '#172033';
  const gold = '#ffe29a';
  const side = index % 2 ? '#f7cb68' : '#c8b7ff';

  const artwork = (() => {
    switch (meta.kind) {
      case 0:
        return <><path d="M32 5 41 25 37 43 32 59 27 43 23 25Z" fill={color} stroke={gold} strokeWidth="2" /><path d="m27 28 10 5-5 17-5-17 10-5" fill="none" stroke="#fff7d1" strokeWidth="2" /><path d="M24 13 32 5l8 8" fill="none" stroke="#fff" strokeWidth="1.5" /></>;
      case 1:
        return <><circle cx="32" cy="33" r="20" fill={dark} stroke={gold} strokeWidth="2" /><circle cx="32" cy="33" r="14" fill={color} stroke="#fff0b5" strokeWidth="1.5" /><path d="M11 33q10-15 21 0t21 0M32 12q-13 10 0 21t0 21" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="2" /><circle cx="32" cy="33" r="4" fill="#fff" /></>;
      case 2:
        return <><path d="M21 13h22l-3 29-8 12-8-12Z" fill={color} stroke={gold} strokeWidth="2" /><path d="M23 18h18M25 35h14" stroke="#fff" strokeWidth="2" /><path d="m16 20-6 8 8 3m30-11 6 8-8 3" fill="none" stroke={side} strokeWidth="3" /><circle cx="32" cy="31" r="5" fill="#fff" /></>;
      case 3:
        return <><path d="M32 5 38 25 56 33 38 39 32 59 26 39 8 33 26 25Z" fill={color} stroke={gold} strokeWidth="2" /><path d="m32 14 4 15 13 4-13 4-4 14-4-14-13-4 13-4Z" fill="none" stroke="#fff" strokeWidth="2" /><circle cx="32" cy="33" r="4" fill="#fff" /></>;
      case 4:
        return <><path d="M12 19 32 9l20 10-3 28-17 10-17-10Z" fill={color} stroke={gold} strokeWidth="2" /><path d="M16 21 32 15l16 6M16 25l16 7 16-7M32 32v20" fill="none" stroke="#fff" strokeWidth="2" /><path d="m24 37 8-5 8 5-8 6Z" fill="#fff2b0" /></>;
      case 5:
        return <><path d="M32 7 48 25 40 31 52 42 32 57 12 42 24 31 16 25Z" fill={color} stroke={gold} strokeWidth="2" /><path d="m32 13-7 19 8-4-1 18 7-20-8 4Z" fill="#fff" /><circle cx="32" cy="32" r="4" fill="#ffd766" /></>;
      case 6:
        return <><path d="M17 25 24 13h16l7 12-4 22-11 9-11-9Z" fill={color} stroke={gold} strokeWidth="2" /><path d="M20 28h24M22 35h20M25 43h14" stroke="#fff" strokeWidth="2" /><circle cx="32" cy="25" r="5" fill="#8bf5ff" stroke="#fff" /></>;
      case 7:
        return <><path d="m18 18 14-9 14 9-4 30-10 8-10-8Z" fill={color} stroke={gold} strokeWidth="2" /><path d="m23 24 9-7 9 7-3 17-6 7-6-7Z" fill={dark} stroke="#fff" strokeWidth="1.5" /><path d="M27 29q5-6 10 0v8q-5 6-10 0Z" fill="#ffb766" /><circle cx="32" cy="33" r="3" fill="#fff" /></>;
      case 8:
        return <><path d="m8 24 20-8 10 3 19-9-13 23-5 6-22 12Z" fill={color} stroke={gold} strokeWidth="2" /><path d="m16 41 18-13m-4 19 18-22" stroke="#fff" strokeWidth="2" /><path d="m37 18 6 11" stroke="#f87171" strokeWidth="3" /></>;
      case 9:
        return <><path d="M32 7 52 47 32 57 12 47Z" fill={color} stroke={gold} strokeWidth="2" /><path d="m32 14 12 30-12 6-12-6Z" fill={dark} stroke="#fff" strokeWidth="1.5" /><path d="m32 19 5 13-5 12-5-12Z" fill="#ffc85c" /><path d="M13 46h38" stroke="#fff" strokeWidth="2" /></>;
      case 10:
        return <><path d="M32 7 54 32 32 57 10 32Z" fill={color} stroke={gold} strokeWidth="2" /><path d="M32 13 47 32 32 51 17 32Z" fill={dark} stroke="#fff" strokeWidth="1.5" /><path d="m32 17 10 15-10 15-10-15Z" fill={color} /><circle cx="32" cy="32" r="5" fill="#fff" /></>;
      case 11:
        return <><path d="M13 13h26l12 12v26H13Z" fill={color} stroke={gold} strokeWidth="2" /><path d="M39 13v13h12M21 32h22M21 39h18M21 46h22" stroke="#fff" strokeWidth="2" /><path d="m24 22 4 5 5-8" fill="none" stroke="#ffdc70" strokeWidth="2" /></>;
      case 12:
        return <><circle cx="32" cy="32" r="20" fill="none" stroke={gold} strokeWidth="5" /><circle cx="32" cy="32" r="12" fill={color} stroke="#fff" strokeWidth="2" /><ellipse cx="32" cy="32" rx="28" ry="9" fill="none" stroke={side} strokeWidth="3" transform="rotate(-32 32 32)" /><circle cx="52" cy="17" r="4" fill="#fff" /></>;
      default:
        return <><path d="m32 6 7 16 17 3-13 12 3 18-14-9-14 9 3-18L8 25l17-3Z" fill={color} stroke={gold} strokeWidth="2" /><circle cx="32" cy="31" r="7" fill="#fff" /><path d="M32 15v7m0 20v7M16 31h7m18 0h7" stroke="#fff" strokeWidth="2" /></>;
    }
  })();

  const sparks = Array.from({ length: 4 }, (_, spark) => {
    const angle = (index * 29 + spark * 90) * Math.PI / 180;
    return { x: 32 + Math.cos(angle) * 25, y: 32 + Math.sin(angle) * 25 };
  });

  return (
    <svg viewBox="0 0 64 64" role="img" aria-label={meta.name} className="h-12 w-12 select-none overflow-visible sm:h-[52px] sm:w-[52px]">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff4c2" />
          <stop offset=".22" stopColor={meta.accentColor} />
          <stop offset=".7" stopColor={meta.accentColor} />
          <stop offset="1" stopColor="#272237" />
        </linearGradient>
        <radialGradient id={`${gradientId}-halo`}>
          <stop offset="0" stopColor={meta.accentColor} stopOpacity=".4" />
          <stop offset="1" stopColor={meta.accentColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${gradientId}-halo)`} />
      {sparks.map((spark, sparkIndex) => (
        <path key={sparkIndex} d={`M${spark.x} ${spark.y - 2}v4m-2-2h4`} stroke="#fff4c2" strokeOpacity=".8" strokeWidth="1" />
      ))}
      <g transform={`rotate(${(index * 19) % 19 - 9} 32 32)`}>{artwork}</g>
      <path d="M9 49q23-7 46 0" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="1" />
    </svg>
  );
}

export const CosmicCardImage: React.FC<{ type: TileType; isCovered?: boolean }> = ({
  type,
  isCovered = false,
}) => {
  const index = TYPES.indexOf(type);
  const meta = getCardMeta(type);
  const gradientId = `relic-${index}`;
  return (
    <div className={isCovered ? 'opacity-65 grayscale-[0.3]' : ''}>
      <RelicArtwork meta={meta} index={index} gradientId={gradientId} />
    </div>
  );
};
