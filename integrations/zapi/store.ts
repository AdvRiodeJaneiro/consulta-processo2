import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ZApiCredentials {
  instanceId: string;
  token: string;
  clientToken: string;
}

interface ZApiLog {
  timestamp: string;
  method: string;
  endpoint: string;
  requestBody?: any;
  responseBody?: any;
  status: 'success' | 'error';
}

interface ZApiState {
  credentials: ZApiCredentials;
  logs: ZApiLog[];
  setCredentials: (creds: Partial<ZApiCredentials>) => void;
  addLog: (log: Omit<ZApiLog, 'timestamp'>) => void;
  clearLogs: () => void;
}

export const useZApiStore = create<ZApiState>()(
  persist(
    (set) => ({
      credentials: {
        instanceId: '',
        token: '',
        clientToken: ''
      },
      logs: [],
      setCredentials: (creds) => set((state) => ({
        credentials: { ...state.credentials, ...creds }
      })),
      addLog: (log) => set((state) => ({
        logs: [{ ...log, timestamp: new Date().toLocaleTimeString() }, ...state.logs].slice(0, 20)
      })),
      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: 'z-api-storage',
    }
  )
);