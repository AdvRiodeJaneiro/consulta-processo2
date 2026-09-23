/**
 * LÓGICA DE NAVEGAÇÃO PÓS-AUTENTICAÇÃO
 * Este arquivo gerencia para onde o usuário deve ser enviado após Login/Cadastro.
 * NÃO ALTERAR sem validar os impactos nos fluxos de conversão.
 */

import { NavigateFunction } from 'react-router-dom';

interface RedirectState {
  from?: string;
  [key: string]: any;
}

export const handleAuthSuccess = (
  navigate: NavigateFunction, 
  state: RedirectState | null, 
  onSuccessCallback?: () => void
) => {
  // 1. Se houver um callback (ex: fechar um modal), executa
  if (onSuccessCallback) {
    onSuccessCallback();
  }

  // 2. Verifica se existe uma rota de origem salva no estado da navegação
  const redirectTo = state?.from || '/';

  // 3. Navega para a origem mantendo qualquer estado adicional
  navigate(redirectTo, { 
    replace: true, 
    state: { ...state, from: undefined } 
  });
};