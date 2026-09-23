"use client";

import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onFocus?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  onSearch, 
  onFocus,
  isLoading, 
  placeholder = "Busque por CPF, CNPJ, Nome ou Número do Processo",
  className 
}) => {
  return (
    <div className={cn(
      "bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-2 transition-all duration-300",
      className
    )}>
      <div className="flex-1 flex items-center px-4 gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl min-h-[56px] h-14 border border-transparent focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-0 transition-all">
        <Search className="text-slate-300" size={20} />
        <input 
          className="w-full bg-transparent border-none focus:ring-0 text-deep-indigo dark:text-white placeholder:text-slate-400 font-medium outline-none" 
          placeholder={placeholder} 
          type="text"
          value={value}
          onFocus={onFocus}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
      </div>
      <button 
        onClick={onSearch}
        disabled={isLoading || !value.trim()}
        className="bg-primary hover:bg-primary/90 text-deep-indigo px-8 py-3 rounded-xl font-bold transition-all h-14 min-h-[56px] whitespace-nowrap shadow-md shadow-primary/20 disabled:opacity-50"
      >
        {isLoading ? 'Buscando...' : 'Buscar Processo'}
      </button>
    </div>
  );
};

export default SearchBar;