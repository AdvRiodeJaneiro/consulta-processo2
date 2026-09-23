import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log("[cron-process-monitoring] Iniciando execução do monitoramento...");

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  try {
    let processesToCheck = [];
    let isTest = false;
    let testUserId = null;

    // Tentar ler o corpo da requisição para verificar se é um teste
    try {
      const body = await req.json();
      if (body && body.test_process_number) {
        isTest = true;
        testUserId = body.test_user_id;
        console.log(`[cron-process-monitoring] Executando em modo de TESTE para o processo: ${body.test_process_number}`);

        const { data: existingProc } = await supabaseAdmin
          .from('monitored_processes')
          .select('*')
          .eq('process_number', body.test_process_number)
          .maybeSingle();

        if (existingProc) {
          processesToCheck = [existingProc];
        } else {
          processesToCheck = [{
            id: "00000000-0000-0000-0000-000000000000",
            user_id: testUserId,
            process_number: body.test_process_number,
            status: 'ATIVO',
            last_movement_date: null
          }];
        }
      }
    } catch (e) {
      // Sem corpo JSON ou erro ao ler, segue fluxo normal do cron
    }

    if (!isTest) {
      const { data: processes, error: procError } = await supabaseAdmin
        .from('monitored_processes')
        .select('*')
        .eq('status', 'ATIVO');

      if (procError) {
        console.error("[cron-process-monitoring] Erro ao buscar processos ativos:", procError);
        return new Response(JSON.stringify({ error: 'Erro ao buscar processos ativos' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      processesToCheck = processes || [];
    }

    console.log(`[cron-process-monitoring] Encontrados ${processesToCheck.length} processos para verificar.`);

    const ESC_API_KEY = Deno.env.get('ESCAVADOR_API_KEY')
    const BASE_URL = "https://api.escavador.com/api/v2"
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!ESC_API_KEY) {
      console.error("[cron-process-monitoring] API Key do Escavador ausente.");
      return new Response(JSON.stringify({ error: 'Configuração do servidor ausente' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const results = [];

    for (let i = 0; i < processesToCheck.length; i++) {
      const proc = processesToCheck[i];
      console.log(`[cron-process-monitoring] Processando (${i + 1}/${processesToCheck.length}): ${proc.process_number}`);

      // 1. Buscar perfil do usuário para verificar créditos antes de qualquer chamada paga
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('email, first_name, monitoring_credits, is_admin')
        .eq('id', proc.user_id)
        .maybeSingle();

      if (profileError || !profile) {
        console.error(`[cron-process-monitoring] Erro ao buscar perfil do usuário ${proc.user_id}:`, profileError);
        results.push({ process_number: proc.process_number, success: false, error: 'Perfil não encontrado' });
        continue;
      }

      // 2. Verificação de saldo de créditos (Ignorada se for Admin)
      const currentCredits = profile.monitoring_credits || 0;
      const isAdmin = profile.is_admin === true;

      if (currentCredits <= 0 && !isTest && !isAdmin) {
        console.log(`[cron-process-monitoring] Usuário ${proc.user_id} está sem créditos de monitoramento (${currentCredits}).`);
        
        if (proc.last_movement_summary !== 'AVISO_SALDO_ESGOTADO') {
          // Enviar e-mail de aviso de saldo esgotado
          if (resendApiKey && profile.email) {
            const { data: templateData } = await supabaseAdmin
              .from('email_templates')
              .select('subject, body_html')
              .eq('slug', 'monitoring_paused_no_credits')
              .maybeSingle();

            if (templateData) {
              const userName = profile.first_name || "Doutor(a)";
              const linkPainel = `https://consultaprocesso.advogadoriodejaneiro.com/planos`;

              let body = templateData.body_html;
              body = body.replace(/\{\{nome_usuario\}\}/g, userName);
              body = body.replace(/\{\{numero_processo\}\}/g, proc.process_number);
              body = body.replace(/\{\{link_painel\}\}/g, linkPainel);

              let subject = templateData.subject;
              subject = subject.replace(/\{\{numero_processo\}\}/g, proc.process_number);

              console.log(`[cron-process-monitoring] Enviando e-mail de saldo esgotado para:`, profile.email);
              const emailRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${resendApiKey}`
                },
                body: JSON.stringify({
                  from: 'Consulta Processo <consultaprocesso@advogadoriodejaneiro.com>',
                  to: [profile.email],
                  subject: subject,
                  html: body
                })
              });

              if (!emailRes.ok) {
                const errData = await emailRes.json();
                console.error("[cron-process-monitoring] Erro ao enviar e-mail de saldo esgotado:", errData);
              }
            }
          }

          // Atualizar o processo para marcar que o aviso foi enviado
          if (proc.id !== "00000000-0000-0000-0000-000000000000") {
            await supabaseAdmin
              .from('monitored_processes')
              .update({
                last_movement_summary: 'AVISO_SALDO_ESGOTADO',
                last_checked_at: new Date().toISOString()
              })
              .eq('id', proc.id);
          }
        } else {
          console.log(`[cron-process-monitoring] Aviso de saldo esgotado já enviado anteriormente para o processo ${proc.process_number}. Pulando.`);
        }

        results.push({ process_number: proc.process_number, success: true, error: 'Sem créditos' });
        continue;
      }

      // Se for um teste ou tiver créditos, aguardar 5 segundos antes da busca (exceto na primeira iteração)
      if (i > 0) {
        console.log("[cron-process-monitoring] Aguardando 5 segundos antes da próxima busca...");
        await delay(5000);
      }

      try {
        // A. Buscar dados da capa do processo no Escavador
        const escResponse = await fetch(`${BASE_URL}/processos/numero_cnj/${proc.process_number}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ESC_API_KEY}`,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (!escResponse.ok) {
          console.error(`[cron-process-monitoring] Erro ao buscar capa do processo ${proc.process_number}:`, escResponse.status);
          results.push({ process_number: proc.process_number, success: false, error: `Erro na capa: ${escResponse.status}` });
          continue;
        }

        const processData = await escResponse.json();

        // B. Buscar movimentações detalhadas no Escavador
        const movementsResponse = await fetch(`${BASE_URL}/processos/numero_cnj/${proc.process_number}/movimentacoes`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ESC_API_KEY}`,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (movementsResponse.ok) {
          const movementsData = await movementsResponse.json();
          if (movementsData && movementsData.items) {
            processData.movimentacoes = movementsData.items;
          }
        } else {
          console.warn(`[cron-process-monitoring] Erro ao buscar movimentações do processo ${proc.process_number}:`, movementsResponse.status);
        }

        // C. Determinar a data da última movimentação
        const latestMoveDate = processData.movimentacoes?.[0]?.data || processData.data_ultima_movimentacao || "";
        const latestMoveContent = processData.movimentacoes?.[0]?.conteudo || "Nenhuma movimentação detalhada listada.";

        // D. Comparar com a última data conhecida
        const hasProgress = proc.last_movement_date ? (latestMoveDate > proc.last_movement_date) : true;
        console.log(`[cron-process-monitoring] Processo ${proc.process_number}: Data anterior: ${proc.last_movement_date} | Nova data: ${latestMoveDate} | Tem progresso: ${hasProgress}`);

        // E. Salvar no histórico de monitoramento (apenas se não for um mock de teste)
        if (proc.id !== "00000000-0000-0000-0000-000000000000") {
          const { error: histError } = await supabaseAdmin
            .from('monitored_process_history')
            .insert({
              monitored_process_id: proc.id,
              user_id: proc.user_id,
              raw_data: processData,
              last_movement_date: latestMoveDate,
              has_progress: hasProgress,
              email_sent: true
            });

          if (histError) {
            console.error(`[cron-process-monitoring] Erro ao salvar histórico do processo ${proc.process_number}:`, histError);
          }

          // F. Atualizar o processo monitorado
          const { error: updateError } = await supabaseAdmin
            .from('monitored_processes')
            .update({
              last_movement_date: latestMoveDate,
              last_movement_summary: latestMoveContent,
              last_checked_at: new Date().toISOString(),
              has_new_updates: hasProgress
            })
            .eq('id', proc.id);

          if (updateError) {
            console.error(`[cron-process-monitoring] Erro ao atualizar processo monitorado ${proc.process_number}:`, updateError);
          }
        }

        // G. Debitar 1 crédito de monitoramento do perfil do usuário (apenas se não for teste e não for Admin)
        if (!isTest && !isAdmin && proc.id !== "00000000-0000-0000-0000-000000000000") {
          const newCredits = Math.max(currentCredits - 1, 0);

          const { error: creditError } = await supabaseAdmin
            .from('profiles')
            .update({ monitoring_credits: newCredits })
            .eq('id', proc.user_id);

          if (creditError) {
            console.error(`[cron-process-monitoring] Erro ao debitar crédito do usuário ${proc.user_id}:`, creditError);
          } else {
            console.log(`[cron-process-monitoring] Debitado 1 crédito de monitoramento do usuário ${proc.user_id}. Novo saldo: ${newCredits}`);
          }
        } else if (isAdmin) {
          console.log(`[cron-process-monitoring] Usuário ${proc.user_id} é Admin. Pulando débito de créditos.`);
        }

        // H. Disparar e-mail via Resend
        if (resendApiKey && profile.email) {
          const templateSlug = hasProgress ? 'monitoring_report_with_progress' : 'monitoring_report_no_progress';
          
          const { data: templateData } = await supabaseAdmin
            .from('email_templates')
            .select('subject, body_html')
            .eq('slug', templateSlug)
            .maybeSingle();

          if (templateData) {
            const userName = profile.first_name || "Doutor(a)";
            const linkPainel = `https://consultaprocesso.advogadoriodejaneiro.com/meus-processos`;
            const linkExplicacaoIa = `https://consultaprocesso.advogadoriodejaneiro.com/?processo=${encodeURIComponent(proc.process_number)}&action=explain_ai`;

            // 1. Formatar Capa do Processo em HTML
            const mainFonte = processData.fontes?.[0];
            const capa = mainFonte?.capa;
            const valorCausa = capa?.valor_causa?.valor_formatado || "Não informado";
            const capaHtml = `
              <ul style="list-style-type: none; padding-left: 0; margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">
                <li><strong>Assunto:</strong> ${capa?.assunto || "Não informado"}</li>
                <li><strong>Classe:</strong> ${capa?.classe || "Não informado"}</li>
                <li><strong>Área:</strong> ${capa?.area || "Não informado"}</li>
                <li><strong>Órgão Julgador:</strong> ${capa?.orgao_julgador || "Não informado"}</li>
                <li><strong>Valor da Causa:</strong> ${valorCausa}</li>
              </ul>
            `;

            // 2. Formatar Partes do Processo em HTML
            const partesHtml = mainFonte?.envolvidos?.map(env => {
              const oabs = env.oabs?.map(o => `${o.uf}-${o.numero}`).join(', ') || '';
              return `<li style="margin-bottom: 6px; font-size: 14px; color: #334155;"><strong>${env.nome}</strong> (${env.polo})${oabs ? ` - OAB: ${oabs}` : ''}</li>`;
            }).join('\n') || '<li style="font-size: 14px; color: #334155;">Não informados</li>';
            const partesListHtml = `<ul style="padding-left: 20px; margin: 0; line-height: 1.6;">${partesHtml}</ul>`;

            // 3. Formatar as últimas 5 movimentações em HTML
            const movesHtml = processData.movimentacoes?.slice(0, 5).map(m => {
              return `
                <div style="margin-bottom: 16px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 12px;">
                  <p style="margin: 0 0 4px 0; font-size: 13px; color: #64748b; font-weight: bold;">📅 ${m.data} - ${m.tipo || 'ANDAMENTO'}</p>
                  <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.5;">${m.conteudo}</p>
                </div>
              `;
            }).join('\n') || '<p style="font-size: 14px; color: #64748b; margin: 0;">Nenhuma movimentação listada.</p>';

            let body = templateData.body_html;
            body = body.replace(/\{\{nome_usuario\}\}/g, userName);
            body = body.replace(/\{\{numero_processo\}\}/g, proc.process_number);
            body = body.replace(/\{\{link_painel\}\}/g, linkPainel);
            body = body.replace(/\{\{link_explicacao_ia\}\}/g, linkExplicacaoIa);
            body = body.replace(/\{\{data_movimentacao\}\}/g, latestMoveDate);
            body = body.replace(/\{\{conteudo_movimentacao\}\}/g, latestMoveContent);
            
            // Injetar os blocos HTML completos
            body = body.replace(/\{\{capa_processo\}\}/g, capaHtml);
            body = body.replace(/\{\{partes_processo\}\}/g, partesListHtml);
            body = body.replace(/\{\{ultimas_movimentacoes\}\}/g, movesHtml);

            let subject = templateData.subject;
            subject = subject.replace(/\{\{numero_processo\}\}/g, proc.process_number);

            console.log(`[cron-process-monitoring] Enviando e-mail (${templateSlug}) para:`, profile.email);
            const emailRes = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
              },
              body: JSON.stringify({
                from: 'Consulta Processo <consultaprocesso@advogadoriodejaneiro.com>',
                to: [profile.email],
                subject: subject,
                html: body
              })
            });

            if (!emailRes.ok) {
              const errData = await emailRes.json();
              console.error("[cron-process-monitoring] Erro ao enviar e-mail via Resend:", errData);
            } else {
              console.log("[cron-process-monitoring] E-mail enviado com sucesso!");
            }
          } else {
            console.error(`[cron-process-monitoring] Template de e-mail não encontrado: ${templateSlug}`);
          }
        }

        results.push({ process_number: proc.process_number, success: true, has_progress: hasProgress });

      } catch (err: any) {
        console.error(`[cron-process-monitoring] Erro inesperado ao processar ${proc.process_number}:`, err);
        results.push({ process_number: proc.process_number, success: false, error: err.message });
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error("[cron-process-monitoring] Erro geral na execução:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
