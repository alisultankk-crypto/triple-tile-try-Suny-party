import React from 'react';
import { Check, Target, X } from 'lucide-react';
import { Language } from '../types/game';

export type DailyChallengeId = 'matches' | 'clear' | 'paint';

export interface DailyChallengeProgress {
  date: string;
  matches: number;
  clears: number;
  paintHits: number;
  claimed: DailyChallengeId[];
}

interface ChallengeDefinition {
  id: DailyChallengeId;
  titleRu: string;
  titleEn: string;
  target: number;
  reward: number;
  icon: string;
}

export const DAILY_CHALLENGES: ChallengeDefinition[] = [
  { id: 'matches', titleRu: 'Собери 6 троек карт', titleEn: 'Make 6 card matches', target: 6, reward: 120, icon: '🐾' },
  { id: 'clear', titleRu: 'Пройди уровень', titleEn: 'Clear a level', target: 1, reward: 220, icon: '🚀' },
  { id: 'paint', titleRu: 'Попади в кота-босса 2 раза', titleEn: 'Hit the cat boss twice', target: 2, reward: 160, icon: '🎨' },
];

export function emptyDailyChallengeProgress(date: string): DailyChallengeProgress {
  return { date, matches: 0, clears: 0, paintHits: 0, claimed: [] };
}

export function loadDailyChallengeProgress(date: string): DailyChallengeProgress {
  try {
    const saved = localStorage.getItem('cosmic_daily_challenges');
    if (!saved) return emptyDailyChallengeProgress(date);
    const parsed = JSON.parse(saved) as Partial<DailyChallengeProgress>;
    if (parsed.date !== date) return emptyDailyChallengeProgress(date);
    return {
      date,
      matches: Number.isFinite(parsed.matches) ? Math.max(0, Number(parsed.matches)) : 0,
      clears: Number.isFinite(parsed.clears) ? Math.max(0, Number(parsed.clears)) : 0,
      paintHits: Number.isFinite(parsed.paintHits) ? Math.max(0, Number(parsed.paintHits)) : 0,
      claimed: Array.isArray(parsed.claimed)
        ? parsed.claimed.filter((id): id is DailyChallengeId => DAILY_CHALLENGES.some((challenge) => challenge.id === id))
        : [],
    };
  } catch {
    return emptyDailyChallengeProgress(date);
  }
}

function getProgress(challenge: ChallengeDefinition, progress: DailyChallengeProgress) {
  if (challenge.id === 'matches') return progress.matches;
  if (challenge.id === 'clear') return progress.clears;
  return progress.paintHits;
}

interface DailyChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: DailyChallengeProgress;
  lang: Language;
  onClaim: (challenge: DailyChallengeId, reward: number) => void;
}

export const DailyChallengesModal: React.FC<DailyChallengesModalProps> = ({
  isOpen,
  onClose,
  progress,
  lang,
  onClaim,
}) => {
  if (!isOpen) return null;
  const isRu = lang === 'ru';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-md">
      <section className="w-full max-w-md border-2 border-cyan-400/50 bg-black p-5 text-white shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-cyan-300" />
            <div>
              <h2 className="font-black text-cyan-100">{isRu ? 'Космические задания' : 'Daily challenges'}</h2>
              <p className="text-xs text-slate-400">{isRu ? 'Новые задания каждый день' : 'New tasks every day'}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label={isRu ? 'Закрыть' : 'Close'} className="p-2 text-slate-300 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-2">
          {DAILY_CHALLENGES.map((challenge) => {
            const value = Math.min(challenge.target, getProgress(challenge, progress));
            const claimed = progress.claimed.includes(challenge.id);
            const complete = value >= challenge.target;
            return (
              <article key={challenge.id} className="border border-cyan-500/25 bg-slate-950 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{challenge.icon}</span>
                    <span className="text-sm font-bold">{isRu ? challenge.titleRu : challenge.titleEn}</span>
                  </div>
                  <span className="whitespace-nowrap text-xs font-black text-yellow-300">🪙 {challenge.reward}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-slate-800">
                    <div className="h-full bg-cyan-400 transition-all" style={{ width: `${(value / challenge.target) * 100}%` }} />
                  </div>
                  <span className="min-w-10 text-right font-mono text-xs text-slate-300">{value}/{challenge.target}</span>
                  {claimed ? (
                    <Check className="h-5 w-5 text-emerald-300" />
                  ) : (
                    <button
                      onClick={() => onClaim(challenge.id, challenge.reward)}
                      disabled={!complete}
                      className="border border-yellow-400/50 px-2 py-1 text-[10px] font-black text-yellow-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isRu ? 'ЗАБРАТЬ' : 'CLAIM'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
