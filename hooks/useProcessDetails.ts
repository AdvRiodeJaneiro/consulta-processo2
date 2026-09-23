import { useState, useEffect, useCallback } from 'react';
import { EscavadorProcesso, Message } from '../types';
import { fetchProcessData, fetchProcessMovements } from '../services/escavadorService';
import { generateLegalAnalysis } from '../services/aiService';
import { supabase } from '../integrations/supabase/client';
import { useProcessStore } from '../store/processStore';

export function useProcessDetails(cnj: string | undefined) {
  const [processData, setProcessData] = useState<EscavadorProcesso | null>(null);
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const updateProcessInStore = useProcessStore(state => state.updateProcess);
  const setAnalysisCache = useProcessStore(state => state.setAnalysisCache);

  const formatMessagesFromCache = useCallback((cache: any) => {
    const newMsgs: Message[] = [];
    if (cache.summary) {
      newMsgs.push({ id: 'summary', role: 'assistant', content: cache.summary, timestamp: new Date() });
    }
    if (cache.latest && cache.latest.length > 10) {
      newMsgs.push({ id: 'latest', role: 'assistant', content: `### 🚨 Movimentação Mais Recente\n\n${cache.latest}`, timestamp: new Date() });
    }
    if (cache.history && cache.history.length > 10) {
      newMsgs.push({ id: 'history', role: 'assistant', content: `### 📜 Histórico Anterior\n\n${cache.history}`, timestamp: new Date() });
    }
    setAiMessages(newMsgs);
  }, []);

  const loadData = useCallback(async () => {
    if (!cnj) return;

    // Acessa o cache atual SEM criar dependência no useCallback
    const currentCache = useProcessStore.getState().analysisCache[cnj];
    
    if (currentCache) {
      formatMessagesFromCache(currentCache);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      // 1. Busca dados da capa
      const liveData = await fetchProcessData(cnj);
      if (!liveData) {
        setError("Processo não encontrado na base de dados.");
        setIsLoading(false);
        return;
      }

      // 2. Busca movimentações e anexa ao liveData para a IA ler
      try {
        const movementsRes = await fetchProcessMovements(cnj);
        if (movementsRes && movementsRes.items) {
          liveData.movimentacoes = movementsRes.items;
        }
      } catch (movErr) {
        console.warn("Erro ao buscar movimentações:", movErr);
      }

      setProcessData(liveData);

      const { data: dbProc } = await supabase
        .from('monitored_processes')
        .select('id, ai_analysis_cache, last_known_movement_id')
        .eq('process_number', cnj)
        .maybeSingle();

      const latestMoveId = liveData.movimentacoes?.[0]?.data || liveData.data_ultima_movimentacao;
      const needsNewAnalysis = !dbProc?.ai_analysis_cache || dbProc?.last_known_movement_id !== latestMoveId;

      if (needsNewAnalysis) {
        const analysis = await generateLegalAnalysis("Analise este processo monitorado.", liveData, true);
        const parts = analysis.split('<<<SPLIT>>>');
        
        const cacheObj = {
          summary: parts[0] || "Resumo indisponível.",
          latest: parts[1] || "",
          history: parts[2] || ""
        };

        const summaryForList = parts[1]?.substring(0, 200) || parts[0]?.substring(0, 200);

        await supabase
          .from('monitored_processes')
          .update({
            ai_analysis_cache: cacheObj,
            last_known_movement_id: latestMoveId,
            last_movement_summary: summaryForList,
            last_movement_date: liveData.data_ultima_movimentacao || liveData.movimentacoes?.[0]?.data
          })
          .eq('process_number', cnj);

        setAnalysisCache(cnj, cacheObj);
        
        if (dbProc?.id) {
          updateProcessInStore(dbProc.id, {
            last_movement_summary: summaryForList,
            last_movement_date: liveData.data_ultima_movimentacao || liveData.movimentacoes?.[0]?.data,
            status: 'ATUALIZADO'
          });
        }

        formatMessagesFromCache(cacheObj);
      } else {
        setAnalysisCache(cnj, dbProc.ai_analysis_cache);
        formatMessagesFromCache(dbProc.ai_analysis_cache);
      }
    } catch (err: any) {
      console.error("Erro nos detalhes:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [cnj, formatMessagesFromCache, setAnalysisCache, updateProcessInStore]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { processData, aiMessages, isLoading, error };
}