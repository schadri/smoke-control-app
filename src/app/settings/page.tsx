'use client';

import { useAppStore } from '@/store/useStore';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function SettingsPage() {
  const { config, updateConfig, user, resetTodayLogs } = useAppStore();
  const [showResetModal, setShowResetModal] = useState(false);
  const router = useRouter();

  // Redirect to login if unauthenticated
  if (!user && typeof window !== 'undefined') {
    router.push('/login');
  }

  // Local state for the form, initialized from global state or defaults
  const [formData, setFormData] = useState({
    meta_diaria: config?.meta_diaria || 10,
    hora_inicio: config?.hora_inicio || '08:00',
    hora_fin: config?.hora_fin || '22:00',
    modo_reduccion_activa: config?.modo_reduccion_activa ?? true,
    precio_paquete: config?.precio_paquete || 5.00,
    notificaciones_activas: config?.notificaciones_activas ?? false,
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateConfig(formData);
      router.push('/');
    } catch (error) {
      console.error('Error updating config', error);
      setSaving(false);
    }
  };

  const handleTestPush = async () => {
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Prueba de Humo 🚭',
          body: 'Si ves esto, las notificaciones push están funcionando perfectamente.'
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        alert('Se ha enviado la señal de notificación. Si no te llega en unos segundos, asegúrate de haber permitido las notificaciones en tu celular.');
      } else {
        const data = await res.json();
        alert('Error: ' + (data.error || 'No se pudo enviar la prueba'));
      }
    } catch (error) {
      console.error('Error enviando prueba push:', error);
      alert('Error al enviar la prueba. Verifica tu conexión.');
    }
  };

  const handleReset = async () => {
    setSaving(true);
    await resetTodayLogs();
    setShowResetModal(false);
    router.push('/');
  };

  return (
    <main className="min-h-screen pb-24 max-w-lg mx-auto w-full relative bg-slate-50 dark:bg-slate-950 px-4 md:px-0">
      <header className="flex items-center gap-4 p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 mx-[-1rem]">
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
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Notificaciones y Alertas</h2>
          
          <label className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-500/50 transition-colors">
            <div className="flex-1">
              <p className="font-medium text-slate-800 dark:text-slate-200">Avisar cuando pueda fumar</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Recibirás una notificación en tu dispositivo cuando el temporizador llegue a cero.
              </p>
            </div>
            <div className="relative flex items-center pt-1">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.notificaciones_activas}
                onChange={async (e) => {
                  const checked = e.target.checked;
                  
                  // Actualizar UI inmediatamente
                  setFormData({...formData, notificaciones_activas: checked});

                  if (checked) {
                    try {
                      // Detección de soporte
                      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                        alert('Tu navegador no soporta notificaciones Push nativas. Si usas iPhone, debes añadir esta app a tu pantalla de inicio primero.');
                        setFormData(prev => ({...prev, notificaciones_activas: false}));
                        return;
                      }

                      if (Notification.permission !== 'granted') {
                        const permission = await Notification.requestPermission();
                        if (permission !== 'granted') {
                          alert('Permiso de notificación denegado. Actívalo en la configuración de tu navegador.');
                          setFormData(prev => ({...prev, notificaciones_activas: false}));
                          return;
                        }
                      }

                      const registration = await navigator.serviceWorker.ready;
                      
                      if (!registration.pushManager) {
                        alert('Error: PushManager no disponible en este dispositivo.');
                        setFormData(prev => ({...prev, notificaciones_activas: false}));
                        return;
                      }

                      const applicationServerKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                      if (!applicationServerKey) {
                        throw new Error('Configuración de servidor incompleta (Missing VAPID Key)');
                      }

                      const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(applicationServerKey)
                      });

                      const res = await fetch('/api/push/subscribe', {
                        method: 'POST',
                        body: JSON.stringify(subscription),
                        headers: { 'Content-Type': 'application/json' }
                      });

                      if (!res.ok) throw new Error('No se pudo guardar la suscripción en el servidor');
                      
                      alert('¡Listo! Este celular ya está registrado para recibir avisos.');
                    } catch (error) {
                      console.error('Error al suscribir a push:', error);
                      alert('Fallo al activar: ' + (error instanceof Error ? error.message : 'Error desconocido'));
                      setFormData(prev => ({...prev, notificaciones_activas: false}));
                    }
                  }
                }}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[6px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </div>
          </label>

          <button 
            type="button"
            onClick={handleTestPush}
            className="w-full text-sm font-medium text-emerald-600 dark:text-emerald-400 py-2 hover:underline transition-all"
          >
            Enviar notificación de prueba
          </button>

          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 pt-4">Reducción Automática</h2>
          
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

        <button 
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-4 rounded-xl font-semibold shadow-lg hover:bg-slate-800 dark:hover:bg-white active:scale-[0.98] transition-all disabled:opacity-50 mt-8"
        >
          {saving && !showResetModal ? (
            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Cambios
            </>
          )}
        </button>
      </form>

      <div className="p-6 pt-0">
        <section className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-rose-600 dark:text-rose-400">Zona de Peligro</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Estas acciones son permanentes y no se pueden deshacer.
          </p>
          
          <button 
            type="button"
            onClick={() => setShowResetModal(true)}
            className="w-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl font-semibold border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-all active:scale-[0.98]"
          >
            Reiniciar Progreso del Día
          </button>
        </section>
      </div>

      {/* Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowResetModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 fade-in duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-3xl flex items-center justify-center mb-2">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                ¿Estás seguro?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Se borrarán todos los registros de consumo de hoy. Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-col w-full gap-3 pt-4">
                <button
                  onClick={handleReset}
                  className="w-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white p-4 rounded-2xl font-bold transition-all shadow-lg shadow-rose-500/20"
                >
                  Sí, Reiniciar Todo
                </button>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 p-4 rounded-2xl font-bold transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
