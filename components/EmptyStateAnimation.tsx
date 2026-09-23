"use client";

import React from 'react';
import { 
  MessageCircle, 
  FileText, 
  Search, 
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateAnimationProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

export const EmptyStateAnimation: React.FC<EmptyStateAnimationProps> = ({ 
  title, 
  description, 
  buttonText, 
  onButtonClick 
}) => {
  return (
    <div className="flex flex-col items-center max-w-2xl w-full mx-auto pt-0 pb-10">
      
      {/* AREA DA ANIMAÇÃO */}
      <div className="relative w-full h-64 flex items-center justify-center mb-10">
        
        {/* Fundo Decorativo (Círculos) */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
           <motion.div 
             animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.15, 0.3] }}
             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
             className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-primary/10 absolute"
           />
           <motion.div 
             animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.1, 0.2] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full border border-primary/20 absolute"
           />
        </div>

        <div className="relative flex items-center justify-between w-full max-w-md px-4">
          
          {/* ELEMENTO ESQUERDA: O PROCESSO */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border-2 border-primary flex items-center justify-center relative overflow-hidden group">
              <FileText size={40} className="text-primary" />
              
              {/* Linha de Scanner */}
              <motion.div 
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_10px_rgba(223,184,42,0.5)]"
              />
              
              {/* Lupa de busca */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 bg-deep-indigo p-2 rounded-xl text-white shadow-lg"
              >
                <Search size={14} />
              </motion.div>
            </div>
            <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Monitorando</p>
          </motion.div>

          {/* CONEXÃO: FLUXO DE DADOS */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-[80px] md:px-[100px] pointer-events-none z-0">
            <div className="w-full border-t-[3px] border-dashed border-slate-200 dark:border-slate-800 relative">
              
              {/* Aviãozinho */}
              <motion.div
                initial={{ left: '0%', y: '-50%', opacity: 0 }}
                animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-0 -translate-x-1/2 bg-[#25D366] text-white p-2 rounded-full shadow-lg shadow-green-200 dark:shadow-green-900/20 flex items-center justify-center z-10"
              >
                <Send size={14} className="ml-0.5" />
              </motion.div>
            </div>
          </div>

          {/* ELEMENTO DIREITA: WHATSAPP */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <div className="w-16 h-28 md:w-20 md:h-36 bg-deep-indigo rounded-[1.5rem] md:rounded-[2rem] border-[3px] md:border-[4px] border-[#333] shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 flex flex-col p-2 pt-6 gap-2">
                <div className="w-full h-1 bg-white/10 rounded-full" />
                
                <motion.div
                  animate={{ 
                    scale: [0.95, 1.05, 1],
                    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="w-full bg-[#25D366] rounded-lg p-1.5 flex flex-col gap-1 shadow-lg shadow-green-900/50"
                >
                  <div className="flex items-center gap-1">
                    <MessageCircle size={6} fill="white" className="text-white" />
                    <div className="w-6 h-0.5 bg-white/40 rounded-full" />
                  </div>
                  <div className="w-full h-0.5 bg-white/20 rounded-full" />
                </motion.div>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-[#333] rounded-b-xl" />
            </div>

            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl border border-green-50 dark:border-green-900/20"
            >
              <MessageCircle size={22} md:size={28} className="text-[#25D366]" fill="#25D366" />
            </motion.div>

            <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Atualizado</p>
          </motion.div>

        </div>
      </div>

      {/* TEXTO E BOTÕES */}
      <div className="text-center z-20 px-4">
        <h1 className="text-2xl md:text-4xl font-black text-deep-indigo dark:text-white mb-4 max-w-lg leading-tight mx-auto">
          {title.split('Whatsapp.').map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && <span className="text-[#25D366]">Whatsapp.</span>}
            </React.Fragment>
          ))}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto leading-relaxed font-medium">
          {description}
        </p>
        
        <button 
          onClick={onButtonClick}
          className="bg-primary hover:bg-primary/90 text-deep-indigo font-black text-xl px-12 py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-95 flex items-center gap-3 mx-auto"
        >
          {buttonText}
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};