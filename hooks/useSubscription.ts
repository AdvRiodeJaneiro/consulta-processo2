"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface SubscriptionHistory {
  id: string;
  plan_name: string;
  amount_paid: number;
  payment_status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export function useSubscription() {
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [currentPlanDetails, setCurrentPlanDetails] = useState<{name: string, price: number} | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    // 1. Busca Histórico
    const { data: historyData, error: historyError } = await supabase
      .from('subscription_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (!historyError && historyData) {
      setHistory(historyData);
    }

    // 2. Busca Detalhes do Plano Atual se houver
    if (profile?.current_plan_id) {
      const { data: planData } = await supabase
        .from('plans')
        .select('name, price')
        .eq('id', profile.current_plan_id)
        .maybeSingle();
      
      if (planData) {
        setCurrentPlanDetails({
          name: planData.name,
          price: Number(planData.price)
        });
      }
    } else {
      setCurrentPlanDetails(null);
    }

    setLoading(false);
  }, [user, profile?.current_plan_id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    currentPlanDetails,
    loading,
    refresh: fetchHistory
  };
}