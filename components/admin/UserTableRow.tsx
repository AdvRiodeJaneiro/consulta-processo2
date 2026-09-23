"use client";

import React from 'react';
import { Mail, Smartphone, Crown, User as UserIcon, Calendar } from 'lucide-react';
import { AdminUser } from '../../hooks/useAdminUsers';
import { cn } from '../../lib/utils';

interface UserTableRowProps {
  user: AdminUser;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({ user }) => {
  const isPro = user.subscription_status === 'active';
  const isAdmin = user.is_admin;
  const fullName = `${user.first_name} ${user.last_name || ''}`;

  return (
    <tr className="group border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "size-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border",
            isAdmin ? "bg-red-500/10 text-red-500 border-red-500/20" : 
            isPro ? "bg-primary/10 text-primary border-primary/20" : 
            "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
          )}>
            {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.first_name} className="size-full object-cover rounded-xl" />
            ) : (
                user.first_name[0].toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
                <p className="font-bold text-deep-indigo dark:text-white truncate">{fullName}</p>
                {isAdmin && <span className="text-[8px] font-black bg-red-500 text-white px-1 rounded uppercase">Admin</span>}
            </div>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                <Mail size={10} /> {user.email}
            </p>
          </div>
        </div>
      </td>
      
      <td className="py-4 px-4 hidden md:table-cell">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Smartphone size={14} className="text-slate-300" />
          {user.whatsapp || 'Não informado'}
        </div>
      </td>

      <td className="py-4 px-4">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
          isPro 
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
            : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
        )}>
          {isPro ? <Crown size={10} fill="currentColor" /> : <UserIcon size={10} />}
          {user.plan_name}
        </div>
      </td>

      <td className="py-4 px-4 text-right hidden lg:table-cell">
        <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Última Atividade</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <Calendar size={12} />
                {new Date(user.updated_at).toLocaleDateString('pt-BR')}
            </div>
        </div>
      </td>
    </tr>
  );
};