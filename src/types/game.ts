export type TileType =
  | 'yasuo'
  | 'ahri'
  | 'jinx'
  | 'teemo'
  | 'garen'
  | 'zed'
  | 'blitzcrank'
  | 'vi'
  | 'ashe'
  | 'darius'
  | 'asol'
  | 'lux'
  | 'heimer'
  | 'katarina'
  | 'nebula'
  | 'comet'
  | 'satellite'
  | 'ufo'
  | 'moon'
  | 'sun'
  | 'mars'
  | 'saturn'
  | 'blackhole'
  | 'galaxy'
  | 'astronaut'
  | 'rocket'
  | 'telescope'
  | 'meteor'
  | 'starship'
  | 'crystal'
  | 'portal'
  | 'rover'
  | 'aurora'
  | 'pulsar'
  | 'quasar'
  | 'stardust'
  | 'eclipse'
  | 'probe'
  | 'spacewhale'
  | 'cosmicflower'
  | 'ringworld'
  | 'constellation';

export type MagicEffectType =
  | 'arcane'
  | 'fire'
  | 'void'
  | 'frost'
  | 'wind'
  | 'starlight';

export type Language = 'ru' | 'en';

export interface TileItemData {
  id: string;
  type: TileType;
  layer: number;
  x: number; // Board coordinate
  y: number;
  isCovered: boolean;
  inSlot: boolean;
  inShelf: boolean;
  isEliminated: boolean;
}

export interface BoostersState {
  undo: number;
  shuffle: number;
  extract: number;
}

export interface RegionScore {
  name: string;
  clearedCount: number;
  rank: number;
  badge: string;
}

export type GameMode = 'campaign' | 'daily';

export interface DailyLeaderboardEntry {
  rank: number;
  playerName: string;
  avatar: string;
  timeSeconds: number;
  region: string;
  isUser?: boolean;
}

export interface DailyChallengeInfo {
  dateString: string;
  dayLabel: string;
  seed: number;
  timeRemainingMs: number;
}

export interface DailyLoginState {
  lastClaimDate: string; // YYYY-MM-DD
  streak: number; // 1 to 7
  hasClaimedToday: boolean;
}
