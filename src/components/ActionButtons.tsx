'use client';

import { useAppStore } from '@/store/useStore';
import { AlertTriangle, PlusCircle } from 'lucide-react';
import { useCallback, useState } from 'react';

interface Props {
  canSmokeNow: boolean;
  onRecord: (esEmergencia: boolean) => Promise<void>;
  isGoalReached: boolean;
}

export function ActionButtons({ canSmokeNow, onRecord, isGoalReached }: Props) {
  const [loading, setLoading] = useState(false);

  const handleRecord = useCallback(async (isEmergencia: boolean) => {
    if (isGoalReached && !isEmergencia) return; // Prevent normal records if goal reached
    setLoading(true);
    await onRecord(isEmergencia);
    setLoading(false);
  }, [onRecord, isGoalReached]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto p-4">
      {canSmokeNow && !isGoalReached ? (
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
          className={`group relative flex items-center justify-center gap-3 ${isGoalReached ? 'bg-slate-800 hover:bg-slate-900 shadow-xl' : 'bg-rose-500 hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.3)]'} text-white p-4 rounded-2xl transition-all overflow-hidden disabled:opacity-50`}
        >
          <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-in-out skew-x-12" />
          <AlertTriangle className={`w-6 h-6 ${isGoalReached ? '' : 'animate-pulse'}`} />
          <span className="font-semibold text-lg">
            {isGoalReached ? 'Registrar Consumo Extra' : '¡Emergencia! No aguanto'}
          </span>
        </button>
      )}
      
      {!canSmokeNow && (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 italic">
          {isGoalReached 
            ? "Has alcanzado tu meta diaria. Cualquier registro adicional contará como exceso."
            : "Registrar una emergencia recalculará los tiempos restantes para ajustarse a tu meta."}
        </p>
      )}
    </div>
  );
}
