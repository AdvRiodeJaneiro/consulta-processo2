import { create } from 'zustand';
import { EscavadorProcesso } from '../types';

interface SearchState {
  query: string;
  results: EscavadorProcesso[];
  totalCount: number;
  lastSearchType: 'cnj' | 'involved' | null;
  resultsCache: Record<string, EscavadorProcesso[]>; // Cache para o botão 'Todos'
  setSearchData: (query: string, results: EscavadorProcesso[], type: 'cnj' | 'involved', total?: number) => void;
  setResults: (results: EscavadorProcesso[]) => void;
  clearSearch: () => void;
  addToCache: (query: string, results: EscavadorProcesso[]) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  totalCount: 0,
  lastSearchType: null,
  resultsCache: {},
  setSearchData: (query, results, type, total) => set((state) => ({ 
    query, 
    results, 
    lastSearchType: type,
    totalCount: total ?? results.length,
    resultsCache: { ...state.resultsCache, [query]: results }
  })),
  setResults: (results) => set({ results }),
  addToCache: (query, results) => set((state) => ({
    resultsCache: { ...state.resultsCache, [query]: results }
  })),
  clearSearch: () => set({ query: '', results: [], lastSearchType: null, totalCount: 0 }),
}));