'use client';

import { useEffect, useState } from 'react';
import { differenceInSeconds } from 'date-fns';
import { Clock } from 'lucide-react';

interface Props {
  nextCigaretteTime: Date | null;
  canSmokeNow: boolean;
  isGoalReached: boolean;
}

export function TimerDisplay({ nextCigaretteTime, canSmokeNow, isGoalReached }: Props) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!nextCigaretteTime || canSmokeNow || isGoalReached) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const totalSeconds = differenceInSeconds(nextCigaretteTime, new Date());
      if (totalSeconds <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    };

    calculateTimeLeft(); // initial
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [nextCigaretteTime, canSmokeNow, isGoalReached]);

  if (isGoalReached) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-sky-50 dark:bg-sky-950/30 rounded-3xl border border-sky-100 dark:border-sky-900/50">
        <div className="bg-sky-100 dark:bg-sky-900/50 p-4 rounded-full mb-4">
          <span className="text-3xl">🏆</span>
        </div>
        <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-400 text-center">
          ¡Meta Alcanzada!
        </h2>
        <p className="text-sky-600/80 dark:text-sky-400/80 text-center mt-2 font-medium">
          Has cumplido con tu objetivo de hoy. Mañana será un nuevo reto.
        </p>
      </div>
    );
  }

  if (canSmokeNow || !nextCigaretteTime) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl border border-emerald-100 dark:border-emerald-900/50">
        <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-full mb-4">
          <Clock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 text-center">
          ¡Es tu momento!
        </h2>
        <p className="text-emerald-600/80 dark:text-emerald-400/80 text-center mt-2 font-medium">
          Puedes fumar ahora respetando tu meta.
        </p>
      </div>
    );
  }

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-6 uppercase tracking-wider text-sm">
        Próximo permitido en
      </h3>
      
      <div className="flex items-center gap-4 text-slate-800 dark:text-slate-100 font-mono tracking-tighter">
        {timeLeft?.hours ? (
          <>
            <div className="flex flex-col items-center">
              <span className="text-6xl font-bold">{pad(timeLeft.hours)}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-sans tracking-normal mt-1">HORAS</span>
            </div>
            <span className="text-4xl text-slate-300 dark:text-slate-700 -mt-6">:</span>
          </>
        ) : null}
        
        <div className="flex flex-col items-center">
          <span className="text-6xl font-bold">{pad(timeLeft?.minutes || 0)}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-sans tracking-normal mt-1">MINUTOS</span>
        </div>
        
        <span className="text-4xl text-slate-300 dark:text-slate-700 -mt-6">:</span>
        
        <div className="flex flex-col items-center">
          <span className="text-6xl font-bold text-sky-500 dark:text-sky-400">{pad(timeLeft?.seconds || 0)}</span>
          <span className="text-xs text-sky-400 dark:text-sky-500 font-sans tracking-normal mt-1">SEGUNDOS</span>
        </div>
      </div>
    </div>
  );
}
