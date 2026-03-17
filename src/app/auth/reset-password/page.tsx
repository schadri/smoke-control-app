'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Nueva Contraseña
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Ingresa tu nueva contraseña para recuperar el acceso.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          {success ? (
            <div className="text-center py-4 space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-in zoom-in duration-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">¡Listo!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tu contraseña ha sido actualizada. Serás redirigido al login...
                </p>
              </div>
              <button 
                onClick={() => router.push('/login')}
                className="text-sm text-emerald-600 font-medium hover:underline"
              >
                Ir al login ahora
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-rose-500 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl font-semibold shadow-md active:scale-[0.98] transition-all disabled:opacity-50 mt-6"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Actualizar Contraseña
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
