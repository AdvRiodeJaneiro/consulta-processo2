import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

export type LimitType = 'search' | 'process' | 'monitoring';

/**
 * useSearchLimit - Blindagem de créditos/limites.
 * O frontend agora consulta diretamente o saldo de créditos (search_credits, process_credits, monitoring_credits) no perfil do usuário.
 * O decremento do saldo acontece via banco de dados (Edge Functions).
 */
export function useSearchLimit() {
  const { user, profile, refreshProfile } = useAuth();
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updateCounter, setUpdateCounter] = useState(0);

  // Carregar configurações globais apenas para fallbacks e visitantes
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data: gData } = await supabase
          .from('system_settings')
          .select('*')
          .eq('id', 'global_limits')
          .maybeSingle();
        
        if (gData) setGlobalSettings(gData);
      } catch (err) {
        console.error("Error fetching global settings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  /**
   * Retorna o saldo de créditos disponíveis (ou limite, no caso de visitantes)
   */
  const getLimitForType = useCallback((type: LimitType): number => {
    // 1. Visitante
    if (!user) {
      if (!globalSettings) return 0;
      if (type === 'search') return globalSettings.guest_search_limit ?? 2;
      if (type === 'process') return globalSettings.guest_process_limit ?? 0;
      if (type === 'monitoring') return globalSettings.guest_monitoring_limit ?? 0;
      return 0;
    }

    // 2. Administrador (Acesso ilimitado)
    if (profile?.is_admin) {
      return 9999;
    }

    // 3. Usuário Logado (Lógica de Carteira/Saldo)
    if (type === 'search') return profile?.search_credits ?? 0;
    if (type === 'process') return profile?.process_credits ?? 0;
    if (type === 'monitoring') return profile?.monitoring_credits ?? 0;

    return 0;
  }, [globalSettings, user, profile]);

  /**
   * Retorna o consumo do usuário
   * No modelo de carteira, buscas e consultas consomem saldo, então o "uso" para a checagem é 0 (pois o saldo já é o valor líquido restante).
   * Para monitoramento, conta os processos atualmente monitorados na tabela.
   */
  const getCurrentUsage = useCallback(async (type: LimitType): Promise<number> => {
    // 1. Visitante (LocalStorage)
    if (!user) {
      const storageKeys: Record<LimitType, string> = {
        search: 'guest_search_count',
        process: 'guest_process_count',
        monitoring: 'guest_monitoring_count'
      };
      
      const stored = localStorage.getItem(storageKeys[type]);
      return stored ? parseInt(stored, 10) : 0;
    }

    // 2. Administrador
    if (profile?.is_admin) return 0;

    // 3. Usuário Logado
    if (type === 'monitoring') {
      const { count, error } = await supabase
        .from('monitored_processes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error counting monitored processes:", error);
        return 0;
      }
      return count || 0;
    }

    // Para consumos do tipo saldo, retornamos 0, pois a validação de limite 'current < limit'
    // se torna '0 < saldo_disponivel', que funciona perfeitamente.
    return 0;
  }, [user, profile, updateCounter]);

  /**
   * Verifica se o usuário tem créditos ou limite para realizar a ação
   */
  const checkLimit = useCallback(async (type: LimitType): Promise<boolean> => {
    const limit = getLimitForType(type);
    const current = await getCurrentUsage(type);
    return current < limit;
  }, [getLimitForType, getCurrentUsage]);

  /**
   * Solicita atualização de UI chamando o refresh do perfil
   */
  const incrementUsage = useCallback(async (type: LimitType) => {
    // 1. Visitante (LocalStorage)
    if (!user) {
      const storageKeys: Record<LimitType, string> = {
        search: 'guest_search_count',
        process: 'guest_process_count',
        monitoring: 'guest_monitoring_count'
      };
      
      const stored = localStorage.getItem(storageKeys[type]);
      const current = stored ? parseInt(stored, 10) : 0;
      
      localStorage.setItem(storageKeys[type], (current + 1).toString());
      setUpdateCounter(prev => prev + 1);
      return;
    }

    // 2. Usuário Logado: Recarrega dados do perfil
    await refreshProfile();
    setUpdateCounter(prev => prev + 1);
  }, [user, refreshProfile]);

  return {
    loading,
    checkLimit,
    incrementUsage,
    getLimitForType,
    getCurrentUsage
  };
}