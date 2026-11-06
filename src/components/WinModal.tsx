import React, { useState } from 'react';
import { Trophy, Sparkles, ArrowRight, RotateCcw, Timer, Share2, Check } from 'lucide-react';
import { GameMode, Language } from '../types/game';
import { formatTimePrecise } from './DailyTimer';
import { TRANSLATIONS } from '../i18n/translations';

interface WinModalProps {
  isOpen: boolean;
  level: number;
  mode: GameMode;
  completionTimeSeconds?: number;
  isNewBest?: boolean;
  dailyRank?: number;
  goldEarned?: number;
  bossHits?: number;
  lang?: Language;
  isCampaignComplete?: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onViewLeaderboard: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  level,
  mode,
  completionTimeSeconds,
  isNewBest = false,
  dailyRank,
  goldEarned = 0,
  bossHits = 0,
  lang = 'ru',
  isCampaignComplete = false,
  onNextLevel,
  onReplay,
  onViewLeaderboard,
}) => {
  const [copied, setCopied] = useState(false);

  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  const isDaily = mode === 'daily';

  const handleShare = () => {
    const text = isDaily && completionTimeSeconds
      ? `🏆 Машка прошла Ежедневный Челлендж Try Party: COSMOS за ${formatTimePrecise(completionTimeSeconds)} (Место: #${dailyRank || 1})! Сможешь быстрее? 🌌⚡`
      : `🌟 Машка одержала победу в Try Party: COSMOS! 0.1% лучших игроков галактики!`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-yellow-500 shadow-[0_0_50px_rgba(250,204,21,0.5)] p-6 text-slate-900 text-center">
        {/* Trophy */}
        <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-yellow-400 border-2 border-yellow-600 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-bounce">
          🏆
        </div>

        <h3 className="text-2xl font-black text-amber-950 mb-1">
          {isDaily ? t.winDailyTitle : t.winTitle}
        </h3>

        {isCampaignComplete && (
          <div className="my-2.5 rounded-2xl border border-yellow-400 bg-amber-200/90 px-3 py-2 text-sm font-black text-amber-950 shadow-sm">
            {t.campaignComplete}
          </div>
        )}

        {/* Daily Time & Rank Badge */}
        {isDaily && completionTimeSeconds !== undefined && (
          <div className="p-3 rounded-2xl bg-slate-900 text-white border-2 border-yellow-400 mb-3 shadow-lg flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase mb-1">
              <Timer className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ru' ? 'ВРЕМЯ ПРОХОЖДЕНИЯ:' : 'COMPLETION TIME:'}</span>
            </div>
            <div className="font-mono text-2xl font-black text-yellow-300 tracking-wider">
              {formatTimePrecise(completionTimeSeconds)}
            </div>

            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 w-full justify-center">
              {isNewBest && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-sm">
                  ⭐ {lang === 'ru' ? 'НОВЫЙ РЕКОРД ДНЯ' : 'NEW DAILY RECORD'}
                </span>
              )}
              {dailyRank && (
                <span className="text-xs font-extrabold text-amber-300">
                  {lang === 'ru' ? `МЕСТО В ТОПЕ: #${dailyRank}` : `LEADERBOARD: #${dailyRank}`}
                </span>
              )}
            </div>
          </div>
        )}

        {goldEarned > 0 && (
          <div className="p-2.5 rounded-xl bg-amber-400/30 border border-yellow-500 mb-3 flex items-center justify-between px-3">
            <span className="text-xs font-black text-amber-900 uppercase">{lang === 'ru' ? 'Золото' : 'Gold'}:</span>
            <span className="font-mono text-lg font-black text-amber-950">+{goldEarned.toLocaleString()} 🪙</span>
          </div>
        )}
        {bossHits > 0 && (
          <div className="mb-3 text-xs font-bold text-fuchsia-800">
            {lang === 'ru'
              ? `🎨 Бонус за попадания по коту-боссу: ${bossHits}/3${bossHits === 3 ? ' · +1 бустер «Вынуть 3»' : ''}`
              : `🎨 Cat boss hits: ${bossHits}/3${bossHits === 3 ? ' · +1 Extract booster' : ''}`}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {isDaily && (
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? t.copied : t.shareRecord}</span>
            </button>
          )}

          {!isDaily && !isCampaignComplete ? (
            <button
              onClick={onNextLevel}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-black text-sm rounded-xl shadow-lg transition"
            >
              <span>{t.nextLevel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : isDaily ? (
            <button
              onClick={onViewLeaderboard}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-sm rounded-xl shadow-md transition active:scale-95"
            >
              <Trophy className="w-4 h-4 fill-current" />
              <span>{t.speedrunLeaderboard}</span>
            </button>
          ) : null}

          <button
            onClick={onReplay}
            className="w-full flex items-center justify-center gap-2 py-2 bg-amber-200 hover:bg-amber-300 active:scale-95 text-amber-950 font-bold text-xs rounded-xl border border-amber-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.playAgain}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
