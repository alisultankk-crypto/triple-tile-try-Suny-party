/**
 * Try Party: COSMOS — Ultimate Cosmic 3-in-a-Row Party Game.
 * Features:
 * - 2 Languages: Russian & English (immediate toggle)
 * - Space-synth music, radio pings, cat meows, and arcade SFX
 * - Gold rewards and a booster shop with permanent tray upgrades
 * - Fullscreen responsive dynamic scaling layout (stretches to fill viewport cleanly)
 * - Level rewards and persistent campaign progress
 * - Encouraging feedback on defeat
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Coins,
  Gift,
  Store,
  Volume2,
  VolumeX,
  CircleHelp,
  RotateCcw,
  Gamepad2,
  Calendar,
  Music,
  MoreHorizontal,
  HelpCircle,
  Trophy,
  Maximize2,
  Minimize2,
  Target,
} from 'lucide-react';
import {
  TileItemData,
  BoostersState,
  TileType,
  GameMode,
  DailyLeaderboardEntry,
  MagicEffectType,
  Language,
  DailyLoginState,
} from './types/game';
import {
  generateCampaignLevel,
  MAX_CAMPAIGN_LEVEL,
  COSMIC_MAP_LEVEL,
  TILE_HEIGHT,
  TILE_WIDTH,
  generateDailyChallenge,
  updateCoveredState,
  getTodayDateString,
  getFormattedDayLabel,
  createPRNG,
} from './game/levelGenerator';
import { TileItem } from './components/TileItem';
import { CosmicMapArtwork } from './components/CosmicMapArtwork';
import { SlotTray } from './components/SlotTray';
import { BoosterBar } from './components/BoosterBar';
import { ReserveShelf } from './components/ReserveShelf';
import { CosmicBackground } from './components/CosmicBackground';
import { MagicVfxOverlay, MagicBurstTrigger } from './components/MagicVfxOverlay';
import { ScoreFloater } from './components/ScoreDisplay';
import { DailyTimer } from './components/DailyTimer';
import { LeaderboardModal } from './components/LeaderboardModal';
import { FailModal } from './components/FailModal';
import { WinModal } from './components/WinModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { BrowserHelpModal } from './components/BrowserHelpModal';
import {
  ShopModal,
  BoosterPurchase,
  SHOP_PRICES,
  EXTRA_SLOT_PRICE,
  MEOW_CARD_PRICE,
} from './components/ShopModal';
import { CatBossChallenge } from './components/CatBossChallenge';
import { ChallengeMode } from './components/ChallengeMode';
import { InstallAppButton } from './components/InstallAppButton';
import {
  DailyChallengesModal,
  DailyChallengeId,
  DailyChallengeProgress,
  DAILY_CHALLENGES,
  emptyDailyChallengeProgress,
  loadDailyChallengeProgress,
} from './components/DailyChallengesModal';
import { puzzleSounds } from './audio/puzzleSounds';
import { TRANSLATIONS } from './i18n/translations';
import { CAMPAIGN_TILE_TYPES, getCardMeta } from './components/CosmicCards';

function findLastTypeIndex(items: TileItemData[], targetType: TileType): number {
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].type === targetType) return i;
  }
  return -1;
}

function loadUnlockedMeows(): TileType[] {
  try {
    const saved = localStorage.getItem('cosmic_unlocked_meows');
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((type): type is TileType =>
      typeof type === 'string' && CAMPAIGN_TILE_TYPES.includes(type as TileType)
    );
  } catch {
    return [];
  }
}

function loadBoosters(): BoostersState {
  const defaults: BoostersState = { undo: 3, shuffle: 3, extract: 3 };
  try {
    const saved = localStorage.getItem('cosmic_boosters');
    if (!saved) return defaults;
    const parsed = JSON.parse(saved) as Partial<Record<keyof BoostersState, unknown>>;
    const count = (key: keyof BoostersState) => {
      const value = parsed[key];
      return typeof value === 'number' && Number.isFinite(value)
        ? Math.max(0, Math.floor(value))
        : defaults[key];
    };
    return { undo: count('undo'), shuffle: count('shuffle'), extract: count('extract') };
  } catch {
    return defaults;
  }
}

const DEFAULT_SPEEDRUNNERS = [
  { name: '⚡ Faker', avatar: '👑', baseTime: 82.4, region: 'KR (T1)' },
  { name: '🗡️ YasuoMain_07', avatar: '🌪️', baseTime: 98.5, region: 'EUW (Ionia)' },
  { name: '🦊 AhriSpirit', avatar: '🌸', baseTime: 112.8, region: 'RU (Freljord)' },
  { name: '💣 JinxRockets', avatar: '🚀', baseTime: 125.4, region: 'NA (Zaun)' },
  { name: '🍄 TeemoShroom', avatar: '🍄', baseTime: 139.9, region: 'EUNE (Bandle)' },
  { name: '✨ LuxLaser', avatar: '✨', baseTime: 154.3, region: 'CN (Demacia)' },
  { name: '🌌 AsolGalaxy', avatar: '⭐', baseTime: 168.7, region: 'BR (Targon)' },
  { name: '⚔️ GarenSpin', avatar: '🛡️', baseTime: 182.1, region: 'JP (Noxus)' },
];

function generateDailyLeaderboard(dateStr: string, userTime: number | null, isRu: boolean): DailyLeaderboardEntry[] {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const prng = createPRNG(Math.abs(hash) || 987654);

  const list: DailyLeaderboardEntry[] = DEFAULT_SPEEDRUNNERS.map((runner, idx) => {
    const variance = (prng() - 0.5) * 16;
    const timeSeconds = Math.round((runner.baseTime + variance) * 100) / 100;
    return {
      rank: idx + 1,
      playerName: runner.name,
      avatar: runner.avatar,
      timeSeconds,
      region: runner.region,
      isUser: false,
    };
  });

  if (userTime !== null) {
    list.push({
      rank: 99,
      playerName: isRu ? 'Машка (Чемпион) 👑' : 'Mashka (Champion) 👑',
      avatar: '🌟',
      timeSeconds: userTime,
      region: isRu ? 'Галактика Машки' : 'Mashka Galaxy',
      isUser: true,
    });
  }

  list.sort((a, b) => a.timeSeconds - b.timeSeconds);
  return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
}

export default function App() {
  // 1. Language state
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('tryparty_lang') as Language;
      if (saved === 'ru' || saved === 'en') return saved;
    } catch {}
    return 'ru';
  });
  const [challengeMode, setChallengeMode] = useState(false);

  const t = TRANSLATIONS[lang];

  const handleToggleLang = () => {
    const next: Language = lang === 'ru' ? 'en' : 'ru';
    setLang(next);
    try {
      localStorage.setItem('tryparty_lang', next);
    } catch {}
  };

  const [mode, setMode] = useState<GameMode>('campaign');
  const [level, setLevel] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('cosmic_campaign_level'));
      if (Number.isInteger(saved) && saved >= 1) return Math.min(saved, MAX_CAMPAIGN_LEVEL);
    } catch {}
    return 1;
  });
  const victoryHandledRef = useRef(false);

  // Daily Challenge state
  const [todayDateStr, setTodayDateStr] = useState<string>(getTodayDateString());
  const [dayLabel, setDayLabel] = useState<string>(getFormattedDayLabel(getTodayDateString()));
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [userBestDailyTime, setUserBestDailyTime] = useState<number | null>(null);
  const [dailyCompletionTime, setDailyCompletionTime] = useState<number | null>(null);
  const [dailyRank, setDailyRank] = useState<number | undefined>(undefined);
  const [isNewBest, setIsNewBest] = useState<boolean>(false);
  const [dailyLeaderboard, setDailyLeaderboard] = useState<DailyLeaderboardEntry[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallengeProgress>(() =>
    loadDailyChallengeProgress(getTodayDateString())
  );

  const timerStartRef = useRef<number>(0);
  const timerFrameRef = useRef<number>(0);

  // Magic VFX Trigger State
  const [magicBurst, setMagicBurst] = useState<MagicBurstTrigger | null>(null);

  // Board state
  const [tiles, setTiles] = useState<TileItemData[]>([]);
  const [slot, setSlot] = useState<TileItemData[]>([]);
  const [shelf, setShelf] = useState<TileItemData[]>([]);
  const [matchingIds, setMatchingIds] = useState<string[]>([]);
  const [history, setHistory] = useState<{ tileId: string; fromBoardX: number; fromBoardY: number }[]>([]);
  const matchResolutionRef = useRef<number | null>(null);

  const [boosters, setBoosters] = useState<BoostersState>(loadBoosters);

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isBossChallenge, setIsBossChallenge] = useState<boolean>(false);
  const [bossHitsThisLevel, setBossHitsThisLevel] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [hasRevive, setHasRevive] = useState<boolean>(true);

  // Audio State
  const [isMuted, setIsMuted] = useState<boolean>(puzzleSounds.getMuted());
  const [bgmActive, setBgmActive] = useState<boolean>(false);

  // Browser Experience States
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showDailyRewardModal, setShowDailyRewardModal] = useState<boolean>(false);
  const [showChallenges, setShowChallenges] = useState<boolean>(false);
  const [unlockedMeows, setUnlockedMeows] = useState<TileType[]>(loadUnlockedMeows);
  const [gold, setGold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cosmic_gold');
      if (saved === null) return 200;
      const parsed = Number(saved);
      return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
    } catch {
      return 200;
    }
  });
  const [goldEarned, setGoldEarned] = useState<number>(0);
  const updateDailyChallenges = (update: (progress: DailyChallengeProgress) => DailyChallengeProgress) => {
    setDailyChallenges((previous) => {
      const today = getTodayDateString();
      const current = previous.date === today ? previous : emptyDailyChallengeProgress(today);
      return update(current);
    });
  };
  const [maxSlots, setMaxSlots] = useState<number>(() => {
    try {
      return localStorage.getItem('cosmic_extra_slot') === '1' ? 8 : 7;
    } catch {
      return 7;
    }
  });

  // 🎁 Daily Login Reward State
  const [dailyLogin, setDailyLogin] = useState<DailyLoginState>(() => {
    const today = getTodayDateString();
    try {
      const saved = localStorage.getItem('cosmic_daily_login');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastClaimDate === today) {
          return parsed;
        } else {
          return {
            lastClaimDate: today,
            streak: parsed.hasClaimedToday ? (parsed.streak % 7) + 1 : 1,
            hasClaimedToday: false,
          };
        }
      }
    } catch {}
    return {
      lastClaimDate: today,
      streak: 1,
      hasClaimedToday: false,
    };
  });
  // Responsive Board Scaling (Dynamic screen stretching)
  const [boardScale, setBoardScale] = useState<number>(1);
  const footerRef = useRef<HTMLElement>(null);

  // Oracle Hint state
  const [hintedTileTypes, setHintedTileTypes] = useState<TileType[]>([]);

  // Score HUD & Floaters
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cosmic_high_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [combo, setCombo] = useState<number>(1);
  const [floaters, setFloaters] = useState<ScoreFloater[]>([]);
  const comboRef = useRef<number>(1);

  // Responsive scale calculator so game comfortably stretches to fill any viewport
  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const footerHeight = footerRef.current?.getBoundingClientRect().height ?? 220;
      const availableHeight = Math.max(72, h - footerHeight - 16);
      const scale = Math.max(0.2, Math.min(1, availableHeight / 390, (w - 24) / 380));
      setBoardScale(scale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    const observer = new ResizeObserver(updateScale);
    if (footerRef.current) observer.observe(footerRef.current);
    return () => {
      window.removeEventListener('resize', updateScale);
      observer.disconnect();
    };
  }, [shelf.length, maxSlots]);

  useEffect(() => {
    return () => {
      if (matchResolutionRef.current !== null) {
        window.clearTimeout(matchResolutionRef.current);
      }
    };
  }, []);

  // Check today's daily date string
  useEffect(() => {
    const today = getTodayDateString();
    setTodayDateStr(today);
    setDayLabel(getFormattedDayLabel(today));

    try {
      const savedBest = localStorage.getItem(`daily_best_${today}`);
      if (savedBest) {
        const parsed = parseFloat(savedBest);
        setUserBestDailyTime(parsed);
      }
    } catch {}

    setDailyLeaderboard(generateDailyLeaderboard(today, userBestDailyTime, lang === 'ru'));
  }, [lang]);

  // Daily Timer tick
  useEffect(() => {
    if (timerRunning) {
      const updateTimer = () => {
        const elapsed = (performance.now() - timerStartRef.current) / 1000;
        setTimerSeconds(elapsed);
        timerFrameRef.current = requestAnimationFrame(updateTimer);
      };
      timerFrameRef.current = requestAnimationFrame(updateTimer);
    } else {
      cancelAnimationFrame(timerFrameRef.current);
    }
    return () => cancelAnimationFrame(timerFrameRef.current);
  }, [timerRunning]);

  // Initialize board when mode or level changes
  useEffect(() => {
    startCurrentGame();
  }, [mode, level]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const preview = new URLSearchParams(window.location.search).get('test');
    if (preview === 'boss') setIsBossChallenge(true);
    if (preview === 'challenges') setShowChallenges(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cosmic_campaign_level', String(level));
    } catch {}
  }, [level]);

  useEffect(() => {
    try {
      localStorage.setItem('cosmic_gold', String(gold));
    } catch {}
  }, [gold]);

  useEffect(() => {
    try {
      localStorage.setItem('cosmic_boosters', JSON.stringify(boosters));
    } catch {}
  }, [boosters]);

  useEffect(() => {
    try {
      localStorage.setItem('cosmic_unlocked_meows', JSON.stringify(unlockedMeows));
    } catch {}
  }, [unlockedMeows]);

  useEffect(() => {
    try {
      localStorage.setItem('cosmic_daily_challenges', JSON.stringify(dailyChallenges));
    } catch {}
  }, [dailyChallenges]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const today = getTodayDateString();
      setDailyChallenges((previous) =>
        previous.date === today ? previous : loadDailyChallengeProgress(today)
      );
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const startCurrentGame = () => {
    if (matchResolutionRef.current !== null) {
      window.clearTimeout(matchResolutionRef.current);
      matchResolutionRef.current = null;
    }
    victoryHandledRef.current = false;
    setTimerRunning(false);
    setTimerSeconds(0);
    setDailyCompletionTime(null);
    setIsNewBest(false);
    setMagicBurst(null);
    setGoldEarned(0);

    let initialTiles: TileItemData[];

    if (mode === 'daily') {
      const challenge = generateDailyChallenge(todayDateStr);
      initialTiles = challenge.tiles;
      setDayLabel(challenge.dayLabel);
    } else {
      initialTiles = generateCampaignLevel(level);
    }

    setTiles(initialTiles);
    setSlot([]);
    setShelf([]);
    setMatchingIds([]);
    setHistory([]);
    setIsGameOver(false);
    setIsVictory(false);
    setIsBossChallenge(false);
    setBossHitsThisLevel(0);
    setHasRevive(true);
    setHintedTileTypes([]);
    comboRef.current = 1;
    setCombo(1);
    setFloaters([]);

    if (level === 1 || mode === 'daily') {
      setScore(0);
    }

  };

  // Handle clicking a tile on the board
  const handleTileClick = (clickedTile: TileItemData) => {
    if (
      clickedTile.isCovered ||
      clickedTile.inSlot ||
      clickedTile.inShelf ||
      isGameOver ||
      isVictory ||
      matchingIds.length > 0
    ) {
      return;
    }
    if (slot.length >= maxSlots) return;

    if (mode === 'daily' && !timerRunning) {
      timerStartRef.current = performance.now() - timerSeconds * 1000;
      setTimerRunning(true);
    }

    const meowIndex = CAMPAIGN_TILE_TYPES.indexOf(clickedTile.type);
    if (unlockedMeows.includes(clickedTile.type)) puzzleSounds.playCardSound(meowIndex);
    else puzzleSounds.playTileTap();

    setHistory((prev) => [
      ...prev,
      { tileId: clickedTile.id, fromBoardX: clickedTile.x, fromBoardY: clickedTile.y },
    ]);

    const updatedTiles = tiles.map((t) =>
      t.id === clickedTile.id ? { ...t, inSlot: true } : t
    );
    updateCoveredState(updatedTiles);
    setTiles(updatedTiles);

    const newSlot = [...slot];
    const sameTypeIndex = findLastTypeIndex(newSlot, clickedTile.type);
    const tileForSlot = { ...clickedTile, inSlot: true };

    if (sameTypeIndex !== -1) {
      newSlot.splice(sameTypeIndex + 1, 0, tileForSlot);
    } else {
      newSlot.push(tileForSlot);
    }

    setSlot(newSlot);
    checkSlotMatches(newSlot, updatedTiles);
  };

  // Handle clicking a tile from the Reserve Shelf
  const handleShelfTileClick = (shelfTile: TileItemData) => {
    if (slot.length >= maxSlots || isGameOver || isVictory || matchingIds.length > 0) return;

    const meowIndex = CAMPAIGN_TILE_TYPES.indexOf(shelfTile.type);
    if (unlockedMeows.includes(shelfTile.type)) puzzleSounds.playCardSound(meowIndex);
    else puzzleSounds.playTileTap();
    const newShelf = shelf.filter((t) => t.id !== shelfTile.id);
    setShelf(newShelf);

    const newSlot = [...slot];
    const sameTypeIndex = findLastTypeIndex(newSlot, shelfTile.type);
    const tileForSlot = { ...shelfTile, inSlot: true, inShelf: false };

    if (sameTypeIndex !== -1) {
      newSlot.splice(sameTypeIndex + 1, 0, tileForSlot);
    } else {
      newSlot.push(tileForSlot);
    }

    setSlot(newSlot);
    checkSlotMatches(newSlot, tiles);
  };

  // Check if 3 matching cards exist in the slot
  const checkSlotMatches = (currentSlot: TileItemData[], currentTiles: TileItemData[]) => {
    const counts: { [type: string]: TileItemData[] } = {};
    for (const item of currentSlot) {
      if (!counts[item.type]) counts[item.type] = [];
      counts[item.type].push(item);
    }

    let matchFound = false;
    for (const rawType in counts) {
      const type = rawType as TileType;
      if (counts[type].length >= 3) {
        matchFound = true;
        const matchingTiles = counts[type].slice(0, 3);
        const matchIds = matchingTiles.map((t) => t.id);
        setMatchingIds(matchIds);

        const cardMeta = getCardMeta(type);
        const magicType: MagicEffectType = cardMeta.magic;
        const currentCombo = comboRef.current;
        const earnedPoints = 300 * currentCombo;
        const earnedGold = 10 * currentCombo;

        puzzleSounds.playMatchChime();
        updateDailyChallenges((progress) => ({ ...progress, matches: progress.matches + 1 }));
        comboRef.current++;
        setCombo(comboRef.current);
        setGold((prev) => prev + earnedGold);
        setGoldEarned((prev) => prev + earnedGold);

        setScore((prev) => {
          const next = prev + earnedPoints;
          setHighScore((curHigh) => {
            const newHigh = Math.max(curHigh, next);
            try {
              localStorage.setItem('cosmic_high_score', String(newHigh));
            } catch {}
            return newHigh;
          });
          return next;
        });

        // Trigger score floater
        const floaterX = window.innerWidth / 2 + (Math.random() - 0.5) * 80;
        const floaterY = window.innerHeight - 150;
        const newFloater: ScoreFloater = {
          id: `${Date.now()}_${Math.random()}`,
          points: earnedPoints,
          combo: currentCombo,
          text:
            currentCombo >= 3
              ? `🔥 MEGA-COMBO x${currentCombo}! +${earnedPoints}`
              : currentCombo === 2
              ? `⚡ COMBO x2! +${earnedPoints}`
              : `+${earnedPoints} PTS!`,
          x: floaterX,
          y: floaterY,
        };
        setFloaters((prev) => [...prev, newFloater]);
        setTimeout(() => {
          setFloaters((prev) => prev.filter((f) => f.id !== newFloater.id));
        }, 1100);

        const burstX = window.innerWidth / 2;
        const burstY = window.innerHeight - 100;
        setMagicBurst({
          id: `${Date.now()}_${Math.random()}`,
          type: magicType,
          color: cardMeta.accentColor,
          x: burstX,
          y: burstY,
        });

        matchResolutionRef.current = window.setTimeout(() => {
          matchResolutionRef.current = null;
          setSlot((prev) => prev.filter((t) => !matchIds.includes(t.id)));
          setMatchingIds([]);

          const afterElimination = currentTiles.map((t) =>
            matchIds.includes(t.id) ? { ...t, isEliminated: true, inSlot: false } : t
          );
          setTiles(afterElimination);
          if (afterElimination.every((t) => t.isEliminated)) handleVictory();
        }, 220);
        break;
      }
    }

    if (!matchFound) {
      if (currentSlot.length >= maxSlots) {
        setTimerRunning(false);
        setTimeout(() => {
          setIsGameOver(true);
          puzzleSounds.playDefeat();
        }, 280);
      } else if (currentSlot.length === maxSlots - 1) {
        puzzleSounds.playSlotWarning();
      }
    }
  };

  const handleVictory = () => {
    if (victoryHandledRef.current) return;
    victoryHandledRef.current = true;
    setTimerRunning(false);
    if (mode === 'campaign') {
      setIsBossChallenge(true);
      return;
    }
    finishLevel(0);
  };

  const finishLevel = (bossHits: number) => {
    setIsBossChallenge(false);
    setIsVictory(true);
    setBossHitsThisLevel(bossHits);
    puzzleSounds.playVictory();
    setMagicBurst({
      id: `victory_${Date.now()}`,
      type: 'starlight',
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const victoryBonus = mode === 'daily' ? 5000 : level * 2000;
    const bossGold = bossHits * 60 + (bossHits === 3 ? 200 : 0);
    const victoryGold = (mode === 'daily' ? 100 : 100 + Math.min(level * 2, 500)) + bossGold;
    setGold((prev) => prev + victoryGold);
    setGoldEarned((prev) => prev + victoryGold);
    if (bossHits === 3) {
      setBoosters((prev) => ({ ...prev, extract: prev.extract + 1 }));
    }
    updateDailyChallenges((progress) => ({ ...progress, clears: progress.clears + 1 }));
    setScore((prev) => {
      const next = prev + victoryBonus;
      setHighScore((curHigh) => {
        const newHigh = Math.max(curHigh, next);
        try {
          localStorage.setItem('cosmic_high_score', String(newHigh));
        } catch {}
        return newHigh;
      });
      return next;
    });

    if (mode === 'daily') {
      const finalTime = (performance.now() - timerStartRef.current) / 1000;
      const roundedTime = Math.round(finalTime * 100) / 100;
      setDailyCompletionTime(roundedTime);

      let isBest = false;
      if (!userBestDailyTime || roundedTime < userBestDailyTime) {
        isBest = true;
        setUserBestDailyTime(roundedTime);
        setIsNewBest(true);
        try {
          localStorage.setItem(`daily_best_${todayDateStr}`, String(roundedTime));
        } catch {}
      }

      const updatedList = generateDailyLeaderboard(
        todayDateStr,
        isBest ? roundedTime : userBestDailyTime || roundedTime,
        lang === 'ru'
      );
      setDailyLeaderboard(updatedList);
      const userRank = updatedList.find((e) => e.isUser)?.rank || 1;
      setDailyRank(userRank);
    }
  };

  // Booster: Extract 3
  const handleExtractBooster = () => {
    if (boosters.extract <= 0 || slot.length === 0) return;

    puzzleSounds.playBooster();
    setBoosters((prev) => ({ ...prev, extract: prev.extract - 1 }));

    const extractCount = Math.min(3, slot.length);
    const toExtract = slot.slice(0, extractCount).map((t) => ({ ...t, inSlot: false, inShelf: true }));
    const remainingSlot = slot.slice(extractCount);

    setSlot(remainingSlot);
    setShelf((prev) => [...prev, ...toExtract]);
  };

  // Booster: Undo
  const handleUndoBooster = () => {
    if (boosters.undo <= 0 || history.length === 0 || slot.length === 0) return;

    puzzleSounds.playBooster();
    setBoosters((prev) => ({ ...prev, undo: prev.undo - 1 }));

    const lastAction = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    setSlot((prev) => prev.filter((t) => t.id !== lastAction.tileId));

    const updatedTiles = tiles.map((t) =>
      t.id === lastAction.tileId
        ? { ...t, inSlot: false, inShelf: false, isEliminated: false }
        : t
    );
    updateCoveredState(updatedTiles);
    setTiles(updatedTiles);
  };

  // Booster: Shuffle
  const handleShuffleBooster = () => {
    if (boosters.shuffle <= 0) return;

    puzzleSounds.playBooster();
    setBoosters((prev) => ({ ...prev, shuffle: prev.shuffle - 1 }));

    const activeTiles = tiles.filter((t) => !t.inSlot && !t.inShelf && !t.isEliminated);
    const activeTypes = activeTiles.map((t) => t.type);

    for (let i = activeTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [activeTypes[i], activeTypes[j]] = [activeTypes[j], activeTypes[i]];
    }

    let typeIdx = 0;
    const shuffledTiles = tiles.map((t) => {
      if (!t.inSlot && !t.inShelf && !t.isEliminated) {
        return { ...t, type: activeTypes[typeIdx++] };
      }
      return t;
    });

    updateCoveredState(shuffledTiles);
    setTiles(shuffledTiles);
  };

  // Booster: Hint
  const handleHintBooster = () => {
    puzzleSounds.playBooster();

    const unpicked = tiles.filter((t) => !t.inSlot && !t.inShelf && !t.isEliminated);
    const uncovered = unpicked.filter((t) => !t.isCovered);

    let foundType: TileType | null = null;
    for (const t of slot) {
      if (uncovered.some((u) => u.type === t.type)) {
        foundType = t.type;
        break;
      }
    }

    if (!foundType && uncovered.length > 0) {
      foundType = uncovered[0].type;
    }

    if (foundType) {
      setHintedTileTypes([foundType]);
      setTimeout(() => setHintedTileTypes([]), 2500);
    }
  };

  // Revive from Game Over
  const handleRevive = () => {
    if (slot.length === 0) return;
    setHasRevive(false);
    setIsGameOver(false);
    puzzleSounds.playBooster();

    if (mode === 'daily') {
      timerStartRef.current = performance.now() - timerSeconds * 1000;
      setTimerRunning(true);
    }

    const extractCount = Math.min(3, slot.length);
    const toExtract = slot.slice(0, extractCount).map((t) => ({ ...t, inSlot: false, inShelf: true }));
    const remainingSlot = slot.slice(extractCount);

    setSlot(remainingSlot);
    setShelf((prev) => [...prev, ...toExtract]);
  };

  const handleToggleMute = () => {
    const muted = puzzleSounds.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleBGM = () => {
    const active = puzzleSounds.toggleBGM();
    setBgmActive(active);
  };

  const closeMoreMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.closest('details')?.removeAttribute('open');
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Daily Reward Claim handler
  const handleClaimDailyReward = (
    boostersEarned: Partial<BoostersState>,
    goldEarned: number
  ) => {
    setBoosters((prev) => ({
      undo: prev.undo + (boostersEarned.undo || 0),
      shuffle: prev.shuffle + (boostersEarned.shuffle || 0),
      extract: prev.extract + (boostersEarned.extract || 0),
    }));
    setGold((prev) => prev + goldEarned);

    const updatedDaily: DailyLoginState = {
      ...dailyLogin,
      hasClaimedToday: true,
      lastClaimDate: todayDateStr,
    };
    setDailyLogin(updatedDaily);
    try {
      localStorage.setItem('cosmic_daily_login', JSON.stringify(updatedDaily));
    } catch {}

    // Score Floater celebration
    const claimFloater: ScoreFloater = {
      id: `daily_${Date.now()}`,
      points: 1000,
      combo: 1,
      text: lang === 'ru' ? `+${goldEarned} ЗОЛОТА!` : `+${goldEarned} GOLD!`,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 - 80,
    };
    setFloaters((prev) => [...prev, claimFloater]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== claimFloater.id));
    }, 1500);

    setTimeout(() => {
      setShowDailyRewardModal(false);
    }, 1200);
  };

  const handleBuyBooster = (booster: BoosterPurchase) => {
    const price = SHOP_PRICES[booster];
    if (gold < price) return;
    setGold((prev) => prev - price);
    setBoosters((prev) => ({
      ...prev,
      [booster]: prev[booster] + (booster === 'undo' ? 2 : 1),
    }));
    puzzleSounds.playBooster();
  };

  const handleBuyMeow = (type: TileType) => {
    if (unlockedMeows.includes(type) || gold < MEOW_CARD_PRICE) return;
    setGold((prev) => prev - MEOW_CARD_PRICE);
    setUnlockedMeows((prev) => [...prev, type]);
    puzzleSounds.playBooster();
  };

  const handleClaimDailyChallenge = (id: DailyChallengeId, reward: number) => {
    const challenge = DAILY_CHALLENGES.find((item) => item.id === id);
    if (!challenge || challenge.reward !== reward || dailyChallenges.claimed.includes(id)) return;
    const currentProgress = id === 'matches'
      ? dailyChallenges.matches
      : id === 'clear'
        ? dailyChallenges.clears
        : dailyChallenges.paintHits;
    if (currentProgress < challenge.target) return;
    updateDailyChallenges((progress) => ({ ...progress, claimed: [...progress.claimed, id] }));
    setGold((prev) => prev + reward);
    puzzleSounds.playBooster();
  };

  const handleBuyExtraSlot = () => {
    if (maxSlots > 7 || gold < EXTRA_SLOT_PRICE) return;
    setGold((prev) => prev - EXTRA_SLOT_PRICE);
    setMaxSlots(8);
    try {
      localStorage.setItem('cosmic_extra_slot', '1');
    } catch {}
    puzzleSounds.playBooster();
  };

  // Browser Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      if (e.key === '1') {
        e.preventDefault();
        handleExtractBooster();
      } else if (e.key === '2') {
        e.preventDefault();
        handleUndoBooster();
      } else if (e.key === '3') {
        e.preventDefault();
        handleShuffleBooster();
      } else if (e.key === '4') {
        e.preventDefault();
        handleHintBooster();
      } else if (key === 'm') {
        e.preventDefault();
        handleToggleMute();
      } else if (key === 'b') {
        e.preventDefault();
        handleToggleBGM();
      } else if (key === 'f') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (key === 'r') {
        e.preventDefault();
        startCurrentGame();
      } else if (key === 'h' || key === '?') {
        e.preventDefault();
        setShowHelpModal((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowHelpModal(false);
        setShowLeaderboard(false);
        setShowDailyRewardModal(false);
        setShowShop(false);
        setShowChallenges(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [boosters, history, slot, tiles, bgmActive]);

  const remainingTilesCount = tiles.filter(
    (t) => !t.isEliminated && !t.inSlot && !t.inShelf
  ).length;

  const campaignDifficulty =
    level <= 100
      ? t.levelEasy
      : level <= 350
        ? t.levelNormal
        : level <= 700
          ? t.levelHard
          : t.levelMaster;

  if (challengeMode) {
    return (
      <ChallengeMode
        lang={lang}
        onToggleLang={handleToggleLang}
        onSelectMode={(selectedMode) => {
          setChallengeMode(false);
          setMode(selectedMode);
        }}
        onExit={() => setChallengeMode(false)}
        onOpenDailyReward={() => setShowDailyRewardModal(true)}
        onOpenDailyChallenges={() => setShowChallenges(true)}
        onOpenShop={() => setShowShop(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        gold={gold}
      />
    );
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-slate-100 flex flex-col justify-between items-center select-none font-sans">
      {/* 1. Animated Deep Space Canvas Background */}
      <CosmicBackground />

      {/* 2. Magic Canvas VFX Explosions */}
      <MagicVfxOverlay burst={magicBurst} />

      {/* 4. Cosmic Sci-Fi Top Header */}
      <header className="hidden">
        <div className="flex items-center justify-between w-full flex-wrap gap-2">
          {/* Game Brand & Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <button
                onClick={() => setMode('campaign')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  mode === 'campaign'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>{t.campaignMode}</span>
              </button>

              <button
                onClick={() => setMode('daily')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  mode === 'daily'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(250,204,21,0.6)]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{t.dailyMode}</span>
              </button>
            </div>

            {/* Language Switcher Badge (RU / EN) */}
            <button
              onClick={handleToggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-black active:scale-95 transition shadow-sm"
              title="Переключить язык / Switch Language"
            >
              <span>{lang === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowDailyRewardModal(true)}
              className="relative p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-yellow-400/50 text-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.3)] transition active:scale-95"
              title={t.dailyRewardBtn}
              aria-label={t.dailyRewardBtn}
            >
              <Gift className="w-4 h-4 text-yellow-400" />
              {!dailyLogin.hasClaimedToday && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white shadow-sm transition active:scale-95"
              title={isMuted ? t.soundOff : t.soundOn}
              aria-label={isMuted ? t.soundOff : t.soundOn}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <details className="relative">
              <summary
                className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-slate-200 shadow-sm transition hover:bg-slate-800 active:scale-95 [&::-webkit-details-marker]:hidden"
                aria-label={lang === 'ru' ? 'Дополнительные действия' : 'More actions'}
                title={lang === 'ru' ? 'Дополнительные действия' : 'More actions'}
              >
                <MoreHorizontal className="w-5 h-5" />
              </summary>
              <div className="absolute right-0 top-full z-50 mt-2 flex w-56 flex-col gap-1 rounded-2xl border border-cyan-500/30 bg-slate-950/95 p-2 text-sm text-white shadow-xl backdrop-blur-md">
                <button
                  onClick={(event) => {
                    closeMoreMenu(event);
                    handleToggleBGM();
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-800"
                >
                  <Music className={`h-4 w-4 ${bgmActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                  {bgmActive ? t.musicOff : t.musicOn}
                </button>
                <button
                  onClick={(event) => {
                    closeMoreMenu(event);
                    setShowHelpModal(true);
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-800"
                >
                  <HelpCircle className="h-4 w-4 text-sky-400" />
                  {t.rulesBtn}
                </button>
                <button
                  onClick={(event) => {
                    closeMoreMenu(event);
                    handleToggleFullscreen();
                  }}
                  className="hidden items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-800 sm:flex"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <Maximize2 className="h-4 w-4 text-cyan-400" />
                  )}
                  {isFullscreen ? t.exitFullscreen : t.fullscreen}
                </button>
                <button
                  onClick={(event) => {
                    closeMoreMenu(event);
                    setShowLeaderboard(true);
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-800"
                >
                  <Trophy className="h-4 w-4 text-amber-400" />
                  {t.speedrunLeaderboard}
                </button>
                <button
                  onClick={(event) => {
                    closeMoreMenu(event);
                    startCurrentGame();
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-800"
                >
                  <RotateCcw className="h-4 w-4 text-yellow-400" />
                  {lang === 'ru' ? 'Перезапустить уровень' : 'Restart level'}
                </button>
              </div>
            </details>
          </div>
        </div>

        {/* Status Sub-Header */}
        {mode === 'daily' ? (
          <div className="flex items-center justify-between w-full">
            <DailyTimer
              elapsedSeconds={timerSeconds}
              isRunning={timerRunning}
              dayLabel={dayLabel}
              bestTimeSeconds={userBestDailyTime}
            />
            <div className="px-3 py-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-white shadow-md text-xs font-bold font-mono">
              {t.remainingTiles}: <span className="text-cyan-300 font-black">{remainingTilesCount}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-white shadow-md">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                {t.level} {level} / {MAX_CAMPAIGN_LEVEL}
              </span>
              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-200">
                {campaignDifficulty}
              </span>
            </div>

            <div className="px-3 py-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-white shadow-md text-xs font-bold font-mono">
              {t.remainingTiles}: <span className="text-cyan-300 font-black">{remainingTilesCount}</span>
            </div>
          </div>
        )}
      </header>

      {/* 5. Center Main Playing Field (Stretches smoothly to fill the screen) */}
      <main className="relative z-10 flex min-h-0 flex-1 w-full max-w-4xl flex-col items-center justify-center px-2">
        {/* The Scalable Responsive Board Container */}
        <div className="relative h-[390px] w-[380px] sm:h-[410px] sm:w-[400px] md:h-[430px] md:w-[420px] flex items-center justify-center transition-all duration-300">
          <div
            className="relative h-[390px] w-[380px] origin-center transition-transform duration-300"
            style={{
              transform: `scale(${boardScale})`,
            }}
          >
            {mode === 'campaign' && level === COSMIC_MAP_LEVEL && (
              <>
                <CosmicMapArtwork />
                <div className="absolute top-2 left-1/2 z-10 -translate-x-1/2 rounded-full border border-cyan-300/50 bg-slate-950/85 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-200 shadow-lg">
                  {lang === 'ru' ? 'Новая карта: Космодром' : 'New map: Spaceport'}
                </div>
              </>
            )}
            {tiles.map((tile) => {
              if (tile.isEliminated || tile.inSlot || tile.inShelf) return null;

              const isHinted = hintedTileTypes.includes(tile.type) && !tile.isCovered;

              return (
                <TileItem
                  key={tile.id}
                  tile={tile}
                  onClick={handleTileClick}
                  isHinted={isHinted}
                  style={{
                    left: `calc(50% + ${tile.x}px - ${TILE_WIDTH / 2}px)`,
                    top: `calc(50% + ${tile.y}px - ${TILE_HEIGHT / 2}px)`,
                    zIndex: tile.layer + 1,
                  }}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* 6. Bottom Control Section: Shelf + Boosters + Stasis Pod Tray */}
      <footer ref={footerRef} className="relative z-20 w-full max-w-2xl shrink-0 px-3 pb-2 flex flex-col items-center">
        <div className="mb-1 flex w-full flex-wrap items-center justify-between gap-1 rounded-xl border border-cyan-500/25 bg-slate-950/85 px-2 py-1 text-[10px] font-black sm:text-xs">
          <span className="text-cyan-200">
            {mode === 'campaign'
              ? `${t.level} ${level}/${MAX_CAMPAIGN_LEVEL} · ${campaignDifficulty}`
              : t.dailyMode}
          </span>
          <span className="text-slate-300">{t.remainingTiles}: {remainingTilesCount}</span>
          <span className="text-yellow-300">🪙 {gold.toLocaleString()}</span>
        </div>
        <div className="mb-1 flex w-full items-center justify-center gap-1">
          <button
            onClick={() => setMode('campaign')}
            aria-label={t.campaignMode}
            title={t.campaignMode}
            className={`rounded-lg px-2 py-1 text-[10px] font-black ${mode === 'campaign' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300'}`}
          >
            {lang === 'ru' ? 'Кампания' : 'Campaign'}
          </button>
          <button
            onClick={() => setMode('daily')}
            aria-label={t.dailyMode}
            title={t.dailyMode}
            className={`rounded-lg px-2 py-1 text-[10px] font-black ${mode === 'daily' ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-300'}`}
          >
            {lang === 'ru' ? 'День' : 'Daily'}
          </button>
          <button
            onClick={() => setChallengeMode(true)}
            title={lang === 'ru' ? 'Крипто-испытание' : 'Crypto challenge'}
            className="rounded-lg border border-cyan-300/40 bg-gradient-to-r from-blue-950 to-emerald-950 px-2 py-1 text-[10px] font-black text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,.15)]"
          >
            {lang === 'ru' ? 'Испытание' : 'Challenge'}
          </button>
          <button onClick={handleToggleLang} title={lang === 'ru' ? 'English' : 'Русский'} className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-black text-slate-200">
            {lang === 'ru' ? 'RU' : 'EN'}
          </button>
          <button onClick={() => setShowShop(true)} title={lang === 'ru' ? 'Магазин золота' : 'Gold shop'} aria-label={lang === 'ru' ? 'Магазин золота' : 'Gold shop'} className="rounded-lg border border-emerald-400/40 bg-gradient-to-br from-blue-950 to-emerald-950 p-1.5 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,.12)]">
            <Store className="h-4 w-4" />
          </button>
          <button onClick={() => setShowDailyRewardModal(true)} title={t.dailyRewardBtn} aria-label={t.dailyRewardBtn} className="rounded-lg bg-slate-900 p-1.5 text-yellow-300">
            <Gift className="h-4 w-4" />
          </button>
          <button onClick={() => setShowChallenges(true)} title={lang === 'ru' ? 'Ежедневные задания' : 'Daily challenges'} aria-label={lang === 'ru' ? 'Ежедневные задания' : 'Daily challenges'} className="rounded-lg bg-slate-900 p-1.5 text-fuchsia-300">
            <Target className="h-4 w-4" />
          </button>
          <button onClick={handleToggleMute} title={isMuted ? t.soundOff : t.soundOn} aria-label={isMuted ? t.soundOff : t.soundOn} className="rounded-lg bg-slate-900 p-1.5 text-cyan-300">
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button onClick={handleToggleBGM} title={bgmActive ? t.musicOff : t.musicOn} aria-label={bgmActive ? t.musicOff : t.musicOn} className="rounded-lg bg-slate-900 p-1.5 text-cyan-300">
            <span className="text-[9px] font-black">♫</span>
          </button>
          <button onClick={() => setShowHelpModal(true)} title={t.rulesBtn} aria-label={t.rulesBtn} className="rounded-lg bg-slate-900 p-1.5 text-cyan-300">
            <CircleHelp className="h-4 w-4" />
          </button>
          <button onClick={startCurrentGame} title={lang === 'ru' ? 'Переиграть уровень' : 'Replay level'} aria-label={lang === 'ru' ? 'Переиграть уровень' : 'Replay level'} className="rounded-lg bg-slate-900 p-1.5 text-amber-300">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={handleToggleFullscreen} title={t.fullscreen} aria-label={t.fullscreen} className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-black text-slate-200">
            ⛶
          </button>
          <InstallAppButton lang={lang} />
        </div>

        {/* Extracted 3-Tile Reserve Shelf */}
        <ReserveShelf tiles={shelf} onTileClick={handleShelfTileClick} lang={lang} />

        {/* 4 Sci-Fi Boosters */}
        <BoosterBar
          boosters={boosters}
          onUndo={handleUndoBooster}
          onShuffle={handleShuffleBooster}
          onExtract={handleExtractBooster}
          onHint={handleHintBooster}
          canUndo={history.length > 0 && slot.length > 0}
          canExtract={slot.length > 0}
          lang={lang}
        />

        <SlotTray slots={slot} matchingIds={matchingIds} maxSlots={maxSlots} lang={lang} />
      </footer>

      {/* 🎁 Daily Login Reward Modal */}
      <DailyRewardModal
        isOpen={showDailyRewardModal}
        onClose={() => setShowDailyRewardModal(false)}
        dailyLogin={dailyLogin}
        lang={lang}
        onClaim={handleClaimDailyReward}
      />

      {/* Speedrun Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        dayLabel={dayLabel}
        userBestTime={userBestDailyTime}
        dailyEntries={dailyLeaderboard}
        lang={lang}
      />

      {/* 💔 Fail Modal (Warm personalized support for Mashka) */}
      <FailModal
        isOpen={isGameOver}
        level={level}
        remainingTiles={remainingTilesCount}
        onRevive={handleRevive}
        onRestart={startCurrentGame}
        hasRevive={hasRevive && slot.length > 0}
        lang={lang}
      />

      {/* 🏆 Level completion */}
      <WinModal
        isOpen={isVictory}
        level={level}
        mode={mode}
        completionTimeSeconds={dailyCompletionTime || timerSeconds}
        isNewBest={isNewBest}
        dailyRank={dailyRank}
        goldEarned={goldEarned}
        bossHits={bossHitsThisLevel}
        lang={lang}
        isCampaignComplete={mode === 'campaign' && level === MAX_CAMPAIGN_LEVEL}
        onNextLevel={() => setLevel((prev) => Math.min(MAX_CAMPAIGN_LEVEL, prev + 1))}
        onReplay={startCurrentGame}
        onViewLeaderboard={() => {
          setIsVictory(false);
          setShowLeaderboard(true);
        }}
      />

      <ShopModal
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        gold={gold}
        extraSlotOwned={maxSlots > 7}
        unlockedMeows={unlockedMeows}
        lang={lang}
        onBuyBooster={handleBuyBooster}
        onBuyExtraSlot={handleBuyExtraSlot}
        onBuyMeow={handleBuyMeow}
      />

      <DailyChallengesModal
        isOpen={showChallenges}
        onClose={() => setShowChallenges(false)}
        progress={dailyChallenges}
        lang={lang}
        onClaim={handleClaimDailyChallenge}
      />

      {isBossChallenge && (
        <CatBossChallenge
          lang={lang}
          level={level}
          onHit={() => updateDailyChallenges((progress) => ({ ...progress, paintHits: progress.paintHits + 1 }))}
          onComplete={finishLevel}
        />
      )}

      {/* Browser Controls & Rules Guide */}
      <BrowserHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        lang={lang}
      />
    </div>
  );
}
