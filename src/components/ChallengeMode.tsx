import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  AudioLines,
  Calendar,
  CircleHelp,
  Eye,
  Gamepad2,
  Gift,
  HelpCircle,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Music,
  RotateCcw,
  Settings,
  Shuffle,
  Sparkles,
  Store,
  Trophy,
  Undo2,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import type { GameMode, Language } from '../types/game';
import { InstallAppButton } from './InstallAppButton';

type ChallengeTile = {
  id: string;
  col: number;
  row: number;
  layer: number;
  island: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  label: string;
  art: string;
};

const TILE_FACES = [
  { label: 'Паук из склепа', art: 'hell-btc' },
  { label: 'Зомби', art: 'hell-eth' },
  { label: 'Капля крови', art: 'hell-wallet' },
  { label: 'Клыки вампира', art: 'hell-chain' },
  { label: 'Летучая мышь', art: 'hell-nft' },
  { label: 'Знак RIP', art: 'hell-mining' },
  { label: 'Полночные часы', art: 'hell-chart' },
  { label: 'Когти чудовища', art: 'hell-token' },
  { label: 'Старая могила', art: 'hell-exchange' },
  { label: 'Череп', art: 'hell-shield' },
  { label: 'Призрак', art: 'hell-rocket' },
  { label: 'Кость', art: 'hell-gem' },
  { label: 'Чёрная свеча', art: 'crypto-btc' },
  { label: 'Сторожевой глаз', art: 'crypto-eth' },
  { label: 'Коса жнеца', art: 'crypto-wallet' },
  { label: 'Дом с привидениями', art: 'crypto-chain' },
  { label: 'Колба с ядом', art: 'crypto-nft' },
  { label: 'Оборотень', art: 'crypto-mining' },
  { label: 'Чёрный кот', art: 'crypto-chart' },
  { label: 'Проклятая книга', art: 'crypto-token' },
  { label: 'Фонарь скитальца', art: 'crypto-exchange' },
  { label: 'Гроб с печатью', art: 'crypto-cold' },
  { label: 'Тёмный амулет', art: 'crypto-contract' },
  { label: 'Ворон', art: 'crypto-key' },
  { label: 'Горгулья', art: 'crypto-stake' },
  { label: 'Паутина', art: 'crypto-rocket' },
  { label: 'Рука из могилы', art: 'crypto-bull' },
  { label: 'Крест на холме', art: 'crypto-bear' },
  { label: 'Ведьмина шляпа', art: 'crypto-candles' },
  { label: 'Метла ведьмы', art: 'crypto-node' },
  { label: 'Кровавый след', art: 'crypto-shield' },
  { label: 'Ночная моль', art: 'crypto-coin' },
  { label: 'Цепи призрака', art: 'crypto-card' },
  { label: 'Зловещая луна', art: 'crypto-network' },
  { label: 'Фонарь тыквы', art: 'crypto-profit' },
  { label: 'Ключ от склепа', art: 'crypto-code' },
  { label: 'Щупальце из тьмы', art: 'crypto-airdrop' },
  { label: 'Ядовитый гриб', art: 'crypto-gem' },
];

const CARD_WIDTH = 88;
const CARD_HEIGHT = 116;
const CARD_STEP_X = CARD_WIDTH;
const CARD_STEP_Y = Math.round(CARD_HEIGHT * 0.75);
const BOARD_PADDING = 20;
const PROGRESS_KEY = 'crypto_challenge_progress_v1';
const VOICE_KEY = 'crypto_challenge_voice_style';
const SATOSHIS_PER_BTC = 100_000_000;

const VOICE_STYLES = [
  { name: 'Мягкий голос', rate: 0.9, pitch: 1.08 },
  { name: 'Суровый', rate: 0.82, pitch: 0.76 },
  { name: 'Загадочный', rate: 0.78, pitch: 0.92 },
  { name: 'Весёлый', rate: 1.1, pitch: 1.22 },
  { name: 'Робот', rate: 0.94, pitch: 0.68 },
  { name: 'Торжественный', rate: 0.78, pitch: 1.02 },
  { name: 'Шёпот', rate: 0.82, pitch: 1.02, volume: 0.6 },
];

function cardPosition(tile: Pick<ChallengeTile, 'offsetX' | 'offsetY'>) {
  return {
    left: BOARD_PADDING + tile.offsetX,
    top: BOARD_PADDING + tile.offsetY,
  };
}

type TilePosition = Pick<ChallengeTile, 'id' | 'col' | 'row' | 'layer' | 'island' | 'offsetX' | 'offsetY' | 'rotation'>;

function isCoveredByUpperTile(tile: TilePosition, tiles: TilePosition[]): boolean {
  const position = cardPosition(tile);
  return tiles.some((other) => {
    if (other.layer <= tile.layer || other.island !== tile.island) return false;
    const otherPosition = cardPosition(other);
    return (
      Math.min(position.left + CARD_WIDTH, otherPosition.left + CARD_WIDTH) > Math.max(position.left, otherPosition.left) &&
      Math.min(position.top + CARD_HEIGHT, otherPosition.top + CARD_HEIGHT) > Math.max(position.top, otherPosition.top)
    );
  });
}

const ART_COLORS: Record<string, { light: string; dark: string; accent: string }> = {
  'hell-btc': { light: '#ffc286', dark: '#762210', accent: '#ff552b' },
  'hell-eth': { light: '#ffb68a', dark: '#762424', accent: '#f45135' },
  'hell-wallet': { light: '#ffcf9c', dark: '#773014', accent: '#fa6a32' },
  'hell-chain': { light: '#ffae86', dark: '#612029', accent: '#e94c4c' },
  'hell-nft': { light: '#ffd0a0', dark: '#702346', accent: '#ef5382' },
  'hell-mining': { light: '#ffd18b', dark: '#693319', accent: '#f38b35' },
  'hell-chart': { light: '#ffba86', dark: '#70231d', accent: '#ff6138' },
  'hell-token': { light: '#ffe09c', dark: '#6e2913', accent: '#ff8b25' },
  'hell-exchange': { light: '#ffbd9c', dark: '#712437', accent: '#f55354' },
  'hell-shield': { light: '#ffc69a', dark: '#5e271f', accent: '#df4d35' },
  'hell-rocket': { light: '#ffd094', dark: '#772814', accent: '#ff6a24' },
  'hell-gem': { light: '#ffc2a1', dark: '#69253f', accent: '#ec496a' },
  'crypto-btc': { light: '#fff0bd', dark: '#92510d', accent: '#f7931a' },
  'crypto-eth': { light: '#e1e9ff', dark: '#334077', accent: '#6878e8' },
  'crypto-wallet': { light: '#c4f7dd', dark: '#176943', accent: '#29bd78' },
  'crypto-chain': { light: '#d1f6ff', dark: '#126b88', accent: '#2fc7e8' },
  'crypto-nft': { light: '#ffd7f1', dark: '#7b327e', accent: '#df68d5' },
  'crypto-mining': { light: '#d5e0ed', dark: '#3e536d', accent: '#839bb5' },
  'crypto-chart': { light: '#c9ffe1', dark: '#166345', accent: '#20d483' },
  'crypto-token': { light: '#fff1b1', dark: '#9b6511', accent: '#f2bd34' },
  'crypto-exchange': { light: '#c8eaff', dark: '#1e5281', accent: '#438fe1' },
  'crypto-cold': { light: '#d0f7ff', dark: '#245b76', accent: '#55c8e6' },
  'crypto-contract': { light: '#e2d6ff', dark: '#4d378a', accent: '#9271ed' },
  'crypto-key': { light: '#fff0ac', dark: '#885714', accent: '#e9b63b' },
  'crypto-stake': { light: '#d8ffbc', dark: '#41752b', accent: '#87d54d' },
  'crypto-rocket': { light: '#ffe0c5', dark: '#983e35', accent: '#ff795f' },
  'crypto-bull': { light: '#dcffd1', dark: '#366c32', accent: '#67c65e' },
  'crypto-bear': { light: '#e3d7ff', dark: '#553a86', accent: '#a27ade' },
  'crypto-candles': { light: '#d0fff2', dark: '#186b63', accent: '#44d6b3' },
  'crypto-node': { light: '#cff2ff', dark: '#245780', accent: '#4ca8e6' },
  'crypto-shield': { light: '#c8ffe8', dark: '#146350', accent: '#20b78b' },
  'crypto-coin': { light: '#fff2ac', dark: '#8e5810', accent: '#edb937' },
  'crypto-card': { light: '#d4e5ff', dark: '#315b98', accent: '#628ee0' },
  'crypto-network': { light: '#d2f8ff', dark: '#1a5d81', accent: '#3bbbd8' },
  'crypto-profit': { light: '#d3ffd9', dark: '#246543', accent: '#49d477' },
  'crypto-code': { light: '#d8e7ff', dark: '#334e86', accent: '#6588e5' },
  'crypto-airdrop': { light: '#d7faff', dark: '#286b84', accent: '#50c7df' },
  'crypto-gem': { light: '#ebd4ff', dark: '#633b93', accent: '#a568e4' },
  'cat-ginger': { light: '#ffe0a3', dark: '#a94e17', accent: '#ff812e' },
  'cat-black': { light: '#e1d7ff', dark: '#332b63', accent: '#8c67ff' },
  'cat-space': { light: '#b8f4ff', dark: '#2051a2', accent: '#19b9f2' },
  'cat-calico': { light: '#fff0a6', dark: '#9d3f2b', accent: '#f05d46' },
  paw: { light: '#ffd2e6', dark: '#9e285e', accent: '#ff4f9a' },
  ears: { light: '#d7ffb8', dark: '#397336', accent: '#78d63e' },
  tail: { light: '#ead1ff', dark: '#542d8a', accent: '#a44dff' },
  coin: { light: '#fff19a', dark: '#855000', accent: '#ffc400' },
  diamond: { light: '#b8ffff', dark: '#00657c', accent: '#00cfe8' },
  chest: { light: '#ffd29a', dark: '#713411', accent: '#f57924' },
  scroll: { light: '#fff3be', dark: '#704321', accent: '#e0a03b' },
  fish: { light: '#b9e8ff', dark: '#174d91', accent: '#328ff0' },
  yarn: { light: '#ffc6f4', dark: '#702779', accent: '#e34bca' },
  crown: { light: '#fff59b', dark: '#875000', accent: '#ffca05' },
  fishbone: { light: '#d2fff1', dark: '#276659', accent: '#53d9b2' },
  bell: { light: '#ffe4a3', dark: '#885014', accent: '#ffad24' },
  star: { light: '#fff3a1', dark: '#9b5800', accent: '#ff9c18' },
  heart: { light: '#ffc4d8', dark: '#8e244c', accent: '#f83b75' },
  gem: { light: '#d8c6ff', dark: '#452a91', accent: '#7953ed' },
  milk: { light: '#dbf3ff', dark: '#345f9a', accent: '#71bfff' },
  cup: { light: '#c6fff1', dark: '#17675e', accent: '#20c9aa' },
  cake: { light: '#ffd4df', dark: '#8a3553', accent: '#f06091' },
  flower: { light: '#ffe0ac', dark: '#853c76', accent: '#f45fbd' },
  honey: { light: '#fff09a', dark: '#805000', accent: '#ffb900' },
  strawberry: { light: '#ffc7c2', dark: '#872d38', accent: '#fa4b50' },
};

const NEON_COLORS = [
  '#d93652', '#91bd57', '#b51f3d', '#d7d0bc', '#8265bd', '#b9a875',
  '#73a1a1', '#b12746', '#8e694e', '#d9d4c6', '#a28bc7', '#d8c8a9',
  '#7b273b', '#8fc4bc', '#a6a0ad', '#635474', '#b9d36b', '#9d4d47',
  '#b58c43', '#9d6dbe', '#849d9c', '#7b3845', '#d1b869', '#6c8194',
  '#87945d', '#9d3c59', '#9f8a6e', '#d4c9a9', '#8c5e9d', '#a79968',
  '#ba4657', '#8bb0a0', '#9890aa', '#d8d1b5', '#c27b43', '#a99bca',
  '#719276', '#bc6573',
];

export const CHALLENGE_CARD_COLORS = NEON_COLORS;

function getNeonColors(art: string) {
  const index = TILE_FACES.findIndex((face) => face.art === art);
  if (index < 0) return ART_COLORS[art] ?? ART_COLORS.cup;
  const accent = NEON_COLORS[index % NEON_COLORS.length];
  return { light: '#e8dfcb', dark: '#241a27', accent };
}

function PunkRelicDrawing({ index, accent, secondary }: { index: number; accent: string; secondary: string }) {
  const ink = '#170d2a';
  const steel = '#8b83a8';
  const motif = index;

  if (motif === 0) {
    return (
      <>
        <path d="M12 57q1-15 17-17 16 2 23 17v4H12Z" fill="#362044" stroke={accent} strokeWidth="2" />
        <path d="M19 36q-5-21 12-29 17 7 12 29l-7 9H25Z" fill="#e7a4c7" stroke={ink} strokeWidth="3" />
        <path d="M14 30q-2-22 17-28 19 6 18 28l-8-7-8 5-7-5Z" fill={accent} stroke={ink} strokeWidth="3" />
        <path d="m20 24 9 2m9-2-9 2" stroke="#fff1ff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="25" cy="27" r="4" fill="#48eaff" stroke={ink} strokeWidth="2" />
        <circle cx="39" cy="27" r="4" fill="#48eaff" stroke={ink} strokeWidth="2" />
        <path d="M29 36q3 2 6 0m-9 11 5 5 5-5" fill="none" stroke={secondary} strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  }
  if (motif === 1) {
    return <><path d="m32 5 21 18-8 29-13 8-13-8-8-29Z" fill={accent} stroke="#ffe8ff" strokeWidth="2.5" /><path d="m32 5 0 25-21-7m21 7 21-7M32 30v30l-13-8-8-29m21 7 13 29" fill="none" stroke={secondary} strokeWidth="2" /><circle cx="32" cy="31" r="5" fill="#fff" /></>;
  }
  if (motif === 2) {
    return <><path d="M32 55 12 36q-9-17 8-22 9-1 12 9 4-10 13-9 17 5 8 22Z" fill="#f92fc4" stroke="#ffd9ff" strokeWidth="2.5" /><path d="M32 21v29m-12-15 12 5 12-9" fill="none" stroke="#57ebff" strokeWidth="3" /><circle cx="32" cy="35" r="4" fill="#fff" /></>;
  }
  if (motif === 3) {
    return <><circle cx="32" cy="32" r="20" fill="#45265d" stroke={accent} strokeWidth="5" strokeDasharray="8 3" /><circle cx="32" cy="32" r="9" fill={secondary} stroke="#fff" strokeWidth="2" /><path d="M32 7v9m0 32v9M7 32h9m32 0h9M14 14l7 7m22 22 7 7m0-36-7 7m-22 22-7 7" stroke="#ffe9ff" strokeWidth="3" strokeLinecap="round" /></>;
  }
  if (motif === 4) {
    return <><path d="M23 9h18l-2 10 8 28-15 9-15-9 8-28Z" fill="#472452" stroke={accent} strokeWidth="3" strokeLinejoin="round" /><path d="M23 21h18m-14-6h10" stroke={steel} strokeWidth="3" /><path d="M20 39q12-8 24 0v9q-12 8-24 0Z" fill={secondary} stroke="#ffe8ff" strokeWidth="2" /><path d="m29 43 3-3 3 3-3 4Z" fill="#fff" /></>;
  }
  if (motif === 5) {
    return <><path d="m11 40 14-14 8 7 10-13 10 10-9 9 4 12-12 5-8-10-12 4Z" fill="#a9a0b7" stroke={ink} strokeWidth="3" strokeLinejoin="round" /><path d="m18 38 8-8 8 8m5-12 7-6m-20 15 7 7" stroke={accent} strokeWidth="4" strokeLinecap="round" /><path d="m12 49 12 6m20-5 7 3" stroke="#f9d5ff" strokeWidth="3" strokeLinecap="round" /></>;
  }
  if (motif === 6) {
    return <><path d="M13 18h38v30H13z" fill="#351943" stroke={accent} strokeWidth="3" /><path d="M19 39 27 30l6 5 11-13" fill="none" stroke="#63efff" strokeWidth="3" strokeLinejoin="round" /><path d="m39 22 6-1-1 6" fill="none" stroke="#fff" strokeWidth="2" /><circle cx="21" cy="25" r="2" fill={secondary} /><circle cx="43" cy="43" r="3" fill={accent} /></>;
  }
  if (motif === 7) {
    return <><path d="m32 6 7 9 12 2-5 11 3 13-12 2-5 12-7-10-13-2 5-12-3-12 12-2Z" fill={accent} stroke="#ffe8ff" strokeWidth="2.5" strokeLinejoin="round" /><path d="M32 17v28m-11-14h22" stroke={ink} strokeWidth="3" /><circle cx="32" cy="31" r="6" fill="#fff" /></>;
  }
  if (motif === 8) {
    return <><rect x="17" y="16" width="30" height="38" rx="4" fill="#332044" stroke={secondary} strokeWidth="3" /><path d="M22 23h20v14H22z" fill="#120d22" stroke={accent} strokeWidth="2" /><circle cx="32" cy="30" r="5" fill="#51eaff" /><path d="M23 45h18m-14 5h10M21 12l-4-5m26 5 4-5" stroke="#ffe8ff" strokeWidth="2.5" strokeLinecap="round" /></>;
  }
  if (motif === 9) {
    return <><path d="m32 7 8 16 15 9-16 7-7 18-7-18-16-7 15-9Z" fill="#44214f" stroke={accent} strokeWidth="3" strokeLinejoin="round" /><circle cx="32" cy="32" r="8" fill={secondary} stroke="#fff" strokeWidth="2" /><path d="M14 18 9 13m41 5 5-5M14 46l-5 5m41-5 5 5" stroke="#54eaff" strokeWidth="3" strokeLinecap="round" /></>;
  }
  if (motif === 10) {
    return <><path d="m18 52 21-24 8 7-21 24-8-7Z" fill={steel} stroke="#fff" strokeWidth="2" /><path d="m35 29 11-15q5-6 10-1l-9 18m-23 23-8 2 2-8" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" /><path d="m40 24 7 6m-15 5 7 6" stroke="#30203c" strokeWidth="2.5" /></>;
  }
  if (motif === 11) {
    return <><path d="M17 20 24 10h16l7 10v26l-15 9-15-9Z" fill="#594568" stroke={accent} strokeWidth="3" /><rect x="22" y="24" width="20" height="13" rx="6" fill="#161126" stroke="#bcefff" strokeWidth="2" /><circle cx="27" cy="30" r="2" fill="#ff53d8" /><circle cx="37" cy="30" r="2" fill="#ff53d8" /><path d="M26 42h12m-6-32V5m-9 48-5 5m25-5 5 5" stroke="#eacbff" strokeWidth="2.5" strokeLinecap="round" /></>;
  }
  if (motif === 12) {
    return <><path d="M32 7 53 20v24L32 57 11 44V20Z" fill="#342044" stroke={accent} strokeWidth="3" /><circle cx="32" cy="32" r="14" fill="none" stroke={secondary} strokeWidth="4" /><circle cx="32" cy="32" r="5" fill="#fff" /><path d="m32 11 5 10m12 2-10 3m6 14-10-3m-6 14-2-11m-14-5 11-2m-7-13 9 7" stroke="#57eaff" strokeWidth="2.5" /></>;
  }
  if (motif === 13) {
    return <><path d="M20 8h24l8 9v35H12V17Z" fill="#30203d" stroke={secondary} strokeWidth="3" strokeLinejoin="round" /><path d="M20 8v12h12m-12 8h24m-24 8h18m-18 8h22" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" /><path d="m37 15 5 3-5 3" fill="none" stroke="#fff" strokeWidth="2" /></>;
  }
  if (motif === 14) {
    return <><path d="M12 19h40v29H12z" fill="#24132e" stroke={accent} strokeWidth="3" /><path d="M18 42 25 31l7 6 8-15 7 11" fill="none" stroke={secondary} strokeWidth="4" strokeLinejoin="round" /><circle cx="23" cy="24" r="3" fill="#fff" /><circle cx="43" cy="42" r="3" fill={accent} /></>;
  }
  if (motif === 15) {
    return <><path d="M32 6 47 17l-5 11 8 8-18 22L13 37l9-10-4-10Z" fill="#13243a" stroke={accent} strokeWidth="3" strokeLinejoin="round" /><path d="m32 12 7 19-8 18-7-19Z" fill={secondary} /><path d="m32 20 1 11-2 10" stroke="#fff" strokeWidth="2" /></>;
  }
  if (motif === 16) {
    return <><path d="M14 49 19 20l13-10 13 10 5 29-18 9Z" fill="#293d20" stroke={accent} strokeWidth="3" /><path d="M32 49V27m0 12q-13-1-15-13 12 1 15 13Zm0-8q2-12 15-13-2 12-15 13Z" fill={secondary} stroke="#eaffcc" strokeWidth="2" /><circle cx="32" cy="49" r="4" fill="#fff" /></>;
  }
  if (motif === 17) {
    return <><path d="m17 16 15-8 15 8v32l-15 9-15-9Z" fill="#431d2b" stroke={accent} strokeWidth="3" /><path d="m22 22 10 6 10-6v18l-10 7-10-7Z" fill="none" stroke={secondary} strokeWidth="3" /><path d="m28 33 4-6 4 6-4 6Z" fill="#fff" /></>;
  }
  if (motif === 18) {
    return <><circle cx="32" cy="32" r="23" fill="#152a32" stroke={accent} strokeWidth="3" /><path d="M14 34q18-20 36-2-18 21-36 2Z" fill={secondary} stroke="#fff" strokeWidth="2" /><circle cx="32" cy="33" r="6" fill="#151126" /><circle cx="32" cy="33" r="2" fill="#fff" /><path d="M13 18 8 12m43 6 5-6" stroke={accent} strokeWidth="3" /></>;
  }
  if (motif === 19) {
    return <><path d="M15 15h34v37H15z" fill="#34203f" stroke={accent} strokeWidth="3" /><path d="m22 43 7-17 7 17m-11-6h9m8-11 5 5-5 5m-8 0-5 5 5 5" fill="none" stroke={secondary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="22" cy="20" r="2" fill="#fff" /></>;
  }
  if (motif === 20) {
    return <><path d="M32 8 54 46 32 57 10 46Z" fill="#332416" stroke={accent} strokeWidth="3" /><path d="m32 15 14 29-14 7-14-7Z" fill={secondary} /><path d="m23 38 7-6 6 6 7-9" fill="none" stroke="#fff" strokeWidth="2.5" /><circle cx="32" cy="26" r="3" fill="#fff" /></>;
  }
  if (motif === 21) {
    return <><path d="M32 7q16 9 12 28l-12 18-12-18Q16 16 32 7Z" fill="#142d39" stroke={accent} strokeWidth="3" /><circle cx="32" cy="29" r="8" fill={secondary} stroke="#fff" strokeWidth="2" /><path d="m18 40-7 11 14-5m21-6 7 11-14-5" fill="none" stroke={accent} strokeWidth="3" /><path d="M28 42h8" stroke="#fff" strokeWidth="2" /></>;
  }
  if (motif === 22) {
    return <><path d="m15 19 17-11 17 11v29L32 57 15 48Z" fill="#292142" stroke={accent} strokeWidth="3" /><path d="m23 25 9-6 9 6v17l-9 6-9-6Z" fill="#111126" stroke={secondary} strokeWidth="2" /><path d="M27 29h10m-10 6h10m-10 6h6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /></>;
  }
  if (motif === 23) {
    return <><circle cx="32" cy="32" r="19" fill="none" stroke={accent} strokeWidth="6" /><path d="M32 8v10m0 28v10M8 32h10m28 0h10" stroke={secondary} strokeWidth="4" strokeLinecap="round" /><path d="m24 33 6 6 12-15" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="32" cy="32" r="26" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="2 5" /></>;
  }
  if (motif === 24) {
    return <><path d="M32 5 56 32 32 59 8 32Z" fill="#311740" stroke={accent} strokeWidth="3" /><path d="M32 13v38M14 32h36m-31-13 26 26m0-26L19 45" stroke={secondary} strokeWidth="2" /><circle cx="32" cy="32" r="8" fill={accent} stroke="#fff" strokeWidth="2" /><circle cx="32" cy="32" r="2" fill="#fff" /></>;
  }
  if (motif === 25) {
    return <><path d="M12 22q0-7 7-7h26q7 0 7 7v25q0 7-7 7H19q-7 0-7-7Z" fill="#163529" stroke={accent} strokeWidth="3" /><path d="M15 27h34v9H35q-5 0-5 5t5 5h14" fill="none" stroke={secondary} strokeWidth="4" strokeLinejoin="round" /><circle cx="38" cy="41" r="2" fill="#fff" /></>;
  }
  if (motif === 26) {
    return <><path d="M32 6 39 22 56 24 43 36 47 54 32 45 17 54 21 36 8 24 25 22Z" fill="#45262e" stroke={accent} strokeWidth="3" strokeLinejoin="round" /><path d="M22 30h6m8 0h6m-15 8q5 5 10 0" fill="none" stroke={secondary} strokeWidth="3" strokeLinecap="round" /><circle cx="25" cy="31" r="2" fill="#fff" /><circle cx="39" cy="31" r="2" fill="#fff" /></>;
  }
  if (motif === 27) {
    return <><path d="M18 26q0-14 14-14t14 14v16q0 12-14 12T18 42Z" fill="#202c3e" stroke={accent} strokeWidth="3" /><path d="M20 29q12 7 24 0v9q-12 8-24 0Z" fill={secondary} /><path d="m25 33 4 2m6 0 4-2m-11 8q4 3 8 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" /><path d="m21 17-6-5m28 5 6-5" stroke={accent} strokeWidth="3" /></>;
  }
  if (motif === 28) {
    return <><path d="M14 14h36v39H14z" fill="#203936" stroke={accent} strokeWidth="3" /><path d="M22 20v27m10-33v33m10-22v22" stroke={secondary} strokeWidth="3" /><path d="M18 35h8v8h-8Zm10-9h8v12h-8Zm10-4h8v9h-8Z" fill={accent} stroke="#fff" strokeWidth="1.5" /></>;
  }
  if (motif === 29) {
    return <><path d="M32 8 52 17v15q0 16-20 25Q12 48 12 32V17Z" fill="#183347" stroke={accent} strokeWidth="3" /><circle cx="32" cy="31" r="12" fill="none" stroke={secondary} strokeWidth="3" /><circle cx="32" cy="31" r="5" fill="#fff" /><path d="M22 44h20" stroke="#fff" strokeWidth="2" /></>;
  }
  if (motif === 30) {
    return <><path d="m12 18 20-10 20 10v29L32 57 12 47Z" fill="#3c2b19" stroke={accent} strokeWidth="3" /><path d="m20 23 12 7 12-7m-24 0v17l12 7 12-7V23m-12 7v17" fill="none" stroke={secondary} strokeWidth="3" strokeLinejoin="round" /><circle cx="32" cy="21" r="3" fill="#fff" /></>;
  }
  if (motif === 31) {
    return <><path d="M32 8q-8 12-8 23 0 14 8 24 8-10 8-24 0-11-8-23Z" fill="#3f2a13" stroke={accent} strokeWidth="3" /><path d="M32 18v27m-8-12 8 5 8-8" stroke={secondary} strokeWidth="3" strokeLinecap="round" /><circle cx="32" cy="30" r="4" fill="#fff" /><path d="M21 53h22" stroke={accent} strokeWidth="3" /></>;
  }
  if (motif === 32) {
    return <><path d="M17 11h30v42H17z" fill="#142743" stroke={accent} strokeWidth="3" /><path d="M23 18h18v13H23z" fill="#312043" stroke={secondary} strokeWidth="2" /><circle cx="37" cy="23" r="3" fill="#fff" /><path d="m21 42 8-8 6 5 8-7" fill="none" stroke={secondary} strokeWidth="3" /><path d="M24 49h16" stroke="#fff" strokeWidth="2" /></>;
  }
  if (motif === 33) {
    return <><circle cx="32" cy="32" r="20" fill="#3b1b42" stroke={accent} strokeWidth="3" /><circle cx="32" cy="32" r="11" fill="none" stroke={secondary} strokeWidth="4" /><path d="M32 9v9m0 28v9M9 32h9m28 0h9" stroke="#fff" strokeWidth="2.5" /><circle cx="32" cy="32" r="4" fill={accent} /></>;
  }
  if (motif === 34) {
    return <><path d="M11 45 24 22l8 12 8-18 13 29Z" fill="#25402b" stroke={accent} strokeWidth="3" strokeLinejoin="round" /><path d="M16 45 28 34m7 11 10-16" stroke={secondary} strokeWidth="3" /><circle cx="42" cy="21" r="4" fill="#fff" /><path d="M20 51h24" stroke={accent} strokeWidth="3" /></>;
  }
  if (motif === 35) {
    return <><path d="M18 8h24l8 9v36H14V17Z" fill="#352147" stroke={accent} strokeWidth="3" strokeLinejoin="round" /><path d="M22 25h20m-20 8h15m-15 8h19" stroke={secondary} strokeWidth="3" strokeLinecap="round" /><path d="m34 12 3 5-5 4 6 4-5 5" fill="none" stroke="#fff" strokeWidth="2" /></>;
  }
  if (motif === 36) {
    return <><path d="M32 6q14 11 10 27l-10 8-10-8Q18 17 32 6Z" fill="#3b2030" stroke={accent} strokeWidth="3" /><circle cx="32" cy="25" r="7" fill={secondary} stroke="#fff" strokeWidth="2" /><path d="m22 38-9 10 13-2m18-8 9 10-13-2M27 43l5 12 5-12" fill="none" stroke={accent} strokeWidth="3" strokeLinejoin="round" /><path d="M29 45q-4 5 0 9m6-9q4 5 0 9" stroke="#fff" strokeWidth="2" /></>;
  }
  if (motif === 37) {
    return <><path d="M32 5 53 24 45 51 32 59 19 51 11 24Z" fill="#28203e" stroke={accent} strokeWidth="3" /><path d="m32 13 12 12-5 20-7 7-7-7-5-20Z" fill={secondary} stroke="#fff" strokeWidth="2" /><path d="m32 17 0 32m-10-24 20 8m-20 0 20-8" stroke="#fff" strokeWidth="2" /></>;
  }
  return <circle cx="32" cy="32" r="22" fill={accent} stroke={secondary} strokeWidth="3" />;
}

function HorrorRelicDrawing({ index, accent, secondary }: { index: number; accent: string; secondary: string }) {
  const dark = '#17131c';
  const bone = '#e8dfcb';

  switch (index) {
    case 0:
      return <><ellipse cx="32" cy="34" rx="8" ry="11" fill={dark} stroke={accent} strokeWidth="3" /><circle cx="32" cy="22" r="5" fill={accent} stroke={bone} strokeWidth="2" />{[0, 1, 2, 3].map((leg) => <path key={leg} d={`M${27 + leg * 3} ${27 + (leg % 2) * 4}l${leg < 2 ? -13 : 13} ${leg % 2 ? 11 : -11}`} fill="none" stroke={secondary} strokeWidth="2.5" strokeLinecap="round" />)}</>;
    case 1:
      return <><path d="M14 30q0-18 18-18t18 18v15l-9 9H23l-9-9Z" fill="#78915a" stroke={accent} strokeWidth="3" /><path d="M20 31h9m6 0h9" stroke={dark} strokeWidth="6" strokeLinecap="round" /><circle cx="24" cy="31" r="2" fill="#e8ffaf" /><circle cx="40" cy="31" r="2" fill="#e8ffaf" /><path d="m24 43 5-3 4 4 4-4 5 3" fill="none" stroke={bone} strokeWidth="2.5" /><path d="M18 22 25 25m21-3-7 3" stroke={bone} strokeWidth="2" /></>;
    case 2:
      return <><path d="M32 7C26 19 15 29 15 41a17 17 0 0 0 34 0C49 29 38 19 32 7Z" fill={accent} stroke={bone} strokeWidth="2.5" /><path d="M23 42q2 8 9 8" fill="none" stroke="#ffd5d9" strokeWidth="3" strokeLinecap="round" /><circle cx="39" cy="37" r="3" fill={secondary} /></>;
    case 3:
      return <><path d="M16 28q0-17 16-17t16 17v16l-7 7H23l-7-7Z" fill={dark} stroke={bone} strokeWidth="3" /><path d="M23 31h5m8 0h5" stroke={accent} strokeWidth="5" strokeLinecap="round" /><path d="m24 41 4 8 4-8 4 8 4-8" fill={bone} stroke={secondary} strokeWidth="2" /><circle cx="32" cy="23" r="3" fill={secondary} /></>;
    case 4:
      return <><path d="M32 26Q20 9 9 14q4 8 2 21 9-7 20 0 11-7 20 0-2-13 2-21-11-5-21 12Z" fill={dark} stroke={accent} strokeWidth="3" /><path d="M32 26q-8 8-7 21l7 8 7-8q1-13-7-21Z" fill={secondary} stroke={bone} strokeWidth="2" /><circle cx="29" cy="37" r="2" fill={bone} /><circle cx="35" cy="37" r="2" fill={bone} /></>;
    case 5:
      return <><path d="M16 13h32v43H16z" fill="#2c242c" stroke={accent} strokeWidth="3" /><path d="M11 18h42M11 52h42" stroke={secondary} strokeWidth="3" /><text x="32" y="42" textAnchor="middle" fill={bone} fontSize="18" fontFamily="serif" fontWeight="900">RIP</text><path d="M25 47h14" stroke={accent} strokeWidth="2" /></>;
    case 6:
      return <><circle cx="32" cy="33" r="23" fill={dark} stroke={accent} strokeWidth="4" /><circle cx="32" cy="33" r="17" fill="none" stroke={bone} strokeWidth="2" />{[0, 1, 2, 3, 4, 5].map((tick) => <path key={tick} d={`M${32 + Math.sin(tick * Math.PI / 3) * 13} ${33 - Math.cos(tick * Math.PI / 3) * 13}l${Math.sin(tick * Math.PI / 3) * 3} ${-Math.cos(tick * Math.PI / 3) * 3}`} stroke={secondary} strokeWidth="2" />)}<path d="M32 33V20m0 13 9 5" stroke={bone} strokeWidth="2.5" strokeLinecap="round" /><circle cx="32" cy="33" r="3" fill={accent} /></>;
    case 7:
      return <><path d="m12 18 13 11 7-8 7 8 13-11M12 34l13 8 7-7 7 7 13-8M12 50l13-4 7 8 7-8 13 4" fill="none" stroke={accent} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" /><path d="M17 14 12 18l5 4m30-8 5 4-5 4" fill="none" stroke={bone} strokeWidth="2" /></>;
    case 8:
      return <><path d="M13 25 32 12l19 13v31H13Z" fill="#373039" stroke={accent} strokeWidth="3" /><path d="M25 56V37h14v19" fill={dark} stroke={bone} strokeWidth="2" /><path d="M20 28h24m-20 5h16" stroke={secondary} strokeWidth="2" /><path d="m32 18 3 5 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1Z" fill={accent} /></>;
    case 9:
      return <><path d="M14 32q0-19 18-19t18 19v13l-9 10H23l-9-10Z" fill={bone} stroke={accent} strokeWidth="3" /><ellipse cx="24" cy="34" rx="5" ry="7" fill={dark} /><ellipse cx="40" cy="34" rx="5" ry="7" fill={dark} /><path d="m32 37-4 7h8Zm-8 13v-5m5 7v-7m6 7v-7m5 5v-5" stroke={dark} strokeWidth="2" /></>;
    case 10:
      return <><path d="M20 17q0-8 12-8t12 8v22l8 12H12l8-12Z" fill={bone} fillOpacity=".18" stroke={accent} strokeWidth="3" /><circle cx="27" cy="31" r="3" fill={secondary} /><circle cx="37" cy="31" r="3" fill={secondary} /><path d="M27 41h10m-5-12v5" stroke={bone} strokeWidth="2.5" strokeLinecap="round" /><path d="M18 51h28" stroke={accent} strokeWidth="3" /></>;
    case 11:
      return <><path d="M20 18q-8-8-11 2l12 16q-8 11 1 14 7 0 10-9 3 9 10 9 9-3 1-14l12-16q-3-10-11-2L32 32Z" fill={bone} stroke={accent} strokeWidth="3" strokeLinejoin="round" /><circle cx="18" cy="22" r="2" fill={secondary} /><circle cx="46" cy="22" r="2" fill={secondary} /><circle cx="23" cy="45" r="2" fill={secondary} /><circle cx="41" cy="45" r="2" fill={secondary} /></>;
    case 12:
      return <><path d="M28 10h8v9l6 7v24q-10 9-20 0V26l6-7Z" fill={dark} stroke={accent} strokeWidth="3" /><path d="M28 10h8m-11 22q7-6 18 0v10q-9 7-18 0Z" fill={secondary} /><path d="M32 26q-6-8 0-13 6 5 0 13Z" fill={bone} /><path d="M24 50h16" stroke={bone} strokeWidth="2" /></>;
    case 13:
      return <><path d="M8 32q24-25 48 0Q32 57 8 32Z" fill={dark} stroke={accent} strokeWidth="3" /><circle cx="32" cy="32" r="13" fill={secondary} stroke={bone} strokeWidth="2" /><circle cx="32" cy="32" r="6" fill={dark} /><circle cx="32" cy="32" r="2" fill={bone} /><path d="m15 26-5-5m39 5 5-5" stroke={accent} strokeWidth="3" /></>;
    case 14:
      return <><path d="m13 47 26-29 8 7-27 30-7-8Z" fill={bone} stroke={accent} strokeWidth="3" /><path d="M37 23 47 9q5-4 8 1l-9 17M19 48l-8 9 12-3" fill="none" stroke={secondary} strokeWidth="4" strokeLinecap="round" /><path d="m35 30 8 6" stroke={dark} strokeWidth="3" /></>;
    case 15:
      return <><path d="M8 31 32 11l24 20v24H8Z" fill="#29232d" stroke={accent} strokeWidth="3" /><path d="M18 34h8v9h-8Zm22 0h8v9h-8Zm-13 21V42h10v13" fill={secondary} stroke={bone} strokeWidth="2" /><path d="M32 11v-6m-5 9 5-8 5 8" stroke={bone} strokeWidth="2" /></>;
    case 16:
      return <><path d="M28 9h8v8l8 7v25q-12 9-24 0V24l8-7Z" fill="#25252b" stroke={accent} strokeWidth="3" /><path d="M21 34q11-8 22 0v10q-11 8-22 0Z" fill={secondary} /><circle cx="28" cy="38" r="2" fill={bone} /><circle cx="36" cy="38" r="2" fill={bone} /><path d="M27 9h10m-6 8v6" stroke={bone} strokeWidth="2" /></>;
    case 17:
      return <><path d="m15 25 7-15 10 9 10-9 7 15-5 23-12 9-12-9Z" fill={dark} stroke={accent} strokeWidth="3" /><path d="m21 34 8 3m6 0 8-3m-17 9 6 7 6-7" fill="none" stroke={bone} strokeWidth="3" strokeLinecap="round" /><path d="M23 25h18" stroke={secondary} strokeWidth="3" /></>;
    case 18:
      return <><path d="m13 27 4-16 13 12 13-12 4 16q1 23-15 29Q15 50 13 27Z" fill={dark} stroke={accent} strokeWidth="3" /><path d="m18 31 10 3m8 0 10-3" stroke={secondary} strokeWidth="4" /><circle cx="26" cy="34" r="2" fill={bone} /><circle cx="38" cy="34" r="2" fill={bone} /><path d="M28 42h8" stroke={bone} strokeWidth="2" /></>;
    case 19:
      return <><path d="M11 16q11-5 21 4 10-9 21-4v36q-11-5-21 4-10-9-21-4Z" fill="#28212a" stroke={accent} strokeWidth="3" /><path d="M32 20v35m-15-28 9 5m-9 3 9 5m13-13 9-5m-9 13 9-5" stroke={secondary} strokeWidth="2" /><path d="m24 31 8 4 8-4" fill="none" stroke={bone} strokeWidth="2" /></>;
    case 20:
      return <><path d="M16 25h32v29H16z" fill={dark} stroke={accent} strokeWidth="3" /><path d="M21 25q0-14 11-14t11 14" fill="none" stroke={bone} strokeWidth="3" /><path d="M24 31h16v16H24z" fill={secondary} /><path d="M32 34q-6 7 0 10 6-3 0-10Z" fill={bone} /></>;
    case 21:
      return <><path d="M18 17h28v40H18z" fill={dark} stroke={accent} strokeWidth="3" /><path d="M14 17h36v8H14zM22 10h20v7H22z" fill={secondary} stroke={bone} strokeWidth="2" /><path d="m32 31 7 7-7 7-7-7Z" fill={accent} stroke={bone} strokeWidth="2" /><path d="M32 32v12m-5-6h10" stroke={dark} strokeWidth="2" /></>;
    case 22:
      return <><path d="m32 7 8 14 16 7-12 11 2 17-14-8-14 8 2-17L8 28l16-7Z" fill={dark} stroke={accent} strokeWidth="3" strokeLinejoin="round" /><circle cx="32" cy="32" r="8" fill={secondary} stroke={bone} strokeWidth="2" /><circle cx="32" cy="32" r="3" fill={dark} /></>;
    case 23:
      return <><path d="M19 23 10 14l3 22 14 3-4 8 9 11 7-12-5-8 12-2 7-21-13 10-8-5-8 5Z" fill={dark} stroke={accent} strokeWidth="3" strokeLinejoin="round" /><circle cx="31" cy="29" r="2" fill={bone} /><path d="m32 36 4 5-4 5" fill="none" stroke={secondary} strokeWidth="2.5" /></>;
    case 24:
      return <><path d="m12 24 8-15 12 11L44 9l8 15-4 23-16 11-16-11Z" fill="#353039" stroke={accent} strokeWidth="3" /><path d="m20 31 8 3m8 0 8-3m-16 9 4 5 4-5" fill="none" stroke={bone} strokeWidth="3" /><path d="M24 19 18 8m22 11 6-11" stroke={secondary} strokeWidth="3" /></>;
    case 25:
      return <><path d="M32 8v48M8 32h48M15 15l34 34m0-34L15 49" stroke={accent} strokeWidth="2" /><path d="M32 12 52 32 32 52 12 32Z" fill="none" stroke={secondary} strokeWidth="3" /><circle cx="32" cy="32" r="5" fill={bone} /><circle cx="32" cy="12" r="3" fill={accent} /><circle cx="52" cy="32" r="3" fill={accent} /></>;
    case 26:
      return <><path d="M20 54q-7-1-5-9l2-20q1-5 5-3l2 11-1-20q0-6 5-5l3 19V11q1-6 6-4l1 20 2-12q2-5 6-2l-1 18 4-7q5-2 5 4l-5 18q-3 9-12 10Z" fill={secondary} stroke={accent} strokeWidth="3" strokeLinejoin="round" /><path d="M25 44h20" stroke={bone} strokeWidth="2" /></>;
    case 27:
      return <><path d="M32 8v48M18 23h28" stroke={bone} strokeWidth="8" strokeLinecap="round" /><path d="M32 8v48M18 23h28" stroke={accent} strokeWidth="3" strokeLinecap="round" /><path d="M12 50q20-9 40 0" fill="none" stroke={secondary} strokeWidth="3" /></>;
    case 28:
      return <><path d="M13 43q3-9 10-9 0-20 9-25 9 5 9 25 7 0 10 9l-7 5H20Z" fill={dark} stroke={accent} strokeWidth="3" /><path d="M10 48h44v7H10z" fill={secondary} stroke={bone} strokeWidth="2" /><path d="m27 22 5 6 5-6m-8 13 3 5 3-5" fill="none" stroke={bone} strokeWidth="2" /></>;
    case 29:
      return <><path d="M10 48 47 13m-4-4 8 8M9 49q-3 6 4 5l8-8-8-7Z" fill={secondary} stroke={accent} strokeWidth="3" strokeLinejoin="round" /><path d="m37 21 6 6m-14 1 6 6m-14 1 6 6" stroke={bone} strokeWidth="2.5" /></>;
    case 30:
      return <><path d="M20 53q-7 0-7-8l2-20q2-5 6-2l1 12 1-23q4-6 7 0l1 21 2-17q5-4 7 1l-1 17 3-10q6-2 6 4l-3 18q-2 8-10 9Z" fill={secondary} stroke={accent} strokeWidth="3" /><path d="M22 45h20m-16 5h13" stroke={bone} strokeWidth="2" /></>;
    case 31:
      return <><path d="M32 32 13 16q8-11 19 9 11-20 19-9ZM32 32 13 48q8 11 19-9 11 20 19 9Z" fill={dark} stroke={accent} strokeWidth="3" /><path d="M32 13v38m-7-20h14" stroke={secondary} strokeWidth="3" /><circle cx="32" cy="30" r="4" fill={bone} /></>;
    case 32:
      return <><path d="M16 11q-7 6 0 12t0 12q-7 6 0 12t0 12m32-48q7 6 0 12t0 12q7 6 0 12t0 12" fill="none" stroke={accent} strokeWidth="5" /><path d="M16 16h32M16 48h32" stroke={secondary} strokeWidth="3" /><circle cx="16" cy="16" r="5" fill={bone} /><circle cx="48" cy="48" r="5" fill={bone} /></>;
    case 33:
      return <><path d="M42 11a22 22 0 1 0 10 36A19 19 0 0 1 42 11Z" fill={secondary} stroke={accent} strokeWidth="3" /><circle cx="17" cy="18" r="2" fill={bone} /><circle cx="14" cy="41" r="2" fill={bone} /><circle cx="30" cy="12" r="2" fill={bone} /><path d="m18 28 3 5 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1Z" fill={accent} /></>;
    case 34:
      return <><path d="M32 14q20 0 21 19-1 20-21 22Q12 53 11 33 12 14 32 14Z" fill="#8d4a2d" stroke={accent} strokeWidth="3" /><path d="M32 14q-7-8 0-11 7 3 0 11Zm-15 9q15 4 30 0M17 43q15-4 30 0" fill="none" stroke={bone} strokeWidth="2" /><path d="M23 31v5m18-5v5" stroke={dark} strokeWidth="4" /><path d="M27 43h10" stroke={dark} strokeWidth="3" /></>;
    case 35:
      return <><circle cx="23" cy="18" r="9" fill="none" stroke={accent} strokeWidth="4" /><path d="M29 24 49 44l-5 5-5-5-4 4-5-5 4-4-10-10" fill={secondary} stroke={bone} strokeWidth="2.5" strokeLinejoin="round" /><path d="M40 39 47 32m-10 1 6-6" stroke={accent} strokeWidth="3" /></>;
    case 36:
      return <><path d="M31 57q-15-8-7-20 8-8 1-17 17 5 11 18 11-4 8-14 16 23-3 33-5Z" fill={secondary} stroke={accent} strokeWidth="3" strokeLinejoin="round" /><path d="M29 52q-5-9 3-14m5 14q7-7 3-13" fill="none" stroke={bone} strokeWidth="2.5" strokeLinecap="round" /></>;
    case 37:
      return <><path d="M11 31q2-17 21-17t21 17q-2 7-21 7t-21-7Z" fill={accent} stroke={bone} strokeWidth="3" /><path d="M32 38v17m-8-1h16" stroke={secondary} strokeWidth="4" strokeLinecap="round" /><path d="M21 26q11 6 22 0" stroke={bone} strokeWidth="2" /><circle cx="26" cy="31" r="2" fill={dark} /><circle cx="38" cy="31" r="2" fill={dark} /></>;
    case 38:
      return <><path d="M13 17q19-10 38 0v30q-19 10-38 0Z" fill={dark} stroke={accent} strokeWidth="3" /><path d="m18 27 9 2m10 0 9-2m-22 11 8 8 8-8" fill="none" stroke={bone} strokeWidth="3" strokeLinecap="round" /><path d="M20 20q4-6 8 0m8 0q4-6 8 0" fill="none" stroke={secondary} strokeWidth="3" /></>;
    case 39:
      return <><path d="M11 35 23 14h18l12 21-21 20Z" fill={dark} stroke={accent} strokeWidth="3" strokeLinejoin="round" /><path d="m18 33 10-5m8 0 10 5m-13-3v10m-9 5q9-7 18 0" fill="none" stroke={secondary} strokeWidth="3" strokeLinecap="round" /><circle cx="25" cy="32" r="2" fill={bone} /><circle cx="39" cy="32" r="2" fill={bone} /></>;
    case 40:
      return <><path d="M15 12h34v44H15z" fill="#28212a" stroke={accent} strokeWidth="3" /><path d="M21 20h22M21 27h22" stroke={bone} strokeWidth="2" /><path d="m24 39 5 5 12-13" fill="none" stroke={secondary} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 50h22" stroke={accent} strokeWidth="3" /></>;
    case 41:
      return <><path d="M32 8q18 5 18 22 0 18-18 27Q14 48 14 30 14 13 32 8Z" fill={secondary} stroke={accent} strokeWidth="3" /><path d="M32 16v31M22 25l10 6 10-6" fill="none" stroke={bone} strokeWidth="3" strokeLinecap="round" /><circle cx="32" cy="34" r="4" fill={dark} /></>;
    default:
      return <PunkRelicDrawing index={index} accent={accent} secondary={secondary} />;
  }
}

export function HorrorCardArtwork({
  index,
  className = 'h-full w-full',
  label,
  isCovered = false,
}: {
  index: number;
  className?: string;
  label?: string;
  isCovered?: boolean;
}) {
  const accent = NEON_COLORS[index % NEON_COLORS.length];
  const secondary = NEON_COLORS[(index + 19) % NEON_COLORS.length];

  return (
    <svg
      viewBox="0 0 64 64"
      preserveAspectRatio="none"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <rect width="64" height="64" fill="#08090a" />
      <rect width="64" height="64" fill={accent} fillOpacity=".08" />
      <path d="M0 49 64 13M-4 64 64 26M8 0l56 56" stroke={accent} strokeOpacity=".12" strokeWidth="1.5" />
      <HorrorRelicDrawing index={index} accent={accent} secondary={secondary} />
      <path d="M3 3h58v58H3Z" fill="none" stroke={accent} strokeOpacity=".7" strokeWidth="1.5" />
      <path d="M7 7h8M7 7v8m50-8h-8m8 0v8M7 57h8m-8 0v-8m50 8h-8m8 0v-8" fill="none" stroke="#e8dfcb" strokeOpacity=".7" strokeWidth="1.5" />
      {isCovered && <rect width="64" height="64" fill="#08090a" fillOpacity=".5" />}
    </svg>
  );
}

function TileArtwork({ art }: { art: string }) {
  const artIndex = TILE_FACES.findIndex((face) => face.art === art);
  if (artIndex >= 0) {
    return <HorrorCardArtwork index={artIndex} />;
  }

  const colors = getNeonColors(art);
  const cat = art.startsWith('cat-');
  let drawing: React.ReactNode;

  if (art === 'crypto-btc' || art === 'crypto-token' || art === 'crypto-coin') {
    const mark = art === 'crypto-btc' ? '₿' : art === 'crypto-token' ? 'T' : '₿';
    drawing = (
      <>
        <circle cx="32" cy="33" r="22" fill={colors.accent} stroke={colors.dark} strokeWidth="3" />
        <circle cx="32" cy="33" r="17" fill="none" stroke="#fff4c2" strokeWidth="2" />
        <text x="32" y="42" textAnchor="middle" fontSize="27" fontWeight="900" fill="#fff9df">{mark}</text>
        <path d="M17 18q13-8 26 0" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  } else if (art === 'crypto-eth' || art === 'crypto-gem') {
    drawing = (
      <>
        <path d="m32 8 17 25-17 10-17-10L32 8Z" fill={colors.accent} stroke={colors.dark} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="m32 8 0 35m-17-10 17-8 17 8-17 25-17-25Z" fill={colors.light} fillOpacity=".52" stroke="#fff" strokeWidth="1.5" />
        <path d="m32 45 17-12-17 25-17-25 17 12Z" fill={colors.dark} fillOpacity=".6" />
      </>
    );
  } else if (art === 'crypto-wallet' || art === 'crypto-card' || art === 'crypto-cold') {
    drawing = (
      <>
        <path d="M13 20q0-5 6-5h27q5 0 5 5v27q0 5-5 5H18q-5 0-5-5V20Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" />
        <path d="M14 25h34v9H35q-5 0-5 5t5 5h13" fill={colors.light} stroke={colors.dark} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="37" cy="39" r="2" fill={colors.dark} />
        {art === 'crypto-cold' && <path d="m25 14 2-4m12 4-2-4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />}
      </>
    );
  } else if (art === 'crypto-chain' || art === 'crypto-network' || art === 'crypto-node') {
    drawing = (
      <>
        <path d="m20 23 12 9 13-11M20 43l12-11 13 10" fill="none" stroke={colors.dark} strokeWidth="4" strokeLinecap="round" />
        <circle cx="19" cy="22" r="7" fill={colors.accent} stroke="#fff" strokeWidth="2" />
        <circle cx="45" cy="21" r="7" fill={colors.accent} stroke="#fff" strokeWidth="2" />
        <circle cx="32" cy="32" r="8" fill={colors.light} stroke={colors.dark} strokeWidth="2.5" />
        <circle cx="19" cy="44" r="7" fill={colors.accent} stroke="#fff" strokeWidth="2" />
        <circle cx="45" cy="43" r="7" fill={colors.accent} stroke="#fff" strokeWidth="2" />
      </>
    );
  } else if (art === 'crypto-nft') {
    drawing = (
      <>
        <rect x="13" y="12" width="38" height="41" rx="5" fill={colors.accent} stroke={colors.dark} strokeWidth="3" />
        <rect x="18" y="17" width="28" height="24" rx="3" fill={colors.light} />
        <circle cx="38" cy="24" r="4" fill="#fff" />
        <path d="m20 38 8-9 5 5 4-4 9 8" fill="none" stroke={colors.dark} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M21 47h22" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </>
    );
  } else if (art === 'crypto-mining' || art === 'crypto-key') {
    drawing = art === 'crypto-key'
      ? <><circle cx="24" cy="28" r="10" fill="none" stroke={colors.dark} strokeWidth="6" /><path d="m32 35 17 17m-7-7 5-5m-11-1 5-5" stroke={colors.accent} strokeWidth="6" strokeLinecap="round" /></>
      : <><path d="m14 44 24-24 9 9-24 24-9-9Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" strokeLinejoin="round" /><path d="m31 27 6 6M24 34l6 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /><path d="m35 18 5-7 11 11-7 5" fill={colors.light} stroke={colors.dark} strokeWidth="2.5" strokeLinejoin="round" /></>;
  } else if (art === 'crypto-chart' || art === 'crypto-candles' || art === 'crypto-profit') {
    drawing = (
      <>
        <path d="M13 49h39M15 44l10-11 8 5 16-20" fill="none" stroke={colors.dark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m41 18 8-2-1 8" fill="none" stroke={colors.dark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {art === 'crypto-candles' && <><path d="M22 17v24m-4-17h8v9h-8Zm14-6v25m-4-16h8v8h-8Zm14-14v19m-4-13h8v7h-8Z" fill={colors.accent} stroke="#fff" strokeWidth="1.5" /></>}
        {art === 'crypto-profit' && <text x="31" y="35" textAnchor="middle" fontSize="18" fontWeight="900" fill={colors.accent}>+</text>}
      </>
    );
  } else if (art === 'crypto-contract' || art === 'crypto-code') {
    drawing = (
      <>
        <path d="M19 11h20l8 8v34H19V11Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" strokeLinejoin="round" />
        <path d="M39 11v9h8M25 29h15m-15 7h15m-15 7h9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="m27 25-4 4 4 4m12 0 4-4-4-4" fill="none" stroke={colors.dark} strokeWidth="2" strokeLinecap="round" />
      </>
    );
  } else if (art === 'crypto-shield') {
    drawing = (
      <>
        <path d="M32 10 50 17v13q0 15-18 25Q14 45 14 30V17l18-7Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" strokeLinejoin="round" />
        <path d="m22 32 7 7 14-16" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
  } else if (art === 'crypto-stake' || art === 'crypto-airdrop') {
    drawing = (
      <>
        <path d="M32 51V24m0 12q-13-1-16-13 12-2 16 13Zm0-7q3-14 16-15-1 13-16 15Z" fill={colors.accent} stroke={colors.dark} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M19 48h26" stroke={colors.dark} strokeWidth="4" strokeLinecap="round" />
        {art === 'crypto-airdrop' && <path d="M22 15 32 8l10 7m-10-6v18" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
      </>
    );
  } else if (art === 'crypto-rocket') {
    drawing = (
      <>
        <path d="M32 11q15 9 11 27l-11 9-11-9q-4-18 11-27Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" />
        <circle cx="32" cy="27" r="5" fill={colors.light} stroke={colors.dark} strokeWidth="2" />
        <path d="m21 34-8 10 11-2m19-8 8 10-11-2M27 48l5 8 5-8" fill={colors.light} stroke={colors.dark} strokeWidth="2.5" strokeLinejoin="round" />
      </>
    );
  } else if (art === 'crypto-bull' || art === 'crypto-bear') {
    drawing = (
      <>
        {art === 'crypto-bull'
          ? <><path d="M15 27q-8-8-7-14 11 0 15 10m26 4q8-8 7-14-11 0-15 10" fill={colors.light} stroke={colors.dark} strokeWidth="3" strokeLinejoin="round" /><path d="M14 31q0-15 18-15t18 15v13q0 8-18 8t-18-8V31Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" /><path d="M23 33h3m12 0h3m-10 3v5" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></>
          : <><circle cx="32" cy="33" r="19" fill={colors.accent} stroke={colors.dark} strokeWidth="3" /><path d="M22 31h5m10 0h5m-17 8q7 6 14 0m-7-5v4" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" /><path d="m22 14-5-5m25 5 5-5" stroke={colors.dark} strokeWidth="3" strokeLinecap="round" /></>}
      </>
    );
  } else if (art === 'crypto-exchange') {
    drawing = (
      <>
        <path d="M15 24h32l-7-7m7 7-7 7M49 40H17l7 7m-7-7 7-7" fill="none" stroke={colors.dark} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="22" cy="24" r="4" fill="#fff" /><circle cx="42" cy="40" r="4" fill="#fff" />
      </>
    );
  } else if (art === 'hell-btc' || art === 'hell-token') {
    drawing = (
      <>
        <circle cx="32" cy="33" r="22" fill={colors.accent} stroke={colors.dark} strokeWidth="3" />
        <circle cx="32" cy="33" r="16" fill="none" stroke="#ffd28a" strokeWidth="2" />
        <text x="32" y="42" textAnchor="middle" fontSize="26" fontWeight="900" fill="#fff2cf">{art === 'hell-btc' ? '₿' : '!'}</text>
        <path d="M22 18q-5-7 0-11m9 10q-4-9 2-13m8 14q-1-7 5-10" fill="none" stroke="#fff1b0" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  } else if (art === 'hell-eth' || art === 'hell-gem') {
    drawing = (
      <>
        <path d="m32 8 18 26-18 25-18-25L32 8Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" strokeLinejoin="round" />
        <path d="m32 8 0 34-18-8 18-26Zm0 34 18-8-18 25V42Z" fill="#ffe2a5" fillOpacity=".52" />
        <path d="M19 48q5-7 0-13m26 13q-5-7 0-13" fill="none" stroke="#fff1b0" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  } else if (art === 'hell-wallet') {
    drawing = (
      <>
        <path d="M13 21q0-6 7-6h27q5 0 5 6v26q0 5-5 5H18q-5 0-5-5V21Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" />
        <path d="M14 26h34v9H35q-5 0-5 5t5 5h13" fill="#ffd7a3" stroke={colors.dark} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="37" cy="40" r="2" fill={colors.dark} />
        <path d="m22 15-2-6 8 5m12 1 4-7 1 10" fill="none" stroke="#fff0ad" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  } else if (art === 'hell-chain') {
    drawing = (
      <>
        <path d="m19 23 13 9 13-9M19 43l13-11 13 11" fill="none" stroke={colors.dark} strokeWidth="4" strokeLinecap="round" />
        {[ [19, 23], [45, 23], [32, 32], [19, 43], [45, 43] ].map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r={index === 2 ? 8 : 7} fill={index % 2 ? '#ffb23f' : colors.accent} stroke="#ffe0a2" strokeWidth="2" />
        ))}
        <path d="M13 15q5-6 10 0m18 0q5-6 10 0" fill="none" stroke="#fff0ad" strokeWidth="2" strokeLinecap="round" />
      </>
    );
  } else if (art === 'hell-nft') {
    drawing = (
      <>
        <rect x="13" y="12" width="38" height="41" rx="5" fill={colors.accent} stroke={colors.dark} strokeWidth="3" />
        <rect x="18" y="17" width="28" height="26" rx="3" fill="#391827" />
        <path d="m22 24 6-7 3 9m11-2-6-7-3 9" fill="#ff613b" stroke="#ffcf88" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M24 33h5m7 0h5m-11 6q3 3 6 0" stroke="#fff1b0" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M21 48h22" stroke="#ffd394" strokeWidth="2" strokeLinecap="round" />
      </>
    );
  } else if (art === 'hell-mining') {
    drawing = (
      <>
        <path d="m15 46 25-25 9 9-25 25-9-9Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" strokeLinejoin="round" />
        <path d="m22 39 7 7m2-18 7 7m-1-20 11 11-7 7-11-11Z" fill="#ffd990" stroke={colors.dark} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M20 17q-4-5 1-9m11 10q-4-7 2-12" fill="none" stroke="#ff6338" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  } else if (art === 'hell-chart') {
    drawing = (
      <>
        <path d="M12 50h41M16 44l9-10 8 5 17-22" fill="none" stroke={colors.dark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m42 17 8-2-1 8" fill="none" stroke={colors.dark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 38q-6-5-2-11m15 13q-6-7-1-14m14-7q-6-7-1-13" fill="none" stroke="#ff9a37" strokeWidth="3" strokeLinecap="round" />
      </>
    );
  } else if (art === 'hell-exchange') {
    drawing = (
      <>
        <path d="M15 23h34l-7-7m7 7-7 7M49 42H15l7 7m-7-7 7-7" fill="none" stroke={colors.dark} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 23h20M23 42h20" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" />
        <path d="M18 15q-4-5 1-9m29 43q-4-5 1-9" fill="none" stroke="#ffbd58" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  } else if (art === 'hell-shield') {
    drawing = (
      <>
        <path d="M32 9 51 17v13q0 16-19 26Q13 46 13 30V17l19-8Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" strokeLinejoin="round" />
        <path d="m23 32 6 6 13-14" fill="none" stroke="#ffe3a8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m19 18-3-7 9 5m20 2 3-7-9 5" fill="#ffb546" stroke={colors.dark} strokeWidth="1.5" strokeLinejoin="round" />
      </>
    );
  } else if (art === 'hell-rocket') {
    drawing = (
      <>
        <path d="M32 10q16 9 11 29l-11 8-11-8q-5-20 11-29Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" />
        <circle cx="32" cy="26" r="5" fill="#ffe8b1" stroke={colors.dark} strokeWidth="2" />
        <path d="m21 34-9 10 12-2m19-8 9 10-12-2m-13 8 5 10 5-10" fill="#ffb236" stroke={colors.dark} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M29 51q-5 5 0 9m7-9q5 5 0 9" fill="none" stroke="#ff5638" strokeWidth="2.5" strokeLinecap="round" />
      </>
    );
  } else if (cat) {
    drawing = (
      <>
        <path d="M17 37 18 17 31 26M47 37 46 17 33 26" fill={colors.dark} stroke="#75452f" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M20 33c0-11 5-18 12-18s12 7 12 18c0 11-5 17-12 17s-12-6-12-17Z" fill={colors.light} stroke="#75452f" strokeWidth="2.2" />
        <path d="M24 23 20 20l1 9M40 23l4-3-1 9" fill="#efaaa2" />
        {art === 'cat-orange' && <path d="m27 19 2 5m5-5-2 5" stroke="#ba7037" strokeWidth="2" strokeLinecap="round" />}
        <path d="M25 34q2-3 4 0m6 0q2-3 4 0" fill="none" stroke="#493d36" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="32" cy="40" rx="7" ry="5" fill="#fffaf0" />
        <path d="m30 38 2 2 2-2q0 4-2 4t-2-4Z" fill="#df7771" />
        <path d="M29 43q3 4 6 0" fill="none" stroke="#815147" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="25" cy="39" r="2.7" fill="#f3a295" opacity=".8" />
        <circle cx="39" cy="39" r="2.7" fill="#f3a295" opacity=".8" />
        <path d="M21 39 13 37m8 6-7 2m37-6-8-2m8 6-7 2" stroke="#815147" strokeWidth="1.2" strokeLinecap="round" />
        {art === 'cat-ginger' && <path d="m27 19 2 5m5-5-2 5m-8 9 4 2m12-2-4 2" stroke="#a95730" strokeWidth="2" strokeLinecap="round" />}
        {art === 'cat-calico' && <><path d="m21 22 7 3-4 6-5-2Zm19 2 5-4 2 8-7 3Z" fill={colors.dark} /><path d="M42 43q10-2 8 6-4 4-10 0" fill="none" stroke={colors.dark} strokeWidth="3" strokeLinecap="round" /></>}
        {art === 'cat-space' && <><circle cx="32" cy="33" r="25" fill="none" stroke="#f8fbff" strokeWidth="2.5" opacity=".9" /><path d="m18 14 2 4 4 1-4 2-2 4-2-4-4-2 4-1Zm30 30 1.5 3 3 .8-3 .9-1.5 3-1.1-3-3-.9 3-.8Z" fill="#fff" /><circle cx="26" cy="34" r="2" fill="#fff" /><circle cx="38" cy="34" r="2" fill="#fff" /></>}
      </>
    );
  } else if (art === 'paw') {
    drawing = <g fill={colors.accent} stroke={colors.dark} strokeWidth="2"><ellipse cx="32" cy="42" rx="13" ry="10" /><ellipse cx="17" cy="28" rx="5" ry="7" transform="rotate(-25 17 28)" /><ellipse cx="27" cy="21" rx="5" ry="7" /><ellipse cx="38" cy="21" rx="5" ry="7" /><ellipse cx="48" cy="29" rx="5" ry="7" transform="rotate(25 48 29)" /></g>;
  } else if (art === 'ears') {
    drawing = <><path d="M13 46 17 13q1-6 6-2l12 16m16 19-4-33q-1-6-6-2L29 27" fill={colors.light} stroke={colors.dark} strokeWidth="3" strokeLinejoin="round" /><path d="m20 37 2-16 8 11m14 5-2-16-8 10" fill={colors.accent} /></>;
  } else if (art === 'tail') {
    drawing = <><path d="M15 47q-5-24 14-30 25-5 20 18-3 15-17 8-8-5-1-13" fill="none" stroke={colors.dark} strokeWidth="11" strokeLinecap="round" /><path d="M15 47q-5-24 14-30 25-5 20 18-3 15-17 8-8-5-1-13" fill="none" stroke={colors.accent} strokeWidth="6" strokeLinecap="round" /><path d="m42 13 2 4 4 1-4 2-2 4-2-4-4-2 4-1Z" fill="#fff" /></>;
  } else if (art === 'coin') {
    drawing = <><circle cx="32" cy="33" r="21" fill={colors.accent} stroke={colors.dark} strokeWidth="3" /><circle cx="32" cy="33" r="15" fill="none" stroke="#fff1a8" strokeWidth="2" /><path d="M37 24q-10-5-12 3-1 5 8 7 8 3 3 9-4 5-12 1m8-24v27" fill="none" stroke={colors.dark} strokeWidth="3" strokeLinecap="round" /></>;
  } else if (art === 'diamond' || art === 'gem') {
    drawing = <><path d="m12 25 10-13h20l10 13-20 29-20-29Z" fill={colors.accent} stroke={colors.dark} strokeWidth="2.5" strokeLinejoin="round" /><path d="m12 25 20 3 20-3M22 12l10 16 10-16M22 12l-2 13m22-13 2 13m-22 0 10 29 10-29" fill="none" stroke="#fff" strokeWidth="2" opacity=".85" /></>;
  } else if (art === 'chest') {
    drawing = <><path d="M13 28q0-15 19-15t19 15v20H13V28Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" /><path d="M13 30h38v18H13z" fill={colors.light} stroke={colors.dark} strokeWidth="3" /><path d="M28 29h9v12h-9z" fill="#ffdf68" stroke={colors.dark} strokeWidth="2" /><circle cx="32.5" cy="34" r="1.5" fill={colors.dark} /><path d="m20 18 2-4m22 4-2-4" stroke="#fff4b1" strokeWidth="3" strokeLinecap="round" /></>;
  } else if (art === 'scroll') {
    drawing = <><path d="M18 15h28v34H18q-8 0-8-8t8-8h24V15Z" fill={colors.light} stroke={colors.dark} strokeWidth="3" strokeLinejoin="round" /><path d="M20 22h19m-19 7h15m-15 12h20" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" /><path d="M42 14q8 0 8 8v22q0 6-7 6" fill="none" stroke={colors.dark} strokeWidth="3" /></>;
  } else if (art === 'fish' || art === 'fishbone') {
    drawing = art === 'fish' ? <><path d="M11 33q18-22 38 0-20 23-38 0Zm38 0 8-9v18l-8-9Z" fill={colors.accent} stroke={colors.dark} strokeWidth="2.5" strokeLinejoin="round" /><circle cx="22" cy="31" r="2.5" fill="#fff" /><path d="M30 23q8 10 0 20m8-18q8 8 0 16" fill="none" stroke="#fff" strokeWidth="2" /></> : <><path d="M13 32h38m-28 0-9-9m9 9-9 9m18-9-8-8m8 8-8 8m18-8-8-8m8 8-8 8" fill="none" stroke={colors.dark} strokeWidth="3" strokeLinecap="round" /><path d="m51 32 7-7v14l-7-7Z" fill={colors.accent} /></>;
  } else if (art === 'yarn') {
    drawing = <><circle cx="32" cy="34" r="19" fill={colors.accent} stroke={colors.dark} strokeWidth="2.5" /><path d="M17 25q17 2 29 17M15 34q13-9 34 0M20 47q2-17 24-27M28 52q-5-21 12-36" fill="none" stroke="#fff0ff" strokeWidth="3" strokeLinecap="round" /><path d="M48 18q10-7 8 2l-8 8" fill="none" stroke={colors.dark} strokeWidth="3" strokeLinecap="round" /></>;
  } else if (art === 'crown') {
    drawing = <><path d="m12 21 12 10 8-18 9 18 12-10-5 30H17l-5-30Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" strokeLinejoin="round" /><path d="M17 42h28" stroke="#fff4b8" strokeWidth="3" /><circle cx="12" cy="19" r="3" fill="#f47a77" /><circle cx="32" cy="12" r="3" fill="#83d8ed" /><circle cx="53" cy="19" r="3" fill="#f47a77" /></>;
  } else if (art === 'bell') {
    drawing = <><path d="M18 42q5-7 5-18 0-10 9-10t9 10q0 11 5 18l4 4H14l4-4Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" strokeLinejoin="round" /><path d="M27 50q5 7 10 0m-5-36V9" fill="none" stroke={colors.dark} strokeWidth="3" strokeLinecap="round" /><path d="M12 18 7 15m45 3 5-3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /></>;
  } else if (art === 'star') {
    drawing = <><path d="m32 8 7 16 18 2-13 12 4 18-16-9-16 9 4-18L7 26l18-2 7-16Z" fill={colors.accent} stroke={colors.dark} strokeWidth="2.5" strokeLinejoin="round" /><path d="m18 27 10 2m11 2 7-1" stroke="#fff8d7" strokeWidth="2.5" strokeLinecap="round" /></>;
  } else if (art === 'heart') {
    drawing = <><path d="M32 52S9 39 9 24q0-13 13-13 7 0 10 8 4-8 11-8 13 0 13 13 0 15-24 28Z" fill={colors.accent} stroke={colors.dark} strokeWidth="3" strokeLinejoin="round" /><path d="M19 22q1-5 6-5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></>;
  } else if (art === 'cup' || art === 'milk') {
    drawing = (
      <>
        <path d="M17 25h29l-4 23H21l-4-23Z" fill={colors.light} stroke="#79593e" strokeWidth="2.3" strokeLinejoin="round" />
        <path d="M17 25q14 6 29 0" fill="none" stroke="#fff9df" strokeWidth="3" />
        {art === 'milk' ? <path d="M23 18h17l4 7H19l4-7Zm0 0v-5h12l5 5" fill="#fffaf0" stroke="#8495ae" strokeWidth="2" strokeLinejoin="round" /> : <path d="M20 31q11 5 23 0" fill="none" stroke={colors.accent} strokeWidth="4" strokeLinecap="round" />}
        {art === 'cup' && <path d="M46 30q12-2 7 9-2 4-9 3" fill="none" stroke="#79593e" strokeWidth="3" />}
      </>
    );
  } else if (art === 'cake' || art === 'cupcake' || art === 'pie' || art === 'cookie') {
    const cookieDots = [[25, 27], [37, 25], [28, 38], [39, 37], [34, 31]];
    drawing = art === 'cookie' ? (
      <>
        <circle cx="32" cy="33" r="18" fill={colors.dark} stroke="#80512f" strokeWidth="2.5" />
        <circle cx="32" cy="33" r="14" fill={colors.light} />
        {cookieDots.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="2.2" fill="#815237" />)}
      </>
    ) : (
      <>
        <path d="M16 33h32l-4 18H20l-4-18Z" fill={colors.light} stroke="#815b45" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M17 34q15 4 30 0" fill="none" stroke={colors.dark} strokeWidth="5" />
        {art === 'cupcake' ? (
          <>
            <path d="M19 30q0-12 13-12t13 12q-13 6-26 0Z" fill={colors.accent} stroke="#89536c" strokeWidth="2" />
            <circle cx="32" cy="16" r="4" fill="#e55458" />
          </>
        ) : (
          <>
            <path d="M20 31 32 15l12 16" fill={art === 'pie' ? colors.accent : '#f7d984'} stroke="#a56c3b" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M26 27h12" stroke="#fff6d8" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </>
    );
  } else if (art === 'flower' || art === 'lotus') {
    drawing = (
      <>
        <path d="M32 29v23m0-7q-9-9-14-2 7 10 14 6m0-8q8-10 15-3-6 10-15 7" fill="none" stroke="#5d9a51" strokeWidth="3" strokeLinecap="round" />
        {Array.from({ length: 8 }, (_, index) => (
          <ellipse key={index} cx="32" cy="23" rx="5.3" ry="10" transform={`rotate(${index * 45} 32 32)`} fill={index % 2 ? colors.accent : colors.light} stroke={colors.dark} strokeWidth="1.2" />
        ))}
        <circle cx="32" cy="32" r="5" fill="#f3bd46" stroke="#a66c3b" strokeWidth="1.5" />
      </>
    );
  } else if (art === 'leaf' || art === 'mint' || art === 'sprout') {
    drawing = (
      <>
        <path d="M32 51Q31 31 18 17m14 22q3-18 17-22" fill="none" stroke="#668f4c" strokeWidth="3" strokeLinecap="round" />
        <path d="M19 17q13-2 13 13-12 1-13-13Zm14 14q0-13 16-14-1 14-16 14Z" fill={colors.accent} stroke="#547b43" strokeWidth="2" strokeLinejoin="round" />
        {art === 'mint' && <path d="M18 37q8-9 15 0-7 8-15 0Zm15 7q4-11 14-7-2 10-14 7Z" fill="#addb79" stroke="#547b43" strokeWidth="1.5" />}
      </>
    );
  } else if (art === 'honey') {
    drawing = (
      <>
        <path d="M24 17h16l4 8v22H20V25l4-8Z" fill="#f3bd45" stroke="#9e6d2d" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M24 17v-5h16v5m-17 15h18" fill="none" stroke="#9e6d2d" strokeWidth="2.2" />
        <path d="M26 35q6-5 12 0-6 7-12 0Z" fill="#fff2c2" />
        <path d="M30 35q2-3 4 0" fill="none" stroke="#9e6d2d" strokeWidth="1.5" />
      </>
    );
  } else {
    drawing = (
      <>
        <circle cx="32" cy="34" r="15" fill={colors.light} stroke={colors.dark} strokeWidth="2.4" />
        {art === 'lemon' && <path d="M19 33q13-16 26 0-13 18-26 0Z" fill="#f5d64d" stroke="#b19b36" strokeWidth="2" />}
        {art === 'strawberry' && <path d="M20 25q12 4 24 0 0 17-12 24-12-7-12-24Z" fill="#e8615b" stroke="#a94743" strokeWidth="2" />}
        {art === 'grapes' && (
          <g fill="#9b78c0" stroke="#6b5291" strokeWidth="1.5">
            <circle cx="27" cy="27" r="7" /><circle cx="38" cy="28" r="7" /><circle cx="22" cy="37" r="7" />
            <circle cx="33" cy="38" r="7" /><circle cx="28" cy="47" r="6" /><path d="M32 20q4-9 12-8" fill="none" stroke="#648f4e" strokeWidth="3" />
          </g>
        )}
        {art === 'lemon' && <><circle cx="28" cy="33" r="2" fill="#fff5c8" /><circle cx="36" cy="34" r="2" fill="#fff5c8" /></>}
        {art !== 'grapes' && art !== 'lemon' && (
          <>
            <path d="M28 17q0-9 8-9-1 8-8 9Zm0 1q-8-8-13-3 6 6 13 3Z" fill="#6ba35c" />
            <circle cx="27" cy="34" r="1.7" fill="#fff1bc" /><circle cx="37" cy="39" r="1.7" fill="#fff1bc" /><circle cx="29" cy="43" r="1.7" fill="#fff1bc" />
          </>
        )}
      </>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`tile-${art}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={colors.accent} />
          <stop offset=".52" stopColor={colors.light} />
          <stop offset="1" stopColor={colors.accent} />
        </linearGradient>
        <linearGradient id={`gloss-${art}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".68" />
          <stop offset=".48" stopColor="#fff" stopOpacity=".12" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="16" fill={`url(#tile-${art})`} />
      <rect x="5" y="5" width="54" height="54" rx="14" fill="#fff9e8" fillOpacity=".22" />
      {drawing}
      <path d="M8 8h48a5 5 0 0 1 5 5v12C46 18 28 12 8 15V8Z" fill={`url(#gloss-${art})`} />
      <rect x="4" y="4" width="56" height="56" rx="15" fill="none" stroke="#fff" strokeWidth="2" opacity=".85" />
      <path d="m49 44 1.2 3.1 3.1 1.2-3.1 1.2-1.2 3.1-1.2-3.1-3.1-1.2 3.1-1.2 1.2-3.1Z" fill="#fff" opacity=".82" />
    </svg>
  );
}

function MiniFireworks({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onFinish, 1200);
    return () => window.clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="pointer-events-none absolute inset-0 z-[1200] overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes challenge-firework-ring {
          0% { transform: scale(.15); opacity: .95; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes challenge-firework-particle {
          0% { transform: translate(0, 0) scale(.8); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
        }
      `}</style>
      {[
        { left: '32%', top: '36%' },
        { left: '68%', top: '42%' },
        { left: '50%', top: '27%' },
      ].map((burst, burstIndex) => (
        <div key={burstIndex} className="absolute h-2 w-2" style={burst}>
          <span className="absolute -inset-3 rounded-full border-2 border-amber-300" style={{ animation: `challenge-firework-ring 750ms ease-out ${burstIndex * 100}ms both` }} />
          {Array.from({ length: 12 }, (_, index) => {
            const angle = (Math.PI * 2 * index) / 12;
            const colors = ['#ff4f81', '#ffd447', '#48cbe8', '#9d71f5', '#77dc68', '#ff8b38'];
            return (
              <span
                key={index}
                className="absolute left-0 top-0 h-2 w-2 rounded-full shadow-sm"
                style={{
                  backgroundColor: colors[(index + burstIndex) % colors.length],
                  '--dx': `${Math.cos(angle) * 46}px`,
                  '--dy': `${Math.sin(angle) * 46}px`,
                  animation: `challenge-firework-particle 850ms cubic-bezier(.15,.65,.25,1) ${burstIndex * 100}ms both`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function BitcoinFireworks({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onFinish, 2200);
    return () => window.clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="pointer-events-none absolute inset-0 z-[1500] overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes challenge-coin-burst { 0% { transform: translate(0,0) scale(.3) rotate(0); opacity: 1; } 100% { transform: translate(var(--coin-x),var(--coin-y)) scale(.15) rotate(540deg); opacity: 0; } }
      `}</style>
      {Array.from({ length: 44 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 22;
        const radius = 90 + (index % 4) * 34;
        return (
          <span
            key={index}
            className="absolute left-1/2 top-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-amber-100 bg-gradient-to-br from-yellow-200 via-amber-400 to-orange-500 text-[15px] font-black text-amber-950 shadow-[0_0_16px_#fbbf24]"
            style={{
              '--coin-x': `${Math.cos(angle) * radius}px`,
              '--coin-y': `${Math.sin(angle) * radius}px`,
              animation: `challenge-coin-burst 1.8s cubic-bezier(.15,.65,.25,1) ${Math.floor(index / 22) * 120}ms both`,
            } as React.CSSProperties}
          >
            ₿
          </span>
        );
      })}
    </div>
  );
}

function hashSeed(value: string): number {
  let seed = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    seed = Math.imul(seed ^ value.charCodeAt(index), 16777619);
  }
  return seed >>> 0;
}

function randomFor(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function getLevelSettings(level: number) {
  const tiers = [
    { start: 1, end: 100, minTypes: 8, maxTypes: 14, minTiles: 36, maxTiles: 72 },
    { start: 101, end: 200, minTypes: 10, maxTypes: 18, minTiles: 72, maxTiles: 144 },
    { start: 201, end: 300, minTypes: 12, maxTypes: 22, minTiles: 120, maxTiles: 192 },
    { start: 301, end: 450, minTypes: 12, maxTypes: 26, minTiles: 120, maxTiles: 210 },
    { start: 451, end: 700, minTypes: 12, maxTypes: 32, minTiles: 150, maxTiles: 300 },
    { start: 701, end: 999, minTypes: 18, maxTypes: 38, minTiles: 180, maxTiles: 420 },
  ];
  const tier = tiers.find((item) => level >= item.start && level <= item.end) ?? tiers[tiers.length - 1];
  const progress = Math.min(1, (level - tier.start) / Math.max(1, tier.end - tier.start));
  const interpolatedTiles = tier.minTiles + progress * (tier.maxTiles - tier.minTiles);
  return {
    typeCount: Math.round(tier.minTypes + progress * (tier.maxTypes - tier.minTypes)),
    tileCount: Math.max(Math.ceil(tier.minTiles / 3), Math.floor(interpolatedTiles / 3)) * 3,
    minTypes: tier.minTypes,
    maxTypes: tier.maxTypes,
    minTiles: tier.minTiles,
    maxTiles: tier.maxTiles,
  };
}

function getIslandRowLengths(tileCount: number, shape: number, maxRows: number): number[] {
  const rowLengths: number[] = [];
  let remaining = tileCount;

  if (shape === 1) {
    const rowCount = Math.ceil(Math.sqrt(tileCount));
    const rowSize = Math.ceil(tileCount / rowCount);
    while (remaining > 0) {
      const length = Math.min(rowSize, remaining);
      rowLengths.push(length);
      remaining -= length;
    }
  } else {
    for (let row = 0; row < maxRows && remaining > 0; row += 1) {
      const length = shape === 2
        ? Math.max(1, maxRows - Math.floor(row / 2) - (row % 2))
        : shape === 3
          ? row + 1
          : maxRows - row;
      const placed = Math.min(length, remaining);
      rowLengths.push(placed);
      remaining -= placed;
    }
  }

  return rowLengths;
}

function createChallengeBoard(date: string, level = 1): ChallengeTile[] {
  const baseSeed = hashSeed(`${date}:${level}`);
  const settings = getLevelSettings(level);
  const tilesPerIsland = Math.ceil(settings.tileCount / 4);
  const columns = Math.ceil((Math.sqrt(8 * tilesPerIsland + 1) - 1) / 2);
  const rows = columns;
  const islandWidth = columns * CARD_STEP_X;
  const islandHeight = (rows - 1) * CARD_STEP_Y + CARD_HEIGHT;
  const islandOffsets = [
    { x: 0, y: 0 },
    { x: islandWidth + 64, y: 36 },
    { x: 22, y: islandHeight + 56 },
    { x: islandWidth + 42, y: islandHeight + 12 },
  ];
  const positions: TilePosition[] = Array.from({ length: settings.tileCount }, (_, index) => {
    const island = Math.floor(index / tilesPerIsland);
    const islandIndex = index % tilesPerIsland;
    const shape = (island + (baseSeed % 4)) % 4;
    const islandTileCount = Math.min(tilesPerIsland, settings.tileCount - island * tilesPerIsland);
    const rowLengths = getIslandRowLengths(islandTileCount, shape, columns);
    let remaining = islandIndex;
    let row = 0;
    let rowLength = rowLengths[row] ?? 0;
    while (remaining >= rowLength) {
      remaining -= rowLength;
      row += 1;
      rowLength = rowLengths[row] ?? 0;
    }
    const col = remaining;
    const offset = islandOffsets[island];
    const rowWidth = rowLength;
    const shapeX = shape === 0
      ? row * 10
      : shape === 1
        ? -row * 10
        : shape === 2
          ? (row % 2) * 18
          : Math.round(Math.sin(row * 1.4) * 13);
    const centerOffset = (columns - rowWidth) * CARD_STEP_X / 2;
    return {
      id: `${island}-${col}-${row}-${index}`,
      col,
      row,
      layer: row,
      island,
      offsetX: offset.x + centerOffset + col * CARD_STEP_X + shapeX,
      offsetY: offset.y + (rows - row - 1) * CARD_STEP_Y,
      rotation: 0,
    };
  });

  for (let attempt = 0; attempt < 128; attempt += 1) {
    const random = randomFor((baseSeed + attempt) >>> 0);
    const remaining = [...positions];
    const removalTriples: [string, string, string][] = [];

    while (remaining.length > 0) {
      const free = remaining.filter((tile) => {
        const covered = isCoveredByUpperTile(tile, remaining);
        if (covered) return false;
        const leftBlocked = remaining.some(
          (other) => other.island === tile.island && other.row === tile.row && other.col === tile.col - 1,
        );
        const rightBlocked = remaining.some(
          (other) => other.island === tile.island && other.row === tile.row && other.col === tile.col + 1,
        );
        return !leftBlocked || !rightBlocked;
      });

      if (free.length < 3) break;
      const candidates = [...free];
      const group = [0, 1, 2].map((_) => candidates.splice(Math.floor(random() * candidates.length), 1)[0]);
      removalTriples.push([group[0].id, group[1].id, group[2].id]);
      const removed = new Set(group.map((tile) => tile.id));
      for (let index = remaining.length - 1; index >= 0; index -= 1) {
        if (removed.has(remaining[index].id)) remaining.splice(index, 1);
      }
    }

    if (remaining.length !== 0) continue;

    const assignments = new Map<string, number>();
    removalTriples.forEach((triple, tripleIndex) => {
      const faceIndex = tripleIndex % settings.typeCount;
      triple.forEach((id) => assignments.set(id, faceIndex));
    });

    return positions.map((tile) => {
      const face = TILE_FACES[assignments.get(tile.id) ?? 0];
      return { ...tile, label: face.label, art: face.art };
    });
  }

  throw new Error(`Could not create a solvable challenge board for level ${level} (${date})`);
}

function formatBitcoin(satoshis: number): string {
  return `${(satoshis / SATOSHIS_PER_BTC).toFixed(8)} BTC`;
}

type ChallengeProgress = {
  level: number;
  unlockedLevel: number;
  bitcoinSatoshis: number;
  wins: number;
  chestsClaimed: number;
  bonusHints: number;
};

function readProgress(): ChallengeProgress {
  const defaults: ChallengeProgress = {
    level: 1,
    unlockedLevel: 1,
    bitcoinSatoshis: 0,
    wins: 0,
    chestsClaimed: 0,
    bonusHints: 0,
  };
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as Partial<ChallengeProgress>;
    const safeInt = (value: unknown, fallback: number, min: number, max: number) =>
      typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.floor(value))) : fallback;
    const unlockedLevel = safeInt(saved.unlockedLevel, 1, 1, Number.MAX_SAFE_INTEGER);
    return {
      level: safeInt(saved.level, 1, 1, Number.MAX_SAFE_INTEGER),
      unlockedLevel,
      bitcoinSatoshis: safeInt(saved.bitcoinSatoshis, 0, 0, Number.MAX_SAFE_INTEGER),
      wins: safeInt(saved.wins, 0, 0, Number.MAX_SAFE_INTEGER),
      chestsClaimed: safeInt(saved.chestsClaimed, 0, 0, Number.MAX_SAFE_INTEGER),
      bonusHints: safeInt(saved.bonusHints, 0, 0, 999),
    };
  } catch (error) {
    console.error('Could not read challenge progress', error);
    return defaults;
  }
}

function createChallengeMusic(): AudioContext {
  const context = new AudioContext();
  const master = context.createGain();
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1800;
  const notes = [392, 493.88, 587.33, 493.88, 440, 523.25, 659.25, 523.25];
  const schedule = () => {
    const now = context.currentTime;
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + index * 0.55);
      gain.gain.exponentialRampToValueAtTime(0.045, now + index * 0.55 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.55 + 0.68);
      oscillator.connect(gain).connect(filter);
      oscillator.start(now + index * 0.55);
      oscillator.stop(now + index * 0.55 + 0.7);
    });
  };
  master.gain.value = 0.24;
  filter.connect(master).connect(context.destination);
  schedule();
  const timer = window.setInterval(schedule, notes.length * 550);
  context.addEventListener('statechange', () => {
    if (context.state === 'closed') window.clearInterval(timer);
  });
  return context;
}

interface ChallengeModeProps {
  lang: Language;
  onExit: () => void;
  onToggleLang?: () => void;
  onSelectMode?: (mode: GameMode) => void;
  onOpenDailyReward?: () => void;
  onOpenDailyChallenges?: () => void;
  onOpenShop?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenHelp?: () => void;
  gold?: number;
}

export function ChallengeMode({
  lang,
  onExit,
  onToggleLang,
  onSelectMode,
  onOpenDailyReward,
  onOpenDailyChallenges,
  onOpenShop,
  onOpenLeaderboard,
  onOpenHelp,
  gold,
}: ChallengeModeProps) {
  const [progress, setProgress] = useState(readProgress);
  const [level, setLevel] = useState(progress.level);
  const [dealSeed, setDealSeed] = useState(() => `${Date.now()}-${Math.random()}`);
  const initialTiles = useMemo(() => createChallengeBoard(dealSeed, level), [dealSeed, level]);
  const [tiles, setTiles] = useState(initialTiles);
  const [slot, setSlot] = useState<ChallengeTile[]>([]);
  const [shelf, setShelf] = useState<ChallengeTile[]>([]);
  const [history, setHistory] = useState<{ tiles: ChallengeTile[]; slot: ChallengeTile[]; shelf: ChallengeTile[]; score: number }[]>([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const pendingChest = progress.wins >= (progress.chestsClaimed + 1) * 5;
  const [completed, setCompleted] = useState(pendingChest);
  const [gameOver, setGameOver] = useState(false);
  const [hintedType, setHintedType] = useState<string | null>(null);
  const [fireworksId, setFireworksId] = useState(0);
  const [coinBurstId, setCoinBurstId] = useState(0);
  const [chestOpen, setChestOpen] = useState(pendingChest);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(() => {
    try {
      const value = Number(localStorage.getItem(VOICE_KEY) ?? 0);
      return Number.isInteger(value) && value >= 0 && value < VOICE_STYLES.length ? value : 0;
    } catch {
      return 0;
    }
  });
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [retryChances, setRetryChances] = useState(2);
  const [hintUses, setHintUses] = useState(5);
  const [isDealing, setIsDealing] = useState(true);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const audioContext = useRef<AudioContext | null>(null);
  const [boosters, setBoosters] = useState({ undo: 3, shuffle: 3, extract: 3 });

  const freeIds = useMemo(() => {
    const alive = tiles;
    return new Set(
      alive
        .filter((tile) => {
          const covered = isCoveredByUpperTile(tile, alive);
          if (covered) return false;
          const leftBlocked = alive.some(
            (other) => other.island === tile.island && other.row === tile.row && other.col === tile.col - 1,
          );
          const rightBlocked = alive.some(
            (other) => other.island === tile.island && other.row === tile.row && other.col === tile.col + 1,
          );
          return !leftBlocked || !rightBlocked;
        })
        .map((tile) => tile.id),
    );
  }, [tiles]);

  useEffect(() => {
    const updateViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      localStorage.setItem(VOICE_KEY, String(selectedVoice));
    } catch (error) {
      console.error('Could not save challenge progress', error);
      setMessage(lang === 'ru' ? 'Не удалось сохранить прогресс на этом устройстве.' : 'Could not save progress on this device.');
    }
  }, [progress, selectedVoice, lang]);

  useEffect(() => {
    setIsDealing(true);
    const timer = window.setTimeout(() => setIsDealing(false), 800);
    return () => window.clearTimeout(timer);
  }, [dealSeed]);

  useEffect(() => () => {
    if (audioContext.current && audioContext.current.state !== 'closed') void audioContext.current.close();
  }, []);

  useEffect(() => {
    if (!completed) return;
    const style = VOICE_STYLES[selectedVoice];
    if (!('speechSynthesis' in window)) {
      setMessage(lang === 'ru' ? 'На устройстве нет голосового синтеза.' : 'Speech synthesis is unavailable on this device.');
      return;
    }
    window.speechSynthesis.cancel();
    const ruLines = [
      'Это ещё не конец!',
      'Ты правда думала, что будет легко?',
      'Как ты осмелилась бросить мне вызов?',
      'Ха! Неплохо. Но дальше сложнее!',
      'Не расслабляйся — испытание продолжается!',
      'Вот это смелость!',
      'Я ещё вернусь!',
    ];
    const enLines = [
      'This is not over yet!',
      'Did you really think this would be easy?',
      'How dare you challenge me?',
      'Not bad. But it gets tougher!',
      'Do not relax. The challenge continues!',
      'Now that is courage!',
      'I will be back!',
    ];
    const lines = lang === 'ru' ? ruLines : enLines;
    const utterance = new SpeechSynthesisUtterance(lines[Math.floor(Math.random() * lines.length)]);
    utterance.lang = lang === 'ru' ? 'ru-RU' : 'en-US';
    utterance.rate = style.rate;
    utterance.pitch = style.pitch;
    utterance.volume = style.volume ?? 1;
    window.speechSynthesis.speak(utterance);
  }, [completed, selectedVoice, lang]);

  const boardWidth = Math.max(340, ...tiles.map((tile) => cardPosition(tile).left + CARD_WIDTH + BOARD_PADDING));
  const boardHeight = Math.max(260, ...tiles.map((tile) => cardPosition(tile).top + CARD_HEIGHT + BOARD_PADDING));
  const boardScale = Math.min(1, (viewport.width - 18) / boardWidth, (viewport.height - 185) / boardHeight);

  const snapshot = () => setHistory((items) => [...items, { tiles, slot, shelf, score }]);
  const resolveTriples = (nextSlot: ChallengeTile[]) => {
    const counts = new Map<string, number>();
    nextSlot.forEach((tile) => counts.set(tile.art, (counts.get(tile.art) ?? 0) + 1));
    const match = [...counts].find(([, count]) => count >= 3);
    if (!match) {
      setSlot(nextSlot);
      if (nextSlot.length >= 7) setGameOver(true);
      return nextSlot;
    }

    let remainingToRemove = 3;
    const resolved = nextSlot.filter((tile) => {
      if (tile.art !== match[0] || remainingToRemove === 0) return true;
      remainingToRemove -= 1;
      return false;
    });
    const rewardSatoshis = 600;
    const nextScore = score + rewardSatoshis;
    setSlot(resolved);
    setScore(nextScore);
    setProgress((current) => ({ ...current, bitcoinSatoshis: current.bitcoinSatoshis + rewardSatoshis }));
    setFireworksId((current) => current + 1);
    setMessage(lang === 'ru' ? `Тройка собрана! +${formatBitcoin(rewardSatoshis)}` : `Triple matched! +${formatBitcoin(rewardSatoshis)}`);
    return resolved;
  };

  const completeLevel = () => {
    const rewardSatoshis = (5000 + level * 500) * 2;
    const nextWinCount = progress.wins + 1;
    setProgress((current) => ({
      ...current,
      unlockedLevel: Math.max(current.unlockedLevel, level + 1),
      bitcoinSatoshis: current.bitcoinSatoshis + rewardSatoshis,
      wins: current.wins + 1,
    }));
    setMessage(lang === 'ru' ? `Испытание пройдено! Награда удвоена: +${formatBitcoin(rewardSatoshis)}` : `Challenge cleared! Double reward: +${formatBitcoin(rewardSatoshis)}`);
    setCompleted(true);
    setChestOpen(nextWinCount % 5 === 0);
    setCoinBurstId((current) => current + 1);
  };

  const pickTile = (tile: ChallengeTile) => {
    if (!freeIds.has(tile.id) || completed || gameOver || isDealing) return;
    snapshot();
    const nextTiles = tiles.filter((item) => item.id !== tile.id);
    setTiles(nextTiles);
    const nextSlot = resolveTriples([...slot, tile]);
    setHintedType(null);
    if (nextTiles.length === 0 && shelf.length === 0) {
      if (nextSlot.length === 0) completeLevel();
      else setGameOver(true);
    }
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous || boosters.undo <= 0) return;
    setTiles(previous.tiles);
    setSlot(previous.slot);
    setShelf(previous.shelf);
    setScore(previous.score);
    setHistory((items) => items.slice(0, -1));
    setBoosters((current) => ({ ...current, undo: current.undo - 1 }));
    setCompleted(false);
    setGameOver(false);
    setMessage('');
  };

  const shuffle = () => {
    if (boosters.shuffle <= 0 || tiles.length < 2) return;
    snapshot();
    const faces = tiles.map(({ label, art }) => ({ label, art }));
    for (let index = faces.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [faces[index], faces[swapIndex]] = [faces[swapIndex], faces[index]];
    }
    setTiles(tiles.map((tile, index) => ({ ...tile, ...faces[index] })));
    setBoosters((current) => ({ ...current, shuffle: current.shuffle - 1 }));
    setMessage(lang === 'ru' ? 'Карты перемешаны' : 'Cards shuffled');
  };

  const extract = () => {
    if (boosters.extract <= 0 || slot.length < 3 || shelf.length > 0) return;
    snapshot();
    setShelf(slot.slice(0, 3));
    resolveTriples(slot.slice(3));
    setBoosters((current) => ({ ...current, extract: current.extract - 1 }));
  };

  const returnFromShelf = (tile: ChallengeTile) => {
    if (slot.length >= 7) return;
    snapshot();
    const nextShelf = shelf.filter((item) => item.id !== tile.id);
    setShelf(nextShelf);
    const nextSlot = resolveTriples([...slot, tile]);
    if (tiles.length === 0 && nextShelf.length === 0) {
      if (nextSlot.length === 0) completeLevel();
      else setGameOver(true);
    }
  };

  const hint = () => {
    if (hintUses <= 0) {
      setMessage(lang === 'ru' ? 'Подсказки на этот раунд закончились.' : 'No hints left this round.');
      return;
    }
    const visible = tiles.filter((tile) => freeIds.has(tile.id));
    const counts = new Map<string, number>();
    slot.forEach((tile) => counts.set(tile.art, (counts.get(tile.art) ?? 0) + 1));
    const type = visible.find((tile) => (counts.get(tile.art) ?? 0) >= 2)?.art
      ?? visible.find((tile) => visible.filter((candidate) => candidate.art === tile.art).length >= 3)?.art
      ?? visible[0]?.art;
    setHintedType(type ?? null);
    setHintUses((current) => current - 1);
    setMessage(lang === 'ru' ? 'Оракул показывает свободную карту' : 'Oracle reveals a free card');
  };

  const restart = () => {
    if (gameOver && retryChances <= 0) return;
    if (gameOver) setRetryChances((current) => current - 1);
    setProgress((current) => ({ ...current, bonusHints: 0 }));
    const seed = `${level}:${Date.now()}-${Math.random()}`;
    setDealSeed(seed);
    setTiles(createChallengeBoard(seed, level));
    setSlot([]);
    setShelf([]);
    setHistory([]);
    setScore(0);
    setCompleted(false);
    setGameOver(false);
    setBoosters({ undo: 3, shuffle: 3, extract: 3 });
    setHintUses(5 + progress.bonusHints);
    setHintedType(null);
    setMessage('');
  };

  const nextLevel = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setProgress((current) => ({ ...current, level: newLevel, bonusHints: 0 }));
    const seed = `${newLevel}:${Date.now()}-${Math.random()}`;
    setDealSeed(seed);
    setTiles(createChallengeBoard(seed, newLevel));
    setSlot([]);
    setShelf([]);
    setHistory([]);
    setScore(0);
    setCompleted(false);
    setGameOver(false);
    setRetryChances(2);
    setHintUses(5 + progress.bonusHints);
    setHintedType(null);
    setMessage('');
  };

  const buyChallengeItem = (item: 'hint' | 'undo' | 'shuffle' | 'extract') => {
    const prices = { hint: 2000, undo: 3000, shuffle: 4000, extract: 5000 };
    const price = prices[item];
    if (progress.bitcoinSatoshis < price) {
      setMessage(lang === 'ru' ? 'Недостаточно BTC.' : 'Not enough BTC.');
      return;
    }
    setProgress((current) => ({ ...current, bitcoinSatoshis: current.bitcoinSatoshis - price }));
    if (item === 'hint') setHintUses((current) => current + 5);
    else setBoosters((current) => ({ ...current, [item]: current[item] + 1 }));
    setMessage(lang === 'ru' ? `Покупка: −${formatBitcoin(price)}` : `Purchased for −${formatBitcoin(price)}`);
  };

  const chooseChest = (choice: number) => {
    const rewards = [
      { bitcoinSatoshis: 20_000, hintUses: 3, title: lang === 'ru' ? 'Сундук сети' : 'Network chest' },
      { bitcoinSatoshis: 50_000, hintUses: 1, title: lang === 'ru' ? 'Сундук майнера' : 'Miner chest' },
      { bitcoinSatoshis: 10_000, hintUses: 8, title: lang === 'ru' ? 'Сундук оракула' : 'Oracle chest' },
    ];
    const reward = rewards[choice];
    setProgress((current) => ({
      ...current,
      bitcoinSatoshis: current.bitcoinSatoshis + reward.bitcoinSatoshis,
      chestsClaimed: current.chestsClaimed + 1,
      bonusHints: current.bonusHints + reward.hintUses,
    }));
    setChestOpen(false);
    setMessage(lang === 'ru'
      ? `${reward.title}: +${formatBitcoin(reward.bitcoinSatoshis)} и ${reward.hintUses} подсказок`
      : `${reward.title}: +${formatBitcoin(reward.bitcoinSatoshis)} and ${reward.hintUses} hints`);
  };

  const toggleMusic = async () => {
    if (audioContext.current && audioContext.current.state !== 'closed') {
      await audioContext.current.close();
      audioContext.current = null;
      setMusicPlaying(false);
      return;
    }
    try {
      audioContext.current = createChallengeMusic();
      await audioContext.current.resume();
      setMusicPlaying(true);
    } catch (error) {
      console.error('Could not start challenge music', error);
      setMessage(lang === 'ru' ? 'Не удалось включить музыку на этом устройстве.' : 'Could not start audio on this device.');
    }
  };

  const chooseVoice = (index: number) => {
    setSelectedVoice(index);
    const style = VOICE_STYLES[index];
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const preview = new SpeechSynthesisUtterance(lang === 'ru' ? 'Испытание продолжается!' : 'The challenge continues!');
      preview.lang = lang === 'ru' ? 'ru-RU' : 'en-US';
      preview.rate = style.rate;
      preview.pitch = style.pitch;
      preview.volume = style.volume ?? 1;
      window.speechSynthesis.speak(preview);
    }
  };

  const texts = lang === 'ru'
    ? {
        level: 'Уровень',
        undo: 'Отмена',
        shuffle: 'Перемешать',
        restart: 'Заново',
        nextLevel: 'Следующий уровень',
        extract: 'Вынуть 3',
        oracle: 'Оракул',
        done: 'Испытание пройдено!',
        lost: 'Лоток заполнен. Попробуй ещё раз!',
        local: 'Прогресс сохраняется на этом устройстве.',
        menu: 'Меню',
        sound: 'Мелодия',
        voice: 'Голос соперника',
        shop: 'Магазин усилений',
        balance: 'Баланс',
        score: 'Счёт',
        buyHint: '5 подсказок',
        buyUndo: 'Отмена',
        buyShuffle: 'Перемешивание',
        buyExtract: 'Вынуть 3',
        chestTitle: 'Выбери один из трёх сундуков',
        chestHint: 'Награда за каждые 5 побед',
        retry: 'Шанс',
      }
    : {
        level: 'Level',
        undo: 'Undo',
        shuffle: 'Shuffle',
        restart: 'Restart',
        nextLevel: 'Next level',
        extract: 'Extract 3',
        oracle: 'Oracle',
        done: 'Challenge complete!',
        lost: 'Tray is full. Give it another try!',
        local: 'Progress is saved on this device.',
        menu: 'Menu',
        sound: 'Music',
        voice: 'Rival voice',
        shop: 'Booster shop',
        balance: 'Balance',
        score: 'Score',
        buyHint: '5 hints',
        buyUndo: 'Undo',
        buyShuffle: 'Shuffle',
        buyExtract: 'Extract 3',
        chestTitle: 'Choose one of three chests',
        chestHint: 'Reward every 5 wins',
        retry: 'Retry',
      };

  const levelSettings = getLevelSettings(level);
  const islandBounds = [0, 1, 2, 3].map((island) => {
    const islandTiles = tiles.filter((tile) => tile.island === island);
    if (islandTiles.length === 0) return null;
    const left = Math.min(...islandTiles.map((tile) => cardPosition(tile).left));
    const top = Math.min(...islandTiles.map((tile) => cardPosition(tile).top));
    const right = Math.max(...islandTiles.map((tile) => cardPosition(tile).left + CARD_WIDTH));
    const bottom = Math.max(...islandTiles.map((tile) => cardPosition(tile).top + CARD_HEIGHT));
    return { left: left - 12, top: top - 12, width: right - left + 24, height: bottom - top + 24, rotate: `${(island % 2 ? 2 : -2)}deg` };
  });

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-black text-slate-100 selection:bg-fuchsia-300/40">
      <style>{`
        @keyframes challenge-card-rain { from { opacity: 0; transform: translateY(-70vh) rotate(-12deg) scale(.8); } to { opacity: 1; transform: translateY(0) rotate(var(--card-tilt)) scale(1); } }
        @media (prefers-reduced-motion: reduce) { .challenge-card-rain { animation-duration: .01ms !important; } }
      `}</style>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_16%_27%,rgba(91,44,138,.18),transparent_30%),radial-gradient(ellipse_at_84%_68%,rgba(30,111,137,.13),transparent_32%),linear-gradient(135deg,transparent_47%,rgba(236,72,153,.035)_48%,transparent_49%),linear-gradient(45deg,transparent_47%,rgba(34,211,238,.035)_48%,transparent_49%)]" />
      {fireworksId > 0 && <MiniFireworks key={fireworksId} onFinish={() => setFireworksId(0)} />}
      {coinBurstId > 0 && <BitcoinFireworks key={coinBurstId} onFinish={() => setCoinBurstId(0)} />}

      {/* Sci-Fi Top Header styled like Campaign & Day */}
      <header className="relative z-20 w-full max-w-4xl px-3 pt-2">
        <div className="flex items-center justify-between w-full flex-wrap gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <button
                onClick={() => onSelectMode?.('campaign')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-slate-300 hover:text-white transition"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>{lang === 'ru' ? 'Кампания' : 'Campaign'}</span>
              </button>

              <button
                onClick={() => onSelectMode?.('daily')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-slate-300 hover:text-white transition"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{lang === 'ru' ? 'День' : 'Daily'}</span>
              </button>

              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(168,85,247,0.6)] transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'ru' ? 'Испытание' : 'Challenge'}</span>
              </button>
            </div>

            {/* Language Switcher Badge */}
            {onToggleLang && (
              <button
                onClick={onToggleLang}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-purple-500/30 text-purple-300 text-xs font-black active:scale-95 transition shadow-sm"
                title="Переключить язык / Switch Language"
              >
                <span>{lang === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}</span>
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            {onOpenDailyReward && (
              <button
                onClick={onOpenDailyReward}
                className="relative p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-yellow-400/50 text-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.3)] transition active:scale-95"
                title={lang === 'ru' ? 'Ежедневная награда' : 'Daily reward'}
                aria-label={lang === 'ru' ? 'Ежедневная награда' : 'Daily reward'}
              >
                <Gift className="w-4 h-4 text-yellow-400" />
              </button>
            )}

            <button
              onClick={() => void toggleMusic()}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white shadow-sm transition active:scale-95"
              title={musicPlaying ? texts.sound : texts.sound}
              aria-label={musicPlaying ? texts.sound : texts.sound}
            >
              {musicPlaying ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/40 bg-slate-900/80 text-purple-200 shadow-sm transition hover:bg-slate-800 active:scale-95"
              title={texts.menu}
              aria-label={texts.menu}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Sub-Header */}
        <div className="mt-1.5 flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-purple-500/40 text-white shadow-md">
            <span className="text-xs font-black uppercase tracking-wider text-purple-300">
              {texts.level} {level} ∞
            </span>
            <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-200">
              ₿ {formatBitcoin(progress.bitcoinSatoshis)}
            </span>
          </div>

          <div className="px-3 py-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-white shadow-md text-xs font-bold font-mono">
            {lang === 'ru' ? 'Осталось' : 'Remaining'}: <span className="text-cyan-300 font-black">{tiles.length}</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-hidden px-1 py-1">
        <div
          className="relative z-10 shrink-0 transition-transform duration-200"
          style={{ width: boardWidth, height: boardHeight, transform: `scale(${boardScale})` }}
        >
          {islandBounds.map((bounds, index) => bounds && (
            <div
              key={index}
              className="pointer-events-none absolute rounded-[34px] border border-emerald-200/15 bg-[#161711]/45 shadow-[inset_0_0_24px_rgba(126,148,77,.08),0_0_28px_rgba(126,148,77,.1)]"
              style={bounds}
            />
          ))}
          {tiles.map((tile, index) => {
            const free = freeIds.has(tile.id);
            const hinted = hintedType === tile.art && free;
            const { left, top } = cardPosition(tile);
            const colors = getNeonColors(tile.art);
            const faceIndex = TILE_FACES.findIndex((face) => face.art === tile.art);
            const frameVariant = faceIndex % 4;
            const cardRadius = ['12px', '5px 16px 5px 16px', '20px 7px 20px 7px', '8px'][frameVariant];
            return (
              <button
                key={tile.id}
                onClick={() => pickTile(tile)}
                disabled={!free || completed || gameOver || isDealing}
                aria-label={`${tile.label}${free ? '' : ', закрытая'}`}
                title={tile.label}
                className={`challenge-card-rain absolute flex h-[116px] w-[88px] flex-col items-center justify-center overflow-hidden border-2 bg-black p-[2px] transition-all duration-150 ${
                  hinted
                    ? 'border-[#f6dc75] ring-2 ring-[#f6dc75]/90 animate-pulse'
                    : free
                      ? 'hover:-translate-y-0.5 hover:brightness-125'
                      : 'brightness-[.72]'
                }`}
                onMouseDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
                data-art={tile.art}
                style={{
                  left,
                  top,
                  zIndex: tile.layer * 100 + tile.row * 10 + tile.col,
                  borderRadius: cardRadius,
                  borderColor: free ? colors.accent : colors.dark,
                  background: frameVariant === 0
                    ? `radial-gradient(ellipse at 30% 18%, color-mix(in srgb, ${colors.accent} 24%, #24151a), #050607 70%)`
                    : frameVariant === 1
                      ? `repeating-linear-gradient(135deg, #090a08 0 8px, color-mix(in srgb, ${colors.accent} 12%, #090a08) 8px 10px)`
                      : frameVariant === 2
                        ? `radial-gradient(circle at 75% 25%, color-mix(in srgb, ${colors.accent} 24%, #171a13), #050607 72%)`
                        : `linear-gradient(90deg, #050607 0 46%, color-mix(in srgb, ${colors.accent} 14%, #050607) 50%, #050607 54%)`,
                  boxShadow: free
                    ? `inset 0 0 12px rgba(0,0,0,.9), 0 0 8px ${colors.accent}, 0 0 18px color-mix(in srgb, ${colors.accent} 40%, transparent)`
                    : 'inset 0 0 12px rgba(0,0,0,.9), 0 0 8px rgba(120,100,150,.25)',
                  animationName: 'challenge-card-rain',
                  animationDuration: '480ms',
                  animationTimingFunction: 'cubic-bezier(.15,.65,.25,1)',
                  animationFillMode: 'backwards',
                  animationDelay: `${(index % 24) * 13}ms`,
                  ['--card-tilt' as string]: `${tile.rotation}deg`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[4px] border border-white/10"
                  style={{
                    borderRadius: frameVariant === 1 ? '3px 10px 3px 10px' : frameVariant === 2 ? '15px 4px 15px 4px' : cardRadius,
                    borderStyle: frameVariant === 3 ? 'dashed' : 'solid',
                  }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[7px] top-[7px] h-1 w-1 rounded-full"
                  style={{ backgroundColor: colors.accent, boxShadow: `0 0 7px ${colors.accent}` }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[3px] flex items-center justify-center"
                  style={{
                    borderRadius: cardRadius,
                    background: `radial-gradient(ellipse at 50% 45%, color-mix(in srgb, ${colors.accent} 15%, transparent), transparent 72%)`,
                  }}
                >
                  <span className="h-full w-full" style={{ filter: `saturate(1.35) brightness(1.15) drop-shadow(0 0 5px ${colors.accent})` }}>
                    <TileArtwork art={tile.art} />
                  </span>
                </span>
              </button>
            );
          })}

          {completed && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center rounded-[32px] bg-[#020817]/70 p-4 text-center backdrop-blur-sm">
              <div className="rounded-[28px] border border-fuchsia-300/60 bg-gradient-to-b from-[#29103d] via-[#180c2b] to-[#090713] p-5 text-fuchsia-50 shadow-[0_0_36px_rgba(217,70,239,.25)]">
                <div className="text-5xl">₿</div>
                <h2 className="mt-2 text-xl font-black">{texts.done}</h2>
                <p className="mt-1 font-black text-amber-300">+{formatBitcoin((5000 + level * 500) * 2)}</p>
                {chestOpen && <p className="mt-2 text-xs font-bold text-emerald-200">{texts.chestHint}</p>}
                <button onClick={nextLevel} disabled={chestOpen} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-100/70 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-violet-600 px-4 py-2 font-black text-white shadow-[0_0_18px_rgba(217,70,239,.38)] disabled:opacity-45"><span className="text-2xl">➜</span>{texts.nextLevel}</button>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center rounded-[32px] bg-[#020817]/75 p-4 text-center backdrop-blur-sm">
              <div className="rounded-[28px] border border-pink-300/50 bg-gradient-to-b from-[#29103d] via-[#180c2b] to-[#090713] p-5 text-pink-50 shadow-[0_0_30px_rgba(236,72,153,.22)]">
                <div className="text-5xl">🪙</div>
                <h2 className="mt-2 text-xl font-black">{texts.lost}</h2>
                <p className="mt-1 text-sm">{texts.retry}: {retryChances}</p>
                <button onClick={restart} disabled={retryChances <= 0} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-pink-100/70 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 px-4 py-2 font-black text-white shadow-[0_0_18px_rgba(236,72,153,.38)] disabled:opacity-45"><span className="text-2xl">↻</span>{texts.restart}</button>
                {retryChances <= 0 && <button onClick={() => setMenuOpen(true)} className="mt-2 text-xs font-bold underline">{texts.menu}</button>}
              </div>
            </div>
          )}
          {chestOpen && (
            <div className="absolute inset-0 z-[1200] flex items-center justify-center rounded-[32px] bg-[#020817]/85 p-4 text-center backdrop-blur-md">
              <div className="w-full max-w-[390px] rounded-[26px] border border-fuchsia-200/50 bg-gradient-to-b from-[#29103d] via-[#180c2b] to-[#090713] p-4 shadow-[0_0_40px_rgba(217,70,239,.3)]">
                <div className="text-4xl">🔐</div>
                <h2 className="mt-2 text-lg font-black text-white">{texts.chestTitle}</h2>
                <p className="mt-1 text-xs text-fuchsia-100/70">{texts.chestHint}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { icon: '🌐', title: lang === 'ru' ? 'Сети' : 'Network', btc: 20_000, hints: 3 },
                    { icon: '⛏️', title: lang === 'ru' ? 'Майнера' : 'Miner', btc: 50_000, hints: 1 },
                    { icon: '🔮', title: lang === 'ru' ? 'Оракула' : 'Oracle', btc: 10_000, hints: 8 },
                  ].map((chest, index) => (
                    <button
                      key={chest.title}
                      onClick={() => chooseChest(index)}
                      className="flex min-h-[130px] flex-col items-center justify-center rounded-2xl border border-fuchsia-300/40 bg-gradient-to-b from-[#351247] to-[#130c24] p-2 text-center shadow-[0_0_18px_rgba(217,70,239,.18)] transition hover:-translate-y-1 hover:border-pink-200 hover:shadow-[0_0_24px_rgba(236,72,153,.38)]"
                    >
                      <span className="text-3xl">{chest.icon}📦</span>
                      <span className="mt-2 text-xs font-black text-fuchsia-100">{chest.title}</span>
                      <span className="mt-1 text-[10px] font-bold text-amber-300">₿ {formatBitcoin(chest.btc)}</span>
                      <span className="text-[9px] text-fuchsia-100/70">+{chest.hints} {lang === 'ru' ? 'подсказок' : 'hints'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-20 w-full max-w-2xl shrink-0 px-3 pb-2 flex flex-col items-center">
        {/* Status bar */}
        <div className="mb-1 flex w-full flex-wrap items-center justify-between gap-1 rounded-xl border border-purple-500/25 bg-slate-950/85 px-2 py-1 text-[10px] font-black sm:text-xs">
          <span className="text-purple-300">
            {texts.level} {level} ∞ · {tiles.length} 🃏
          </span>
          <span className="text-slate-300">{lang === 'ru' ? 'Открытых' : 'Free'}: {freeIds.size}</span>
          <span className="text-amber-300">₿ {formatBitcoin(progress.bitcoinSatoshis)}</span>
        </div>

        {/* Mode switcher row matching Campaign and Day */}
        <div className="mb-1 flex w-full items-center justify-center gap-1">
          <button
            onClick={() => onSelectMode?.('campaign')}
            aria-label={lang === 'ru' ? 'Кампания' : 'Campaign'}
            title={lang === 'ru' ? 'Кампания' : 'Campaign'}
            className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-black text-slate-300 hover:text-white transition"
          >
            {lang === 'ru' ? 'Кампания' : 'Campaign'}
          </button>
          <button
            onClick={() => onSelectMode?.('daily')}
            aria-label={lang === 'ru' ? 'День' : 'Daily'}
            title={lang === 'ru' ? 'День' : 'Daily'}
            className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-black text-slate-300 hover:text-white transition"
          >
            {lang === 'ru' ? 'День' : 'Daily'}
          </button>
          <button
            title={lang === 'ru' ? 'Крипто-испытание' : 'Crypto challenge'}
            className="rounded-lg border border-purple-400/40 bg-gradient-to-r from-purple-900 to-cyan-900 px-2 py-1 text-[10px] font-black text-purple-200 shadow-[0_0_10px_rgba(168,85,247,.3)]"
          >
            {lang === 'ru' ? 'Испытание' : 'Challenge'}
          </button>
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              title={lang === 'ru' ? 'English' : 'Русский'}
              className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-black text-slate-200"
            >
              {lang === 'ru' ? 'RU' : 'EN'}
            </button>
          )}
          {onOpenShop && (
            <button
              onClick={onOpenShop}
              title={lang === 'ru' ? 'Магазин золота' : 'Gold shop'}
              aria-label={lang === 'ru' ? 'Магазин золота' : 'Gold shop'}
              className="rounded-lg border border-emerald-400/40 bg-gradient-to-br from-blue-950 to-emerald-950 p-1.5 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,.12)]"
            >
              <Store className="h-4 w-4" />
            </button>
          )}
          {onOpenDailyReward && (
            <button
              onClick={onOpenDailyReward}
              title={lang === 'ru' ? 'Ежедневная награда' : 'Daily reward'}
              aria-label={lang === 'ru' ? 'Ежедневная награда' : 'Daily reward'}
              className="rounded-lg bg-slate-900 p-1.5 text-yellow-300"
            >
              <Gift className="h-4 w-4" />
            </button>
          )}
          {onOpenDailyChallenges && (
            <button
              onClick={onOpenDailyChallenges}
              title={lang === 'ru' ? 'Ежедневные задания' : 'Daily challenges'}
              aria-label={lang === 'ru' ? 'Ежедневные задания' : 'Daily challenges'}
              className="rounded-lg bg-slate-900 p-1.5 text-fuchsia-300"
            >
              <Calendar className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Slot tray */}
        <div className="flex h-[50px] w-full max-w-[520px] items-center justify-center gap-1 rounded-2xl border border-fuchsia-300/30 bg-gradient-to-b from-[#1b1027] to-[#080711] px-1 shadow-[inset_0_1px_0_rgba(255,220,255,.12),0_0_20px_rgba(217,70,239,.16)]">
          {Array.from({ length: 7 }, (_, index) => {
            const tile = slot[index];
            const matching = tile && slot.filter((item) => item.art === tile.art).length >= 3;
            return (
              <div key={index} className="flex h-[42px] min-w-0 flex-1 items-center justify-center rounded-lg border border-fuchsia-200/20 bg-[#100b1b]">
                {tile && <span className={`block h-9 w-9 ${matching ? 'animate-bounce ring-2 ring-amber-400' : ''}`} aria-label={tile.label}><TileArtwork art={tile.art} /></span>}
              </div>
            );
          })}
        </div>
        {shelf.length > 0 && (
          <div className="flex items-center justify-center gap-1">
            {shelf.map((tile) => (
              <button key={tile.id} onClick={() => returnFromShelf(tile)} aria-label={tile.label} className="flex h-9 w-9 items-center justify-center rounded-lg border border-fuchsia-300/40 bg-[#100b1b] p-0.5 shadow-[0_0_10px_rgba(217,70,239,.2)]"><TileArtwork art={tile.art} /></button>
            ))}
          </div>
        )}
        <div className="grid w-full max-w-[390px] grid-cols-6 gap-1">
          <button onClick={onExit} aria-label={lang === 'ru' ? 'Назад' : 'Back'} className="flex h-11 items-center justify-center rounded-xl border border-slate-400/50 bg-gradient-to-b from-[#59616e] via-[#333744] to-[#171821] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_3px_0_#111219,0_0_12px_rgba(148,163,184,.15)] transition hover:brightness-125">
            <ArrowLeft className="h-7 w-7" />
          </button>
          <button onClick={extract} disabled={slot.length < 3 || shelf.length > 0 || boosters.extract <= 0} title={texts.extract} aria-label={texts.extract} className="relative flex h-11 items-center justify-center rounded-xl border border-cyan-100/60 bg-gradient-to-b from-cyan-300 via-cyan-600 to-indigo-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_3px_0_#15113e,0_0_14px_rgba(34,211,238,.28)] transition hover:brightness-125 disabled:opacity-45">
            <ArrowDown className="h-8 w-8 stroke-[3]" /><b className="absolute right-0 top-0 rounded-full bg-[#82b84f] px-1 text-[9px] text-white">{boosters.extract}</b>
          </button>
          <button onClick={undo} disabled={history.length === 0 || boosters.undo <= 0} title={texts.undo} aria-label={texts.undo} className="relative flex h-11 items-center justify-center rounded-xl border border-violet-100/70 bg-gradient-to-b from-violet-300 via-violet-600 to-indigo-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_3px_0_#17103c,0_0_14px_rgba(139,92,246,.28)] transition hover:brightness-125 disabled:opacity-45">
            <Undo2 className="h-7 w-7" /><b className="absolute right-0 top-0 rounded-full bg-[#d6a64a] px-1 text-[9px] text-white">{boosters.undo}</b>
          </button>
          <button onClick={shuffle} disabled={tiles.length === 0 || boosters.shuffle <= 0} title={texts.shuffle} aria-label={texts.shuffle} className="relative flex h-11 items-center justify-center rounded-xl border border-pink-100/70 bg-gradient-to-b from-pink-300 via-fuchsia-600 to-purple-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.32),0_3px_0_#310b43,0_0_14px_rgba(236,72,153,.3)] transition hover:brightness-125 disabled:opacity-45">
            <Shuffle className="h-7 w-7" /><b className="absolute right-0 top-0 rounded-full bg-[#ad70bb] px-1 text-[9px] text-white">{boosters.shuffle}</b>
          </button>
          <button onClick={hint} disabled={hintUses <= 0} title={texts.oracle} aria-label={`${texts.oracle}: ${hintUses}`} className="relative flex h-11 items-center justify-center rounded-xl border border-fuchsia-100/70 bg-gradient-to-b from-fuchsia-300 via-fuchsia-600 to-violet-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_3px_0_#281040,0_0_14px_rgba(217,70,239,.32)] transition hover:brightness-125 disabled:opacity-45">
            <CircleHelp className="h-7 w-7" /><b className="absolute right-0 top-0 rounded-full bg-[#ad70bb] px-1 text-[9px] text-white">{hintUses}</b>
          </button>
          <button onClick={() => setMenuOpen(true)} title={texts.menu} aria-label={texts.menu} className="flex h-11 items-center justify-center rounded-xl border border-pink-100/70 bg-gradient-to-b from-pink-300 via-pink-600 to-purple-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_3px_0_#2e0c3f,0_0_14px_rgba(236,72,153,.28)] transition hover:brightness-125">
            <Settings className="h-7 w-7" />
          </button>
        </div>
        <div className="flex min-h-[16px] w-full max-w-[520px] items-center justify-center gap-1 text-center text-[10px] font-bold text-fuchsia-100/80">
          <span>{message || (isDealing ? (lang === 'ru' ? 'Карты летят на места…' : 'Cards are dealing…') : `${freeIds.size} ${lang === 'ru' ? 'открытых' : 'free'}`)}</span>
          <InstallAppButton lang={lang} />
          <button onClick={restart} title={texts.restart} aria-label={texts.restart} className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-fuchsia-300/40 bg-gradient-to-b from-fuchsia-500 to-violet-950 text-fuchsia-50 shadow-[0_0_10px_rgba(217,70,239,.22)]"><RotateCcw className="h-4 w-4" /></button>
        </div>
        <span className="sr-only">{texts.local}</span>
      </footer>

      {menuOpen && (
        <div className="absolute inset-0 z-[1400] flex items-center justify-center bg-[#020817]/75 p-3 backdrop-blur-md">
          <div className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-y-auto rounded-[26px] border border-fuchsia-200/40 bg-gradient-to-b from-[#29103d] via-[#180c2b] to-[#090713] p-4 text-slate-100 shadow-[0_0_40px_rgba(217,70,239,.22)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Settings className="h-5 w-5" /><h2 className="text-lg font-black">{texts.menu}</h2></div>
              <button onClick={() => setMenuOpen(false)} aria-label={lang === 'ru' ? 'Закрыть' : 'Close'} className="flex h-9 w-9 items-center justify-center rounded-xl border border-fuchsia-200/40 bg-[#241033] text-2xl font-black text-fuchsia-100">×</button>
            </div>
            <div className="mt-3 rounded-2xl border border-fuchsia-200/20 bg-white/[.04] p-3">
              <div className="flex items-center justify-between text-sm font-black"><span>{texts.level} {level} ∞</span><span className="text-amber-300">₿ {formatBitcoin(progress.bitcoinSatoshis)}</span></div>
              <p className="mt-2 text-xs font-black text-fuchsia-100">{levelSettings.typeCount} {lang === 'ru' ? 'видов ·' : 'types ·'} {levelSettings.tileCount} {lang === 'ru' ? 'карт ·' : 'tiles ·'} {progress.wins} {lang === 'ru' ? 'побед' : 'wins'}</p>
              <p className="mt-1 text-[10px] text-slate-300">{lang === 'ru' ? 'Каждая победа открывает следующий уровень. Сложность растёт до максимального набора карт.' : 'Each win unlocks the next level. Difficulty scales up to the maximum tile set.'}</p>
            </div>

            {/* Mode Switcher in Menu Modal */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSelectMode?.('campaign');
                }}
                className="flex-1 py-2 px-2 rounded-xl border border-cyan-500/30 bg-slate-900 text-xs font-bold text-cyan-300 hover:bg-slate-800 transition"
              >
                🎮 {lang === 'ru' ? 'Кампания' : 'Campaign'}
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSelectMode?.('daily');
                }}
                className="flex-1 py-2 px-2 rounded-xl border border-amber-500/30 bg-slate-900 text-xs font-bold text-amber-300 hover:bg-slate-800 transition"
              >
                📅 {lang === 'ru' ? 'День' : 'Daily'}
              </button>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex-1 py-2 px-2 rounded-xl border border-purple-500/50 bg-purple-950/80 text-xs font-bold text-purple-200 shadow"
              >
                ✨ {lang === 'ru' ? 'Испытание' : 'Challenge'}
              </button>
            </div>

            {/* Quick action buttons in Menu Modal */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {onOpenHelp && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenHelp();
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-white/5 p-2 text-xs font-bold text-cyan-300 hover:bg-slate-800"
                >
                  <HelpCircle className="h-4 w-4" />
                  {lang === 'ru' ? 'Правила' : 'Rules'}
                </button>
              )}
              {onOpenLeaderboard && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenLeaderboard();
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-white/5 p-2 text-xs font-bold text-amber-300 hover:bg-slate-800"
                >
                  <Trophy className="h-4 w-4" />
                  {lang === 'ru' ? 'Рекорды' : 'Leaderboard'}
                </button>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => void toggleMusic()} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border border-fuchsia-200/20 p-2 text-sm font-bold ${musicPlaying ? 'bg-fuchsia-500/25 text-fuchsia-100' : 'bg-white/5'}`}>
                <AudioLines className="h-5 w-5" />{texts.sound}: {musicPlaying ? '♫' : '○'}
              </button>
              <div className="flex items-center justify-center gap-2 rounded-xl border border-fuchsia-200/20 bg-white/5 p-2">
                <Sparkles className="h-5 w-5 shrink-0" />
                <select value={selectedVoice} onChange={(event) => chooseVoice(Number(event.target.value))} aria-label={texts.voice} className="min-w-0 bg-[#29103d] text-xs font-bold">
                  {VOICE_STYLES.map((style, index) => <option key={style.name} value={index}>{index + 1}. {style.name}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-fuchsia-200/25 bg-fuchsia-400/[.05] p-3">
              <div className="flex items-center justify-between">
                <p className="font-black text-fuchsia-100">{texts.shop}</p>
                <span className="text-xs font-black text-amber-300">₿ {formatBitcoin(progress.bitcoinSatoshis)}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([
                  ['hint', texts.buyHint, 2000, '🔮'],
                  ['undo', texts.buyUndo, 3000, '↶'],
                  ['shuffle', texts.buyShuffle, 4000, '⤨'],
                  ['extract', texts.buyExtract, 5000, '⬇'],
                ] as const).map(([item, label, price, icon]) => (
                  <button
                    key={item}
                    onClick={() => buyChallengeItem(item)}
                    disabled={progress.bitcoinSatoshis < price}
                    className="flex min-h-[64px] flex-col justify-center rounded-xl border border-fuchsia-200/20 bg-[#100b1b] px-2 py-1 text-left transition hover:border-pink-200/50 disabled:opacity-40"
                  >
                    <span className="flex items-center gap-1"><span className="text-lg">{icon}</span><span className="truncate text-[11px] font-bold">{label}</span></span>
                    <span className="mt-1 self-end text-[9px] font-black text-amber-300">₿ {formatBitcoin(price)}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] text-fuchsia-100/55">{texts.local} · {texts.balance}: {formatBitcoin(progress.bitcoinSatoshis)} · {progress.wins} {lang === 'ru' ? 'побед' : 'wins'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
