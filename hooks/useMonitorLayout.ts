import { useState, useRef, useCallback, useEffect } from 'react';

export function useMonitorLayout() {
  const [showSteps, setShowSteps] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Função para esconder o passo a passo
  const hideSteps = useCallback(() => {
    setShowSteps(false);
  }, []);

  // Função para rolar a tela até a barra de pesquisa bater no topo
  const scrollToSearch = useCallback(() => {
    if (searchBarRef.current) {
      searchBarRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, []);

  // Resetar quando o componente for montado (ao trocar de menu e voltar)
  useEffect(() => {
    setShowSteps(true);
  }, []);

  return {
    showSteps,
    hideSteps,
    scrollToSearch,
    scrollContainerRef,
    searchBarRef
  };
}