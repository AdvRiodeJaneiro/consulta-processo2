import { fetchProcessData, fetchProcessMovements } from './escavadorService';
import { formatCNJ, parseCNJ } from '../utils/cnjParser';
import { EscavadorProcesso } from '../types';

export const legalDataService = {
  /**
   * Busca um processo por número CNJ e o nutre com movimentações detalhadas
   */
  async fetchAndNutritiveProcess(userText: string): Promise<{ processData: EscavadorProcesso, formattedCNJ: string } | null> {
    const cnjParts = parseCNJ(userText);
    if (!cnjParts) return null;

    const formattedCNJ = formatCNJ(cnjParts);
    
    // 1. Busca Dados da Capa
    const processData = await fetchProcessData(formattedCNJ);
    if (!processData || !processData.numero_cnj) return null;

    // 2. Nutrição: Busca Movimentações Detalhadas
    try {
      const movementsRes = await fetchProcessMovements(formattedCNJ);
      if (movementsRes && movementsRes.items) {
        processData.movimentacoes = movementsRes.items;
      }
    } catch (movErr) {
      console.warn("Erro ao nutrir consulta simples:", movErr);
    }

    return { processData, formattedCNJ };
  }
};