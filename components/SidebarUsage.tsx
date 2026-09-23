"use client";

import React, { useState, useEffect } from 'react';
import { useSearchLimit, LimitType } from '../hooks/useSearchLimit';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UsageItemProps {
  label: string;
  type: LimitType;
  updateTrigger: number;
}

const UsageItem: React.FC<UsageItemProps> = ({ label, type, updateTrigger }) => {
  const { getLimitForType, getCurrentUsage, loading } = useSearchLimit();
  const [current, setCurrent] = useState(0);
  const [limit, setLimit] = useState(0);

  useEffect(() => {
    const fetchUsage = async () => {
      const l = getLimitForType(type);
      const c = await getCurrentUsage(type);
      setLimit(l);
      setCurrent(c);
    };
    fetchUsage();
  }, [type, getLimitForType, getCurrentUsage, updateTrigger, loading]);

  if (loading) return (
    <div className="space-y-2 animate-pulse">
      <div className="h-2 w-20 bg-white/10 rounded" />
      <div className="h-1.5 w-full bg-white/5 rounded-full" />
    </div>
  );

  // No modelo de recarga:
  // - Para buscas e consultas (consumíveis): mostramos o saldo disponível direto (limit)
  // - Para monitoramento (slots ativos): mostramos a contagem ocupada "current de limit"
  const isConsumable = type === 'search' || type === 'process';
  
  const percentage = isConsumable 
    ? (limit > 0 ? 100 : 0) // Barra cheia se tiver saldo, vazia se zerado
    : Math.min((current / Math.max(limit, 1)) * 100, 100);

  const remainingPercentage = isConsumable ? percentage : (100 - percentage);
  const isWarning = limit === 0 || (!isConsumable && remainingPercentage < 20);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-400 truncate pr-2">{label}</span>
        <span className={cn(
          "shrink-0",
          isWarning ? "text-red-400" : "text-white"
        )}>
          {isConsumable ? `${limit} disponíveis` : `${current} de ${limit}`}
        </span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-500 ease-out",
            isWarning ? (isConsumable ? "bg-red-500/40" : "bg-red-500") : "bg-primary"
          )}
          style={{ width: `${isConsumable ? percentage : remainingPercentage}%` }}
        />
      </div>
    </div>
  );
};

export const SidebarUsage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;

  const hasCredits = (profile?.search_credits || 0) > 0 || (profile?.process_credits || 0) > 0;
  const updateTrigger = (profile?.search_credits || 0) + (profile?.process_credits || 0);

  return (
    <div className="px-0 py-2">
      <div className="bg-[#1E1B4B] rounded-2xl p-5 border border-white/5 shadow-xl">
        {/* Cabeçalho Centralizado */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <Wallet size={10} strokeWidth={3} />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Seus Créditos</p>
            <div className="size-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          
          <button 
            onClick={() => navigate('/minha-conta')}
            className={cn(
              "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border transition-all hover:bg-white/5",
              hasCredits 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-slate-500/10 text-slate-400 border-white/10"
            )}
          >
            Status: {hasCredits ? 'Saldo Ativo' : 'Sem Créditos'}
          </button>
        </div>
        
        <div className="space-y-5">
          <UsageItem 
            label="N° de processo" 
            type="process" 
            updateTrigger={updateTrigger}
          />
          <UsageItem 
            label="CPF, CNPJ e Nome" 
            type="search" 
            updateTrigger={updateTrigger}
          />
          <UsageItem
            label="Monitoramento E-mail"
            type="monitoring"
            updateTrigger={updateTrigger}
          />
        </div>

        <p className="text-[10px] text-slate-500 font-bold text-center mt-4 border-t border-white/5 pt-4">Créditos acumulativos que não expiram</p>
      </div>
    </div>
  );
};