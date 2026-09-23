"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useProcessAccess } from '../hooks/useProcessAccess';
import { UnmaskUpsellModal } from './UnmaskUpsellModal';
import { cn } from '../lib/utils';

interface MaskedProcessNumberProps {
  cnj: string;
  className?: string;
}

export const MaskedProcessNumber: React.FC<MaskedProcessNumberProps> = ({ cnj, className }) => {
  const { canSeeFullDetails, maskCNJ } = useProcessAccess();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Se o usuário tem permissão, mostra o número real e o ícone de olho aberto (apenas visual)
  if (canSeeFullDetails) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <h4 className="text-base font-bold text-deep-indigo dark:text-white break-all">
          {cnj}
        </h4>
        <div className="text-emerald-500 p-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10" title="Acesso Completo">
          <Eye size={14} />
        </div>
      </div>
    );
  }

  // Se NÃO tem permissão, renderiza o texto mascarado diretamente
  return (
    <>
      <div className={cn("flex items-center gap-2 group", className)}>
        <h4 className="text-base font-bold text-slate-400 dark:text-slate-500 break-all select-none">
          {maskCNJ(cnj)}
        </h4>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-primary hover:text-deep-indigo transition-all shadow-sm flex items-center gap-1.5 border border-transparent hover:border-primary/20"
        >
          <EyeOff size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:inline">Ver</span>
        </button>
      </div>

      <UnmaskUpsellModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};