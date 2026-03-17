'use client';

import { useEffect, useState } from 'react';
import { TimerDisplay } from '@/components/TimerDisplay';
import { ActionButtons } from '@/components/ActionButtons';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { useAppStore } from '@/store/useStore';
import { addMinutes, isBefore } from 'date-fns';
import { calcularIntervaloRestante, calcularIntervaloInicial, timeStringToDate } from '@/lib/utils/time';
import { Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, config, logs, isLoading, fetchInitialData, addLog, signOut, resetTodayLogs } = useAppStore();
  const [nextCigaretteTime, setNextCigaretteTime] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  // On mount, fetch data.
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Handle protected route redirect
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const logsToday = logs.length;
  const lastLogTimestamp = logs.length > 0 ? logs[logs.length - 1].created_at : null;
  const isGoalReached = config ? logsToday >= config.meta_diaria : false;

  useEffect(() => {
    if (!config) return;

    if (isGoalReached) {
      setNextCigaretteTime(null);
      return;
    }

    const lastLogAt = lastLogTimestamp ? new Date(lastLogTimestamp) : null;
    let interval = calcularIntervaloInicial(config);
    let referenceTime = new Date();

    if (lastLogAt) {
      interval = calcularIntervaloRestante(lastLogAt, logsToday, config);
      referenceTime = lastLogAt;
    } else {
      const startTime = timeStringToDate(config.hora_inicio);
      setNextCigaretteTime(startTime);
      return;
    }

    const nextTime = addMinutes(referenceTime, interval);
    setNextCigaretteTime(nextTime);
  }, [config, logsToday, lastLogTimestamp, isGoalReached]);

  // Force re-render when timer hits zero
  useEffect(() => {
    if (!nextCigaretteTime || isGoalReached) return;

    const msUntilNext = nextCigaretteTime.getTime() - Date.now();
    if (msUntilNext > 0) {
      const timeout = setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, msUntilNext + 500);
      return () => clearTimeout(timeout);
    }
  }, [nextCigaretteTime, isGoalReached]);

  const canSmokeNow = !isGoalReached && nextCigaretteTime ? isBefore(nextCigaretteTime, new Date()) : false;

  const handleRecord = async (esEmergencia: boolean) => {
    if (!config) return;
    const lastLogAt = lastLogTimestamp ? new Date(lastLogTimestamp) : null;
    const intervalToSave = lastLogAt ? calcularIntervaloRestante(lastLogAt, logsToday, config) : calcularIntervaloInicial(config);
    await addLog(esEmergencia, intervalToSave);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (isLoading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <span className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 max-w-lg mx-auto w-full relative">
      <header className="flex justify-between items-center p-6 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full p-1 shadow-sm border border-slate-100 dark:border-slate-800">
            <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
              Controla los Puchos.
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Progreso Diario: {logsToday}/{config?.meta_diaria || 10}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/settings" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
            <Settings className="w-5 h-5" />
          </Link>
          <button onClick={handleSignOut} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-8 mt-4">
        <section>
          <TimerDisplay 
            nextCigaretteTime={nextCigaretteTime} 
            canSmokeNow={canSmokeNow} 
            isGoalReached={isGoalReached}
          />
        </section>

        <section>
          <ActionButtons 
            canSmokeNow={canSmokeNow} 
            onRecord={handleRecord} 
            isGoalReached={isGoalReached}
          />
        </section>

        <section className="pt-4">
          <AnalyticsChart logs={logs} />
        </section>
      </div>

      {/* Bottom Padding for mobile navigation feels if needed later */}
    </main>
  );
}
