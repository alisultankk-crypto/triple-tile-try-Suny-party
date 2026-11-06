import React from 'react';
import { MagicEffectType, TileType } from '../types/game';

interface CatMeta {
  name: string;
  accentColor: string;
  glowColor: string;
  magic: MagicEffectType;
  coat: string;
  form: 'head' | 'full' | 'paw';
  markings: number;
  angle: number;
}

const TYPES: TileType[] = [
  'yasuo', 'ahri', 'jinx', 'teemo', 'garen', 'zed', 'blitzcrank', 'vi', 'ashe', 'darius', 'asol', 'lux', 'heimer', 'katarina',
  'nebula', 'comet', 'satellite', 'ufo', 'moon', 'sun', 'mars', 'saturn', 'blackhole', 'galaxy', 'astronaut', 'rocket', 'telescope',
  'meteor', 'starship', 'crystal', 'portal', 'rover', 'aurora', 'pulsar', 'quasar', 'stardust', 'eclipse', 'probe', 'spacewhale',
  'cosmicflower', 'ringworld', 'constellation',
];

const CAT_NAMES = [
  'Пушистик', 'Искра', 'Клякса', 'Тимоша', 'Граф', 'Ниндзя', 'Бублик', 'Вишня', 'Снежок', 'Барсик', 'Комета', 'Луна',
  'Профессор', 'Кнопка', 'Туманчик', 'Хвостик', 'Пиксель', 'Марсик', 'Мурка', 'Солнышко', 'Рыжик', 'Сатурн', 'Ночка',
  'Звёздочка', 'Космо', 'Ракета', 'Шустрик', 'Метеор', 'Капитан', 'Жемчужинка', 'Фокус', 'Ровер', 'Аврора', 'Пульс',
  'Квазар', 'Пылинка', 'Затмение', 'Зондик', 'Облачко', 'Ромашка', 'Кольцо', 'Созвездие',
];

const COATS = [
  '#f5ead7', '#f4a261', '#7c8799', '#d4a373', '#302d3b', '#e7e5e4', '#d6ad70',
  '#c56b4a', '#f8fafc', '#9c6644', '#b9a7ff', '#ffd166', '#e9c46a', '#e76f51',
  '#c4b5fd', '#67e8f9', '#cbd5e1', '#a3e635', '#ddd6fe', '#fde047', '#fb7185',
  '#fbbf24', '#a5b4fc', '#f0abfc', '#e2e8f0', '#fb923c', '#60a5fa', '#f97316',
  '#2dd4bf', '#22d3ee', '#a78bfa', '#fb7185', '#34d399', '#f0abfc', '#fde68a',
  '#fcd34d', '#a5b4fc', '#38bdf8', '#7dd3fc', '#f9a8d4', '#fdba74', '#c7d2fe',
];

const EFFECTS: MagicEffectType[] = ['wind', 'arcane', 'fire', 'frost', 'starlight', 'void'];

export const CAMPAIGN_TILE_TYPES = TYPES;

export const CAT_CARD_METAS = Object.fromEntries(
  TYPES.map((type, index) => {
    const accentColor = COATS[index];
    return [
      type,
      {
        name: CAT_NAMES[index],
        accentColor,
        glowColor: `${accentColor}88`,
        magic: EFFECTS[index % EFFECTS.length],
        coat: accentColor,
        form: (['head', 'full', 'paw'] as const)[index % 3],
        markings: index % 8,
        angle: [-14, 0, 12, -6, 8, 0][Math.floor(index / 3) % 6],
      } satisfies CatMeta,
    ];
  })
) as Record<TileType, CatMeta>;

export function getCardMeta(type: TileType): CatMeta {
  return CAT_CARD_METAS[type];
}

function CatDrawing({ meta, index }: { meta: CatMeta; index: number }) {
  const stripeColor = index % 2 === 0 ? '#111827' : '#f8fafc';
  const eyeColor = ['#67e8f9', '#fef08a', '#86efac', '#f9a8d4'][index % 4];
  const flip = index % 2 === 0 ? 1 : -1;

  if (meta.form === 'paw') {
    return (
      <g transform={`rotate(${meta.angle} 32 32)`}>
        <ellipse cx="32" cy="39" rx="18" ry="15" fill={meta.coat} stroke="#ffffff" strokeOpacity=".8" strokeWidth="1.5" />
        {[17, 27, 38, 48].map((x, i) => (
          <ellipse key={x} cx={x} cy={i % 2 ? 18 : 20} rx="6" ry="9" fill={meta.coat} stroke="#ffffff" strokeOpacity=".75" strokeWidth="1.3" transform={`rotate(${(i - 1.5) * 9} ${x} 20)`} />
        ))}
        <path d="M32 32c-7 0-10 5-9 10 1 4 5 5 9 2 4 3 8 2 9-2 1-5-2-10-9-10Z" fill="#f9a8d4" />
        <circle cx="27" cy="38" r="1" fill="#7f1d1d" />
        <circle cx="37" cy="38" r="1" fill="#7f1d1d" />
      </g>
    );
  }

  const full = meta.form === 'full';
  return (
    <g transform={`rotate(${meta.angle} 32 35) scale(${flip} 1) translate(${flip < 0 ? -64 : 0} 0)`}>
      {full && (
        <>
          <path
            d={index % 2 ? 'M25 51c-9 2-17-1-18-8-1-6 7-7 10-2 3 4 8 3 11 2' : 'M38 52c10 3 18-2 16-8-1-5-8-4-10 1-2 4-6 3-10 1'}
            fill="none" stroke={meta.coat} strokeWidth="6" strokeLinecap="round"
          />
          <ellipse cx="32" cy="44" rx="15" ry="16" fill={meta.coat} stroke="#ffffff" strokeOpacity=".75" strokeWidth="1.5" />
          <ellipse cx="23" cy="56" rx="6" ry="4" fill={meta.coat} />
          <ellipse cx="41" cy="56" rx="6" ry="4" fill={meta.coat} />
          <path d="M22 48q10 8 20 0" fill="none" stroke="#f8fafc" strokeOpacity=".65" strokeWidth="2" />
        </>
      )}
      <path d="M14 28 17 8q1-5 7 0l8 7 8-7q6-5 7 0l3 20v11q-1 16-18 17Q15 54 14 39Z" fill={meta.coat} stroke="#ffffff" strokeOpacity=".82" strokeWidth="1.6" />
      <path d="m18 13 3 13 7-8Z" fill="#f9a8d4" fillOpacity=".85" />
      <path d="m46 13-3 13-7-8Z" fill="#f9a8d4" fillOpacity=".85" />
      {meta.markings % 3 === 0 && <path d="M20 17q8 6 12 0v9q-6 5-12 0Zm24 0q-8 6-12 0v9q6 5 12 0Z" fill={stripeColor} fillOpacity=".58" />}
      {meta.markings % 3 === 1 && <ellipse cx={index % 2 ? 24 : 40} cy="32" rx="7" ry="11" fill={stripeColor} fillOpacity=".56" />}
      {meta.markings % 3 === 2 && <path d="M17 37q15-9 30 0M19 43q13-7 26 0" fill="none" stroke={stripeColor} strokeOpacity=".58" strokeWidth="2.5" />}
      {full && meta.markings % 2 === 0 && <path d="M21 43q11 6 22 0v8q-11 5-22 0Z" fill={stripeColor} fillOpacity=".55" />}
      <ellipse cx="24" cy="34" rx="4" ry={index % 4 === 1 ? 5 : 3.5} fill={eyeColor} stroke="#111827" strokeWidth="1" />
      <ellipse cx="40" cy="34" rx="4" ry={index % 4 === 1 ? 5 : 3.5} fill={eyeColor} stroke="#111827" strokeWidth="1" />
      <ellipse cx="25" cy="34" rx="1" ry="2.5" fill="#111827" />
      <ellipse cx="39" cy="34" rx="1" ry="2.5" fill="#111827" />
      <path d="m29 40 3-2 3 2-3 3Z" fill="#fb7185" />
      <path d="M32 43q-4 5-7 1m7-1q4 5 7 1" fill="none" stroke="#422006" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M21 40 8 38m13 5L9 47m34-7 13-2m-13 5 12 4" stroke="#f8fafc" strokeOpacity=".75" strokeWidth="1" />
      {index % 4 === 0 && <path d="M17 29q15-8 30 0" fill="none" stroke="#facc15" strokeWidth="3" />}
      {index % 4 === 2 && <path d="M17 29h30" stroke="#7dd3fc" strokeWidth="2.5" />}
      {index % 4 === 3 && <path d="M26 16 32 9l6 7" fill="none" stroke="#facc15" strokeWidth="2" />}
      {index % 5 === 1 && <path d="M17 31 25 30M39 30l8 1" stroke="#111827" strokeWidth="2" />}
    </g>
  );
}

export const CosmicCardImage: React.FC<{ type: TileType; isCovered?: boolean }> = ({
  type,
  isCovered = false,
}) => {
  const index = TYPES.indexOf(type);
  const meta = getCardMeta(type);
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={meta.name}
      className={`h-10 w-10 select-none ${isCovered ? 'opacity-65 grayscale-[0.3]' : ''}`}
    >
      <CatDrawing meta={meta} index={index} />
    </svg>
  );
};
