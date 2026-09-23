"use client";

import React from 'react';
import { Search, X } from 'lucide-react';

interface UserSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const UserSearch: React.FC<UserSearchProps> = ({ value, onChange, placeholder = "Buscar por nome ou e-mail..." }) => {
  return (
    <div className="relative group w-full max-w-md">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
        <Search size={18} />
      </div>
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 ring-primary/20 outline-none transition-all text-sm font-medium text-foreground"
      />
      {value && (
        <button 
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};