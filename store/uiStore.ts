import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  searchCount: number;
  isLimitReached: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setSearchCount: (count: number) => void;
  setIsLimitReached: (reached: boolean) => void;
  incrementSearchCount: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false, // Inicia fechado para não atrapalhar no mobile
  theme: 'light',
  searchCount: 0,
  isLimitReached: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setTheme: (theme) => set({ theme }),
  setSearchCount: (count) => set({ searchCount: count }),
  setIsLimitReached: (reached) => set({ isLimitReached: reached }),
  incrementSearchCount: () => set((state) => {
    const newCount = state.searchCount + 1;
    return { searchCount: newCount };
  }),
}));