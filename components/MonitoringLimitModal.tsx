"use client";

import React from 'react';
import { X, BellRing, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface MonitoringLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MonitoringLimitModal: React.FC<MonitoringLimitModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    navigate('/planos');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
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
            className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="p-8 md:p-10 flex flex-col items-center text-center">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <BellRing size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-deep-indigo dark:text-white leading-tight mb-2">
                Deseja Monitorar esse processo?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8">
                Adquira um plano de benefícios para poder monitorar esse processo.
              </p>

              <div className="w-full space-y-3">
                <button 
                  onClick={handleAction}
                  className="w-full py-4 bg-[#1E1B4B] text-white font-bold rounded-2xl hover:bg-[#2d2a5d] transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group"
                >
                  <span className="text-lg">Quero monitorar</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={onClose}
                  className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition-all text-sm"
                >
                  Talvez mais tarde
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MonitoringLimitModal;