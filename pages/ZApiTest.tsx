"use client";

import React, { useState } from 'react';
import { useZApiStore } from '../integrations/zapi/store';
import { useAuth } from '../contexts/AuthContext';
import { checkZApiStatus, sendZApiText } from '../integrations/zapi/service';
import { 
  Settings, 
  Send, 
  Activity, 
  Trash2, 
  Terminal, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function ZApiTest() {
  const { profile } = useAuth();
  const { credentials, setCredentials, logs, clearLogs } = useZApiStore();
  
  const [testMessage, setTestMessage] = useState("Olá! Este é um teste do sistema *Consulta Processo IA* via Z-API. 🤪");
  const [isLoading, setIsLoading] = useState(false);
  const [statusResult, setStatusResult] = useState<any>(null);

  const handleUpdateCreds = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ [e.target.name]: e.target.value });
  };

  const onCheckStatus = async () => {
    setIsLoading(true);
    try {
      const res = await checkZApiStatus();
      setStatusResult(res);
      if (res.connected) {
        toast.success("Instância conectada!");
      } else {
        toast.error("Instância desconectada.");
      }
    } catch (err: any) {
      toast.error("Erro ao verificar status.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSendTest = async () => {
    if (!profile?.whatsapp) {
      toast.error("Você não configurou seu WhatsApp no perfil.");
      return;
    }
    
    setIsLoading(true);
    try {
      await sendZApiText(profile.whatsapp, testMessage);
      toast.success("Mensagem enviada!");
    } catch (err: any) {
      toast.error("Erro no envio.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <div>
          <h2 className="text-3xl font-black text-deep-indigo dark:text-white tracking-tight">Integração WhatsApp (Z-API)</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Painel de configuração e testes técnicos da API de disparos.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna 1: Configurações */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Settings size={20} />
                </div>
                <h3 className="text-lg font-bold text-deep-indigo dark:text-white">Credenciais</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instance ID</label>
                  <input 
                    name="instanceId"
                    value={credentials.instanceId}
                    onChange={handleUpdateCreds}
                    placeholder="Ex: 3C4E..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Token</label>
                  <input 
                    name="token"
                    value={credentials.token}
                    onChange={handleUpdateCreds}
                    placeholder="Ex: 57FA..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Token</label>
                  <input 
                    name="clientToken"
                    value={credentials.clientToken}
                    onChange={handleUpdateCreds}
                    placeholder="Security Token da Conta"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                  />
                </div>

                <button 
                  onClick={onCheckStatus}
                  disabled={isLoading}
                  className="w-full mt-4 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-deep-indigo py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Activity size={16} />
                  Verificar Status da Instância
                </button>
              </div>

              {statusResult && (
                <div className={cn(
                  "mt-6 p-4 rounded-2xl border flex items-center gap-3",
                  statusResult.connected ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
                )}>
                  {statusResult.connected ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  <div className="text-xs">
                    <p className="font-bold">{statusResult.connected ? "Conectado" : "Desconectado"}</p>
                    <p className="opacity-70">{statusResult.error || "Aguardando leitura do QR Code."}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coluna 2: Teste de Envio */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <Smartphone size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-deep-indigo dark:text-white">Teste de Envio</h3>
                </div>
                {profile?.whatsapp && (
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enviar para meu número</p>
                    <p className="text-sm font-bold text-green-500">{profile.whatsapp}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <textarea 
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Escreva sua mensagem de teste..."
                  className="w-full min-h-[120px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-base focus:ring-2 focus:ring-primary/20 transition-all text-foreground resize-none"
                />
                
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                    <Info size={14} />
                    <span>Suporta markdown (*bold*, _italic_) e emojis.</span>
                  </div>
                  <button 
                    onClick={onSendTest}
                    disabled={isLoading || !testMessage.trim()}
                    className="w-full sm:w-auto bg-primary text-deep-indigo px-10 py-4 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Send size={20} />
                    Enviar Mensagem agora
                  </button>
                </div>
              </div>
            </div>

            {/* Debug Console */}
            <div className="bg-slate-950 rounded-[32px] overflow-hidden border border-slate-800 flex flex-col h-[400px]">
              <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                  <Terminal size={14} />
                  <span>Webhook & API Debug (Logs em Tempo Real)</span>
                </div>
                <button 
                  onClick={clearLogs}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] space-y-4 scrollbar-hide">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <Terminal size={48} className="mb-4" />
                    <p className="font-bold">Nenhuma atividade registrada.</p>
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i} 
                      className={cn(
                        "p-3 rounded-xl border-l-4",
                        log.status === 'success' ? "bg-green-500/5 border-green-500" : "bg-red-500/5 border-red-500"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-black", log.status === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white')}>
                            {log.method}
                          </span>
                          <span className="text-slate-400">{log.endpoint}</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {log.requestBody && (
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-slate-600 uppercase">Request</p>
                            <pre className="bg-black/40 p-2 rounded overflow-x-auto text-slate-300">
                              {JSON.stringify(log.requestBody, null, 2)}
                            </pre>
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-600 uppercase">Response</p>
                          <pre className={cn("bg-black/40 p-2 rounded overflow-x-auto", log.status === 'error' ? 'text-red-400' : 'text-green-400')}>
                            {JSON.stringify(log.responseBody, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}