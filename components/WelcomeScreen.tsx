import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { parseCNJ } from "../utils/cnjParser";
import { DottedSurface } from "./ui/dotted-surface";
import { WhatsappButtons } from "./WhatsappButtons";

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`; // reset first
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

interface WelcomeScreenProps {
  onSubmit: (text: string) => void;
}

export default function WelcomeScreen({ onSubmit }: WelcomeScreenProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const urlProcess = queryParams.get('processo');
  const urlAction = queryParams.get('action');

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showUrlBox, setShowUrlBox] = useState(!!urlProcess);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  const handleSubmit = () => {
    if (!message.trim()) return;

    // Validation logic: Must contain a valid CNJ
    const cnj = parseCNJ(message);
    if (!cnj) {
      setError("Por favor, informe um número de processo válido (Ex: 0000000-00.0000.0.00.0000) para começar.");
      return;
    }

    setError("");
    onSubmit(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center bg-slate-950 overflow-hidden">
      {/* Dynamic Background */}
      <DottedSurface className="fixed inset-0 z-0 pointer-events-none" />

      {/* Centered Title */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 z-10">
        <div className="text-center backdrop-blur-sm bg-black/20 p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center">
          <img 
            src="https://advogadoriodejaneiro.com/wp-content/uploads/2024/07/WhatsApp-Image-2022-09-24-at-14.28.30-removebg-preview-300x170.png" 
            alt="Magalhães e Gomes Advogados" 
            className="h-16 mb-4 object-contain"
          />
          <h1 className="text-4xl md:text-5xl font-semibold text-white drop-shadow-sm tracking-tight">
            Consulta Processo IA
          </h1>
          <p className="mt-2 text-neutral-200 text-lg">
            Simplificando a explicação do seu processo
          </p>
        </div>
      </div>

      {/* Input Box Section */}
      <div className="w-full max-w-3xl mb-12 px-4 pb-8 z-10 flex flex-col gap-8">
        {showUrlBox && urlProcess && (
          <div className="w-full p-6 rounded-2xl bg-gradient-to-r from-indigo-950 to-slate-900 border border-primary/30 shadow-2xl shadow-primary/10 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                ✨ Atualização de Processo Detectada
              </h3>
              <p className="text-slate-300 text-sm mt-1">
                Olá! Vimos que você recebeu um e-mail sobre a atualização do seu processo nº <strong className="text-primary">{urlProcess}</strong>. Quer que nossa Inteligência Artificial explique o que mudou em linguagem simples?
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                onClick={() => {
                  if (urlAction === 'explain_ai') {
                    sessionStorage.setItem('auto_explain', 'true');
                  }
                  onSubmit(urlProcess);
                  navigate('/', { replace: true });
                }}
                className="bg-primary text-secondary hover:bg-primary/90 font-bold"
              >
                Sim, eu quero!
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowUrlBox(false)}
                className="text-slate-400 hover:text-white"
              >
                Ignorar
              </Button>
            </div>
          </div>
        )}

        <div>
            <div className={cn(
                "relative bg-black/60 backdrop-blur-md rounded-xl border transition-colors shadow-xl",
                error ? "border-red-500/50" : "border-neutral-700"
            )}>
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError(""); // Clear error on type
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Digite o número do processo aqui..."
                className={cn(
                  "w-full px-4 py-3 resize-none border-none",
                  "bg-transparent text-white text-sm md:text-base",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "placeholder:text-neutral-400 min-h-[48px]"
                )}
                style={{ overflow: "hidden" }}
              />

              {/* Footer Buttons */}
              <div className="flex items-center justify-between p-3">
                {/* Empty div to keep layout if we add left buttons later, or for spacing */}
                <div className="text-red-400 text-xs font-medium ml-2">
                    {error}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!message.trim()}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                      message.trim() 
                        ? "bg-primary text-secondary hover:bg-primary/90" 
                        : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                    )}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="m5 12 7-7 7 7"/>
                      <path d="M12 19V5"/>
                    </svg>
                    <span className="sr-only">Enviar</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <p className="text-center text-neutral-400 text-xs mt-4">
               Apenas cole o número do processo (ex: 0000000-98.2023.5.01.0056) e nós explicaremos o restante.
            </p>
        </div>

        {/* New Contact Section */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
             <p className="text-slate-300 text-sm mb-3 font-medium">Não sabe o número do seu processo? Fale com nossa equipe:</p>
             <WhatsappButtons variant="outline" />
        </div>

      </div>
    </div>
  );
}