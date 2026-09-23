"use client";

import React from 'react';
import { Users, UserPlus, Crown, Loader2, RefreshCw, SearchX } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { UserSearch } from '../components/admin/UserSearch';
import { UserTableRow } from '../components/admin/UserTableRow';
import { cn } from '../lib/utils';

const AdminUsers: React.FC = () => {
  const { users, totalCount, loading, error, searchQuery, setSearchQuery, refresh } = useAdminUsers();

  const proCount = users.filter(u => u.subscription_status === 'active').length;
  const adminCount = users.filter(u => u.is_admin).length;

  return (
    <div className="p-6 max-w-7xl mx-auto pb-24 space-y-8">
      {/* Header e Estatísticas Rápidas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-deep-indigo dark:text-white tracking-tight">Gestão de Usuários</h1>
            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase border border-primary/20">Admin</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Controle e visualize todos os clientes da plataforma.</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <StatCard icon={<Users size={16} />} label="Total" value={totalCount} />
            <StatCard icon={<Crown size={16} />} label="Assinantes" value={proCount} color="text-emerald-500" />
            <StatCard icon={<RefreshCw size={16} />} label="Admins" value={adminCount} color="text-red-500" />
        </div>
      </div>

      {/* Área de Filtros e Busca */}
      <div className="flex items-center justify-between gap-4">
        <UserSearch value={searchQuery} onChange={setSearchQuery} />
        <button 
          onClick={refresh}
          disabled={loading}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm active:rotate-180"
          title="Atualizar lista"
        >
          <RefreshCw size={18} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações do Usuário</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">WhatsApp</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano Ativo</th>
                <th className="py-4 px-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Atividade</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse border-b border-slate-50 dark:border-slate-800/50">
                    <td colSpan={4} className="py-6 px-6"><div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <SearchX size={48} className="mb-4" />
                      <p className="font-bold">Nenhum usuário encontrado</p>
                      <p className="text-xs">Tente ajustar os filtros de busca.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserTableRow key={user.id} user={user} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Sub-componente de Card de Estatística
const StatCard = ({ icon, label, value, color = "text-primary" }: { icon: React.ReactNode, label: string, value: number, color?: string }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm flex items-center gap-3 shrink-0">
    <div className={cn("size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center", color)}>
      {icon}
    </div>
    <div className="min-w-[60px]">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{label}</p>
      <p className="text-lg font-black text-deep-indigo dark:text-white leading-none">{value}</p>
    </div>
  </div>
);

export default AdminUsers;