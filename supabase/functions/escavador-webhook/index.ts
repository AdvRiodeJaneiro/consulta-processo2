import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-escavador-token',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const payload = await req.json();
    const eventType = payload.evento;
    const monitoramentoId = payload.monitoramento_id;
    const cnj = payload.processo?.numero_cnj || payload.numero_cnj;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: proc, error: dbError } = await supabase
      .from('monitored_processes')
      .select('*')
      .eq('escavador_monitoring_id', monitoramentoId)
      .maybeSingle();

    if (!proc) return new Response("OK", { status: 200 });

    // Buscar e-mail de login/cadastro do usuário para as notificações por e-mail
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email, first_name')
      .eq('id', proc.user_id)
      .maybeSingle();

    const userEmail = userProfile?.email;

    // Se recebermos QUALQUER evento e o processo estiver PENDENTE, significa que ele foi "achado"
    const isFirstTime = proc.status === 'PENDENTE';

    if (eventType === 'nova_movimentacao' || isFirstTime) {
      const conteudoBruto = payload.data?.conteudo || payload.movimentacao?.conteudo || "Processo localizado e agora está sendo monitorado.";
      const dataMov = payload.data?.data || payload.movimentacao?.data || new Date().toLocaleDateString('pt-BR');

      // Tradução IA - Migrado para DeepSeek V4
      let resumoSimples = conteudoBruto;
      const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
      
      if (deepseekKey) {
        try {
          const prompt = isFirstTime 
            ? `Faça um resumo de boas-vindas curto (máximo 140 caracteres) dizendo que o processo foi localizado e o estado atual é: "${conteudoBruto}"`
            : `Resuma esta movimentação jurídica para um cliente leigo em no máximo 140 caracteres: "${conteudoBruto}"`;
          
          const aiRes = await fetch(`https://api.deepseek.com/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${deepseekKey}`
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                { role: "system", content: "Você é um assistente jurídico que resume atualizações processuais para leigos de forma clara e concisa." },
                { role: "user", content: prompt }
              ],
              max_tokens: 150
            })
          });
          
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            resumoSimples = aiData.choices?.[0]?.message?.content || resumoSimples;
          } else {
            console.error("[escavador-webhook] Falha na API DeepSeek:", await aiRes.text());
          }
        } catch (e) { 
          console.error("[escavador-webhook] Erro técnico na IA (DeepSeek):", e); 
        }
      }

      // 1. SALVAR NOTIFICAÇÃO
      await supabase.from('process_notifications').insert({
        process_id: proc.id,
        user_id: proc.user_id,
        content: resumoSimples,
        movement_date: dataMov
      });

      // 2. DISPARO DE E-MAIL (RESEND)
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey && userEmail) {
        const header = isFirstTime ? "✅ Processo Localizado!" : "🔔 Nova Atualização";
        let finalSubject = `${isFirstTime ? '✅ Processo Localizado' : '🔔 Nova Atualização'} - CNJ: ${cnj}`;
        
        // Template padrão em caso de falha de carregamento
        let emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${header}</title>
            <style>
              body { font-family: sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
              .header { background-color: #4f46e5; color: #ffffff; padding: 24px; text-align: center; }
              .header h1 { margin: 0; font-size: 20px; font-weight: bold; }
              .content { padding: 32px; background-color: #ffffff; }
              .process-card { background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #cbd5e1; }
              .process-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin: 0 0 4px 0; }
              .process-value { font-size: 16px; color: #0f172a; font-weight: bold; margin: 0; }
              .summary-title { font-size: 14px; font-weight: bold; color: #4f46e5; margin: 0 0 8px 0; }
              .summary-text { font-size: 14px; color: #334155; line-height: 1.6; margin: 0; }
              .footer { text-align: center; padding: 24px; font-size: 12px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${header}</h1>
              </div>
              <div class="content">
                <div class="process-card">
                  <p class="process-label">Número do Processo (CNJ)</p>
                  <p class="process-value">${cnj}</p>
                  <p class="process-label" style="margin-top: 12px;">Data da Movimentação</p>
                  <p class="process-value" style="font-size: 14px; font-weight: normal;">${dataMov}</p>
                </div>
                
                <h3 class="summary-title">Resumo Simplificado (Inteligência Artificial)</h3>
                <p class="summary-text">${resumoSimples}</p>
                
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                
                <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
                  Para acompanhar todos os seus processos, acesse o painel da sua conta.
                </p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Consulta Processo IA. Todos os direitos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        try {
          const { data: templateData } = await supabase
            .from('email_templates')
            .select('subject, body_html')
            .eq('slug', 'process_update')
            .maybeSingle();

          if (templateData) {
            const userName = userProfile?.first_name || "Doutor(a)";
            const linkPainel = `https://consultaprocesso.advogadoriodejaneiro.com/meus-processos`;

            let body = templateData.body_html;
            body = body.replace(/\{\{nome_usuario\}\}/g, userName);
            body = body.replace(/\{\{numero_processo\}\}/g, cnj);
            body = body.replace(/\{\{resumo_ia\}\}/g, resumoSimples);
            body = body.replace(/\{\{link_painel\}\}/g, linkPainel);
            
            emailHtml = body;

            let subj = templateData.subject;
            subj = subj.replace(/\{\{nome_usuario\}\}/g, userName);
            subj = subj.replace(/\{\{numero_processo\}\}/g, cnj);
            subj = subj.replace(/\{\{resumo_ia\}\}/g, resumoSimples);
            finalSubject = subj;
          }
        } catch (templateErr) {
          console.error("[escavador-webhook] Erro ao buscar template no banco de dados:", templateErr);
        }

        try {
          console.log("[escavador-webhook] Enviando e-mail de atualização para:", userEmail);
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: 'Consulta Processo <consultaprocesso@advogadoriodejaneiro.com>',
              to: [userEmail],
              subject: finalSubject,
              html: emailHtml
            })
          });

          if (!emailRes.ok) {
            const errData = await emailRes.json();
            console.error("[escavador-webhook] Erro ao disparar e-mail via Resend:", errData);
          } else {
            console.log("[escavador-webhook] E-mail de notificação enviado com sucesso!");
          }
        } catch (e) {
          console.error("[escavador-webhook] Erro técnico Resend:", e);
        }
      } else {
        console.warn("[escavador-webhook] Disparo de e-mail pulado: RESEND_API_KEY ou e-mail de usuário ausente.", { hasKey: !!resendApiKey, userEmail });
      }

      // 3. ATUALIZAR STATUS
      await supabase.from('monitored_processes').update({
        last_movement_summary: resumoSimples,
        last_movement_date: dataMov,
        status: 'ATIVO', // Muda de PENDENTE para ATIVO
        has_new_updates: true
      }).eq('id', proc.id);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) { 
    console.error("[escavador-webhook] Erro na integração com base de dados jurídica.", err);
    return new Response("Erro técnico processado.", { status: 500 }); 
  }
});