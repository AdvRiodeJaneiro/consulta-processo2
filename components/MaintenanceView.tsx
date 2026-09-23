"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from './ui/button';

export function MaintenanceView() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950 h-full">
      <div className="max-w-md space-y-6">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-black text-deep-indigo dark:text-white uppercase tracking-tight">Em Manutenção</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium leading-relaxed">
            Estamos configurando o acesso a esta funcionalidade. Em breve você poderá consultar por CPF e CNPJ através de nossos planos.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="mt-8 bg-deep-indigo text-white dark:bg-primary dark:text-deep-indigo font-black w-full py-6 rounded-2xl gap-2 shadow-xl"
          >
            <Home size={18} />
            Voltar para o Início
          </Button>
        </div>
      </div>
    </div>
  );
}