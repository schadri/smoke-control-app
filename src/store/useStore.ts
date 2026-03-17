import { create } from 'zustand';
import { UserConfig, calcularIntervaloInicial } from '@/lib/utils/time';
import { createClient } from '@/lib/supabase/client';
import { startOfDay } from 'date-fns';

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
        .single();
      
      const config = profileData?.config as UserConfig | null;
      if (config) {
        set({ config });
      }

      // Fetch Logs for today
      const todayStart = startOfDay(new Date()).toISOString();
      const { data: logsData } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', todayStart)
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
      // Revert optimistic update
      set({ logs: logs.filter(l => l.id !== newLogLocal.id) });
    } else {
      // Replace optimistic log with real DB log
      set({ logs: logs.map(l => l.id === newLogLocal.id ? data : l) });
    }
  },

  resetTodayLogs: async () => {
    const { user } = get();
    if (!user) return;
    const supabase = createClient();
    const todayStart = startOfDay(new Date()).toISOString();

    set({ isLoading: true });
    try {
      await supabase
        .from('logs')
        .delete()
        .eq('user_id', user.id)
        .gte('created_at', todayStart);
      
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
