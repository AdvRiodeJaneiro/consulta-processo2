"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToastAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

export const ToastAlert: React.FC<ToastAlertProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  actionLabel, 
  onAction, 
  duration = 6000 
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isOpen) {
      setProgress(100);
      const interval = 10;
      const step = (interval / duration) * 100;
      
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - step;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-4"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Bell size={16} />
                </div>
                <p className="text-sm font-medium text-white">{title}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {actionLabel && (
                  <button 
                    onClick={() => {
                      onAction?.();
                      onClose();
                    }}
                    className="bg-primary text-deep-indigo px-4 py-1.5 rounded-lg text-xs font-bold hover:scale-105 transition-all"
                  >
                    {actionLabel}
                  </button>
                )}
                <button onClick={onClose} className="text-slate-500 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1 w-full bg-slate-800">
              <motion.div 
                className="h-full bg-green-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};