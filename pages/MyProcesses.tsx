"use client";

import React, { useState } from 'react';
import { Search, Gavel, Calendar, Trash2, ChevronRight, BellOff, Loader2, User, Bell } from 'lucide-react';
import { useMyProcesses, MonitoredProcess } from '../hooks/useMyProcesses';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { EmptyStateAnimation } from '../components/EmptyStateAnimation';
import { motion } from 'framer-motion';
import { useProcessStore } from '../store/processStore';
import { supabase } from '../integrations/supabase/client';
import { cn } from '../lib/utils';
import ConfirmModal from '../components/ConfirmModal';

const MyProcesses: React.FC = () => {
  const { processes, loading, hasLoadedOnce } = useMyProcesses();
  const updateProcessInStore = useProcessStore(state => state.updateProcess);
  const removeProcessFromStore = useProcessStore(state => state.removeProcess);
  const { user, sessionLoading, refreshProfile } = useAuth();
  const [search, setSearch] = useState('');
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [processToCancel, setProcessToCancel] = useState<MonitoredProcess | null>(null);
  const navigate = useNavigate();

  const filteredProcesses = processes.filter(p =>
    p.process_number.includes(search)
  );

  const handleDetailsClick = async (proc: MonitoredProcess) => {
    if (proc.has_new_updates) {
      updateProcessInStore(proc.id, { has_new_updates: false });
      await supabase
        .from('monitored_processes')
        .update({ has_new_updates: false })
        .eq('id', proc.id);
    }
    navigate(`/processo/${proc.process_number}`);
  };

  const handleCancelClick = (process: MonitoredProcess) => {
    setProcessToCancel(process);
  };

  const handleConfirmCancel = async () => {
    if (!processToCancel) return;

    setIsCancelling(processToCancel.id);
    const toastId = toast.loading('Cancelando monitoramento...');

    try {
      const { error } = await supabase
        .from('monitored_processes')
        .delete()
        .eq('id', processToCancel.id);
      
      if (!error) {
        removeProcessFromStore(processToCancel.id);
        toast.success('Monitoramento removido com sucesso!', { id: toastId });
        refreshProfile().catch(err => console.error("Erro ao atualizar perfil:", err));
      } else {
        throw error;
      }
    } catch (err: any) {
      console.error("Erro ao remover monitoramento:", err);
      toast.error('Erro ao remover monitoramento.', { id: toastId });
    } finally {
      setIsCancelling(null);
      setProcessToCancel(null);
    }
  };

  // 1. Loader de Sessão ou Carregamento Inicial
  if (sessionLoading || (loading && !hasLoadedOnce)) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // 2. Caso: Usuário NÃO logado
  if (!user) {
    return (
      <div className="flex-1 bg-background dark:bg-background-dark p-8 flex flex-col items-center min-h-[calc(100vh-80px)]">
        <EmptyStateAnimation
          title="Monitore o andamento do seu processo e receba a atualização no seu e-mail."
          description="Faça login para gerenciar seus processos monitorados."
          buttonText="Fazer Login"
          onButtonClick={() => navigate('/auth', { state: { from: '/meus-processos' } })}
        />
      </div>
    );
  }

  // 3. Caso: Usuário logado mas SEM processos monitorados
  if (hasLoadedOnce && processes.length === 0) {
    return (
      <div className="flex-1 bg-background dark:bg-background-dark p-8 flex flex-col items-center min-h-[calc(100vh-80px)]">
        <EmptyStateAnimation 
          title="Deseja monitorar seu processo?"
          description="Você ainda não tem processos monitorados. Faça uma busca para começar a receber updates."
          buttonText="Buscar Processo"
          onButtonClick={() => navigate('/monitoramento')}
        />
      </div>
    );
  }

  // 4. Caso: Usuário logado COM processos
  return (
    <div className="flex-1 bg-background dark:bg-background-dark p-8 overflow-y-auto scrollbar-hide flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-deep-indigo dark:text-white tracking-tight">Meus Processos</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">
            Processos monitorados com alertas via e-mail: <span className="text-primary font-bold">{user?.email}</span>
          </p>
        </div>

        {/* Barra de Busca */}
        <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 mb-10">
          <div className="flex items-center px-4 gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl h-14 border border-transparent focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0 transition-all">
            <Search className="text-slate-300" size={20} />
            <input
              className="w-full bg-transparent border-none focus:ring-0 text-deep-indigo dark:text-white placeholder:text-slate-400 font-medium outline-none"
              placeholder="Filtrar por número do processo..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de Processos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          {filteredProcesses.length > 0 ? (
            filteredProcesses.map((proc) => {
              const hasUpdates = proc.has_new_updates;

              return (
                <motion.div 
                  layout
                  key={proc.id} 
                  className={cn(
                    "bg-white dark:bg-slate-900 rounded-3xl border shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all p-6 flex flex-col justify-between group overflow-hidden relative",
                    hasUpdates ? "border-red-200 ring-2 ring-red-500/10" : "border-slate-100 dark:border-slate-800"
                  )}
                >
                  {hasUpdates && (
                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-red-500 text-white text-[10px] font-black rounded-bl-2xl uppercase flex items-center gap-1.5 animate-pulse z-10">
                      <Bell size={10} fill="white" />
                      NOVA ATUALIZAÇÃO
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 min-w-0 flex-1">
                        <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                          <Gavel size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Número CNJ</p>
                          <h4 className="text-lg font-bold text-deep-indigo dark:text-white truncate pr-10">{proc.process_number}</h4>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex gap-2 items-start">
                        <User size={14} className="text-primary mt-1 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Autor</p>
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{proc.title_polo_ativo || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-start">
                        <User size={14} className="text-slate-400 mt-1 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Réu</p>
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{proc.title_polo_passivo || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className={cn(
                      "rounded-2xl p-4 border transition-colors",
                      hasUpdates ? "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800/50"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-primary" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Última Notificação</span>
                        <span className="text-[10px] font-bold text-primary ml-auto">{proc.last_movement_date || 'Aguardando'}</span>
                      </div>
                      <p className={cn(
                        "text-sm font-semibold line-clamp-2 leading-relaxed",
                        hasUpdates ? "text-red-700 dark:text-red-300" : "text-slate-700 dark:text-slate-300"
                      )}>
                        {proc.last_movement_summary || 'O robô está verificando o tribunal. Você será avisado assim que surgir uma novidade.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <button
                      onClick={() => handleCancelClick(proc)}
                      disabled={isCancelling === proc.id}
                      className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-xs font-bold disabled:opacity-50"
                    >
                      {isCancelling === proc.id ? <Loader2 className="animate-spin" size={16} /> : <BellOff size={16} />}
                      <span className="hidden sm:inline">Cancelar</span>
                    </button>

                    <button
                      onClick={() => handleDetailsClick(proc)}
                      className="flex items-center gap-2 bg-primary text-deep-indigo px-5 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                      <span>Ver Detalhes</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Search size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">Nenhum processo corresponde à sua busca.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={processToCancel !== null}
        onClose={() => setProcessToCancel(null)}
        onConfirm={handleConfirmCancel}
        title="Cancelar Monitoramento?"
        description={`Deseja realmente parar de monitorar o processo ${processToCancel?.process_number}? Você deixará de receber alertas por e-mail.`}
        confirmLabel="Sim, cancelar"
        variant="danger"
      />
    </div>
  );
};

export default MyProcesses;