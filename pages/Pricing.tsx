"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  CreditCard, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Loader2,
  Wallet
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'react-hot-toast';
import { DottedSurface } from '../components/ui/dotted-surface';
import { motion, AnimatePresence } from 'framer-motion';

interface Plan {
  id: string;
  name: string;
  badge: string;
  benefits: string[];
  price: number;
  checkout_url: string;
  search_limit?: number;
  process_limit?: number;
  monitoring_limit?: number;
}

// Subcomponente interno para a simulação animada de saldo
const PlanSimulation: React.FC<{ plan: Plan; profile: any }> = ({ plan, profile }) => {
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsSimulated((prev) => !prev);
    }, 3000); // Alterado para 3 segundos conforme solicitado
    return () => clearInterval(timer);
  }, []);

  const searchCurrent = profile?.search_credits ?? 0;
  const processCurrent = profile?.process_credits ?? 0;
  const monitoringCurrent = profile?.monitoring_credits ?? 0;

  const searchLimit = plan.search_limit ?? 0;
  const processLimit = plan.process_limit ?? 0;
  const monitoringLimit = plan.monitoring_limit ?? 0;

  const searchTarget = isSimulated ? searchCurrent + searchLimit : searchCurrent;
  const processTarget = isSimulated ? processCurrent + processLimit : processCurrent;
  const monitoringTarget = isSimulated ? monitoringCurrent + monitoringLimit : monitoringCurrent;

  return (
    <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 mb-6 text-left">
      {/* Cabeçalho */}
      <div className="flex items-center justify-center mb-4">
        <AnimatePresence mode="wait">
          <motion.span
            key={isSimulated ? "after" : "before"}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
              isSimulated
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-slate-500/10 text-slate-400 border-white/5"
            }`}
          >
            {isSimulated ? "Saldo após a Compra" : "Saldo Atual"}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        {/* Item: N° de processo */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
            <span>N° de processo</span>
            <span className={isSimulated && processLimit > 0 ? "text-emerald-400 font-bold" : "text-white"}>
              {processTarget} disponíveis
            </span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${isSimulated && processLimit > 0 ? "bg-emerald-400" : "bg-primary"}`}
              animate={{ width: processTarget > 0 ? "100%" : "0%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Item: CPF, CNPJ e Nome */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
            <span>CPF, CNPJ e Nome</span>
            <span className={isSimulated && searchLimit > 0 ? "text-emerald-400 font-bold" : "text-white"}>
              {searchTarget} disponíveis
            </span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${isSimulated && searchLimit > 0 ? "bg-emerald-400" : "bg-primary"}`}
              animate={{ width: searchTarget > 0 ? "100%" : "0%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Item: Monitoramento */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
            <span>Slots Monitoramento</span>
            <span className={isSimulated && monitoringLimit > 0 ? "text-emerald-400 font-bold" : "text-white"}>
              {monitoringTarget} slots
            </span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${isSimulated && monitoringLimit > 0 ? "bg-emerald-400" : "bg-primary"}`}
              animate={{ width: monitoringTarget > 0 ? "100%" : "0%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) {
      toast.error('Erro ao carregar pacotes');
      console.error(error);
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  };

  const handleSubscribe = (checkoutUrl: string) => {
    if (!user) {
      navigate('/auth', { state: { from: '/planos' } });
      return;
    }

    const url = new URL(checkoutUrl);
    if (user.email) url.searchParams.append('email', user.email);
    
    window.open(url.toString(), '_blank');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-950 dark text-white relative overflow-x-hidden flex flex-col items-center py-12 px-4 scrollbar-hide">
      <DottedSurface />

      <div className="text-center relative z-10 mb-16 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-widest mb-6 animate-pulse">
          <Sparkles className="w-4 h-4" />
          Pacotes de Créditos
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-primary to-emerald-400 bg-clip-text text-transparent">
          Recarga de Consultas
        </h1>
        <p className="text-slate-400 text-lg font-medium">
          Adquira créditos acumulativos para realizar suas consultas de processos e nomes. Seus créditos não expiram.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl relative z-10 px-4">
        {plans.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
             <CreditCard className="w-12 h-12 text-slate-700 mx-auto mb-4" />
             <p className="text-slate-500 font-bold">Nenhum pacote de créditos disponível no momento.</p>
          </div>
        ) : plans.map((plan) => {
          return (
            <div 
              key={plan.id}
              className={`relative flex flex-col bg-slate-900/50 backdrop-blur-xl border-2 rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] ${
                plan.badge 
                ? 'border-primary/50 shadow-[0_0_30px_rgba(223,184,42,0.1)] ring-2 ring-primary/20' 
                : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-emerald-500 text-deep-indigo text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  {plan.badge}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="text-slate-500 font-medium text-sm">/único</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="bg-emerald-500/10 rounded-full p-1 mt-0.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-slate-300 text-sm font-medium leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Seção Dinâmica de Simulação de Saldo */}
              {user && <PlanSimulation plan={plan} profile={profile} />}

              <Button 
                onClick={() => handleSubscribe(plan.checkout_url)}
                className={`w-full py-6 rounded-2xl text-lg font-black uppercase tracking-widest transition-all duration-300 gap-3 group ${
                  plan.badge 
                  ? 'bg-primary text-deep-indigo hover:shadow-[0_0_20px_rgba(223,184,42,0.4)]' 
                  : 'bg-white text-slate-950 hover:bg-slate-200'
                }`}
              >
                <>Adquirir <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl text-center px-4 opacity-60">
        <div className="flex flex-col items-center">
          <CreditCard className="w-8 h-8 text-primary mb-3" />
          <h4 className="font-bold text-sm uppercase tracking-widest mb-1">Pagamento Seguro</h4>
          <p className="text-xs text-slate-500">Processado via Cakto</p>
        </div>
        <div className="flex flex-col items-center">
          <Zap className="w-8 h-8 text-emerald-400 mb-3" />
          <h4 className="font-bold text-sm uppercase tracking-widest mb-1">Acesso Imediato</h4>
          <p className="text-xs text-slate-500">Liberação automática do saldo</p>
        </div>
        <div className="flex flex-col items-center">
          <Globe className="w-8 h-8 text-indigo-400 mb-3" />
          <h4 className="font-bold text-sm uppercase tracking-widest mb-1">Sem Fidelidade</h4>
          <p className="text-xs text-slate-500">Use os créditos quando quiser</p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;