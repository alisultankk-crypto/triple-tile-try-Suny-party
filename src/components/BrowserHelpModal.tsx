import React from 'react';
import { X, Keyboard, Sparkles, Coins, Trophy } from 'lucide-react';
import { CAMPAIGN_TILE_TYPES, CosmicCardImage, getCardMeta } from './CosmicCards';
import { Language } from '../types/game';
import { TRANSLATIONS } from '../i18n/translations';

interface BrowserHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const BrowserHelpModal: React.FC<BrowserHelpModalProps> = ({
  isOpen,
  onClose,
  lang = 'ru',
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.3)] p-5 md:p-6 text-slate-100 flex flex-col gap-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          title="Esc"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Sparkles className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
              {t.gameTitle}
            </h2>
            <p className="text-xs text-slate-400">{t.gameTagline}</p>
          </div>
        </div>

        {/* Rules summary */}
        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-cyan-500/20 flex gap-3 items-start">
            <div className="text-xl">🎯</div>
            <div>
              <span className="font-bold text-cyan-300">
                {lang === 'ru' ? 'Цель игры:' : 'Goal:'}
              </span>{' '}
              {lang === 'ru'
                ? 'Очистите всё поле, собирая тройки одинаковых артефактов!'
                : 'Clear the board by matching 3 identical magical artifacts!'}
            </div>
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-slate-950/60 p-3">
            <div className="mb-2 text-xs font-bold text-violet-300">
              {lang === 'ru' ? '42 магических артефакта с уникальными узорами' : '42 magical artifacts with unique designs'}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {CAMPAIGN_TILE_TYPES.map((type) => {
                const meta = getCardMeta(type);
                return (
                <div
                  key={type}
                  className="flex aspect-square items-center justify-center rounded-lg border border-slate-700"
                  style={{ backgroundColor: `color-mix(in srgb, ${meta.accentColor} 35%, #111827)` }}
                  title={meta.name}
                >
                  <CosmicCardImage type={type} />
                </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-rose-500/20 flex gap-3 items-start">
            <div className="text-xl">⚠️</div>
            <div>
              <span className="font-bold text-rose-300">
                {lang === 'ru' ? 'Слоты лотка:' : 'Tray slots:'}
              </span>{' '}
              {lang === 'ru'
                ? 'Если лоток заполнится картами без совпадений — наступает перегрузка. Дополнительный слот можно купить в магазине.'
                : 'If the tray fills with unmatched cards, stasis overload triggers. Buy an extra slot in the shop.'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-amber-500/20 flex gap-3 items-start">
            <Coins className="mt-1 h-5 w-5 shrink-0 text-yellow-300" />
            <div>
              <span className="font-bold text-yellow-300">
                {lang === 'ru' ? 'Золото и магазин:' : 'Gold & Shop:'}
              </span>{' '}
              {lang === 'ru'
                ? 'Оракул бесплатный и безлимитный. За золото можно открыть звуки артефактов, отмены и перемешивания.'
                : 'Oracle hints are free and unlimited. Spend gold to unlock artifact sounds, undos, and shuffles.'}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-fuchsia-500/20 flex gap-3 items-start">
            <div className="text-xl">🎯</div>
            <div>
              <span className="font-bold text-fuchsia-200">
                {lang === 'ru' ? 'Задания и босс:' : 'Challenges & boss:'}
              </span>{' '}
              {lang === 'ru'
                ? 'Выполняй ежедневные задания за золото. После прохождения уровня натяни рогатку и попади в кота-босса тремя шариками с краской: за точность будут дополнительные награды.'
                : 'Complete daily challenges for gold. After clearing a level, pull the slingshot and splat the boss with three paintballs for bonus rewards.'}
            </div>
          </div>
        </div>

        {/* Keyboard Hotkeys */}
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
          <div className="flex items-center gap-2 mb-3 text-cyan-300 font-bold text-xs uppercase tracking-wide">
            <Keyboard className="w-4 h-4" />
            <span>{lang === 'ru' ? 'Горячие клавиши (ПК / Браузер)' : 'Keyboard Shortcuts (PC / Browser)'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">{t.boosterExtract}</span>
              <kbd className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/40">1</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">{t.boosterUndo}</span>
              <kbd className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/40">2</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">{t.boosterShuffle}</span>
              <kbd className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/40">3</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">{lang === 'ru' ? 'Оракул' : 'Oracle'}</span>
              <kbd className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/40">4</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">8-bit BGM</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono font-bold border border-slate-700">B</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">{lang === 'ru' ? 'Звук' : 'Sound'}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono font-bold border border-slate-700">M</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">{lang === 'ru' ? 'Инвентарь' : 'Inventory'}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono font-bold border border-slate-700">I</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">{lang === 'ru' ? 'Экран' : 'Fullscreen'}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono font-bold border border-slate-700">F</kbd>
            </div>
          </div>
        </div>

        {/* Ready to play button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-95 transition"
        >
          {lang === 'ru' ? 'В БОЙ! ИГРАТЬ (ESC)' : 'LET’S PLAY! (ESC)'}
        </button>
      </div>
    </div>
  );
};
