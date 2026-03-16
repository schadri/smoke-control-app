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

// Mock data to simulate an active session for the build/preview
// In the integration phase, this will be fetched from Supabase
const dummyConfig = {
  meta_diaria: 10,
  hora_inicio: '08:00',
  hora_fin: '22:00',
  modo_reduccion_activa: true,
  precio_paquete: 5.00
};

export default function Dashboard() {
  const { config, logsToday, lastLogAt, setConfig, addLog, hydrateSession } = useAppStore();
  const [nextCigaretteTime, setNextCigaretteTime] = useState<Date | null>(null);

  useEffect(() => {
    // Simulate auth hydration 
    if (!config) {
      hydrateSession(
        { id: '1', email: 'user@example.com' },
        dummyConfig,
        2, // Simulate 2 cigarettes smoked today
        new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      );
    }
  }, [config, hydrateSession]);

  useEffect(() => {
    if (!config) return;

    // Calculate next allowed time based on last log + current dynamic interval
    let interval = calcularIntervaloInicial(config);
    let referenceTime = new Date();

    if (lastLogAt) {
      interval = calcularIntervaloRestante(lastLogAt, logsToday, config);
      referenceTime = lastLogAt;
    } else {
      // If no logs today, the next is at start time
      const startTime = timeStringToDate(config.hora_inicio);
      setNextCigaretteTime(startTime);
      return;
    }

    const nextTime = addMinutes(referenceTime, interval);
    setNextCigaretteTime(nextTime);
  }, [config, logsToday, lastLogAt]);

  const canSmokeNow = nextCigaretteTime ? isBefore(nextCigaretteTime, new Date()) : false;

  const handleRecord = async (esEmergencia: boolean) => {
    // In actual implementation: await supabase.from('logs').insert(...)
    console.log('Registrando consumo...', { esEmergencia });
    addLog(esEmergencia);
  };

  // Mock logs for the chart
  const mockLogs = [
    { id: '1', created_at: new Date(new Date().setHours(10)).toISOString(), es_emergencia: true },
    { id: '2', created_at: new Date(new Date().setHours(14)).toISOString(), es_emergencia: true },
    { id: '3', created_at: new Date(new Date().setHours(14)).toISOString(), es_emergencia: true },
    { id: '4', created_at: new Date(new Date().setHours(19)).toISOString(), es_emergencia: true },
  ];

  return (
    <main className="min-h-screen pb-24 max-w-lg mx-auto w-full relative">
      <header className="flex justify-between items-center p-6 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
            Control C.
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Progreso Diario: {logsToday}/{config?.meta_diaria || 10}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/settings" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
            <Settings className="w-5 h-5" />
          </Link>
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-8 mt-4">
        {/* Timer Hero Section */}
        <section>
          <TimerDisplay 
            nextCigaretteTime={nextCigaretteTime} 
            canSmokeNow={canSmokeNow} 
          />
        </section>

        {/* Action Buttons */}
        <section>
          <ActionButtons 
            canSmokeNow={canSmokeNow} 
            onRecord={handleRecord} 
          />
        </section>

        {/* Analytics Section */}
        <section className="pt-4">
          <AnalyticsChart logs={mockLogs} />
        </section>
      </div>

      {/* Bottom Padding for mobile navigation feels if needed later */}
    </main>
  );
}
