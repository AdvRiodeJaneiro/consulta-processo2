"use client";

import React from 'react';
import { ChevronRight, MessageSquare, Bell, Menu, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { cn } from '../lib/utils';

interface HeaderProps {
  viewTitle: string;
  onWhatsappClick?: () => void;
  onNewSearchClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ viewTitle, onWhatsappClick, onNewSearchClick }) => {
  const { toggleSidebar } = useUIStore();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className={cn(
          "items-center gap-2 text-slate-400 overflow-hidden",
          isHome ? "hidden sm:flex" : "flex"
        )}>
          <span className="text-xs md:text-sm font-medium hidden sm:inline">Dashboard</span>
          <ChevronRight size={14} className="mt-0.5 hidden sm:inline" />
          <span className="text-xs md:text-sm font-bold text-deep-indigo dark:text-white truncate max-w-[150px] md:max-w-none">
            {viewTitle}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
        <button
          onClick={isHome ? onNewSearchClick : undefined}
          className="size-9 md:size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 shrink-0"
          title={isHome ? "Nova Consulta" : "Notificações"}
        >
          {isHome ? (
            <Plus size={20} className="text-primary" />
          ) : (
            <Bell size={18} className="md:w-5 md:h-5" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;