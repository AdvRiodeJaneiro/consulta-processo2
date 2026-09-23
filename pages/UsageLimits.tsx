"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { 
  ShieldCheck, 
  Save, 
  Users, 
  UserPlus, 
  Crown,
  Search,
  Gavel,
  Smartphone,
  Loader2,
  Info
} from 'lucide-react';
import { Button } from '../components/ui/button';

interface SystemSettings {
  guest_search_limit: number;
  guest_process_limit: number;
  guest_monitoring_limit: number;
  free_search_limit: number;
  free_process_limit: number;
  free_monitoring_limit: number;
  admin_search_limit: number;
  admin_process_limit: number;
  admin_monitoring_limit: number;
}

const UsageLimits: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    guest_search_limit: 2,
    guest_process_limit: 0,
    guest_monitoring_limit: 0,
    free_search_limit: 5,
    free_process_limit: 1,
    free_monitoring_limit: 0,
    admin_search_limit: 9999,
    admin_process_limit: 9999,
    admin_monitoring_limit: 9999
  });
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Buscar Configurações Globais (Não Logado e Free)
    const { data: settingsData } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 'global_limits')
      .maybeSingle();
    
    if (settingsData) setSettings(settingsData);

    // Buscar Planos (Pro)
    const { data: plansData } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });
    
    if (plansData) setPlans(plansData);

    setLoading(false);
  };

  const handleGlobalChange = (field: keyof SystemSettings, value: number) => {
    setSettings({ ...settings, [field]: value });
  };

  const handlePlanChange = (planId: string, field: string, value: number) => {
    setPlans(plans.map(p => p.id === planId ? { ...p, [field]: value } : p));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      // 1. Salvar Globais
      const { error: gErr } = await supabase
        .from('system_settings')
        .upsert({ id: 'global_limits', ...settings });
      
      if (gErr) throw gErr;

      // 2. Salvar Planos Individualmente
      for (const plan of plans) {
        const { error: pErr } = await supabase
          .from('plans')
          .update({
            search_limit: plan.search_limit,
            process_limit: plan.process_limit,
            monitoring_limit: plan.monitoring_limit
          })
          .eq('id', plan.id);
        
        if (pErr) throw pErr;
      }

      toast.success('Limites de uso atualizados!');
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-deep-indigo dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            Limites de Uso
          </h1>
          <p className="text-slate-500 mt-1">Controle quanto cada tipo de usuário pode utilizar do sistema.</p>
        </div>
        <Button onClick={saveAll} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Configurações
        </Button>
      </div>

      <div className="space-y-8">
        {/* Nível: Administrador */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-deep-indigo dark:text-white leading-none">Limites do Administrador</h3>
              <p className="text-xs text-primary mt-1 uppercase tracking-widest font-black">Créditos para sua conta admin</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Consulta CPF/CNPJ/nome</label>
              <input
                type="number"
                value={settings.admin_search_limit}
                onChange={(e) => handleGlobalChange('admin_search_limit', parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm focus:ring-2 ring-primary/20 text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Consulta n° de Processo</label>
              <input
                type="number"
                value={settings.admin_process_limit}
                onChange={(e) => handleGlobalChange('admin_process_limit', parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm focus:ring-2 ring-primary/20 text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Processos Monitorados</label>
              <input
                type="number"
                value={settings.admin_monitoring_limit}
                onChange={(e) => handleGlobalChange('admin_monitoring_limit', parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm focus:ring-2 ring-primary/20 text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Nível: Free (Logado sem Plano) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="size-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-deep-indigo dark:text-white leading-none">Limites Gratuitos (Usuários Logados)</h3>
              <p className="text-xs text-blue-400 mt-1 uppercase tracking-widest font-black">Usuário Logado s/ Assinatura</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Consulta CPF/CNPJ/nome</label>
              <input 
                type="number" 
                value={settings.free_search_limit}
                onChange={(e) => handleGlobalChange('free_search_limit', parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm focus:ring-2 ring-primary/20 text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Consulta n° de Processo</label>
              <input 
                type="number" 
                value={settings.free_process_limit}
                onChange={(e) => handleGlobalChange('free_process_limit', parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm focus:ring-2 ring-primary/20 text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Processos Monitorados</label>
              <input 
                type="number" 
                value={settings.free_monitoring_limit}
                onChange={(e) => handleGlobalChange('free_monitoring_limit', parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm focus:ring-2 ring-primary/20 text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Nível: PRO (Planos Individuais) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4">
            <Crown size={20} className="text-primary" />
            <h2 className="text-xl font-black text-deep-indigo dark:text-white uppercase tracking-tight">Planos PRO</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-black text-deep-indigo dark:text-white text-lg">{plan.name}</h4>
                    <span className="text-xs text-primary font-bold">R$ {plan.price.toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Search size={10} /> Consulta CPF/CNPJ/nome
                    </label>
                    <input 
                      type="number" 
                      value={plan.search_limit || 0}
                      onChange={(e) => handlePlanChange(plan.id, 'search_limit', parseInt(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2.5 text-sm focus:ring-2 ring-primary/20 text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Gavel size={10} /> Consulta n° de Processo
                    </label>
                    <input 
                      type="number" 
                      value={plan.process_limit || 0}
                      onChange={(e) => handlePlanChange(plan.id, 'process_limit', parseInt(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2.5 text-sm focus:ring-2 ring-primary/20 text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Smartphone size={10} /> Processos Monitorados
                    </label>
                    <input 
                      type="number" 
                      value={plan.monitoring_limit || 0}
                      onChange={(e) => handlePlanChange(plan.id, 'monitoring_limit', parseInt(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2.5 text-sm focus:ring-2 ring-primary/20 text-foreground"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageLimits;