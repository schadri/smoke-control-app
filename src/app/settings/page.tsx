'use client';

import { useAppStore } from '@/store/useStore';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { config, setConfig } = useAppStore();
  const router = useRouter();

  // Local state for the form, initialized from global state or defaults
  const [formData, setFormData] = useState({
    meta_diaria: config?.meta_diaria || 10,
    hora_inicio: config?.hora_inicio || '08:00',
    hora_fin: config?.hora_fin || '22:00',
    modo_reduccion_activa: config?.modo_reduccion_activa ?? true,
    precio_paquete: config?.precio_paquete || 5.00,
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // In actual implementation: update Supabase profile
    console.log('Guardando configuración...', formData);
    setConfig(formData);
    
    // Simulate network latency
    setTimeout(() => {
      setSaving(false);
      router.push('/');
    }, 800);
  };

  return (
    <main className="min-h-screen pb-24 max-w-lg mx-auto w-full relative bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center gap-4 p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Ajustes de Perfil
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Meta y Tiempos</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Meta Diaria (Cigarrillos)
            </label>
            <input 
              type="number" 
              min="1"
              required
              value={formData.meta_diaria}
              onChange={e => setFormData({...formData, meta_diaria: Number(e.target.value)})}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Hora Inicio
              </label>
              <input 
                type="time" 
                required
                value={formData.hora_inicio}
                onChange={e => setFormData({...formData, hora_inicio: e.target.value})}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Hora Fin
              </label>
              <input 
                type="time" 
                required
                value={formData.hora_fin}
                onChange={e => setFormData({...formData, hora_fin: e.target.value})}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Reducción Automática</h2>
          
          <label className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-500/50 transition-colors">
            <div className="flex-1">
              <p className="font-medium text-slate-800 dark:text-slate-200">Modo Reducción Activa</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                La app restará 1 cigarrillo a tu meta diaria automáticamente cada 7 días para ayudarte a dejarlo progresivamente.
              </p>
            </div>
            <div className="relative flex items-center pt-1">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.modo_reduccion_activa}
                onChange={e => setFormData({...formData, modo_reduccion_activa: e.target.checked})}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </div>
          </label>
        </section>

        <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Economía</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Precio promedio del paquete (USD/EUR)
            </label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              value={formData.precio_paquete}
              onChange={e => setFormData({...formData, precio_paquete: Number(e.target.value)})}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </section>

        <button 
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-4 rounded-xl font-semibold shadow-lg hover:bg-slate-800 dark:hover:bg-white active:scale-[0.98] transition-all disabled:opacity-50 mt-8"
        >
          {saving ? (
            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Cambios
            </>
          )}
        </button>
      </form>
    </main>
  );
}
