"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { 
  Globe, 
  Save, 
  Loader2, 
  HelpCircle, 
  Eye, 
  Search, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SeoManagement() {
  const [seoTitle, setSeoTitle] = useState('Consulta Processo IA');
  const [seoDescription, setSeoDescription] = useState('Monitore seus processos jurídicos e receba notificações inteligentes direto no seu e-mail.');
  const [seoKeywords, setSeoKeywords] = useState('consulta, processo, cnj, monitoramento, email, ia, escavador');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar as configurações atuais de SEO do banco
  const fetchSeoSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('seo_title, seo_description, seo_keywords')
        .eq('id', 'global_limits')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (data.seo_title) setSeoTitle(data.seo_title);
        if (data.seo_description) setSeoDescription(data.seo_description);
        if (data.seo_keywords) setSeoKeywords(data.seo_keywords);
      }
    } catch (err: any) {
      console.error("[SeoManagement] Erro ao carregar SEO:", err);
      toast.error("Erro ao carregar as configurações de SEO.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (seoTitle.length > 60) {
      toast.error("O título deve conter preferencialmente até 60 caracteres.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          id: 'global_limits',
          seo_title: seoTitle,
          seo_description: seoDescription,
          seo_keywords: seoKeywords,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Atualizar o cabeçalho dinamicamente em tempo real para o admin
      document.title = seoTitle;

      const updateMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      const updateOgTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateMetaTag('description', seoDescription);
      updateMetaTag('keywords', seoKeywords);
      updateOgTag('og:title', seoTitle);
      updateOgTag('og:description', seoDescription);

      toast.success("Configurações de SEO salvas com sucesso!");
    } catch (err: any) {
      console.error("[SeoManagement] Erro ao salvar:", err);
      toast.error("Erro ao salvar as configurações no banco de dados.");
    } finally {
      setSaving(false);
    }
  };

  // Cores de feedback para contagem de caracteres
  const getTitleLengthColor = () => {
    if (seoTitle.length === 0) return "text-red-500";
    if (seoTitle.length <= 60) return "text-emerald-500 font-bold";
    return "text-amber-500 font-bold";
  };

  const getDescLengthColor = () => {
    const len = seoDescription.length;
    if (len >= 120 && len <= 160) return "text-emerald-500 font-bold";
    if (len > 0 && len < 120) return "text-amber-500 font-bold";
    if (len > 160) return "text-red-500 font-bold";
    return "text-slate-400";
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-deep-indigo dark:text-white tracking-tight">Otimização de SEO Google</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Gerencie metatags globais e impulsione o rankeamento nos mecanismos de busca.</p>
          </div>
          <button 
            type="submit"
            form="seo-form"
            disabled={saving || loading}
            className="flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-deep-indigo px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all duration-200 disabled:opacity-50 shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
            {saving ? "Salvando..." : "Salvar Configurações"}
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs text-slate-400 uppercase tracking-widest font-black">Carregando configurações de SEO...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Coluna 1 & 2: Formulário */}
            <div className="lg:col-span-2 space-y-6">
              <form id="seo-form" onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-[28px] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-deep-indigo dark:text-white">Meta Tags Globais</h3>
                    <p className="text-xs text-slate-400">Edite as tags HTML lidas pelo Google e mídias sociais.</p>
                  </div>
                </div>

                {/* Título de SEO */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Título de SEO (Title Tag) *</label>
                    <span className={`text-[10px] ${getTitleLengthColor()}`}>
                      {seoTitle.length} / 60 caracteres
                    </span>
                  </div>
                  <input
                    required
                    maxLength={100}
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Ex: Consulta Processo IA - Monitoramento de Andamentos"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed px-1">
                    Idealmente entre 50 e 60 caracteres. Títulos maiores serão cortados pelo Google nos resultados de buscas de computadores e celulares.
                  </p>
                </div>

                {/* Descrição de SEO */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Descrição (Meta Description) *</label>
                    <span className={`text-[10px] ${getDescLengthColor()}`}>
                      {seoDescription.length} / 160 caracteres (Recomendado: 120-160)
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    maxLength={300}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Ex: Monitore os processos dos seus clientes nos tribunais e receba notificações imediatas por e-mail com resumos simplificados por IA."
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed px-1">
                    Um resumo atraente do seu site que induz o usuário a clicar no seu resultado. Deve conter entre 120 e 160 caracteres para visualização perfeita.
                  </p>
                </div>

                {/* Palavras-Chave de SEO */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Palavras-Chave (Meta Keywords)</label>
                  </div>
                  <input
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="Ex: advogado, processo, cnj, tribunal, justiça, ia"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-primary/20 transition-all text-foreground font-mono text-xs"
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed px-1">
                    Insira termos de pesquisa importantes para o seu negócio separados por vírgula.
                  </p>
                </div>
              </form>
            </div>

            {/* Coluna 3: Prévia e Dicas */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Google Snippet Live Preview */}
              <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-slate-400" />
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Prévia no Google Search</h4>
                </div>

                <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                  {/* Google Logo / Search simulation */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono pb-2 border-b border-dashed border-slate-200 dark:border-slate-800">
                    <Search size={12} />
                    <span>google.com/search</span>
                  </div>

                  {/* URL */}
                  <div className="text-[11px] text-[#202124] dark:text-slate-300 truncate font-sans">
                    https://advogadoriodejaneiro.com <span className="text-slate-400">&gt; home</span>
                  </div>

                  {/* Title (Standard Google Blue/Purple link) */}
                  <h4 className="text-[19px] leading-tight text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-sans truncate font-medium">
                    {seoTitle || "Consulta Processo IA"}
                  </h4>

                  {/* Snippet Description */}
                  <p className="text-xs text-[#4d5156] dark:text-slate-400 leading-relaxed font-sans line-clamp-2">
                    {seoDescription || "Insira uma descrição meta personalizada para que seus clientes em potencial encontrem sua plataforma jurídica no topo dos resultados de pesquisa do Google."}
                  </p>
                </div>

                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-800 dark:text-indigo-400 rounded-xl text-[11px] leading-relaxed flex gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <p>
                    <strong>Análise do Robô:</strong> A prévia acima é atualizada em tempo real conforme você edita o formulário. Use-a para evitar que seu título seja cortado!
                  </p>
                </div>
              </div>


            </div>

          </div>
        )}

      </div>
    </div>
  );
}
