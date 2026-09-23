"use client";

import React from 'react';
import { X, Lock, Sparkles, ChevronRight, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface UnmaskUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnmaskUpsellModal: React.FC<UnmaskUpsellModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1E1B4B]/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden relative z-10 border border-white/20"
          >
            {/* Botão Fechar */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            {/* Cabeçalho Visual */}
            <div className="bg-gradient-to-b from-primary/10 to-transparent p-10 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="size-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                   <Lock size={40} />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-2 -right-2 bg-deep-indigo p-2 rounded-xl text-white shadow-lg border-2 border-white"
                >
                  <Eye size={16} />
                </motion.div>
              </div>
              
              <h3 className="text-xl font-black text-deep-indigo dark:text-white leading-tight text-center">
                Ver número do processo
              </h3>
            </div>

            <div className="px-8 pb-10 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                Assine um plano de benefícios para ver o número do processo e ter acesso a todas as atualizações.
              </p>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    navigate('/planos');
                    onClose();
                  }}
                  className="w-full py-4 bg-primary text-deep-indigo font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
                >
                  <Sparkles size={18} className="group-hover:animate-pulse" />
                  Ver número do processo
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={onClose}
                  className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition-all text-sm"
                >
                  Continuar com busca limitada
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};