import { supabase } from '../integrations/supabase/client';
import { EscavadorProcesso } from '../types';

/**
 * AI Service - Centralizado no Supabase Edge Functions
 * Gerencia a comunicação com o DeepSeek V4 através de nossa camada de backend segura.
 */

export const generateLegalAnalysis = async (
  userMessage: string,
  processData: EscavadorProcesso,
  isFirstInteraction: boolean
): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('process-analysis', {
    body: { userMessage, processData, isFirstInteraction }
  });

  if (error) {
    console.error("[AI Analysis Error]:", error);
    throw error;
  }

  return data?.text || "Não consegui gerar uma resposta.";
};