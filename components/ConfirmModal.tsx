"use client";

import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description,
  confirmLabel = "Confirmar",
  variant = 'primary'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1E1B4B]/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden relative z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="p-8 text-center">
              <div className={cn(
                "size-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
                variant === 'danger' ? "bg-red-100 text-red-500" : "bg-primary/10 text-primary"
              )}>
                {variant === 'danger' ? <Trash2 size={32} /> : <AlertTriangle size={32} />}
              </div>
              
              <h3 className="text-xl font-black text-deep-indigo dark:text-white leading-tight mb-2">
                {title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">
                {description}
              </p>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "w-full py-4 font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2",
                    variant === 'danger' 
                      ? "bg-red-500 text-white hover:bg-red-600 shadow-red-200 dark:shadow-none" 
                      : "bg-deep-indigo text-white hover:bg-deep-indigo/90 shadow-indigo-200 dark:shadow-none"
                  )}
                >
                  {confirmLabel}
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition-all text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;