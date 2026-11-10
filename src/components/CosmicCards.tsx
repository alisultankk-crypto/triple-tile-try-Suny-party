import React from 'react';
import { MagicEffectType, TileType } from '../types/game';
import { CHALLENGE_CARD_COLORS, HorrorCardArtwork } from './ChallengeMode';

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
  'Рунный странник', 'Лунная провидица', 'Искровой механик', 'Моховой хранитель', 'Солнечный страж', 'Масочник теней',
  'Медный голем', 'Грозовой кулак', 'Ледяной следопыт', 'Багровый кузнец', 'Астральный оракул', 'Призматическая чародейка',
  'Шестерённый мастер', 'Рубиновая танцовщица', 'Туманная сфера', 'Падающая звезда', 'Орбитальный ключ', 'Лунный эликсир',
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

function OriginalHeroArtwork({ index, color }: { index: number; color: string }) {
  const ink = '#252338';
  const skin = '#ffd8b4';
  const eyes = <><ellipse cx="27" cy="31" rx="2" ry="3" fill={ink} /><ellipse cx="38" cy="31" rx="2" ry="3" fill={ink} /><path d="M29 39q4 3 8 0" fill="none" stroke="#9e5364" strokeWidth="1.8" strokeLinecap="round" /></>;
  const bust = <path d="M13 60q2-18 19-18t19 18Z" fill={color} stroke={ink} strokeWidth="3" strokeLinejoin="round" />;
  let portrait: React.ReactNode;

  switch (index) {
    case 0:
      portrait = <><path d="M12 60q2-22 20-22t20 22Z" fill="#39b9aa" stroke={ink} strokeWidth="3" /><path d="M16 33q-3-22 16-25 21 3 17 26l-8 9H23Z" fill="#40506d" stroke={ink} strokeWidth="3" /><ellipse cx="32" cy="31" rx="12" ry="14" fill={skin} stroke={ink} strokeWidth="2.5" />{eyes}<path d="m22 13 10 5 10-7m-13 34 3 8 3-8" fill="none" stroke="#ffe07b" strokeWidth="3" strokeLinecap="round" /></>;
    case 1:
      portrait = <><path d="M12 60q2-19 20-19t20 19Z" fill="#617be0" stroke={ink} strokeWidth="3" /><path d="M17 31Q15 9 32 8q18 2 15 23l-5 13H22Z" fill="#263e79" stroke={ink} strokeWidth="3" /><ellipse cx="32" cy="31" rx="11" ry="13" fill="#f3c8b7" stroke={ink} strokeWidth="2.5" />{eyes}<path d="M32 9q0-9 10-7-2 7-10 7Zm-3 3q-10-6-14 1 7 3 14-1Z" fill="#ffdc72" stroke={ink} strokeWidth="2" /><circle cx="32" cy="21" r="3" fill="#9be7f0" /></>;
    case 2:
      portrait = <><path d="M15 60V29q0-17 17-17t17 17v31Z" fill="#d58a45" stroke={ink} strokeWidth="3" /><rect x="20" y="21" width="24" height="23" rx="7" fill="#e7c77f" stroke={ink} strokeWidth="3" /><circle cx="27" cy="31" r="5" fill="#9ce8f1" stroke={ink} strokeWidth="2" /><circle cx="38" cy="31" r="5" fill="#9ce8f1" stroke={ink} strokeWidth="2" /><path d="M31 31h3m-4 9h5M20 17l-5-7m29 7 5-7M17 49h30" fill="none" stroke="#fff0a6" strokeWidth="3" strokeLinecap="round" /><circle cx="17" cy="50" r="3" fill="#66e5d4" /><circle cx="47" cy="50" r="3" fill="#66e5d4" /></>;
    case 3:
      portrait = <><path d="M11 60q3-20 21-20t21 20Z" fill="#538e58" stroke={ink} strokeWidth="3" /><path d="M18 37q-8-20 8-28 15-8 22 7 8 17-5 24Z" fill="#708e5b" stroke={ink} strokeWidth="3" /><ellipse cx="32" cy="32" rx="11" ry="12" fill="#d7bb8b" stroke={ink} strokeWidth="2.5" />{eyes}<path d="m18 18-7-5 10-1m24 3 8-7-1 13M21 47l-5 6m26-6 6 6" fill="none" stroke="#9cdb67" strokeWidth="4" strokeLinecap="round" /><path d="M26 27q2-3 4 0m7 0q2-3 4 0" fill="none" stroke="#547b43" strokeWidth="2" /></>;
    case 4:
      portrait = <><path d="M12 60q2-18 20-18t20 18Z" fill="#d69c36" stroke={ink} strokeWidth="3" /><path d="M17 30 20 14l12-8 12 8 3 16-7 12H24Z" fill="#e8b848" stroke={ink} strokeWidth="3" /><ellipse cx="32" cy="31" rx="10" ry="12" fill={skin} stroke={ink} strokeWidth="2.5" />{eyes}<path d="M32 7V2m-5 9 5-7 5 7m-17 5 8 3 8-3 8 3" fill="none" stroke="#fff2ab" strokeWidth="3" strokeLinecap="round" /><path d="M25 47h14" stroke="#fff0a2" strokeWidth="3" /></>;
    case 5:
      portrait = <><path d="M11 60q3-20 21-20t21 20Z" fill="#524771" stroke={ink} strokeWidth="3" /><path d="M15 37Q8 8 32 6q25 2 17 31L39 43 32 34l-8 10Z" fill="#29283d" stroke={ink} strokeWidth="3" /><path d="M20 28q12-9 24 0l-3 12q-9 7-18 0Z" fill="#7562a4" stroke={ink} strokeWidth="2" /><path d="m25 32 4 1m6 0 4-1" stroke="#76e8ee" strokeWidth="3" strokeLinecap="round" /><path d="M19 48 10 55m35-7 9 7" stroke="#b292ed" strokeWidth="3" /></>;
    case 6:
      portrait = <><path d="M12 60V31l8-6h24l8 6v29Z" fill="#b27a42" stroke={ink} strokeWidth="3" /><rect x="19" y="14" width="26" height="29" rx="5" fill="#d7a65d" stroke={ink} strokeWidth="3" /><circle cx="26" cy="27" r="3" fill="#7ef0dc" /><circle cx="38" cy="27" r="3" fill="#7ef0dc" /><path d="M27 36h10M16 32h-5m42 0h-5M23 18l3-7h12l3 7" fill="none" stroke="#4a3b3b" strokeWidth="3" strokeLinecap="round" /><circle cx="17" cy="51" r="3" fill="#f4cf67" /><circle cx="47" cy="51" r="3" fill="#f4cf67" /></>;
    case 7:
      portrait = <><path d="M13 60q0-20 19-20t19 20Z" fill="#4478bc" stroke={ink} strokeWidth="3" /><path d="M19 34q-3-18 13-22 17 3 14 22l-7 9H25Z" fill="#30456b" stroke={ink} strokeWidth="3" /><ellipse cx="32" cy="31" rx="11" ry="13" fill="#f0c4a6" stroke={ink} strokeWidth="2.5" />{eyes}<path d="M12 45 8 34l9-8 8 8-6 13Zm40 0 4-11-9-8-8 8 6 13Z" fill="#6fe0ed" stroke={ink} strokeWidth="2.5" /><path d="m8 34 5-3m43-3-5 3" stroke="#fff" strokeWidth="2" /></>;
    case 8:
      portrait = <><path d="M11 60q3-19 21-19t21 19Z" fill="#6ab7dc" stroke={ink} strokeWidth="3" /><path d="M15 38Q7 17 24 7q17-7 26 12l-6 24-8-7H23Z" fill="#e5f6f7" stroke={ink} strokeWidth="3" /><ellipse cx="32" cy="32" rx="10" ry="12" fill="#efc7b1" stroke={ink} strokeWidth="2.5" />{eyes}<path d="m21 14 6 6m17-10-3 8m-23 5-6 2m39-1 5 3" stroke="#8bdff0" strokeWidth="3" strokeLinecap="round" /><path d="m32 47 2 5 5 1-5 2-2 5-2-5-5-2 5-1Z" fill="#fff" /></>;
    case 9:
      portrait = <><path d="M11 60q2-20 21-20t21 20Z" fill="#a6404c" stroke={ink} strokeWidth="3" /><path d="M17 34 13 18l14-11 21 8 2 20-9 8H23Z" fill="#8f3447" stroke={ink} strokeWidth="3" /><ellipse cx="32" cy="32" rx="10" ry="12" fill="#e9b69b" stroke={ink} strokeWidth="2.5" /><path d="m23 29 6 2m6 0 6-2m-10 9 2 2 2-2" stroke={ink} strokeWidth="2.5" strokeLinecap="round" /><path d="m19 18 13 6 14-8m-22 31 8 6 8-6" fill="none" stroke="#f2bc62" strokeWidth="3" /></>;
    case 10:
      portrait = <><path d="M11 60q2-19 21-19t21 19Z" fill="#6554b6" stroke={ink} strokeWidth="3" /><path d="M14 28 24 7l7 14L42 4l8 27-9 12H22Z" fill="#453e87" stroke={ink} strokeWidth="3" /><ellipse cx="32" cy="32" rx="10" ry="12" fill="#e8c5bd" stroke={ink} strokeWidth="2.5" />{eyes}<circle cx="49" cy="18" r="8" fill="#64d8eb" stroke="#f6e8aa" strokeWidth="2" /><circle cx="49" cy="18" r="3" fill="#fff" /><path d="M18 19 8 15m41 22 7 3" stroke="#bd9bff" strokeWidth="3" /></>;
    case 11:
      portrait = <><path d="M12 60q2-18 20-18t20 18Z" fill="#a153b8" stroke={ink} strokeWidth="3" /><path d="M16 35Q11 7 32 6q21 2 16 29l-7 11H23Z" fill="#6f4a9d" stroke={ink} strokeWidth="3" /><ellipse cx="32" cy="32" rx="10" ry="12" fill="#f0c7ca" stroke={ink} strokeWidth="2.5" />{eyes}<path d="M22 13 32 4l10 9m-19 8h18" fill="none" stroke="#80e7f2" strokeWidth="3" /><path d="m32 44 5 8-5 7-5-7Z" fill="#58d8ed" stroke="#fff" strokeWidth="1.5" /><path d="m20 48-7 7m31-7 7 7" stroke="#f3a5ed" strokeWidth="3" /></>;
    case 12:
      portrait = <><path d="M12 60q2-18 20-18t20 18Z" fill="#4a9a91" stroke={ink} strokeWidth="3" /><path d="M17 32Q12 11 31 7q19-1 17 24l-5 15H21Z" fill="#647b78" stroke={ink} strokeWidth="3" /><rect x="20" y="23" width="11" height="9" rx="4" fill="#edcf72" stroke={ink} strokeWidth="2" /><rect x="34" y="23" width="11" height="9" rx="4" fill="#edcf72" stroke={ink} strokeWidth="2" /><path d="M31 27h3m-9-15 6-7 7 7M22 40l-8 8m28-8 8 8" fill="none" stroke="#9de4d0" strokeWidth="3" strokeLinecap="round" /><path d="M26 37q6 4 12 0" fill="none" stroke="#e9bd7a" strokeWidth="2" /></>;
    default:
      portrait = <><path d="M11 60q3-19 21-19t21 19Z" fill="#d55773" stroke={ink} strokeWidth="3" /><path d="M15 34Q8 14 26 7q17-7 24 12l-5 25-8-7H23Z" fill="#aa4165" stroke={ink} strokeWidth="3" /><path d="M22 29q10-6 20 0l-2 12q-8 5-16 0Z" fill="#e8977f" stroke={ink} strokeWidth="2" /><path d="m26 34 4 1m4 0 4-1m-8 5 2 2 2-2" stroke={ink} strokeWidth="2" strokeLinecap="round" /><path d="m18 15-8-6m38 8 7-8m-36 37-6 8m36-8 7 8" stroke="#f8cb68" strokeWidth="3" strokeLinecap="round" /><path d="m32 44 4 6-4 7-4-7Z" fill="#73e8e1" stroke="#fff" strokeWidth="1.5" /></>;
  }

  return <g strokeLinejoin="round" strokeLinecap="round">{bust}{portrait}</g>;
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
  const index = TYPES.indexOf(type);
  const artColor = CHALLENGE_CARD_COLORS[index % CHALLENGE_CARD_COLORS.length];
  const frameColor = isHinted ? '#fde047' : isMatching ? '#fef08a' : artColor;
  return (
    <div
      className={`relative overflow-hidden rounded-[12px] border border-black/80 p-[1px] transition-all duration-200 ${className}`}
      style={{
        background: `linear-gradient(145deg, ${frameColor} 0%, #09090a 34%, #252026 72%, ${frameColor} 100%)`,
        boxShadow: isHinted
          ? '0 0 18px rgba(250,204,21,.75), inset 0 0 0 1px rgba(255,255,255,.55)'
          : isMatching
            ? '0 0 20px rgba(250,204,21,.85)'
            : `0 4px 0 #020303, 0 7px 14px color-mix(in srgb, ${artColor} 48%, transparent)`,
      }}
    >
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] border border-white/10"
        style={{
          background: `radial-gradient(ellipse at 50% 42%, color-mix(in srgb, ${artColor} 16%, #101112) 0%, #08090a 72%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-x-1 top-[3px] z-10 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        <div className={isCovered ? 'h-full w-full brightness-[.68] grayscale-[.15]' : 'h-full w-full drop-shadow-[0_2px_5px_rgba(0,0,0,.8)]'}>
          {children}
        </div>
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
      <g transform={`rotate(${(index * 19) % 19 - 9} 32 32)`}>
        {index < 14 ? <OriginalHeroArtwork index={index} color={meta.accentColor} /> : artwork}
      </g>
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
  return (
    <div className="h-full w-full">
      <HorrorCardArtwork index={index} label={meta.name} isCovered={isCovered} />
    </div>
  );
};
