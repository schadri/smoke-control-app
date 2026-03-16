'use client';

import { useAppStore } from '@/store/useStore';
import { AlertTriangle, PlusCircle } from 'lucide-react';
import { useCallback, useState } from 'react';

interface Props {
  canSmokeNow: boolean;
  onRecord: (esEmergencia: boolean) => Promise<void>;
}

export function ActionButtons({ canSmokeNow, onRecord }: Props) {
  const [loading, setLoading] = useState(false);

  const handleRecord = useCallback(async (isEmergencia: boolean) => {
    setLoading(true);
    await onRecord(isEmergencia);
    setLoading(false);
  }, [onRecord]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto p-4">
      {canSmokeNow ? (
        <button
          onClick={() => handleRecord(false)}
          disabled={loading}
          className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white p-4 rounded-2xl shadow-lg transition-all disabled:opacity-50"
        >
          <PlusCircle className="w-6 h-6" />
          <span className="font-semibold text-lg">Registrar Consumo Permitido</span>
        </button>
      ) : (
        <button
          onClick={() => handleRecord(true)}
          disabled={loading}
          className="group relative flex items-center justify-center gap-3 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white p-4 rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all overflow-hidden disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-in-out skew-x-12" />
          <AlertTriangle className="w-6 h-6 animate-pulse" />
          <span className="font-semibold text-lg">¡Emergencia! No aguanto</span>
        </button>
      )}
      
      {!canSmokeNow && (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Registrar una emergencia recalculará los tiempos restantes para ajustarse a tu meta.
        </p>
      )}
    </div>
  );
}
