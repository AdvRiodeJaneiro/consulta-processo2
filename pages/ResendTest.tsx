"use client";

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Info,
  ShieldCheck,
  Code
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ResendTest() {
  const { profile } = useAuth();
  const [fromEmail, setFromEmail] = useState("consultaprocesso@advogadoriodejaneiro.com");
  const [toEmail, setToEmail] = useState("advriodejaneiro@saltonaweb.sh27.com.br");
  const [subject, setSubject] = useState("Hello World");
  const [htmlContent, setHtmlContent] = useState("<p>Congrats on sending your <strong>first email</strong>!</p>");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onSendTestEmail = async () => {
    if (!toEmail.trim()) {
      toast.error("Por favor, preencha o destinatário.");
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          from: fromEmail,
          to: toEmail,
          subject: subject,
          html: htmlContent
        }
      });

      if (error) {
        throw error;
      }

      setResult({ success: true, data });
      toast.success("E-mail disparado com sucesso!");
    } catch (err: any) {
      console.error("[ResendTest] Erro ao enviar:", err);
      setResult({ success: false, error: err.message || err });
      toast.error("Erro ao realizar disparo de teste.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <div>
          <h2 className="text-3xl font-black text-deep-indigo dark:text-white tracking-tight">Integração E-mail (Resend)</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Painel de Onboarding e testes técnicos da API de disparos de e-mail.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna 1: Informações de Status & Dicas */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-deep-indigo dark:text-white">Conexão API</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs space-y-1">
                  <p className="font-bold">✓ Credencial Ativada</p>
                  <p className="opacity-80">A variável de ambiente <code className="bg-emerald-100 dark:bg-emerald-900 px-1 rounded">RESEND_API_KEY</code> foi configurada nas Secrets do Supabase.</p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-800 dark:text-indigo-400 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info size={14} />
                    <span>Dica de Onboarding</span>
                  </div>
                  <p className="opacity-80 leading-relaxed">
                    O Resend exige um primeiro disparo para a conta de testes para liberar o seu painel de controle. Use as configurações pré-carregadas ao lado para validar instantaneamente o passo de Onboarding deles.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Code size={20} />
                </div>
                <h3 className="text-lg font-bold text-deep-indigo dark:text-white">Próximo Passo</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Após concluir a validação do primeiro e-mail no painel do Resend, configure um domínio próprio em <strong>Domains</strong> no painel do Resend. Isso permitirá enviar e-mails de qualquer remetente personalizado (ex: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-primary">notificacoes@seudominio.com.br</code>) para qualquer cliente de forma irrestrita.
              </p>
            </div>
          </div>

          {/* Coluna 2: Formulário de Teste */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-deep-indigo dark:text-white">Dados do Disparo de Teste</h3>
                  <p className="text-xs text-slate-500">Insira as informações do e-mail de teste para validação.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remetente (De)</label>
                    <input
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      placeholder="consultaprocesso@advogadoriodejaneiro.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                    />
                    <span className="text-[10px] text-slate-400 ml-1">Usar o e-mail oficial do domínio verificado no Resend.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destinatário (Para)</label>
                    <input 
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      placeholder="advriodejaneiro@saltonaweb.sh27.com.br"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                    />
                    <span className="text-[10px] text-slate-400 ml-1">E-mail de onboarding do cliente.</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assunto</label>
                  <input 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Hello World"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conteúdo (HTML)</label>
                  <textarea 
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="HTML do e-mail..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground font-mono"
                  />
                </div>

                <button 
                  onClick={onSendTestEmail}
                  disabled={isLoading}
                  className="w-full bg-primary text-deep-indigo hover:opacity-90 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  <Send size={16} />
                  {isLoading ? "Enviando e-mail de teste..." : "Enviar E-mail de Teste"}
                </button>
              </div>

              {result && (
                <div className={`mt-6 p-4 rounded-2xl border flex items-start gap-3 ${
                  result.success ? "bg-green-50 border-green-100 text-green-800 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400" : "bg-red-50 border-red-100 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
                }`}>
                  {result.success ? <CheckCircle2 size={20} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />}
                  <div className="text-xs space-y-1">
                    <p className="font-bold">{result.success ? "Disparo efetuado com sucesso!" : "O disparo falhou."}</p>
                    <p className="opacity-80">
                      {result.success 
                        ? `ID do Envio: ${result.data?.data?.id || "N/A"}. Verifique o painel do Resend para confirmar o recebimento.`
                        : `Causa: ${result.error}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
