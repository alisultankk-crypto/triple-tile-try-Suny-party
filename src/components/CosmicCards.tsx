import React from 'react';
import { MagicEffectType, TileType } from '../types/game';

interface CatMeta {
  name: string;
  accentColor: string;
  glowColor: string;
  magic: MagicEffectType;
  coat: string;
  form: 'head' | 'full' | 'paw' | 'profile' | 'sleeping';
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
  '#f2b66d', '#343b4b', '#f3eee1', '#b95d38', '#8e9ba8', '#e994ad', '#76509a',
  '#a4bf70', '#282c35', '#c8a77d', '#72c7c5', '#f3ce58', '#d2a4d8', '#d77e59',
  '#5b7cba', '#e5a945', '#a8d1c0', '#ce5265', '#f5f5f5', '#c28153', '#7192a8',
  '#dba6c8', '#8a754f', '#559b76', '#b2a1e2', '#d86f37', '#82b5d8', '#9d4c37',
  '#52a69d', '#e6cb9a', '#7372a8', '#e77b9a', '#71a55d', '#b88142', '#a8c9dc',
  '#c45136', '#687d54', '#eea36d', '#4b5968', '#d7bd65', '#9971b0', '#e4e6ec',
];

const EFFECTS: MagicEffectType[] = ['wind', 'arcane', 'fire', 'frost', 'starlight', 'void'];
const FORMS: CatMeta['form'][] = ['head', 'full', 'paw', 'profile', 'sleeping', 'full'];

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
        form: FORMS[index % FORMS.length],
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
  const eyeColor = ['#76e4ff', '#ffd166', '#b5f28c', '#ff91bd', '#c5a5ff', '#fff2d6'][index % 6];
  const patch = index % 2 ? '#f4eee3' : '#272b36';
  const earInner = ['#ee7796', '#e4a4b8', '#bf7d58', '#dbb1e6'][index % 4];

  if (meta.form === 'paw') {
    return (
      <g transform={`rotate(${meta.angle} 32 32)`}>
        <ellipse cx="32" cy="40" rx="19" ry="15" fill={meta.coat} stroke="#fff" strokeWidth="1.5" />
        {[16, 27, 38, 49].map((x, i) => (
          <ellipse key={x} cx={x} cy={i % 2 ? 17 : 19} rx="6.5" ry="9" fill={meta.coat} stroke="#fff" strokeWidth="1.3" transform={`rotate(${(i - 1.5) * 11} ${x} 19)`} />
        ))}
        <path d="M32 32c-7-1-11 5-9 10 1 4 5 5 9 2 4 3 8 2 9-2 2-5-2-10-9-10Z" fill={earInner} />
        {meta.markings % 2 === 0 && <path d="M25 35q7 5 14 0" fill="none" stroke="#fff" strokeWidth="1.5" />}
      </g>
    );
  }

  if (meta.form === 'sleeping') {
    return (
      <g transform={`rotate(${meta.angle} 32 35)`}>
        <ellipse cx="34" cy="42" rx="23" ry="14" fill={meta.coat} stroke="#fff" strokeWidth="1.5" />
        <path d="M17 45c-8 9 2 15 11 8" fill="none" stroke={meta.coat} strokeWidth="6" strokeLinecap="round" />
        <path d="M20 45q12-9 27-1" fill="none" stroke={patch} strokeWidth="4" />
        <circle cx="25" cy="30" r="13" fill={meta.coat} stroke="#fff" strokeWidth="1.5" />
        <path d="m15 25 1-13q1-4 5 0l6 5m10 8-1-13q-1-4-5 0l-6 5" fill={meta.coat} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="m17 16 6 4m15-4-6 4" stroke={earInner} strokeWidth="3" />
        <path d="M19 30q4 4 8 0m3 0q4 4 8 0" fill="none" stroke="#292331" strokeWidth="1.6" strokeLinecap="round" />
        <path d="m27 35 3 2 3-2" fill="none" stroke="#854f45" strokeWidth="1.5" />
        {meta.markings % 2 === 0 && <circle cx="43" cy="37" r="4" fill={patch} />}
        <text x="47" y="19" fontSize="10" fill="#fff2a8">z</text>
      </g>
    );
  }

  if (meta.form === 'profile') {
    return (
      <g transform={`rotate(${meta.angle} 32 34) scale(${index % 2 ? -1 : 1} 1) translate(${index % 2 ? -64 : 0} 0)`}>
        <path d="M18 45c-7 11 4 15 13 9 3-3 5-7 8-9" fill="none" stroke={meta.coat} strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="31" cy="47" rx="12" ry="13" fill={meta.coat} stroke="#fff" strokeWidth="1.5" />
        <path d="M19 32 21 9q1-5 7 0l7 8q12 2 13 14l10 9-11 4q-12 5-22-3-7-5-6-9Z" fill={meta.coat} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="m22 14 3 12 7-8Z" fill={earInner} />
        <ellipse cx="37" cy="29" rx="3.5" ry="5" fill={eyeColor} stroke="#20202a" strokeWidth="1" />
        <circle cx="38" cy="29" r="1.4" fill="#15151c" />
        <path d="M47 36q4 3 8 0m-9 3 10 1" fill="none" stroke="#542f37" strokeWidth="1.4" strokeLinecap="round" />
        {meta.markings % 2 === 0 && <path d="M20 24q9 5 17 2" fill="none" stroke={patch} strokeWidth="4" />}
        {index % 3 === 0 && <path d="M20 40q11 6 23 1" fill="none" stroke="#f1cc59" strokeWidth="3" />}
      </g>
    );
  }

  const full = meta.form === 'full';
  const facePath = [
    'M14 29 18 9q1-5 7 0l7 7 8-7q6-5 7 0l4 20v9q-1 16-19 17Q14 54 14 39Z',
    'M12 30 18 7q2-4 8 1l6 8 9-8q6-4 8 1l5 23q-1 18-21 20Q13 51 12 30Z',
    'M16 27 16 8q1-5 7-1l9 8 9-8q6-4 7 1l2 19q2 21-18 25Q13 49 16 27Z',
    'M13 31 19 10q2-6 8 0l5 7 7-7q7-5 9 1l4 20q0 17-20 21Q14 49 13 31Z',
  ][index % 4];

  return (
    <g transform={`rotate(${meta.angle} 32 35) scale(${index % 2 ? -1 : 1} 1) translate(${index % 2 ? -64 : 0} 0)`}>
      {full && (
        <>
          <path
            d={index % 2 ? 'M25 51c-9 2-17-1-18-8-1-6 7-7 10-2 3 4 8 3 11 2' : 'M38 52c10 3 18-2 16-8-1-5-8-4-10 1-2 4-6 3-10 1'}
            fill="none" stroke={meta.coat} strokeWidth="6" strokeLinecap="round"
          />
          <ellipse cx="32" cy="45" rx={index % 3 === 0 ? 17 : 14} ry="15" fill={meta.coat} stroke="#fff" strokeWidth="1.5" />
          <ellipse cx="23" cy="56" rx="6" ry="4" fill={meta.coat} />
          <ellipse cx="41" cy="56" rx="6" ry="4" fill={meta.coat} />
          {meta.markings % 2 === 0 && <path d="M22 44q10 6 20 0v7q-10 5-20 0Z" fill={patch} />}
        </>
      )}
      <path d={facePath} fill={meta.coat} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      <path d={`M18 14 21 27 29 18Z`} fill={earInner} />
      <path d="m46 14-3 13-8-9Z" fill={earInner} />
      {meta.markings % 4 === 0 && <path d="M20 17q8 6 12 0v9q-6 5-12 0Zm24 0q-8 6-12 0v9q6 5 12 0Z" fill={patch} />}
      {meta.markings % 4 === 1 && <ellipse cx={index % 2 ? 24 : 40} cy="33" rx="7" ry="11" fill={patch} />}
      {meta.markings % 4 === 2 && <path d="M17 38q15-9 30 0M19 44q13-7 26 0" fill="none" stroke={patch} strokeWidth="2.5" />}
      {meta.markings % 4 === 3 && <path d="M19 22q13 8 26 0" fill="none" stroke={patch} strokeWidth="4" />}
      <ellipse cx="24" cy="34" rx="4" ry={index % 4 === 1 ? 5 : 3.5} fill={eyeColor} stroke="#161923" strokeWidth="1" />
      <ellipse cx="40" cy="34" rx="4" ry={index % 4 === 1 ? 5 : 3.5} fill={eyeColor} stroke="#161923" strokeWidth="1" />
      <ellipse cx="25" cy="34" rx="1" ry="2.5" fill="#111" />
      <ellipse cx="39" cy="34" rx="1" ry="2.5" fill="#111" />
      <path d="m29 40 3-2 3 2-3 3Z" fill={earInner} />
      <path d="M32 43q-4 5-7 1m7-1q4 5 7 1" fill="none" stroke="#422b2b" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M21 40 8 38m13 5L9 47m34-7 13-2m-13 5 12 4" stroke="#f8fafc" strokeOpacity=".8" strokeWidth="1" />
      {index % 4 === 0 && <path d="M17 29q15-8 30 0" fill="none" stroke="#facc15" strokeWidth="3" />}
      {index % 4 === 2 && <path d="M17 29h30" stroke="#7dd3fc" strokeWidth="2.5" />}
      {index % 4 === 3 && <path d="M26 16 32 9l6 7" fill="none" stroke="#facc15" strokeWidth="2" />}
      {index % 5 === 1 && (
        <>
          <circle cx="24" cy="34" r="7" fill="none" stroke="#e8e4d7" strokeWidth="1.5" />
          <circle cx="40" cy="34" r="7" fill="none" stroke="#e8e4d7" strokeWidth="1.5" />
          <path d="M31 34h2" stroke="#e8e4d7" strokeWidth="1.5" />
        </>
      )}
      {full && index % 3 === 1 && <path d="M23 51q9 4 18 0" fill="none" stroke="#fff4cc" strokeWidth="2" />}
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
