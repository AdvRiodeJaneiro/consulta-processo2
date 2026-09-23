"use client";

import React, { useState } from 'react';
import { AuthForm } from '../AuthForm';
import { cn } from '../../lib/utils';
import { UserPlus, LogIn } from 'lucide-react';

interface GuestLimitContentProps {
  onSuccess: () => void;
}

export const GuestLimitContent: React.FC<GuestLimitContentProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');

  return (
    <div className="space-y-6 w-full">
      <div className="text-center">
        <h3 className="text-2xl font-black text-deep-indigo dark:text-white leading-tight">
          Descubra os processos por CPF, CNPJ ou nome
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
          Crie uma conta grátis para continuar
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

      <div key={mode} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
        <AuthForm 
            onSuccess={onSuccess} 
            defaultIsLogin={mode === 'login'} 
        />
      </div>
    </div>
  );
};