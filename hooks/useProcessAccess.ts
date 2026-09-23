import { useAuth } from '../contexts/AuthContext';

export function useProcessAccess() {
  const { user, profile } = useAuth();

  // Regra: Apenas usuários Logados com Assinatura ATIVA ou Administradores podem ver o número completo.
  const canSeeFullDetails = user && (profile?.subscription_status === 'active' || profile?.is_admin === true);

  /**
   * Mascara o número CNJ preservando apenas os 4 últimos dígitos (Origem)
   * Formato: 0000000-00.0000.0.00.0000 -> *******-**.****.*.**.0000
   */
  const maskCNJ = (cnj: string) => {
    if (!cnj) return "";
    const parts = cnj.split('.');
    if (parts.length < 5) return cnj.replace(/\d/g, '*'); // Fallback caso não seja CNJ padrão

    // Mantém apenas a última parte (Origem - 4 dígitos)
    const lastPart = parts[parts.length - 1];
    
    return `*******-**.****.*.**. ${lastPart}`;
  };

  return {
    canSeeFullDetails,
    maskCNJ
  };
}