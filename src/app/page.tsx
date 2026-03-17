'use client';

import { useEffect, useState } from 'react';
import { TimerDisplay } from '@/components/TimerDisplay';
import { ActionButtons } from '@/components/ActionButtons';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { useAppStore } from '@/store/useStore';
import { addMinutes, isBefore, isAfter } from 'date-fns';
import { calcularIntervaloRestante, calcularIntervaloInicial, timeStringToDate, getOperationalWindow } from '@/lib/utils/time';
import { Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InstallBanner } from '@/components/InstallBanner';

export default function Dashboard() {
  const { user, config, logs, isLoading, fetchInitialData, addLog, signOut, resetTodayLogs } = useAppStore();
  const [nextCigaretteTime, setNextCigaretteTime] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
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

  const { inicio, fin } = config ? getOperationalWindow(config) : { inicio: new Date(), fin: new Date() };

  // Filtrar logs que pertenecen a la jornada operativa actual
  const logsInWindow = logs.filter(log => {
    const logDate = new Date(log.created_at);
    return isAfter(logDate, inicio) && isBefore(logDate, fin);
  });

  const logsToday = logsInWindow.length;
  const lastLogTimestamp = logsInWindow.length > 0 ? logsInWindow[logsInWindow.length - 1].created_at : null;
  const isGoalReached = config ? logsToday >= config.meta_diaria : false;

  useEffect(() => {
    if (!config) return;

    const { inicio, fin } = getOperationalWindow(config);
    const now = new Date();

    // PRIORIDAD: Si estamos fuera del rango permitido (el hueco entre fin e inicio)
    // Siempre bloqueamos hasta el próximo inicio, sin importar los logs.
    if (isAfter(now, fin)) {
      setNextCigaretteTime(addMinutes(inicio, 24 * 60));
      return;
    }
    
    if (isBefore(now, inicio)) {
      setNextCigaretteTime(inicio);
      return;
    }

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
      // No hay logs y estamos dentro del rango (por el check de arriba)
      setNextCigaretteTime(inicio);
      return;
    }

    const nextTime = addMinutes(referenceTime, interval);
    setNextCigaretteTime(nextTime);
  }, [config, logsToday, lastLogTimestamp, isGoalReached, refreshTrigger]);

  // Force re-render when timer hits zero
  // Force re-render when timer hits zero
  useEffect(() => {
    if (!nextCigaretteTime || isGoalReached) return;

    const msUntilNext = nextCigaretteTime.getTime() - Date.now();
    if (msUntilNext > 0) {
      const timeout = setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
        
        // Trigger notification if enabled
        if (config?.notificaciones_activas) {
          if ('serviceWorker' in navigator && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification('¡Es tu momento!', {
                body: 'Ya puedes fumar respetando tu meta diaria. 🚭',
                icon: '/logo.svg',
                badge: '/logo.svg',
                data: '/',
              });
            });
          } else if (Notification.permission === 'granted') {
            // Fallback for environments where SW might not be ready/supported but notifications are
            new Notification('¡Es tu momento!', {
              body: 'Ya puedes fumar respetando tu meta diaria. 🚭',
              icon: '/logo.svg',
              badge: '/logo.svg',
            });
          }
        }
      }, msUntilNext + 500);
      return () => clearTimeout(timeout);
    }
  }, [nextCigaretteTime, isGoalReached, config]);

  const canSmokeNow = !isGoalReached && (!nextCigaretteTime || isBefore(nextCigaretteTime, new Date()));

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
          <button onClick={() => setShowSignOutModal(true)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
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

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="bg-rose-100 dark:bg-rose-950/50 p-4 rounded-full">
                <LogOut className="w-7 h-7 text-rose-500 dark:text-rose-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">¿Cerrar sesión?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tu progreso del día está guardado en la nube y podrás retomarlo cuando vuelvas a entrar.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-all shadow-lg shadow-rose-500/20"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      <InstallBanner />
    </main>
  );
}
