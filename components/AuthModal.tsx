"use client";

import React, { useState } from 'react';
import { X, Lock, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthForm } from './AuthForm';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  title = "Quase lá...", 
  description = "Crie uma conta grátis para ver o resultado desse processo.",
  initialMode = 'signup'
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
            className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative z-10 max-h-[95vh] flex flex-col"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all z-20"
            >
              <X size={20} />
            </button>

            <div className="p-8 md:p-10 overflow-y-auto scrollbar-hide">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                  <Lock size={32} />
                </div>
                <h3 className="text-2xl font-black text-deep-indigo dark:text-white leading-tight">
                  {title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
                  {description}
                </p>
              </div>

              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
                <button
                  onClick={() => setMode('signup')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    mode === 'signup' 
                      ? "bg-white dark:bg-slate-700 text-deep-indigo dark:text-white shadow-sm" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                >
                  <UserPlus size={14} />
                  Criar Conta
                </button>
                <button
                  onClick={() => setMode('login')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    mode === 'login' 
                      ? "bg-white dark:bg-slate-700 text-deep-indigo dark:text-white shadow-sm" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                >
                  <LogIn size={14} />
                  Fazer Login
                </button>
              </div>

              <div key={mode}>
                <AuthForm 
                  onSuccess={onClose} 
                  defaultIsLogin={mode === 'login'} 
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;