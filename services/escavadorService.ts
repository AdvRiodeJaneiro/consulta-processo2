import { supabase } from '../integrations/supabase/client';
import { EscavadorResponse, EscavadorInvolvedSearchResponse } from '../types';

/**
 * Escavador Service - Centralizado no Supabase Edge Functions (Blindagem de Chave)
 * Não há mais chaves de API ou URLs diretas aqui por segurança.
 */

const invokeSearch = async (type: 'process' | 'involved' | 'movements', params: any) => {
    const { data, error } = await supabase.functions.invoke('search-legal-data', {
        body: { type, ...params }
    });

    if (error) {
        console.error(`[Escavador Service Error] (${type}):`, error);
        
        // Se o erro for de limite, lançar erro amigável
        if (error.message?.includes('Limit reached') || (error as any).status === 403) {
            throw new Error("Você atingiu seu limite de buscas para este mês.");
        }

        throw new Error(error.message || "Erro ao consultar base jurídica.");
    }

    return data;
};

export const fetchProcessData = async (processNumber: string): Promise<EscavadorResponse | null> => {
    return invokeSearch('process', { processNumber });
};

export const fetchProcessMovements = async (processNumber: string): Promise<any> => {
    return invokeSearch('movements', { processNumber });
};

export const fetchProcessesByInvolved = async (query: string): Promise<EscavadorInvolvedSearchResponse | null> => {
    const data = await invokeSearch('involved', { query });
    return (data && data.items) ? data : { total_encontrados: 0, items: [] };
};

// --- MONITORAMENTO ---

export const createMonitoring = async (processNumber: string, whatsappNumber: string, title_polo_ativo?: string, title_polo_passivo?: string) => {
    const { data, error } = await supabase.functions.invoke('manage-monitoring', {
        body: {
            action: 'create',
            processNumber,
            whatsappNumber,
            title_polo_ativo,
            title_polo_passivo
        }
    });

    if (error) {
        if (error.message?.includes('Limit reached') || (error as any).status === 403) {
            throw new Error("Você atingiu seu limite de monitoramentos.");
        }
        throw new Error(error.message || "Falha ao criar monitoramento.");
    }

    return data;
};

export const deleteMonitoring = async (monitoringId: number) => {
    const { data, error } = await supabase.functions.invoke('manage-monitoring', {
        body: { action: 'delete', monitoringId }
    });

    if (error) throw new Error(error.message || "Falha ao deletar monitoramento.");
    return data;
};
