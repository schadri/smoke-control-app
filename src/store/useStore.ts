import { create } from 'zustand';
import { UserConfig, calcularIntervaloInicial, getOperationalWindow } from '@/lib/utils/time';
import { createClient } from '@/lib/supabase/client';
import { startOfDay, addMinutes } from 'date-fns';

interface User {
  id: string;
  email: string;
}

export interface LogEntry {
  id: string;
  created_at: string;
  es_emergencia: boolean;
  intervalo_recalculado: number;
}

interface AppState {
  user: User | null;
  config: UserConfig | null;
  logs: LogEntry[]; // Store all logs of the day
  isLoading: boolean;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  updateConfig: (newConfig: UserConfig) => Promise<void>;
  addLog: (esEmergencia: boolean, intervaloActual: number) => Promise<void>;
  resetTodayLogs: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  config: null,
  logs: [],
  isLoading: true,

  fetchInitialData: async () => {
    const supabase = createClient();
    set({ isLoading: true });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        set({ user: null, config: null, logs: [], isLoading: false });
        return;
      }

      set({ user: { id: session.user.id, email: session.user.email || '' } });

      // Fetch Profile (Config)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('config')
        .eq('id', session.user.id)
        .maybeSingle();
      
      const defaultConfig: UserConfig = {
        meta_diaria: 10,
        hora_inicio: '08:00',
        hora_fin: '22:00',
        modo_reduccion_activa: true,
        precio_paquete: 5.00,
        notificaciones_activas: false
      };

      let config = (profileData?.config as UserConfig | null) || defaultConfig;

      // If no profile row exists, create one so FK constraints on logs/push work
      if (!profileData) {
        await supabase
          .from('profiles')
          .upsert({ id: session.user.id, config: defaultConfig as any }, { onConflict: 'id' });
      }

      set({ config });

      // Fetch Logs for the last 48 hours to cover window crossings
      const fortyEightHoursAgo = addMinutes(new Date(), -48 * 60).toISOString();
      const { data: logsData } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', fortyEightHoursAgo)
        .order('created_at', { ascending: true });

      set({ logs: (logsData as LogEntry[]) || [] });
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateConfig: async (newConfig: UserConfig) => {
    const { user } = get();
    if (!user) return;
    const supabase = createClient();

    set({ config: newConfig }); // optimistic update
    await supabase
      .from('profiles')
      .update({ config: newConfig as any })
      .eq('id', user.id);
  },

  addLog: async (esEmergencia: boolean, intervaloActual: number) => {
    const { user, logs } = get();
    if (!user) return;
    const supabase = createClient();

    // Optimistic Update
    const newLogLocal: LogEntry = {
      id: 'optimistic-' + Date.now(),
      created_at: new Date().toISOString(),
      es_emergencia: esEmergencia,
      intervalo_recalculado: intervaloActual,
    };
    set({ logs: [...logs, newLogLocal] });

    const { data, error } = await supabase
      .from('logs')
      .insert({
        user_id: user.id,
        es_emergencia: esEmergencia,
        intervalo_recalculado: intervaloActual,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding log:', error);
      // Revert optimistic update using the latest state
      set({ logs: get().logs.filter(l => l.id !== newLogLocal.id) });
    } else {
      // Replace optimistic log with real DB log using the latest state
      set({ logs: get().logs.map(l => l.id === newLogLocal.id ? data : l) });
    }
  },

  resetTodayLogs: async () => {
    const { user, config } = get();
    if (!user || !config) return;
    const supabase = createClient();
    
    // Usar el inicio de la ventana operativa actual en vez de la medianoche calendario
    const { inicio } = getOperationalWindow(config);
    const windowStart = inicio.toISOString();

    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('logs')
        .delete()
        .eq('user_id', user.id)
        .gte('created_at', windowStart);
      
      if (error) throw error;
      
      set({ logs: [] });
    } catch (error) {
      console.error('Error resetting logs:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, config: null, logs: [], isLoading: false });
  }
}));
