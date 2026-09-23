"use client";

import React, { useState } from 'react';
import { X, Clock, Search, Gavel, User, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchEntry } from '../hooks/useSearchHistory';
import ConfirmModal from './ConfirmModal';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: SearchEntry[];
  onSelect: (entry: SearchEntry) => void;
  onDeleteEntry: (id?: string, query?: string) => void;
  onClear: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect,
  onDeleteEntry,
  onClear 
}) => {
  const [entryToDelete, setEntryToDelete] = useState<SearchEntry | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-[110] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-deep-indigo dark:text-white font-black uppercase tracking-widest text-sm">
                  <Clock size={18} className="text-primary" />
                  <span>Histórico de Buscas</span>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-10">
                     <Search size={48} className="mb-4" />
                     <p className="text-sm font-bold">Nenhuma busca recente</p>
                  </div>
                ) : (
                  history.map((entry, idx) => (
                    <div key={idx} className="relative group">
                      <button
                        onClick={() => {
                          onSelect(entry);
                          onClose();
                        }}
                        className="w-full text-left p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary transition-all pr-12"
                      >
                        <div className="flex items-start gap-3">
                          <div className="size-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700">
                            {entry.type === 'cnj' ? <Gavel size={16} /> : <User size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                              {entry.type === 'cnj' ? 'Processo' : 'Envolvido'}
                            </p>
                            <p className="text-sm font-bold text-deep-indigo dark:text-white truncate">{entry.query}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {entry.results_count} resultados
                            </p>
                          </div>
                        </div>
                      </button>
                      
                      {/* Botão de excluir individual - visível no hover */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEntryToDelete(entry);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-50 dark:hover:bg-red-900/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {history.length > 0 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                    Limpar Histórico
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={() => {
          if (entryToDelete) {
            onDeleteEntry(entryToDelete.id, entryToDelete.query);
            setEntryToDelete(null);
          }
        }}
        title="Excluir busca?"
        description={`Deseja remover "${entryToDelete?.query}" do seu histórico?`}
        confirmLabel="Sim, excluir"
        variant="danger"
      />

      <ConfirmModal 
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          onClear();
          setShowClearConfirm(false);
        }}
        title="Limpar histórico?"
        description="Esta ação removerá todas as suas buscas recentes permanentemente. Deseja continuar?"
        confirmLabel="Limpar tudo"
        variant="danger"
      />
    </>
  );
};