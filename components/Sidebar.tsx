"use client";

import React from 'react';
import {
  LogOut,
  Gavel
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useUIStore } from '../store/uiStore';
import { MAIN_MENU, ADMIN_MENU, MenuItem } from '../configs/navigation';
import { SidebarUsage } from './SidebarUsage';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path;
    return (
      <button
        key={item.id}
        onClick={() => {
          navigate(item.path);
          if (window.innerWidth < 768) toggleSidebar();
        }}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
          isActive
            ? "bg-primary/10 text-primary font-bold"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "group-hover:text-primary")} />
          <span className="text-sm">{item.label}</span>
        </div>
        {item.maintenance && (
          <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase border border-slate-200 dark:border-slate-700">
            Maint
          </span>
        )}
      </button>
    );
  };

  // Filtra o menu principal: Remove "Minha Conta" se o usuário não estiver logado
  const filteredMainMenu = MAIN_MENU.filter(item => {
    if (item.id === 'my-account' && !user) return false;
    return true;
  });

  return (
    <>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      <aside className={cn(
        "fixed md:static inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full">
            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-deep-indigo shadow-sm shrink-0">
              <Gavel className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-deep-indigo dark:text-white text-lg font-bold leading-none truncate">Consulta Processo</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium uppercase tracking-wider mt-1 leading-tight">
                Busque e Monitore seus processos com IA
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            {filteredMainMenu.map(renderMenuItem)}
          </div>

          {profile?.is_admin && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <div className="px-4 mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Adm</p>
              </div>
              {ADMIN_MENU.map(renderMenuItem)}
            </div>
          )}

          {/* O painel de créditos agora rola junto com o menu */}
          <div className="mt-6">
            <SidebarUsage />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          {user ? (
            <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl group relative">
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                {profile?.avatar_url ? (
                  <img className="w-full h-full object-cover" src={profile.avatar_url} alt={profile.first_name} />
                ) : (
                  <span className="text-primary font-bold">{profile?.first_name?.[0] || user.email?.[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-deep-indigo dark:text-white truncate">
                  {profile ? `${profile.first_name} ${profile.last_name || ''}` : 'Usuário'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                  {profile?.whatsapp || user.email}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate('/auth', { state: { from: location.pathname } });
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className="w-full py-3 px-4 bg-primary text-deep-indigo font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
            >
              Entrar / Cadastrar
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;