"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MousePointerClick, 
  BellRing,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const StepsCard = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { num: 1, title: "Faça uma busca", icon: Search, color: "text-[#1E1B4B]" },
    { num: 2, title: "Selecione o processo", icon: MousePointerClick, color: "text-[#1E1B4B]" },
    { num: 3, title: "Clique em monitorar", icon: BellRing, color: "text-[#1E1B4B]" },
    { num: 4, title: "Receba no E-mail", icon: Mail, isEmail: true, color: "text-indigo-600" }
  ];

  // Lógica de tempo para alternar os passos no mobile
  useEffect(() => {
    const delays = [2000, 2000, 2000, 4500]; 
    
    const timer = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, delays[activeStep]);

    return () => clearTimeout(timer);
  }, [activeStep, steps.length]);

  return (
    <div className="w-full mb-8 relative">
      <style>{`
        .bg-dashed-line {
          background-image: linear-gradient(to right, #e5e7eb 50%, transparent 50%);
          background-size: 10px 1px;
          background-repeat: repeat-x;
        }
        .dark .bg-dashed-line {
          background-image: linear-gradient(to right, #334155 50%, transparent 50%);
        }
      `}</style>
      
      {/* COMPONENTE DESKTOP */}
      <div className="hidden md:block w-full relative px-10 py-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="absolute top-[45%] left-12 right-12 h-[2px] bg-dashed-line -translate-y-1/2 z-0" />
        
        <motion.div
          initial={{ left: '3rem', opacity: 0 }}
          animate={{ left: 'calc(100% - 3rem)', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute top-[45%] w-3 h-3 bg-[#FFCC33] rounded-full shadow-[0_0_10px_#FFCC33] -translate-y-1/2 -translate-x-1/2 z-0"
        />

        <div className="flex justify-between items-center relative z-10">
          {steps.map((step, index) => (
            <motion.div 
              key={step.num}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="flex flex-col items-center gap-3 w-32"
            >
              <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-800 shadow-md border",
                    step.isEmail ? 'border-indigo-500 shadow-indigo-100 dark:shadow-indigo-950/10' : 'border-gray-100 dark:border-slate-700'
                  )}
                >
                  <step.icon size={24} className={cn(step.color, !step.isEmail && "dark:text-white")} />
                </motion.div>

                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FFCC33] text-[#1E1B4B] text-xs font-black flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                  {step.num}
                </div>

                {step.isEmail && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-indigo-600/30 rounded-2xl -z-10"
                  />
                )}
              </div>

              <p className={cn(
                "text-center text-sm font-bold leading-tight",
                step.isEmail ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-slate-400'
              )}>
                {step.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* COMPONENTE MOBILE */}
      <div className="md:hidden w-full relative h-48 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute flex flex-col items-center gap-4 w-full px-4"
          >
            <div className="relative">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-800 shadow-md border",
                steps[activeStep].isEmail ? 'border-indigo-500 shadow-indigo-100 dark:shadow-indigo-950/10' : 'border-gray-100 dark:border-slate-700'
              )}>
                {(() => {
                  const StepIcon = steps[activeStep].icon;
                  return <StepIcon size={28} className={cn(steps[activeStep].color, !steps[activeStep].isEmail && "dark:text-white")} />;
                })()}
              </div>

              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#FFCC33] text-[#1E1B4B] text-sm font-black flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                {steps[activeStep].num}
              </div>

              {steps[activeStep].isEmail && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-indigo-600/30 rounded-2xl -z-10"
                />
              )}
            </div>

            <p className={cn(
              "text-center text-base font-bold leading-tight",
              steps[activeStep].isEmail ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-slate-400'
            )}>
              {steps[activeStep].title}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-4 flex gap-2">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === activeStep ? 'w-5 bg-[#FFCC33]' : 'w-1.5 bg-gray-200 dark:bg-slate-700'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepsCard;