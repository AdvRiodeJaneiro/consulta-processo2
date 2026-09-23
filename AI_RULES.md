# Regras de Desenvolvimento e Stack Tecnológico

Este documento define o stack tecnológico da aplicação "Consulta Processo IA" e estabelece regras claras para o uso de bibliotecas e padrões de código.

## 1. Stack Tecnológico Principal

1.  **Linguagem:** TypeScript (TSX) para tipagem e segurança de código.
2.  **Framework:** React (versão 19) para a construção da interface do usuário.
3.  **Tooling:** Vite para desenvolvimento e build.
4.  **Estilização:** Tailwind CSS para todos os aspectos de design e responsividade.
5.  **Componentes UI:** Utilizamos o padrão Shadcn/ui para componentes reutilizáveis (localizados em `src/components/ui`).
6.  **Inteligência Artificial:** DeepSeek V4 API (via Edge Functions) para todas as interações com modelos de linguagem (LLM).
7.  **Gerenciamento de Classes:** `clsx` e `tailwind-merge` (expostos via `cn` utility) para manipulação de classes CSS.
8.  **Visualização 3D:** Three.js para efeitos visuais de fundo (ex: `DottedSurface`).
9.  **Ícones:** Lucide-react.
10. **Backend/Database:** Supabase (Auth, DB, Edge Functions).

## 2. Documentação Externa
- **API Escavador:** Consultar sempre o arquivo `docs/escavador-api.txt` para detalhes de endpoints, parâmetros de busca, monitoramento e callbacks.

## 3. Regras de Uso de Bibliotecas

| Biblioteca | Uso Mandatório | Regras Específicas |
| :--- | :--- | :--- |
| **Tailwind CSS** | Estilização | **Obrigatório** para todos os estilos. Priorizar classes utilitárias em vez de CSS customizado. |
| **Shadcn/ui** | Componentes UI | Use os componentes existentes em `src/components/ui`. Se precisar de um novo componente básico, crie-o seguindo o mesmo padrão. |
| **`cn` utility** | Classes CSS | Use `cn` (de `lib/utils.ts`) sempre que precisar combinar ou sobrescrever classes Tailwind. |
| **DeepSeek API** | LLM | Exclusivo para comunicação com o modelo DeepSeek V4 (serviços em `src/services/aiService.ts`). |
| **`three`** | Gráficos 3D | Uso restrito a efeitos visuais de fundo (como a superfície pontilhada). Não deve ser usado para elementos de UI padrão. |
| **`lucide-react`** | Ícones | Use esta biblioteca para todos os ícones da aplicação. |
| **React Router** | Navegação | Será o padrão para roteamento, caso necessário. |

## 4. Estrutura de Arquivos

-   **`src/pages/`**: Telas principais da aplicação.
-   **`src/components/`**: Componentes de aplicação específicos (ex: `ChatBubble`).
-   **`src/components/ui/`**: Componentes genéricos e reutilizáveis (padrão Shadcn/ui).
-   **`src/services/`**: Lógica de comunicação com APIs externas (Escavador, DeepSeek).
-   **`src/utils/`**: Funções utilitárias (ex: `cnjParser`).