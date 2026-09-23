import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Phone, Loader2, FileText, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GlowingButton } from './GlowingButton';
import { handleAuthSuccess } from '../utils/navigation';

interface AuthFormProps {
  onSuccess?: () => void;
  defaultIsLogin?: boolean;
  initialWhatsapp?: string;
}

// Validador matemático e estrutural de CPF real
const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Rejeita CPFs com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

export const AuthForm: React.FC<AuthFormProps> = ({ 
  onSuccess, 
  defaultIsLogin = true,
  initialWhatsapp = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Detecta se viemos do link de redefinição de senha
  const [isResettingPassword, setIsResettingPassword] = useState(
    location.search.includes('reset=true') || location.hash.includes('type=recovery')
  );

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    whatsapp: initialWhatsapp,
    cpf: ''
  });

  useEffect(() => {
    if (initialWhatsapp) {
      setFormData(prev => ({ ...prev, whatsapp: initialWhatsapp }));
      setIsLogin(false);
    }
  }, [initialWhatsapp]);

  // Atualiza se houver mudança de URL (por exemplo, clicou no link de recuperação)
  useEffect(() => {
    if (location.search.includes('reset=true') || location.hash.includes('type=recovery')) {
      setIsResettingPassword(true);
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Máscara e formatação dinâmica de CPF (000.000.000-00)
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = rawValue;
    
    if (rawValue.length > 3) {
      formatted = `${rawValue.slice(0, 3)}.${rawValue.slice(3)}`;
    }
    if (rawValue.length > 6) {
      formatted = `${formatted.slice(0, 7)}.${rawValue.slice(6)}`;
    }
    if (rawValue.length > 9) {
      formatted = `${formatted.slice(0, 11)}-${rawValue.slice(9)}`;
    }
    
    setFormData({ ...formData, cpf: formatted });
  };

  // Envia e-mail de recuperação de senha
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Informe o seu e-mail');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      if (error) throw error;
      toast.success('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setIsForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar e-mail de recuperação');
    } finally {
      setLoading(false);
    }
  };

  // Salva a nova senha redefinida
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.password || formData.password.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });
      if (error) throw error;
      toast.success('Sua senha foi redefinida com sucesso!');
      setIsResettingPassword(false);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success('Bem-vindo de volta!');
        handleAuthSuccess(navigate, location.state, onSuccess);
      } else {
        // Validações do Cadastro
        if (!formData.firstName) {
          toast.error('O nome é obrigatório');
          setLoading(false);
          return;
        }

        if (!formData.cpf) {
          toast.error('O CPF é obrigatório');
          setLoading(false);
          return;
        }

        // Validação estrutural do CPF
        if (!validateCPF(formData.cpf)) {
          toast.error('CPF inválido. Insira um CPF válido para continuar.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              whatsapp: formData.whatsapp,
              cpf: formData.cpf.replace(/\D/g, '') // Salva o CPF limpo (apenas números) no metadata
            }
          }
        });
        
        if (error) throw error;

        // Se o Supabase retornar uma sessão imediatamente (confirmação de email OFF)
        if (data.session) {
          toast.success('Conta criada com sucesso!');
          handleAuthSuccess(navigate, location.state, onSuccess);
        } else {
          toast.success('Conta criada! Verifique seu e-mail.');
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      const errMsg = error.message || '';
      // Captura o erro específico de CPF já cadastrado no banco de dados
      if (
        errMsg.includes('profiles_cpf_unique') || 
        errMsg.toLowerCase().includes('duplicate key') || 
        errMsg.toLowerCase().includes('cpf já existe')
      ) {
        toast.error('Este CPF já existe na nossa base de dados.');
      } else {
        toast.error(error.message || 'Ocorreu um erro ao criar conta');
      }
    } finally {
      setLoading(false);
    }
  };

  // 1. VIEW: Redefinir Senha (Vindo do link do E-mail)
  if (isResettingPassword) {
    return (
      <div className="w-full">
        <div className="text-center mb-6">
          <div className="size-12 rounded-xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 mx-auto mb-3">
            <KeyRound size={24} />
          </div>
          <h3 className="text-xl font-bold text-deep-indigo dark:text-white">Defina sua nova senha</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Insira uma nova senha de segurança para a sua conta.
          </p>
        </div>

        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nova Senha *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                required
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
              />
            </div>
          </div>

          <GlowingButton 
            type="submit" 
            className="w-full py-4 mt-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Salvar Nova Senha'
            )}
          </GlowingButton>
        </form>
      </div>
    );
  }

  // 2. VIEW: Solicitar Recuperação de Senha (Esqueci minha senha)
  if (isForgotPassword) {
    return (
      <div className="w-full">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-deep-indigo dark:text-white">Recuperar Senha</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enviaremos um link de redefinição de senha para o seu e-mail de cadastro.
          </p>
        </div>

        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Seu E-mail *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                required
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
              />
            </div>
          </div>

          <GlowingButton 
            type="submit" 
            className="w-full py-4 mt-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Enviar Link de Recuperação'
            )}
          </GlowingButton>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsForgotPassword(false)}
            className="text-sm font-bold text-primary hover:underline transition-all"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    );
  }

  // 3. VIEW: Login ou Cadastro Padrão
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  name="firstName"
                  type="text"
                  placeholder="Ex: João"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Sobrenome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="lastName"
                  type="text"
                  placeholder="Ex: Silva"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                />
              </div>
            </div>
          </div>
        )}

        {!isLogin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">CPF *</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  name="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleCpfChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="whatsapp"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              required
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
            {isLogin && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-[11px] font-bold text-primary hover:underline"
              >
                Esqueceu sua senha?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              required
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
            />
          </div>
        </div>

        <GlowingButton 
          type="submit" 
          className="w-full py-4 mt-4"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            isLogin ? 'Entrar' : 'Criar Conta'
          )}
        </GlowingButton>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
        >
          {isLogin ? (
            <>Não tem uma conta? <span className="text-primary font-bold">Cadastre-se</span></>
          ) : (
            <>Já tem uma conta? <span className="text-primary font-bold">Faça login</span></>
          )}
        </button>
      </div>
    </div>
  );
};
