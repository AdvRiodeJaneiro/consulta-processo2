import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Info,
  Calendar,
  User,
  MapPin,
  Scale,
  History,
  MessageSquare,
  ChevronUp,
  X,
  Bell
} from 'lucide-react';
import { useProcessDetails } from '../hooks/useProcessDetails';
import { ChatBubble } from '../components/ChatBubble';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../integrations/supabase/client';

const ProcessTimeline: React.FC = () => {
  const { cnj } = useParams();
  const navigate = useNavigate();
  const { processData, aiMessages, isLoading, error } = useProcessDetails(cnj);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Carrega histórico de notificações do banco de dados
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!cnj) return;
      const { data } = await supabase
        .from('process_notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Filtramos no front pelo número do processo (poderia ser feito no SQL via join se necessário)
      // Como estamos buscando direto, se o usuário tiver muitos processos, o ideal é filtrar no DB
      // Para simplificar agora, pegamos as do processo atual baseado no processData se disponível
    };
    fetchNotifications();
  }, [cnj]);

  // Busca notificações específicas deste processo
  useEffect(() => {
    if (processData) {
        supabase
          .from('process_notifications')
          .select('*')
          .eq('process_id', (processData as any).id || '')
          .order('created_at', { ascending: false })
          .then(({ data }) => setNotifications(data || []));
    }
  }, [processData]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/meus-processos');
  };

  if (error && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-red-100 max-w-md">
           <h2 className="text-xl font-bold text-red-500 mb-2">Ops! Algo deu errado</h2>
           <p className="text-slate-500 mb-6">{error}</p>
           <button onClick={handleBack} className="bg-primary text-deep-indigo px-6 py-2 rounded-xl font-bold">Voltar</button>
        </div>
      </div>
    );
  }

  const InfoContent = () => (
    <div className="space-y-8 pb-10">
        {/* Histórico de Notificações - NOVO */}
        {notifications.length > 0 && (
            <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Bell size={16} className="text-primary" />
                Alertas Enviados (WhatsApp)
                </h3>
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div key={notif.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">Alerta</span>
                                <span className="text-[10px] font-bold text-slate-400 ml-auto">{notif.movement_date}</span>
                            </div>
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{notif.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Info size={16} className="text-primary" />
            Dados do Processo
            </h3>
            <div className="space-y-5">
            {isLoading ? (
                [1,2,3].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)
            ) : (
                <>
                    <DetailItem icon={<Scale size={16} />} label="Assunto" value={processData?.fontes?.[0]?.capa?.assunto || "Não informado"} />
                    <DetailItem icon={<User size={16} />} label="Polo Ativo" value={processData?.titulo_polo_ativo || "Não informado"} />
                    <DetailItem icon={<User size={16} />} label="Polo Passivo" value={processData?.titulo_polo_passivo || "Não informado"} />
                </>
            )}
            </div>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <History size={16} className="text-primary" />
            Movimentações do Tribunal
            </h3>
            <div className="space-y-4">
                {processData?.movimentacoes?.slice(0, 10).map((move, idx) => (
                    <div key={idx} className="relative pl-6 pb-6 border-l-2 border-slate-100 dark:border-slate-800 last:border-0">
                        <div className="absolute left-[-9px] top-0 size-4 rounded-full bg-white dark:bg-slate-900 border-2 border-primary" />
                        <div className="flex flex-col">
                            <time className="text-[10px] font-black text-primary uppercase mb-1">{move.data}</time>
                            <p className="text-xs font-bold text-deep-indigo dark:text-white mb-1 leading-tight">{move.tipo}</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">{move.conteudo}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 md:p-6 z-[60] shrink-0">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
          <button onClick={handleBack} className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-primary transition-all active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">Monitorado</span>
            </div>
            <h2 className="text-base md:text-xl font-black text-deep-indigo dark:text-white truncate">{cnj}</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <div className="flex-1 overflow-y-auto scrollbar-hide lg:border-r border-slate-200 dark:border-slate-800 h-full">
           <div className="max-w-3xl mx-auto p-4 md:p-8 pb-32">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-deep-indigo">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-lg md:text-xl font-black text-deep-indigo dark:text-white">Análise do Presente</h3>
              </div>
              {isLoading ? (
                <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ) : (
                aiMessages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
              )}
           </div>
        </div>

        <div className="hidden lg:block w-[400px] bg-white dark:bg-slate-900 overflow-y-auto p-6 scrollbar-hide">
          <InfoContent />
        </div>

        <div className="lg:hidden">
          <AnimatePresence>
            {isSheetOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSheetOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" />}
          </AnimatePresence>
          <motion.div
            animate={{ y: isSheetOpen ? 0 : "calc(100% - 70px)" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t border-slate-200 dark:border-slate-800 z-[80] flex flex-col max-h-[90vh]"
          >
            <div onClick={() => setIsSheetOpen(!isSheetOpen)} className="pt-3 pb-5 flex flex-col items-center gap-3 cursor-pointer">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="flex items-center justify-between w-full px-8">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                  <Bell size={16} /> Dados & Alertas
                </div>
                {isSheetOpen ? <X size={20} className="text-slate-400" /> : <ChevronUp size={20} className="text-primary animate-bounce" />}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-10 scrollbar-hide"><InfoContent /></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex gap-4">
    <div className="size-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100 dark:border-slate-700">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xs font-bold text-deep-indigo dark:text-white leading-tight break-words">{value}</p>
    </div>
  </div>
);

export default ProcessTimeline;