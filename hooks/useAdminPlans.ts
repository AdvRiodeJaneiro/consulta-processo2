import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'react-hot-toast';

export interface Plan {
  id?: string;
  name: string;
  badge: string;
  benefits: string[];
  price: number;
  cakto_product_id: string;
  checkout_url: string;
}

export function useAdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      toast.error('Erro ao carregar planos');
      console.error(error);
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  };

  const addPlan = () => {
    const newPlan: Plan = {
      name: '',
      badge: '',
      benefits: [''],
      price: 0,
      cakto_product_id: '',
      checkout_url: ''
    };
    setPlans([...plans, newPlan]);
  };

  const removePlan = async (index: number, id?: string) => {
    if (id) {
      const confirm = window.confirm('Deseja realmente excluir este plano permanentemente?');
      if (!confirm) return;

      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Erro ao excluir plano');
        return;
      }
    }

    const updatedPlans = [...plans];
    updatedPlans.splice(index, 1);
    setPlans(updatedPlans);
    toast.success('Plano removido');
  };

  const updatePlanField = (index: number, field: keyof Plan, value: any) => {
    const updatedPlans = [...plans];
    updatedPlans[index] = { ...updatedPlans[index], [field]: value };
    setPlans(updatedPlans);
  };

  const updateBenefit = (planIndex: number, benefitIndex: number, value: string) => {
    const updatedPlans = [...plans];
    const updatedBenefits = [...updatedPlans[planIndex].benefits];
    updatedBenefits[benefitIndex] = value;
    updatedPlans[planIndex].benefits = updatedBenefits;
    setPlans(updatedPlans);
  };

  const addBenefit = (planIndex: number) => {
    const updatedPlans = [...plans];
    updatedPlans[planIndex].benefits = [...updatedPlans[planIndex].benefits, ''];
    setPlans(updatedPlans);
  };

  const removeBenefit = (planIndex: number, benefitIndex: number) => {
    const updatedPlans = [...plans];
    const updatedBenefits = [...updatedPlans[planIndex].benefits];
    updatedBenefits.splice(benefitIndex, 1);
    updatedPlans[planIndex].benefits = updatedBenefits;
    setPlans(updatedPlans);
  };

  const savePlans = async () => {
    setSaving(true);
    try {
      for (const plan of plans) {
        if (!plan.name || !plan.checkout_url) {
          toast.error('Nome e Link de Checkout são obrigatórios');
          setSaving(false);
          return;
        }

        const planData = {
          name: plan.name,
          badge: plan.badge,
          benefits: plan.benefits.filter(b => b.trim() !== ''),
          price: plan.price,
          cakto_product_id: plan.cakto_product_id,
          checkout_url: plan.checkout_url,
          updated_at: new Date().toISOString()
        };

        if (plan.id) {
          await supabase.from('plans').update(planData).eq('id', plan.id);
        } else {
          await supabase.from('plans').insert(planData);
        }
      }
      toast.success('Configurações de planos salvas!');
      fetchPlans();
    } catch (err) {
      toast.error('Erro ao salvar planos');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const formatPriceForInput = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, planIdx: number) => {
    const value = e.target.value.replace(/\D/g, '');
    const cents = parseInt(value || '0', 10);
    const numericValue = cents / 100;
    updatePlanField(planIdx, 'price', numericValue);
  };

  return {
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
    handlePriceChange,
    refreshPlans: fetchPlans
  };
}