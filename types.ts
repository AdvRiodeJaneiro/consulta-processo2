export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
  isContact?: boolean;
  isMonitorSuggestion?: boolean;
  isExplainAi?: boolean;
}

export interface CNJParts {
  number: string; 
  digit: string; 
  year: string; 
  justice: string; 
  tribunal: string; 
  origin: string; 
}

// Escavador Types

export interface EscavadorMovimentacao {
  data: string;
  tipo: string;
  conteudo: string;
  fonte?: {
    sigla: string;
  };
}

export interface EscavadorEnvolvido {
  nome: string;
  tipo_pessoa: string;
  quantidade_processos: number;
  polo: 'ATIVO' | 'PASSIVO' | 'ADVOGADO' | 'TERCEIRO';
  oabs?: Array<{uf: string, numero: number, tipo: string}>;
}

export interface EscavadorFonte {
  id: number;
  sigla: string; // e.g. TRT-1
  grau: number;
  grau_formatado: string;
  capa: {
    classe: string;
    assunto: string;
    area: string; // e.g. Trabalhista
    data_distribuicao: string;
    valor_causa?: {
      valor: string;
      moeda: string;
      valor_formatado: string;
    };
    orgao_julgador: string;
  };
  movimentacoes?: EscavadorMovimentacao[];
  envolvidos: EscavadorEnvolvido[];
}

export interface EscavadorProcesso {
  numero_cnj: string;
  titulo_polo_ativo?: string;
  titulo_polo_passivo?: string;
  ano_inicio: number;
  data_inicio: string;
  data_ultima_movimentacao: string;
  quantidade_movimentacoes: number;
  fontes: EscavadorFonte[];
  // Merged field from /movimentacoes endpoint
  movimentacoes?: EscavadorMovimentacao[];
}

// The API returns the process object directly
export type EscavadorResponse = EscavadorProcesso;

export interface EscavadorInvolvedSearchResponse {
  total_encontrados: number;
  items: EscavadorProcesso[];
}

export interface Profile {
  id: string;
  first_name: string;
  last_name?: string;
  whatsapp?: string;
  email?: string;
  avatar_url?: string;
  is_admin: boolean;
  subscription_status: 'active' | 'inactive';
  current_plan_id?: string;
  subscription_expires_at?: string;
  updated_at: string;
  search_credits?: number;
  process_credits?: number;
  monitoring_credits?: number;
}

export interface AdminSettings {
  guest_search_limit?: number;
  guest_process_limit?: number;
  guest_monitoring_limit?: number;
  free_search_limit?: number;
  free_process_limit?: number;
  free_monitoring_limit?: number;
  admin_search_limit?: number;
  admin_process_limit?: number;
  admin_monitoring_limit?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}
