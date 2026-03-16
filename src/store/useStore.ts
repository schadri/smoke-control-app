import { create } from 'zustand';
import { UserConfig } from '@/lib/utils/time';

interface User {
  id: string;
  email: string;
}

interface AppState {
  user: User | null;
  config: UserConfig | null;
  logsToday: number;
  lastLogAt: Date | null;
  setUser: (user: User | null) => void;
  setConfig: (config: UserConfig | null) => void;
  addLog: (esEmergencia: boolean) => void;
  hydrateSession: (user: User, config: UserConfig, logsToday: number, lastLogAt: Date | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  config: null,
  logsToday: 0,
  lastLogAt: null,
  setUser: (user) => set({ user }),
  setConfig: (config) => set({ config }),
  addLog: (esEmergencia) => set((state) => ({ 
    logsToday: state.logsToday + 1,
    lastLogAt: new Date(),
  })),
  hydrateSession: (user, config, logsToday, lastLogAt) => set({ user, config, logsToday, lastLogAt }),
}));
