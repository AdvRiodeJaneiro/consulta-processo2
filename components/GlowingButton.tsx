import React from 'react';
import { cn } from '../lib/utils';

interface GlowingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const GlowingButton: React.FC<GlowingButtonProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn("relative inline-flex items-center justify-center group", className)}>
      {/* Glowing effect layer */}
      <div className="absolute inset-0 duration-1000 opacity-60 transition-all bg-gradient-to-r from-primary via-yellow-500 to-primary rounded-xl blur-md filter group-hover:opacity-100 group-hover:duration-200" />
      
      {/* Actual Button */}
      <button 
        type="button"
        className="group relative inline-flex items-center justify-center w-full rounded-xl bg-primary px-6 py-4 font-black text-deep-indigo transition-all duration-200 hover:scale-[1.01] active:scale-95 shadow-xl border border-white/20"
        {...props}
      >
        {children}
      </button>
    </div>
  );
};