"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import {
  Mail,
  Save,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Type,
  Code,
  Sparkles,
  Eye,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body_html: string;
}

export default function EmailTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [activeEditorTab, setActiveEditorTab] = useState<'visual' | 'code'>('visual');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Test dispatch states
  const [testProcessNumber, setTestProcessNumber] = useState('');
  const [isTestingDispatch, setIsTestingDispatch] = useState(false);


  const editorRef = useRef<HTMLDivElement>(null);

  const handleTestDispatch = async () => {
    if (!testProcessNumber.trim()) {
      toast.error("Por favor, informe um número de processo válido.");
      return;
    }
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    setIsTestingDispatch(true);
    const loadingToast = toast.loading("Executando teste de monitoramento (Escavador + Banco + E-mail)...");

    try {
      const { data, error } = await supabase.functions.invoke('cron-process-monitoring', {
        body: {
          test_process_number: testProcessNumber.trim(),
          test_user_id: user.id
        }
      });

      if (error) throw error;

      if (data && data.success) {
        const result = data.results?.[0];
        if (result && result.success) {
          toast.success(`Teste concluído com sucesso! E-mail enviado para ${user.email}.`, { id: loadingToast });
          setTestProcessNumber('');
        } else {
          toast.error(`Erro no processamento: ${result?.error || "Erro desconhecido"}`, { id: loadingToast });
        }
      } else {
        toast.error("Falha ao executar o teste de monitoramento.", { id: loadingToast });
      }
    } catch (err: any) {
      console.error("[EmailTemplates] Erro no teste de disparo:", err);
      toast.error(`Erro técnico: ${err.message || "Erro ao invocar função"}`, { id: loadingToast });
    } finally {
      setIsTestingDispatch(false);
    }
  };

  // Fetch templates from the database
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
      if (data && data.length > 0) {
        // Selecionar o primeiro template por padrão se nenhum estiver selecionado
        const current = selectedTemplate ? data.find(t => t.id === selectedTemplate.id) || data[0] : data[0];
        handleSelectTemplate(current);
      }
    } catch (err: any) {
      console.error("[EmailTemplates] Erro ao buscar templates:", err);
      toast.error("Não foi possível carregar os modelos de e-mail.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setBodyHtml(template.body_html);
    if (editorRef.current) {
      editorRef.current.innerHTML = template.body_html;
    }
  };

  // Sync editor innerHTML when template body_html changes
  useEffect(() => {
    if (editorRef.current && activeEditorTab === 'visual') {
      editorRef.current.innerHTML = bodyHtml;
    }
  }, [selectedTemplate, activeEditorTab]);

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    try {
      // Se o editor de código estiver ativo, salvar o valor da textarea.
      // Se o editor visual estiver ativo, salvar o innerHTML do editorRef.
      const finalHtml = activeEditorTab === 'visual' && editorRef.current 
        ? editorRef.current.innerHTML 
        : bodyHtml;

      const { error } = await supabase
        .from('email_templates')
        .update({
          subject,
          body_html: finalHtml,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      toast.success("Modelo de e-mail salvo com sucesso!");
      // Recarregar para garantir sincronização
      await fetchTemplates();
    } catch (err: any) {
      console.error("[EmailTemplates] Erro ao salvar:", err);
      toast.error("Erro técnico ao salvar o modelo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefault = async () => {
    if (!selectedTemplate) return;
    if (!window.confirm("Deseja realmente restaurar as configurações padrão deste modelo? As alterações atuais serão perdidas.")) {
      return;
    }

    setIsSaving(true);
    try {
      let defaultSubject = '';
      let defaultHtml = '';

      if (selectedTemplate.slug === 'monitoring_confirmation') {
        defaultSubject = '🔍 Monitoramento Ativo - Processo CNJ: {{numero_processo}}';
        defaultHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmação de Monitoramento</title>
  <style>
    body { font-family: sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background-color: #1e1b4b; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: bold; }
    .content { padding: 32px; background-color: #ffffff; }
    .process-card { background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #cbd5e1; }
    .process-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin: 0 0 4px 0; }
    .process-value { font-size: 16px; color: #0f172a; font-weight: bold; margin: 0; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 Monitoramento Ativo</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>{{nome_usuario}}</strong>,</p>
      <p>Confirmamos que o processo abaixo foi adicionado com sucesso ao seu painel de monitoramento:</p>
      
      <div class="process-card">
        <p class="process-label">Número do Processo (CNJ)</p>
        <p class="process-value">{{numero_processo}}</p>
      </div>
      
      <p>A partir de agora, nosso robô fará buscas constantes nos tribunais. Assim que qualquer nova movimentação for publicada, você receberá um resumo detalhado gerado por nossa Inteligência Artificial diretamente em seu e-mail.</p>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
        Para ver o andamento e o histórico de buscas do seu processo, acesse o seu <a href="{{link_painel}}" style="color: #4f46e5; text-decoration: none; font-weight: bold;">Painel de Processos</a>.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Consulta Processo IA. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>`;
      } else if (selectedTemplate.slug === 'monitoring_report_no_progress') {
        defaultSubject = '🔍 Relatório Quinzenal: Sem novas movimentações - Processo CNJ: {{numero_processo}}';
        defaultHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Relatório Quinzenal - Sem Avanço</title>
  <style>
    body { font-family: sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background-color: #4f46e5; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: bold; }
    .content { padding: 32px; background-color: #ffffff; }
    .process-card { background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #cbd5e1; }
    .process-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin: 0 0 4px 0; }
    .process-value { font-size: 16px; color: #0f172a; font-weight: bold; margin: 0; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 Relatório Quinzenal</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>{{nome_usuario}}</strong>,</p>
      <p>Nosso robô de busca realizou a verificação periódica do seu processo monitorado:</p>
      
      <div class="process-card">
        <p class="process-label">Número do Processo (CNJ)</p>
        <p class="process-value">{{numero_processo}}</p>
      </div>
      
      <p><strong>Resultado da verificação:</strong> Não foram encontradas novas movimentações ou avanços no tribunal desde a última verificação.</p>
      <p>Fique tranquilo(a), continuaremos acompanhando de perto e avisaremos assim que houver qualquer novidade.</p>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
        Para ver o histórico completo do seu processo, acesse o seu <a href="{{link_painel}}" style="color: #4f46e5; text-decoration: none; font-weight: bold;">Painel de Processos</a>.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Consulta Processo IA. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>`;
      } else if (selectedTemplate.slug === 'monitoring_report_with_progress') {
        defaultSubject = '🔔 Relatório Quinzenal: Nova movimentação detectada! - Processo CNJ: {{numero_processo}}';
        defaultHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Relatório Quinzenal - Nova Movimentação</title>
  <style>
    body { font-family: sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background-color: #4f46e5; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: bold; }
    .content { padding: 32px; background-color: #ffffff; }
    .process-card { background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #cbd5e1; }
    .process-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin: 0 0 4px 0; }
    .process-value { font-size: 16px; color: #0f172a; font-weight: bold; margin: 0; }
    .movement-card { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0; }
    .movement-title { font-size: 14px; font-weight: bold; color: #b45309; margin: 0 0 8px 0; }
    .movement-text { font-size: 14px; color: #78350f; line-height: 1.6; margin: 0; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn-ia { background-color: #4f46e5; color: #ffffff !important; padding: 14px 28px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Relatório Quinzenal</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>{{nome_usuario}}</strong>,</p>
      <p>Nosso robô de busca identificou um **novo avanço** no seu processo monitorado:</p>
      
      <div class="process-card">
        <p class="process-label">Número do Processo (CNJ)</p>
        <p class="process-value">{{numero_processo}}</p>
      </div>
      
      <div class="movement-card">
        <p class="movement-title">📅 Nova Movimentação Detectada ({{data_movimentacao}})</p>
        <p class="movement-text">{{conteudo_movimentacao}}</p>
      </div>
      
      <p>Os termos jurídicos acima podem ser complexos. Gostaria que nossa Inteligência Artificial traduzisse e explicasse detalhadamente o que essa atualização significa para você?</p>
      
      <div class="btn-container">
        <a href="{{link_explicacao_ia}}" class="btn-ia">✨ Gerar explicação com IA</a>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
        Para ver o histórico completo do seu processo, acesse o seu <a href="{{link_painel}}" style="color: #4f46e5; text-decoration: none; font-weight: bold;">Painel de Processos</a>.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Consulta Processo IA. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>`;
      } else if (selectedTemplate.slug === 'monitoring_paused_no_credits') {
        defaultSubject = '⚠️ Seu monitoramento de processos foi pausado - Saldo Esgotado';
        defaultHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Monitoramento Pausado - Saldo Esgotado</title>
  <style>
    body { font-family: sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background-color: #dc2626; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: bold; }
    .content { padding: 32px; background-color: #ffffff; }
    .process-card { background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #cbd5e1; }
    .process-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin: 0 0 4px 0; }
    .process-value { font-size: 16px; color: #0f172a; font-weight: bold; margin: 0; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn-recharge { background-color: #dc2626; color: #ffffff !important; padding: 14px 28px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2); }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Monitoramento Pausado</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>{{nome_usuario}}</strong>,</p>
      <p>Identificamos que você possui processos ativos em seu painel de monitoramento, mas o seu **saldo de créditos de monitoramento chegou ao fim**.</p>
      
      <div class="process-card">
        <p class="process-label">Processo Afetado (CNJ)</p>
        <p class="process-value">{{numero_processo}}</p>
      </div>
      
      <p>Para garantir que você continue recebendo as atualizações automáticas e relatórios quinzenais do seu processo, adicione mais saldo à sua conta agora mesmo.</p>
      
      <div class="btn-container">
        <a href="{{link_painel}}" class="btn-recharge">💳 Adicionar Créditos</a>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
        Acesse o seu <a href="{{link_painel}}" style="color: #dc2626; text-decoration: none; font-weight: bold;">Painel de Controle</a> para gerenciar seus planos e créditos.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Consulta Processo IA. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>`;
      }

      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: defaultSubject,
          body_html: defaultHtml,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;
      toast.success("Modelo restaurado para o padrão!");
      await fetchTemplates();
    } catch (err: any) {
      console.error("[EmailTemplates] Erro ao restaurar padrão:", err);
      toast.error("Erro ao redefinir modelo padrão.");
    } finally {
      setIsSaving(false);
    }
  };

  // Run formatting commands on the contentEditable area
  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setBodyHtml(editorRef.current.innerHTML);
    }
  };

  // Insert a shortcode at the current cursor position
  const insertShortcode = (shortcode: string) => {
    if (activeEditorTab === 'code') {
      setBodyHtml(prev => prev + shortcode);
      return;
    }

    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // Se não houver seleção/foco, adiciona ao final
      editorRef.current.innerHTML += shortcode;
      setBodyHtml(editorRef.current.innerHTML);
      return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(shortcode);
    range.insertNode(textNode);
    
    // Move o cursor para depois do shortcode inserido
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    setBodyHtml(editorRef.current.innerHTML);
  };

  // Replaces shortcodes with mock data for preview rendering
  const getPreviewHtml = () => {
    let preview = bodyHtml;
    preview = preview.replace(/\{\{nome_usuario\}\}/g, "Adriano");
    preview = preview.replace(/\{\{numero_processo\}\}/g, "5008720-53.2026.8.08.0035");
    preview = preview.replace(/\{\{resumo_ia\}\}/g, "O tribunal deferiu o pedido liminar, determinando que o réu apresente os documentos solicitados no prazo improrrogável de 15 dias úteis, sob pena de multa diária.");
    preview = preview.replace(/\{\{link_painel\}\}/g, "#");
    return preview;
  };

  const getPreviewSubject = () => {
    let preview = subject;
    preview = preview.replace(/\{\{numero_processo\}\}/g, "5008720-53.2026.8.08.0035");
    return preview;
  };

  const shortcodesList = [
    { code: '{{nome_usuario}}', label: 'Nome do Advogado', desc: 'Primeiro nome do usuário logado' },
    { code: '{{numero_processo}}', label: 'Número CNJ', desc: 'Número CNJ formatado do processo' },
    { code: '{{resumo_ia}}', label: 'Resumo IA', desc: 'Resumo interpretativo gerado pela IA (Apenas Atualização)', isUpdateOnly: true },
    { code: '{{link_painel}}', label: 'Link do Painel', desc: 'URL de acesso direto ao processo no sistema' },
  ];

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-deep-indigo dark:text-white tracking-tight">Modelos de E-mail</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Configure as notificações automáticas de monitoramento por e-mail.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRestoreDefault}
              disabled={isSaving || isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Restaurar Padrão
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-deep-indigo font-bold text-xs shadow-md shadow-primary/20 transition-all flex items-center gap-2"
            >
              <Save size={14} />
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>

        {/* Test Dispatch System */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Send size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-deep-indigo dark:text-white">Teste de Disparo de Monitoramento</h3>
              <p className="text-xs text-slate-400">Simule o fluxo completo de monitoramento (busca no Escavador, salvamento no banco e disparo de e-mail) para qualquer processo.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1.5 w-full">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número do Processo (CNJ)</label>
              <input
                value={testProcessNumber}
                onChange={(e) => setTestProcessNumber(e.target.value)}
                placeholder="Ex: 5008720-53.2026.8.08.0035"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground font-semibold"
              />
            </div>
            <button
              onClick={handleTestDispatch}
              disabled={isTestingDispatch || !testProcessNumber.trim()}
              className="px-6 py-3 rounded-xl bg-primary hover:opacity-90 text-deep-indigo font-bold text-sm shadow-md shadow-primary/20 transition-all flex items-center gap-2 shrink-0 w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTestingDispatch ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Disparando...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Disparar Teste de Monitoramento
                </>
              )}
            </button>
          </div>
        </div>


        {/* Template Selector Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto scrollbar-hide">
          {templates.map((temp) => (
            <button
              key={temp.id}
              onClick={() => handleSelectTemplate(temp)}
              className={`px-5 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
                selectedTemplate?.id === temp.id 
                  ? "border-primary text-deep-indigo dark:text-white" 
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              {temp.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-slate-400 uppercase tracking-widest font-black">Carregando modelos...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Editor Side */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card de Configurações Básicas */}
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-deep-indigo dark:text-white uppercase tracking-widest">Configuração do Cabeçalho</h3>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assunto do E-mail</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Alerta de Atualização"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 ml-1">Você pode usar as tags como <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-primary">{"{{numero_processo}}"}</code> no assunto.</p>
                </div>
              </div>

              {/* Editor Tabs */}
              <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (activeEditorTab === 'code' && editorRef.current) {
                          setBodyHtml(bodyHtml);
                        }
                        setActiveEditorTab('visual');
                      }}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                        activeEditorTab === 'visual' 
                          ? "bg-slate-100 dark:bg-slate-800 text-deep-indigo dark:text-white" 
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Type size={14} className="inline mr-1.5" />
                      Editor Visual
                    </button>
                    <button
                      onClick={() => {
                        if (activeEditorTab === 'visual' && editorRef.current) {
                          setBodyHtml(editorRef.current.innerHTML);
                        }
                        setActiveEditorTab('code');
                      }}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                        activeEditorTab === 'code' 
                          ? "bg-slate-100 dark:bg-slate-800 text-deep-indigo dark:text-white" 
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Code size={14} className="inline mr-1.5" />
                      Código HTML Raw
                    </button>
                  </div>

                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <Eye size={14} />
                    {isPreviewMode ? "Voltar ao Editor" : "Ver Prévia Dinâmica"}
                  </button>
                </div>

                {/* VISUAL EDITOR MODE */}
                {activeEditorTab === 'visual' && !isPreviewMode && (
                  <div className="flex-1 flex flex-col min-h-[400px]">
                    {/* Visual Toolbar */}
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap gap-1">
                      <button 
                        onClick={() => executeCommand('bold')}
                        className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Negrito"
                      >
                        <Bold size={16} />
                      </button>
                      <button 
                        onClick={() => executeCommand('italic')}
                        className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Itálico"
                      >
                        <Italic size={16} />
                      </button>
                      <button 
                        onClick={() => executeCommand('underline')}
                        className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Sublinhado"
                      >
                        <Underline size={16} />
                      </button>
                      <button 
                        onClick={() => executeCommand('strikeThrough')}
                        className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Tachado"
                      >
                        <Strikethrough size={16} />
                      </button>
                      <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 self-center mx-1" />
                      <button 
                        onClick={() => executeCommand('formatBlock', '<h1>')}
                        className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs text-slate-600 dark:text-slate-300"
                        title="Título 1"
                      >
                        <Heading1 size={16} />
                      </button>
                      <button 
                        onClick={() => executeCommand('formatBlock', '<h2>')}
                        className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs text-slate-600 dark:text-slate-300"
                        title="Título 2"
                      >
                        <Heading2 size={16} />
                      </button>
                      <button 
                        onClick={() => executeCommand('formatBlock', '<p>')}
                        className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs text-slate-600 dark:text-slate-300"
                        title="Texto Normal"
                      >
                        P
                      </button>
                    </div>

                    {/* Content editable wrapper */}
                    <div 
                      ref={editorRef}
                      contentEditable={true}
                      onInput={(e) => setBodyHtml(e.currentTarget.innerHTML)}
                      className="flex-1 p-6 outline-none prose max-w-none dark:prose-invert bg-white dark:bg-slate-900 text-foreground overflow-y-auto max-h-[500px]"
                      style={{ minHeight: '350px' }}
                    />
                  </div>
                )}

                {/* CODE MODE */}
                {activeEditorTab === 'code' && !isPreviewMode && (
                  <div className="flex-1 flex flex-col min-h-[400px]">
                    <textarea
                      value={bodyHtml}
                      onChange={(e) => setBodyHtml(e.target.value)}
                      className="flex-1 w-full p-6 outline-none bg-slate-950 text-emerald-400 font-mono text-xs overflow-y-auto resize-none"
                      style={{ minHeight: '400px' }}
                      placeholder="Coloque seu código HTML aqui..."
                    />
                  </div>
                )}

                {/* PREVIEW MODE */}
                {isPreviewMode && (
                  <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-6 flex justify-center">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-[600px] overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-100 p-4 text-xs space-y-1 font-mono text-slate-500">
                        <p><span className="font-bold">De:</span> Consulta Processo &lt;consultaprocesso@advogadoriodejaneiro.com&gt;</p>
                        <p><span className="font-bold">Para:</span> adriano@advogadoriodejaneiro.com</p>
                        <p><span className="font-bold">Assunto:</span> {getPreviewSubject()}</p>
                      </div>
                      <div className="p-4 overflow-y-auto bg-slate-50 max-h-[450px]">
                        <div 
                          dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                          className="bg-white rounded-xl shadow-sm overflow-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar with Shortcodes & Explanations */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Shortcodes Tool */}
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-deep-indigo dark:text-white">Variáveis Dinâmicas</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Clique nas variáveis abaixo para inseri-las no ponto exato do seu e-mail. Elas serão substituídas automaticamente antes de cada envio:
                </p>

                <div className="space-y-3">
                  {shortcodesList.map((sc) => (
                    <button
                      key={sc.code}
                      onClick={() => insertShortcode(sc.code)}
                      disabled={sc.isUpdateOnly && selectedTemplate?.slug === 'monitoring_confirmation'}
                      className={`w-full text-left p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/40 bg-slate-50/50 dark:bg-slate-900/50 transition-all flex items-start gap-2.5 hover:shadow-sm ${
                        sc.isUpdateOnly && selectedTemplate?.slug === 'monitoring_confirmation' 
                          ? "opacity-40 cursor-not-allowed hover:border-slate-100" 
                          : ""
                      }`}
                    >
                      <div className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 rounded-md mt-0.5">
                        {sc.code}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-deep-indigo dark:text-white">{sc.label}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">{sc.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedTemplate?.slug === 'monitoring_confirmation' && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 rounded-xl text-xs flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <p className="leading-relaxed text-[11px]">
                      A variável <code className="font-bold font-mono text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-1 rounded">{"{{resumo_ia}}"}</code> só está ativa no template de <strong>Atualizações</strong>, pois nas confirmações ainda não houve movimentação.
                    </p>
                  </div>
                )}
              </div>

              {/* Guia de Edição */}
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle size={16} className="text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none">Guia de Edição</h4>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed space-y-2">
                  <p>✓ Para aplicar formatações, você pode selecionar o texto no <strong>Editor Visual</strong> e clicar nos botões de estilo (Negrito, Itálico, etc.).</p>
                  <p>✓ Se preferir colocar um estilo totalmente personalizado (imagens, logos, cores), alterne para o modo <strong>Código HTML Raw</strong>.</p>
                  <p>✓ Use a <strong>Prévia Dinâmica</strong> a qualquer momento para verificar o alinhamento e o layout final antes de salvar.</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// Declarar Loader2 auxiliar para uso de animação de carregamento
const Loader2 = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    className={className} 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
