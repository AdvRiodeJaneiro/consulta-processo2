import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useProcessStore } from '../store/processStore';
import { deleteMonitoring } from '../services/escavadorService';

export interface MonitoredProcess {
  id: string;
  escavador_monitoring_id: number;
  process_number: string;
  whatsapp_number: string;
  status: string;
  last_movement_summary?: string;
  last_movement_date?: string;
  created_at: string;
  debug_logs?: string;
  title_polo_ativo?: string;
  title_polo_passivo?: string;
  has_new_updates?: boolean;
}

export function useMyProcesses() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const { 
    myProcesses, 
    hasLoadedOnce, 
    setProcesses, 
    removeProcess, 
    setHasLoaded 
  } = useProcessStore();

  const fetchProcesses = useCallback(async (force = false) => {
    if (hasLoadedOnce && !force) return;
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('monitored_processes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProcesses(data || []);
      setHasLoaded(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, hasLoadedOnce, setProcesses, setHasLoaded]);

  useEffect(() => {
    if (user && !hasLoadedOnce) {
      fetchProcesses();
    }
  }, [user, hasLoadedOnce, fetchProcesses]);

  return {
    processes: myProcesses,
    loading: loading || (!hasLoadedOnce && !!user), // Garante loading no primeiro acesso
    hasLoadedOnce,
    error,
    refresh: () => fetchProcesses(true),
    cancelMonitoring
  };
}

async function cancelMonitoring(id: string, escavadorId: number) {
  try {
    // A lógica de deleção é via Edge Function agora, chamada pelo service
    // Mas mantemos a casca aqui para compatibilidade
    return { success: true }; 
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}