"use client";

import React from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  CreditCard, 
  Link as LinkIcon, 
  Tag, 
  ListTodo,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAdminPlans } from '../hooks/useAdminPlans';

const AdminSettings: React.FC = () => {
  const {
    plans,
    loading,
    saving,
    addPlan,
    removePlan,
    updatePlanField,
    updateBenefit,
    addBenefit,
    removeBenefit,
    savePlans,
    formatPriceForInput,
    handlePriceChange
  } = useAdminPlans();

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
            <CreditCard className="w-8 h-8 text-primary" />
            Configuração de Planos (Cakto)
          </h1>
          <p className="text-slate-500 mt-1">Gerencie os preços e links de checkout da Cakto que aparecerão para os usuários.</p>
        </div>
        <Button onClick={savePlans} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Tudo
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {plans.map((plan, planIdx) => (
          <div key={plan.id || planIdx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-2">
                  <Tag className="w-4 h-4" /> Básico
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome do Plano</label>
                  <input 
                    type="text" 
                    value={plan.name} 
                    onChange={(e) => updatePlanField(planIdx, 'name', e.target.value)}
                    placeholder="Ex: Plano Ouro"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm focus:ring-2 ring-primary/20 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Etiqueta (Badge)</label>
                  <input 
                    type="text" 
                    value={plan.badge} 
                    onChange={(e) => updatePlanField(planIdx, 'badge', e.target.value)}
                    placeholder="Ex: Mais Escolhido"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm focus:ring-2 ring-primary/20 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Preço (R$)</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={formatPriceForInput(plan.price)} 
                    onChange={(e) => handlePriceChange(e, planIdx)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm focus:ring-2 ring-primary/20 text-foreground text-left font-medium"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-2">
                  <LinkIcon className="w-4 h-4" /> Integração
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    ID do Produto (Cakto)
                    <AlertCircle className="w-3 h-3 text-slate-400 cursor-help" />
                  </label>
                  <input 
                    type="text" 
                    value={plan.cakto_product_id} 
                    onChange={(e) => updatePlanField(planIdx, 'cakto_product_id', e.target.value)}
                    placeholder="UUID do produto"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm font-mono focus:ring-2 ring-primary/20 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Link de Checkout</label>
                  <input 
                    type="text" 
                    value={plan.checkout_url} 
                    onChange={(e) => updatePlanField(planIdx, 'checkout_url', e.target.value)}
                    placeholder="https://pay.cakto.com.br/..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-sm focus:ring-2 ring-primary/20 text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-4 lg:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                    <ListTodo className="w-4 h-4" /> Benefícios
                  </div>
                  <button onClick={() => addBenefit(planIdx)} className="text-xs text-primary hover:underline font-bold">+ Adicionar</button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {plan.benefits.map((benefit, benIdx) => (
                    <div key={benIdx} className="flex gap-2">
                      <div className="flex-1 relative">
                        <CheckCircle className="absolute left-3 top-3 w-4 h-4 text-emerald-500" />
                        <input 
                          type="text" 
                          value={benefit} 
                          onChange={(e) => updateBenefit(planIdx, benIdx, e.target.value)}
                          placeholder="Benefício..."
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-2 pl-9 text-xs focus:ring-2 ring-primary/20 text-foreground"
                        />
                      </div>
                      <button 
                        onClick={() => removeBenefit(planIdx, benIdx)}
                        className="p-2 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button variant="ghost" onClick={() => removePlan(planIdx, plan.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 gap-2">
                <Trash2 className="w-4 h-4" />
                Excluir Plano
              </Button>
            </div>
          </div>
        ))}

        <button 
          onClick={addPlan}
          className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all duration-200 group"
        >
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-bold uppercase tracking-widest text-sm">Adicionar Novo Plano</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;