import { useState, useCallback, useEffect } from 'react';
import { Message, EscavadorProcesso } from '../types';
import { legalDataService } from '../services/legalDataService';
import { generateLegalAnalysis } from '../services/aiService';
import { useSearchLimit } from './useSearchLimit';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export function useChat() {
  const [activeView, setActiveView] = useState('search-number');
  const [showWelcome, setShowWelcome] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeProcess, setActiveProcess] = useState<EscavadorProcesso | null>(null);
  const [debugInfo, setDebugInfo] = useState<{type: 'error' | 'info', content: string} | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  
  const { checkLimit, incrementUsage, loading: limitLoading } = useSearchLimit();
  const { refreshProfile, profileLoading } = useAuth();

  // Capturar parâmetros de URL para abrir o chat direto com a sugestão de IA
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlProcess = queryParams.get('processo');
    const urlAction = queryParams.get('action');

    // Se o perfil ainda estiver carregando, espera.
    if (profileLoading || limitLoading) {
      console.log("[useChat] Aguardando carregamento do perfil/limites para processar URL...");
      return;
    }

    if (urlProcess && urlAction === 'explain_ai') {
      console.log("[useChat] Parâmetros de URL detectados:", { urlProcess, urlAction });
      // 1. Pula a tela de boas-vindas
      setShowWelcome(false);
      
      // 2. Insere a mensagem personalizada do assistente no chat
      setMessages([
        {
          id: 'url-welcome-' + Date.now(),
          role: 'assistant',
          content: `Olá! Vi que você recebeu um e-mail sobre a atualização do seu processo nº **${urlProcess}**. Gostaria que nossa Inteligência Artificial explicasse detalhadamente o que essa atualização significa em linguagem simples?`,
          timestamp: new Date(),
          isUrlExplainSuggestion: true,
          processNumber: urlProcess
        }
      ]);
    }
  }, [profileLoading, limitLoading]);

  const resetSearch = useCallback(() => {
    setActiveProcess(null);
    setDebugInfo(null);
    setMessages([]);
    setShowWelcome(true);
  }, []);

  const handleExplainAi = useCallback(async (processToExplain?: EscavadorProcesso) => {
    const targetProcess = processToExplain || activeProcess;
    if (!targetProcess || isProcessing) return;
    setIsProcessing(true);

    const loadingId = 'loading-' + Date.now();
    
    // Remove o balão de sugestão de IA para não poluir o chat
    setMessages(prev => prev.filter(m => !m.isExplainAi));

    setMessages(prev => [
      ...prev,
      {
        id: 'divider-' + Date.now(),
        role: 'system',
        content: 'Explicação IA Jurídica',
        timestamp: new Date()
      },
      {
        id: loadingId,
        role: 'assistant',
        content: 'Traduzindo os termos jurídicos e analisando o processo com a nossa Inteligência Artificial... Isso pode levar alguns segundos.',
        timestamp: new Date(),
        isLoading: true
      }
    ]);

    try {
      const fullAnalysis = await generateLegalAnalysis("Analise este processo.", targetProcess, true);
      
      // Atualiza o perfil e os créditos imediatamente na interface do usuário
      refreshProfile().catch(err => console.error("Erro ao atualizar perfil:", err));

      const parts = fullAnalysis.split('<<<SPLIT>>>');
      const summaryPart = parts[0] || "Resumo indisponível.";
      const latestMovePart = parts[1] || "";
      const historyPart = parts[2] || "";

      setMessages(prev => prev.map(m => m.id === loadingId ? {
        ...m,
        isLoading: false,
        content: summaryPart.trim()
      } : m));

      let delay = 600;

      if (latestMovePart.trim().length > 5) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + '-latest',
            role: 'assistant',
            content: `### 🚨 Movimentação Mais Recente\n\n${latestMovePart.trim()}`,
            timestamp: new Date()
          }]);
        }, delay);
        delay += 800; 
      }

      if (historyPart.trim().length > 5 && !historyPart.includes("Sem mais movimentações")) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + '-history',
            role: 'assistant',
            content: `### 📜 Histórico Anterior\n\n${historyPart.trim()}`,
            timestamp: new Date()
          }]);
        }, delay);
        delay += 800;
      }

      // Sugestão de Monitoramento
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-monitor-suggest',
          role: 'assistant',
          content: "Deseja monitorar esse processo e receber os andamentos sobre ele direto no seu E-mail?",
          timestamp: new Date(),
          isMonitorSuggestion: true
        }]);
      }, delay);
      delay += 600;

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-contact',
          role: 'assistant',
          content: "Dúvidas, fale com um advogado de nossa equipe:",
          timestamp: new Date(),
          isContact: true
        }]);
      }, delay);

    } catch (error: any) {
      console.error(error);
      const isLimitError = error.message?.includes('Limit reached') || error.status === 403 || error.context?.status === 403;
      
      setMessages(prev => prev.map(m => m.id === loadingId ? {
        ...m,
        isLoading: false,
        content: isLimitError
          ? "⚠️ Você atingiu seu limite de créditos de IA para este processo. Faça um upgrade de plano no menu para continuar."
          : "⚠️ Não foi possível carregar a tradução com IA neste momento. Caso precise de esclarecimentos rápidos, fale com um de nossos advogados."
      } : m));

      if (isLimitError) {
        toast.error("Limite de créditos de IA atingido.");
      }
    } finally {
      setIsProcessing(false);
    }
  }, [activeProcess, isProcessing]);

  const processInput = useCallback(async (userText: string) => {
    if (!userText.trim() || isProcessing) return;
    
    // Aguarda o perfil carregar antes de processar limites
    if (profileLoading || limitLoading) {
       toast.error("Carregando sua conta...");
       return;
    }

    setIsProcessing(true);
    setDebugInfo(null);

    // Se não houver processo ativo, é uma nova busca (Consulta IA)
    if (!activeProcess) {
      const canConsult = await checkLimit('process');
      if (!canConsult) {
        toast.error("Você atingiu seu limite de consultas de IA.");
        setIsProcessing(false);
        return;
      }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      if (!activeProcess) {
        const loadingId = 'loading-' + Date.now();
        setMessages(prev => [...prev, {
          id: loadingId,
          role: 'assistant',
          content: 'Buscando informações do processo... Isso pode levar até 1 minuto.',
          timestamp: new Date(),
          isLoading: true
        }]);

        const result = await legalDataService.fetchAndNutritiveProcess(userText);

        if (!result) {
          const isInvalidCNJ = userText.length < 11;
          
          setMessages(prev => prev.map(m => m.id === loadingId ? {
            ...m,
            isLoading: false,
            content: isInvalidCNJ 
              ? "Por favor, informe um número de processo válido."
              : `🔍 Não encontrei o processo na base de dados.\n\nPossíveis motivos:\n- O processo corre em segredo de justiça.\n- O número digitado está incorreto.\n- O processo é muito recente e ainda não foi indexado.`
          } : m));
          setIsProcessing(false);
          return;
        }

        const { processData } = result;
        setActiveProcess(processData);
        
        await incrementUsage('process');

        const mainFonte = processData.fontes?.[0];
        const capa = mainFonte?.capa;
        const valorCausa = capa?.valor_causa?.valor_formatado || "Não informado";
        
        // Formata os envolvidos
        const envolvidosList = mainFonte?.envolvidos?.map(env => {
          const oabs = env.oabs?.map(o => `${o.uf}-${o.numero}`).join(', ') || '';
          return `- **${env.nome}** (${env.polo})${oabs ? ` - OAB: ${oabs}` : ''}`;
        }).join('\n') || '- Não informados';

        // Lista as últimas 5 movimentações brutas de forma clara
        const movesList = processData.movimentacoes?.slice(0, 5).map(m => {
          return `📅 **${m.data}** - *${m.tipo}*\n${m.conteudo}\n`;
        }).join('\n') || 'Nenhuma movimentação listada.';

        // Retorna os dados BRUTOS detalhados do processo na tela primeiro (Sem acionar IA)
        const rawMessageContent = `### 🔍 Processo Localizado!

**⚖️ Número CNJ:** ${processData.numero_cnj}
**📅 Início:** ${processData.data_inicio || "Não informado"}
** Última Movimentação:** ${processData.data_ultima_movimentacao || "Não informada"}

#### 🏬 Capa do Processo:
- **Assunto:** ${capa?.assunto || "Não informado"}
- **Classe:** ${capa?.classe || "Não informado"}
- **Área:** ${capa?.area || "Não informada"}
- **Órgão Julgador:** ${capa?.orgao_julgador || "Não informado"}
- **Valor da Causa:** ${valorCausa}

#### 👥 Partes do Processo:
${envolvidosList}

#### 📄 Últimas Movimentações no Tribunal (Bruto):
${movesList}
`;

        setMessages(prev => prev.map(m => m.id === loadingId ? {
          ...m,
          isLoading: false,
          content: rawMessageContent
        } : m));

        const isAutoExplain = sessionStorage.getItem('auto_explain') === 'true';
        if (isAutoExplain) {
          sessionStorage.removeItem('auto_explain');
          setTimeout(() => {
            handleExplainAi(processData);
          }, 1000);
        } else {
          // Adiciona a oferta para tradução com IA
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString() + '-explain-suggest',
              role: 'assistant',
              content: "Os dados técnicos acima podem parecer complexos. Gostaria de traduzir os termos técnicos do processo e as movimentações judiciais para uma linguagem simples e clara?",
              timestamp: new Date(),
              isExplainAi: true
            }]);
          }, 600);
        }

      } else {
        const loadingId = 'loading-' + Date.now();
        setMessages(prev => [...prev, {
          id: loadingId,
          role: 'assistant',
          content: 'Analisando...',
          timestamp: new Date(),
          isLoading: true
        }]);

        try {
          const answer = await generateLegalAnalysis(userText, activeProcess, false);
          
          // Atualiza o perfil e os créditos imediatamente na interface do usuário
          refreshProfile().catch(err => console.error("Erro ao atualizar perfil:", err));

          setMessages(prev => prev.map(m => m.id === loadingId ? {
            ...m,
            isLoading: false,
            content: answer
          } : m));
        } catch (error: any) {
          console.error(error);
          const isLimitError = error.message?.includes('Limit reached') || error.status === 403 || error.context?.status === 403;
          
          setMessages(prev => prev.map(m => m.id === loadingId ? {
            ...m,
            isLoading: false,
            content: isLimitError
              ? "⚠️ Limite de créditos de IA atingido. Faça um upgrade de plano para continuar perguntando à IA."
              : "⚠️ Não foi possível obter a resposta jurídica neste momento."
          } : m));

          if (isLimitError) {
            toast.error("Limite de créditos de IA atingido.");
          }
        }
      }

    } catch (error: any) {
      console.error(error);
      setDebugInfo({ 
        type: 'error', 
        content: `Erro: ${error.message}\n\n${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}` 
      });

      setMessages(prev => {
        const loadingMsg = prev.find(m => m.isLoading);
        if (loadingMsg) {
          return prev.map(m => m.isLoading ? {
            ...m,
            isLoading: false,
            content: "⚠️ Ocorreu um erro técnico. Verifique a área de informações acima."
          } : m);
        } else {
          return [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: "⚠️ Ocorreu um erro técnico. Verifique a área de informações acima.",
            timestamp: new Date()
          }];
        }
      });
    } finally {
      setIsProcessing(false);
    }
  }, [activeProcess, isProcessing, checkLimit, incrementUsage, profileLoading, limitLoading]);

  const handleWelcomeSubmit = useCallback((text: string) => {
    setShowWelcome(false);
    processInput(text);
  }, [processInput]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return;
    const text = input;
    setInput('');
    await processInput(text);
  }, [input, isProcessing, processInput]);

  return {
    activeView,
    setActiveView,
    showWelcome,
    setShowWelcome,
    input,
    setInput,
    messages,
    isProcessing,
    activeProcess,
    debugInfo,
    setDebugInfo,
    whatsappNumber,
    setWhatsappNumber,
    isWhatsappModalOpen,
    setIsWhatsappModalOpen,
    resetSearch,
    handleWelcomeSubmit,
    handleSend,
    handleExplainAi
  };
}