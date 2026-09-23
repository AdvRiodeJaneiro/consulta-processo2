import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { EscavadorProcesso } from '../types';

export interface SearchEntry {
  id?: string;
  query: string;
  type: 'cnj' | 'involved';
  results_count: number;
  timestamp: number;
}

export function useSearchHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<SearchEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setHistory(data.map(item => ({
          id: item.id,
          query: item.query,
          type: item.search_type as any,
          results_count: item.results_count,
          timestamp: new Date(item.created_at).getTime()
        })));
      }
      setIsLoading(false);
    } else {
      const stored = localStorage.getItem('search_history_v2');
      if (stored) {
        try {
          setHistory(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const addToHistory = async (query: string, type: 'cnj' | 'involved', resultsCount: number) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    if (user) {
      // Usa UPSERT com a regra do banco: Se a query já existe para o usuário, atualiza o created_at
      const { error } = await supabase
        .from('search_history')
        .upsert(
          {
            user_id: user.id,
            query: cleanQuery,
            search_type: type,
            results_count: resultsCount,
            created_at: new Date().toISOString() // Força a atualização da data para subir no topo
          },
          { onConflict: 'user_id,query' }
        );
      
      if (!error) loadHistory();
    } else {
      // Lógica LocalStorage: Remove duplicata antiga e coloca a nova no topo
      const newEntry: SearchEntry = {
        query: cleanQuery,
        type,
        results_count: resultsCount,
        timestamp: Date.now()
      };
      
      const filteredHistory = history.filter(h => h.query.toLowerCase() !== cleanQuery.toLowerCase());
      const newHistory = [newEntry, ...filteredHistory].slice(0, 10);
      
      setHistory(newHistory);
      localStorage.setItem('search_history_v2', JSON.stringify(newHistory));
    }
  };

  const deleteEntry = async (id?: string, queryStr?: string) => {
    if (user && id) {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', id);
      if (!error) loadHistory();
    } else if (queryStr) {
      const newHistory = history.filter(h => h.query !== queryStr);
      setHistory(newHistory);
      localStorage.setItem('search_history_v2', JSON.stringify(newHistory));
    }
  };

  const clearHistory = async () => {
    if (user) {
      await supabase.from('search_history').delete().eq('user_id', user.id);
      setHistory([]);
    } else {
      setHistory([]);
      localStorage.removeItem('search_history_v2');
    }
  };

  return {
    history,
    isLoading,
    addToHistory,
    deleteEntry,
    clearHistory,
    refreshHistory: loadHistory
  };
}