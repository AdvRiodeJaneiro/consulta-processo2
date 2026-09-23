import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Gavel, ArrowLeft } from 'lucide-react';
import { AuthForm } from '../components/AuthForm';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica se deve iniciar no modo cadastro (ex: vindo do modal de monitoramento ou whatsapp)
  const isSignupMode = location.state?.mode === 'signup';
  const initialWhatsapp = location.state?.whatsapp || '';
  const isResetMode = location.search.includes('reset=true') || location.hash.includes('type=recovery');

  const getSubTitle = () => {
    if (isResetMode) {
      return "Defina uma nova senha para restabelecer o acesso à sua conta";
    }
    return "Acesse sua conta para monitorar andamentos do seu processo por e-mail";
  };

  const handleBack = () => {
    // Se houver histórico de navegação, volta. Senão vai para a home.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-deep-indigo/10 rounded-full blur-[120px]" />
      </div>

      <button 
        onClick={handleBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors z-20 p-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Voltar</span>
      </button>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="size-16 rounded-2xl bg-primary mx-auto flex items-center justify-center text-deep-indigo shadow-lg mb-4">
            <Gavel className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-deep-indigo dark:text-white">Consulta Processo</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {getSubTitle()}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800">
          <AuthForm 
            defaultIsLogin={!isSignupMode} 
            initialWhatsapp={initialWhatsapp}
          />
        </div>
      </div>
    </div>
  );
}