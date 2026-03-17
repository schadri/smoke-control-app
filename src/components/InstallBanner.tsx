'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user already dismissed it in this session
    const wasDismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-8 left-4 right-4 max-w-sm mx-auto z-50 animate-slide-up">
      <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/5 p-6 flex items-center gap-5">
        {/* Floating Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-8 h-8 bg-black rounded-full border border-slate-800 flex items-center justify-center text-white hover:bg-slate-800 transition-all shadow-lg active:scale-90"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Container */}
        <div className="shrink-0 w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
          <Smartphone className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg leading-tight tracking-tight">
            Instalar GOS App
          </h3>
          <p className="text-sm text-slate-400 mt-1 leading-snug">
            Instala nuestra app para recibir...
          </p>
        </div>

        {/* Install Button */}
        <button
          onClick={handleInstall}
          className="shrink-0 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold px-5 py-3 rounded-full transition-all shadow-lg shadow-emerald-600/20 active:scale-95 whitespace-nowrap"
        >
          <Download className="w-5 h-5" />
          Instalar
        </button>
      </div>
    </div>
  );
}
