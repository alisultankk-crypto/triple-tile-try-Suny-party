/**
 * Level generator for the cosmic tile-matching campaign.
 * Generates layered boards and ensures all tiles exist in triplets.
 * Includes deterministic Daily Challenge generator with 24-hour reset cycle.
 */

import { TileItemData, TileType } from '../types/game';
import { CAMPAIGN_TILE_TYPES } from '../components/CosmicCards';

export const TILE_WIDTH = 56;
export const TILE_HEIGHT = 64;

const ALL_TYPES: TileType[] = [
  'yasuo',
  'ahri',
  'jinx',
  'teemo',
  'garen',
  'zed',
  'blitzcrank',
  'vi',
  'ashe',
  'darius',
  'asol',
  'lux',
  'heimer',
  'katarina',
];

export const MAX_CAMPAIGN_LEVEL = 777;
export const COSMIC_MAP_LEVEL = 25;

interface TileBlueprint {
  x: number;
  y: number;
  layer: number;
}

/**
 * Seeded PRNG (Mulberry32) for deterministic daily boards
 */
export function createPRNG(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getFormattedDayLabel(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  return `${day} ${months[monthIdx] || ''} ${year}`;
}

export function getMsUntilTomorrow(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 123456789;
}

/**
 * Generates one of 777 campaign boards with new card types every 50 levels.
 */
export function generateCampaignLevel(level: number): TileItemData[] {
  const safeLevel = Math.max(1, Math.min(MAX_CAMPAIGN_LEVEL, Math.floor(level)));
  const progress = (safeLevel - 1) / (MAX_CAMPAIGN_LEVEL - 1);
  const typeCount = Math.min(CAMPAIGN_TILE_TYPES.length, 12 + Math.floor((safeLevel - 1) / 50) * 2);
  const totalTriplets = Math.max(typeCount, 14 + Math.ceil(120 * Math.pow(progress, 0.72)));
  const tripletTypes = Array.from(
    { length: totalTriplets },
    (_, i) => CAMPAIGN_TILE_TYPES[i % typeCount]
  );
  const random = createPRNG(safeLevel * 7919 + 104729);
  for (let i = tripletTypes.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [tripletTypes[i], tripletTypes[j]] = [tripletTypes[j], tripletTypes[i]];
  }
  const pool = tripletTypes.flatMap((type) => [type, type, type]);

  const columns = 7;
  const rows = 6;
  const positions: { x: number; y: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      positions.push({
        x: (column - (columns - 1) / 2) * 40,
        y: (row - (rows - 1) / 2) * 46,
      });
    }
  }

  const layout = safeLevel === COSMIC_MAP_LEVEL ? 4 : Math.floor(random() * 6);
  positions.sort((a, b) => {
    if (layout === 4) {
      const rocketRows = [
        '...#...',
        '..###..',
        '.#####.',
        '#######',
        '...#...',
        '...#...',
      ];
      const getRocketRank = (position: { x: number; y: number }) => {
        const column = Math.round(position.x / 40 + (columns - 1) / 2);
        const row = Math.round(position.y / 46 + (rows - 1) / 2);
        return rocketRows[row][column] === '#' ? 0 : 1;
      };
      return getRocketRank(a) - getRocketRank(b) || a.y - b.y || a.x - b.x;
    }
    if (layout === 0) {
      return Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y);
    }
    if (layout === 1) {
      if (a.y !== b.y) return a.y - b.y;
      const row = Math.round(a.y / 46 + (rows - 1) / 2);
      return row % 2 === 0 ? a.x - b.x : b.x - a.x;
    }
    if (layout === 2) {
      return Math.abs(a.x) - Math.abs(b.x) || a.y - b.y;
    }
    if (layout === 3) {
      return Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x);
    }
    if (layout === 5) {
      const spiralRank = (position: { x: number; y: number }) =>
        Math.atan2(position.y, position.x) + Math.hypot(position.x, position.y) / 70;
      return spiralRank(a) - spiralRank(b);
    }
    return Math.abs(a.x) + Math.abs(a.y) - Math.abs(b.x) - Math.abs(b.y);
  });

  const boardPositions = positions.slice(0, 18 + Math.floor(progress * 24));
  if (safeLevel !== COSMIC_MAP_LEVEL) {
    for (let i = boardPositions.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [boardPositions[i], boardPositions[j]] = [boardPositions[j], boardPositions[i]];
    }
  }
  const tripletsPerLayer = Math.max(1, Math.floor(boardPositions.length / 3));
  const blueprints = tripletTypes.flatMap((_, tripletIndex) => {
    const layer = Math.floor(tripletIndex / tripletsPerLayer);
    const firstPosition = (tripletIndex % tripletsPerLayer) * 3;
    return [0, 1, 2].map((offset) => {
      const position = boardPositions[firstPosition + offset];
        const warpX = Math.sin(position.y / 31 + tripletIndex * 1.7) * 16
          + Math.cos(position.x / 42 - tripletIndex) * 8;
        const warpY = Math.sin(position.x / 37 + tripletIndex * 2.1) * 15
          + Math.cos(position.y / 32) * 6;
        return {
          x: position.x + (safeLevel === COSMIC_MAP_LEVEL ? 0 : warpX + (random() - 0.5) * 24),
          y: position.y + (safeLevel === COSMIC_MAP_LEVEL ? 0 : warpY + (random() - 0.5) * 22),
          layer,
        };
    });
  });

  return createTilesFromBlueprints(blueprints, pool, random);
}

/**
 * Generates the DAILY CHALLENGE:
 * A deterministic fixed board layout that automatically updates every 24 hours.
 * Uses the day's date string as a seed so every player in the world plays on the exact same layout!
 */
export function generateDailyChallenge(dateStr?: string): {
  tiles: TileItemData[];
  dateString: string;
  dayLabel: string;
} {
  const targetDate = dateStr || getTodayDateString();
  const seed = stringToSeed(targetDate);
  const prng = createPRNG(seed);

  // 12 item types, 40 triplets = 120 tiles (balanced & competitive)
  const typesUsed = ALL_TYPES.slice(0, 12);
  const totalTriplets = 40;
  const pool: TileType[] = [];

  for (let i = 0; i < totalTriplets; i++) {
    const t = typesUsed[i % typesUsed.length];
    pool.push(t, t, t);
  }

  // Deterministic Fisher-Yates shuffle with PRNG
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Select 1 of 4 daily archetypes based on seed
  const archetype = Math.floor(prng() * 4);
  const blueprints: TileBlueprint[] = [];

  if (archetype === 0) {
    // Archetype 0: "Royal Clover" (Center 6-layer pyramid + 4 petal wings)
    for (let l = 0; l < 6; l++) {
      const size = Math.max(1, 4 - Math.floor(l / 1.8));
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          blueprints.push({
            x: (c - (size - 1) / 2) * 38 + (l % 2 === 1 ? 12 : 0),
            y: (r - (size - 1) / 2) * 44 - 15 + (l % 2 === 1 ? 12 : 0),
            layer: l,
          });
        }
      }
    }
    // 4 Petals
    const offsets = [
      { dx: -115, dy: 0 },
      { dx: 115,  dy: 0 },
      { dx: 0,    dy: -90 },
      { dx: 0,    dy: 95 },
    ];
    offsets.forEach((off) => {
      for (let i = 0; i < 14; i++) {
        blueprints.push({
          x: off.dx + (i % 2) * 6,
          y: off.dy + (i % 3) * 12 - 15,
          layer: i + 8,
        });
      }
    });
  } else if (archetype === 1) {
    // Archetype 1: "Twin Mountains & Bridge"
    [-75, 75].forEach((mX) => {
      for (let l = 0; l < 6; l++) {
        const size = Math.max(1, 3 - Math.floor(l / 2.2));
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            blueprints.push({
              x: mX + (c - (size - 1) / 2) * 38,
              y: (r - (size - 1) / 2) * 42 - 10,
              layer: l,
            });
          }
        }
      }
    });
    // Bridge & wings
    for (let i = 0; i < 22; i++) {
      blueprints.push({
        x: -120 + (i % 2) * 6,
        y: -80 + i * 9,
        layer: i + 8,
      });
      blueprints.push({
        x: 120 + (i % 2) * 6,
        y: -80 + i * 9,
        layer: i + 8,
      });
    }
  } else if (archetype === 2) {
    // Archetype 2: "Sunburst Fortress"
    for (let l = 0; l < 7; l++) {
      blueprints.push(
        { x: 0, y: -15, layer: l * 2 },
        { x: -36, y: -15, layer: l * 2 + 1 },
        { x: 36, y: -15, layer: l * 2 + 1 },
        { x: 0, y: -55, layer: l * 2 + 1 },
        { x: 0, y: 25, layer: l * 2 + 1 }
      );
    }
    // Cross stacks
    for (let i = 0; i < 18; i++) {
      blueprints.push({ x: -110 - (i % 2) * 6, y: -60 + i * 11, layer: i + 5 });
      blueprints.push({ x: 110 + (i % 2) * 6, y: -60 + i * 11, layer: i + 5 });
      blueprints.push({ x: -40 + (i % 3) * 40, y: 105 + (i % 2) * 6, layer: i + 5 });
    }
  } else {
    // Archetype 3: "Farm Labyrinth"
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        for (let l = 0; l < 3; l++) {
          blueprints.push({
            x: (c - 1.5) * 42 + (l % 2) * 8,
            y: (r - 1.5) * 46 - 10 + (l % 2) * 8,
            layer: l,
          });
        }
      }
    }
    for (let i = 0; i < 20; i++) {
      blueprints.push({ x: -125 + (i % 2) * 4, y: -80 + i * 10, layer: i + 8 });
      blueprints.push({ x: 125 - (i % 2) * 4, y: -80 + i * 10, layer: i + 8 });
    }
  }

  // Adjust blueprint count to pool size exactly
  while (blueprints.length > pool.length) blueprints.pop();
  while (blueprints.length < pool.length) {
    const idx = Math.floor(prng() * blueprints.length);
    const ref = blueprints[idx];
    blueprints.push({
      x: ref.x + Math.round((prng() - 0.5) * 16),
      y: ref.y + Math.round((prng() - 0.5) * 16),
      layer: ref.layer + 1,
    });
  }

  const tiles = createTilesFromBlueprints(blueprints, pool, prng);
  return {
    tiles,
    dateString: targetDate,
    dayLabel: getFormattedDayLabel(targetDate),
  };
}

function createTilesFromBlueprints(
  blueprints: TileBlueprint[],
  pool: TileType[],
  prng?: () => number
): TileItemData[] {
  const randFn = prng || Math.random;
  const tiles: TileItemData[] = blueprints.map((bp, idx) => ({
    id: `tile_${idx}_${Date.now()}_${Math.floor(randFn() * 100000)}`,
    type: pool[idx],
    layer: bp.layer,
    x: Math.round(bp.x),
    y: Math.round(bp.y),
    isCovered: false,
    inSlot: false,
    inShelf: false,
    isEliminated: false,
  }));

  updateCoveredState(tiles);
  return tiles;
}

/**
 * Updates `isCovered` for every tile on the board.
 */
export function updateCoveredState(tiles: TileItemData[]) {
  const activeTiles = tiles.filter((t) => !t.inSlot && !t.inShelf && !t.isEliminated);

  for (const t of activeTiles) {
    t.isCovered = false;
  }

  const w = TILE_WIDTH - 6;
  const h = TILE_HEIGHT - 6;

  for (let i = 0; i < activeTiles.length; i++) {
    const lower = activeTiles[i];
    for (let j = 0; j < activeTiles.length; j++) {
      const upper = activeTiles[j];
      if (upper.layer > lower.layer) {
        if (Math.abs(upper.x - lower.x) < w && Math.abs(upper.y - lower.y) < h) {
          lower.isCovered = true;
          break;
        }
      }
    }
  }
}
