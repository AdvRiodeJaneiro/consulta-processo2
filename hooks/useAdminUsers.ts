"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Profile } from '../types';

export interface AdminUser extends Profile {
  plan_name?: string;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select(`
          *,
          plans:current_plan_id (
            name
          )
        `)
        .order('updated_at', { ascending: false });

      if (dbError) throw dbError;

      const formattedUsers: AdminUser[] = (data || []).map((u: any) => ({
        ...u,
        plan_name: u.plans?.name || 'Free'
      }));

      setUsers(formattedUsers);
    } catch (err: any) {
      console.error("[useAdminUsers] Erro:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${user.first_name} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  return {
    users: filteredUsers,
    totalCount: users.length,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refresh: fetchUsers
  };
}