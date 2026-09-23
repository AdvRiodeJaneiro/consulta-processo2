"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  CheckCircle2, 
  Smartphone,
  Send,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface WhatsappModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phone: string) => void;
  initialValue?: string;
}

const WhatsappModal: React.FC<WhatsappModalProps> = ({ isOpen, onClose, onSave, initialValue = '' }) => {
  const [phone, setPhone] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  // Sincroniza o estado interno com o valor inicial quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setPhone(initialValue);
      // Se já tem um número, começa no modo visualização, senão começa editando
      setIsEditing(!initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSave = () => {
    if (phone.trim()) {
      onSave(phone);
      setIsEditing(false);
      toast.success('WhatsApp configurado com sucesso!');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1E1B4B]/40 backdrop-blur-sm"
        />
        
        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative z-10"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={20} />
          </button>

          {/* ANIMATION AREA: "CONNECTED AND READY" */}
          <div className="bg-gradient-to-b from-gray-50 to-white pt-12 pb-6 flex flex-col items-center justify-center overflow-hidden">
            <div className="relative w-32 h-32 flex items-center justify-center">
              
              {/* Pulse Circles */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ 
                    scale: [0.6, 2.2], 
                    opacity: [0, 0.5, 0] 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3, 
                    delay: i * 1,
                    ease: "linear" 
                  }}
                  className="absolute inset-0 border-2 border-[#25D366] rounded-full"
                />
              ))}

              {/* Central WhatsApp Icon */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative z-10 bg-white p-5 rounded-[24px] shadow-xl shadow-green-100 border border-green-50"
              >
                <MessageCircle size={48} className="text-[#25D366]" fill="#25D366" />
                
                {/* Verified Badge */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute -top-2 -right-2 bg-[#25D366] text-white p-1 rounded-full border-4 border-white"
                >
                  <CheckCircle2 size={16} strokeWidth={3} />
                </motion.div>
              </motion.div>

              {/* Floating Send Icon (Notification leaving) */}
              <motion.div
                animate={{ 
                  x: [0, 40, 0], 
                  y: [0, -30, 0],
                  opacity: [0, 1, 0] 
                }}
                transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                className="absolute text-[#FFCC33]"
              >
                <Send size={14} />
              </motion.div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-[#128C7E] uppercase tracking-wider">
                {initialValue && !isEditing ? 'Conectado' : 'Sistema Pronto'}
              </span>
            </div>
          </div>

          {/* FORM CONTENT */}
          <div className="px-10 pb-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#1E1B4B] mb-2 leading-tight">
                Receba atualização no seu WhatsApp
              </h3>
              <p className="text-gray-500 text-sm">
                Informe o WhatsApp que deseja receber as atualizações sobre seus processos.
              </p>
            </div>

            {/* INPUT FIELD OR SAVED VIEW */}
            <div className="space-y-4">
              {initialValue && !isEditing ? (
                // SAVED NUMBER VIEW
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#25D366]/10 p-2 rounded-lg">
                      <Smartphone size={20} className="text-[#25D366]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Número Configurado</p>
                      <p className="text-lg font-bold text-[#1E1B4B]">{initialValue}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-100"
                  >
                    <Edit2 size={18} />
                  </button>
                </motion.div>
              ) : (
                // INPUT FIELD VIEW
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#25D366] transition-colors">
                    <Smartphone size={20} />
                  </div>
                  <input 
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoFocus
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#FFCC33] focus:bg-white outline-none transition-all text-[#1E1B4B] font-medium placeholder:text-gray-300"
                  />
                </motion.div>
              )}

              {/* ACTION BUTTONS */}
              <div className="pt-2 space-y-3">
                {(!initialValue || isEditing) ? (
                  <button 
                    onClick={handleSave}
                    disabled={!phone.trim()}
                    className="w-full py-4 bg-[#1E1B4B] text-white font-bold rounded-2xl hover:bg-[#2d2a5d] transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Salvar e Conectar
                  </button>
                ) : (
                  <button 
                    onClick={onClose}
                    className="w-full py-4 bg-[#1E1B4B] text-white font-bold rounded-2xl hover:bg-[#2d2a5d] transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    Fechar
                  </button>
                )}
                
                {isEditing && initialValue && (
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="w-full py-2 text-gray-400 font-bold hover:text-gray-600 transition-all text-sm"
                  >
                    Voltar
                  </button>
                )}
                
                {!isEditing && !initialValue && (
                  <button 
                    onClick={onClose}
                    className="w-full py-2 text-gray-400 font-bold hover:text-gray-600 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WhatsappModal;