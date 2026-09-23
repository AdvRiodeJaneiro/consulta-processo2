"use client";

import React, { useEffect, useState } from 'react';
import { AlertCircle, Gavel, Eye, Search, History, ChevronDown, Loader2, Check, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import MonitorConfirmModal from './MonitorConfirmModal';
import LimitModal from './LimitModal';
import MonitoringLimitModal from './MonitoringLimitModal';
import SearchBar from './SearchBar';
import StepsCard from './StepsCard';
import { HistorySidebar } from './HistorySidebar';
import { ToastAlert } from './ui/ToastAlert';
import { MaskedProcessNumber } from './MaskedProcessNumber';

import { useMonitor } from '../hooks/useMonitor';
import { useSearchLimit } from '../hooks/useSearchLimit';
import { useSearchHistory, SearchEntry } from '../hooks/useSearchHistory';
import { useMyProcesses } from '../hooks/useMyProcesses';
import { useMonitorLayout } from '../hooks/useMonitorLayout';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface MonitorProcessProps {
  whatsappNumber: string;
  onUpdateWhatsapp: (phone: string) => void;
}

const MonitorProcess: React.FC<MonitorProcessProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    query, setQuery,
    results,
    totalCount,
    isLoading,
    error,
    isConfirmModalOpen, setIsConfirmModalOpen,
    selectedProcess,
    handleSearch,
    handleMonitorClick,
    confirmMonitoring
  } = useMonitor();

  const { checkLimit, incrementUsage, getLimitForType, getCurrentUsage } = useSearchLimit();
  const { history, addToHistory, deleteEntry, clearHistory } = useSearchHistory();
  const { processes } = useMyProcesses();
  const { showSteps, hideSteps, searchBarRef } = useMonitorLayout();
  
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showMonitoringLimitModal, setShowMonitoringLimitModal] = useState(false);
  const [showAlreadyMonitoredAlert, setShowAlreadyMonitoredAlert] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('');

  const monitoredNumbers = processes.map(p => p.process_number);

  const onSearchSubmit = async () => {
    if (!query.trim()) return;

    const canSearch = await checkLimit('search');
    if (!canSearch) {
      setShowLimitModal(true);
      return;
    }
    
    hideSteps();
    setActiveFilter(query); 
    
    const success = await handleSearch();
    
    if (success) {
        const type = query.replace(/[^\d]/g, '').length >= 11 ? 'cnj' : 'involved';
        addToHistory(query, type, results.length);
        await incrementUsage('search');
    }
  };

  const handleEntrySelect = (entry: SearchEntry) => {
    hideSteps();
    setQuery(entry.query);
    setActiveFilter(entry.query); 
    handleSearch(entry.query);
  };

  const handleStartMonitoring = async (proc: any) => {
      const canMonitor = await checkLimit('monitoring');
      if (!canMonitor) {
          setShowMonitoringLimitModal(true);
          return;
      }
      handleMonitorClick(proc);
  }

  return (
    <div className="flex-1 bg-background dark:bg-background-dark overflow-y-auto scrollbar-hide">
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-2xl md:text-3xl font-black text-deep-indigo dark:text-white tracking-tight">Consulte processos e Monitore o andamento</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-primary text-deep-indigo uppercase tracking-wider shadow-sm">
                Consulta CPF, CNPJ e Nome
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg font-medium">Busque e escolha o processo para receber atualizações por e-mail</p>
          </div>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 bg-[#1E1B4B] dark:bg-slate-900 border border-[#1E1B4B] dark:border-slate-800 px-4 py-2.5 rounded-xl text-xs font-black text-white shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <History size={16} className="text-primary" />
            Histórico de buscas
          </button>
        </div>

        <AnimatePresence>
          {showSteps && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <StepsCard />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={searchBarRef} className="space-y-6 mb-10 transition-all">
            <SearchBar 
              value={query}
              onChange={setQuery}
              onSearch={onSearchSubmit}
              isLoading={isLoading}
              onFocus={hideSteps}
            />

            {history.length > 0 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                  {history.slice(0, 6).map((entry, idx) => (
                      <button
                          key={idx}
                          onClick={() => handleEntrySelect(entry)}
                          className={cn(
                              "whitespace-nowrap flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all border shadow-sm",
                              activeFilter === entry.query 
                                  ? 'bg-deep-indigo text-white border-deep-indigo dark:bg-white dark:text-deep-indigo' 
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                          )}
                      >
                          {entry.query}
                      </button>
                  ))}
              </div>
            )}
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 font-bold">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {(results.length > 0 || isLoading) && (
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-black text-deep-indigo dark:text-white">
              {isLoading ? 'Buscando processos...' : 'Resultados Encontrados'}
            </h3>
            {!isLoading && (
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {results.length} de {totalCount}
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
          {results.map((proc) => {
            const isMonitored = monitoredNumbers.includes(proc.numero_cnj);
            return (
              <div key={proc.numero_cnj} className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-primary shadow-sm hover:shadow-xl transition-all p-6 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 min-w-0">
                      <Gavel className="text-primary mt-1 shrink-0" size={20} />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Número do Processo</p>
                        <MaskedProcessNumber cnj={proc.numero_cnj} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Polo Ativo</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 line-clamp-2">{proc.titulo_polo_ativo || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Polo Passivo</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 line-clamp-2">{proc.titulo_polo_passivo || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between gap-4">
                  <span className="text-[10px] text-slate-400 italic">
                    {proc.data_ultima_movimentacao}
                  </span>
                  
                  {isMonitored ? (
                    <button 
                      onClick={() => setShowAlreadyMonitoredAlert(true)}
                      className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-400 px-4 py-2 rounded-lg text-sm font-bold cursor-default"
                    >
                      <Check size={16} />
                      <span>Monitorando</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        if (!user) navigate('/auth', { state: { from: '/monitoramento', mode: 'signup' } });
                        else handleStartMonitoring(proc);
                      }}
                      className="flex items-center gap-2 bg-deep-indigo dark:bg-primary text-white dark:text-deep-indigo px-5 py-2.5 rounded-xl text-sm font-black hover:opacity-90 transition-all shadow-md active:scale-95"
                    >
                      <Eye size={16} />
                      <span>Monitorar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!isLoading && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={48} className="text-slate-200 dark:text-slate-800 mb-4" />
            <h3 className="text-lg font-bold text-deep-indigo dark:text-white">Inicie uma nova busca</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">Busque por Nome, CPF ou CNPJ para localizar processos.</p>
          </div>
        )}
      </div>

      <HistorySidebar 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleEntrySelect}
        onDeleteEntry={deleteEntry}
        onClear={clearHistory}
      />

      <MonitorConfirmModal 
         isOpen={isConfirmModalOpen}
         onClose={() => setIsConfirmModalOpen(false)}
         onConfirm={confirmMonitoring}
         process={selectedProcess}
      />

      <LimitModal 
        isOpen={showLimitModal} 
        onClose={() => setShowLimitModal(false)} 
      />

      <MonitoringLimitModal 
        isOpen={showMonitoringLimitModal} 
        onClose={() => setShowMonitoringLimitModal(false)} 
      />

      <ToastAlert 
        isOpen={showAlreadyMonitoredAlert}
        onClose={() => setShowAlreadyMonitoredAlert(false)}
        title="Esse processo já está sendo monitorado."
        actionLabel="Ver meus processos"
        onAction={() => navigate('/meus-processos')}
      />
    </div>
  );
};

export default MonitorProcess;