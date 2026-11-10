import React, { useEffect, useState } from 'react';
import { Download, Share } from 'lucide-react';
import type { Language } from '../types/game';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallAppButton({ lang }: { lang: Language }) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;

    setInstalled(standalone);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  const title = lang === 'ru' ? 'Установить на телефон' : 'Install on phone';

  return (
    <>
      <button
        onClick={() => void handleClick()}
        title={installed ? (lang === 'ru' ? 'Приложение установлено' : 'App installed') : title}
        aria-label={installed ? (lang === 'ru' ? 'Приложение установлено' : 'App installed') : title}
        className="rounded-lg bg-slate-900 p-1.5 text-emerald-300"
      >
        <Download className="h-4 w-4" />
      </button>
      {showInstructions && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setShowInstructions(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-app-title"
            className="w-full max-w-sm rounded-2xl border border-emerald-300/40 bg-[#0b0d0d] p-5 text-slate-100 shadow-[0_0_30px_rgba(145,189,87,.16)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-emerald-200">
              <Download className="h-5 w-5" />
              <h2 id="install-app-title" className="font-black">{title}</h2>
            </div>
            <p className="mt-3 text-sm text-slate-200">
              {lang === 'ru'
                ? 'Добавьте игру на главный экран — она откроется как приложение и сохранит прогресс на этом устройстве.'
                : 'Add the game to your home screen to open it like an app and keep progress on this device.'}
            </p>
            <div className="mt-4 space-y-3 rounded-xl bg-white/[.05] p-3 text-sm">
              <p><b className="text-emerald-200">Android:</b> {lang === 'ru' ? 'меню браузера ⋮ → «Установить приложение» или «Добавить на главный экран».' : 'browser menu ⋮ → “Install app” or “Add to Home screen”.'}</p>
              <p className="flex items-start gap-1"><Share className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /><span><b className="text-emerald-200">iPhone:</b> {lang === 'ru' ? 'в Safari нажмите «Поделиться» → «На экран Домой».' : 'in Safari, tap Share → “Add to Home Screen”.'}</span></p>
            </div>
            <button onClick={() => setShowInstructions(false)} className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-2 font-bold text-white hover:bg-emerald-600">
              {lang === 'ru' ? 'Понятно' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
