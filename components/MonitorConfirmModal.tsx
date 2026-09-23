"use client";

import React from 'react';
import { X, FileText, CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EscavadorProcesso } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface MonitorConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  process: EscavadorProcesso | null;
}

const MonitorConfirmModal: React.FC<MonitorConfirmModalProps> = ({ isOpen, onClose, onConfirm, process }) => {
  const { user } = useAuth();
  if (!process) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1E1B4B]/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="bg-gradient-to-b from-gray-50 to-white pt-12 pb-8 px-8 flex justify-center items-center overflow-hidden">
              <div className="relative w-full max-w-[280px] h-40 flex items-center justify-between">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10"
                >
                  <div className="w-16 h-16 bg-white border-2 border-[#FFCC33] rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-100">
                    <FileText className="text-[#FFCC33]" size={32} />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-[#FFCC33] rounded-2xl -z-10"
                  />
                </motion.div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-16">
                  <div className="h-[2px] w-full border-t-2 border-dashed border-gray-200 relative">
                    <motion.div
                      animate={{ x: ['-10%', '110%'], opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="absolute top-1/2 -translate-y-1/2 text-indigo-600"
                    >
                      <ArrowRight size={24} />
                    </motion.div>
                  </div>
                </div>

                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <div className="w-14 h-24 bg-[#1E1B4B] rounded-2xl border-[3px] border-[#333] relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-[#333] rounded-b-md" />
                    <motion.div 
                      animate={{ backgroundColor: ['#1E1B4B', '#2d2a5d', '#1E1B4B'] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2"
                    >
                       <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.1, 1], opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 3, times: [0, 0.2, 0.3] }}
                        className="bg-indigo-600 text-white p-1 rounded-lg w-full flex items-center justify-center shadow-md shadow-indigo-900/50"
                       >
                        <Mail size={14} />
                       </motion.div>
                       <motion.div
                         animate={{ opacity: [0.3, 0.6, 0.3] }}
                         transition={{ repeat: Infinity, duration: 3 }}
                         className="w-full h-1 bg-white/20 rounded-full"
                       />
                       <motion.div
                         animate={{ opacity: [0.3, 0.6, 0.3] }}
                         transition={{ repeat: Infinity, duration: 3, delay: 0.2 }}
                         className="w-2/3 h-1 bg-white/20 rounded-full"
                       />
                    </motion.div>
                  </div>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-3 -right-3 bg-white p-1.5 rounded-full shadow-lg border border-gray-50"
                  >
                    <Mail size={20} className="text-indigo-600" />
                  </motion.div>
                </motion.div>
              </div>
            </div>

            <div className="px-10 pb-10 text-center">
              <h3 className="text-2xl font-bold text-[#1E1B4B] mb-4">
                Monitore esse processo
              </h3>
              <p className="text-gray-500 leading-relaxed mb-4 text-sm">
                Pronto, agora você pode ficar tranquilo: sempre que uma atualização chegar sobre esse processo, você a receberá em seu e-mail: <span className="text-indigo-600 font-bold">{user?.email || 'Cadastro'}</span>.
              </p>
              
              <div className="bg-gray-50 rounded-xl p-3 mb-8 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Processo selecionado</p>
                <p className="text-sm font-bold text-[#1E1B4B] font-mono truncate">{process.numero_cnj}</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={onConfirm}
                  className="w-full py-4 bg-[#1E1B4B] text-white font-bold rounded-2xl hover:bg-[#2d2a5d] transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group"
                >
                  <CheckCircle2 size={20} />
                  Confirmar e Monitorar Agora
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-4 text-gray-400 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MonitorConfirmModal;