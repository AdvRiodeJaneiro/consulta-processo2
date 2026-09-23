import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

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

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const { userMessage, processData, isFirstInteraction } = await req.json()

    const { data: hasLimit, error: limitError } = await supabaseAdmin.rpc('check_user_usage_limit', {
        target_user_id: user.id,
        usage_type: 'process'
    })

    if (limitError) {
        console.error("[process-analysis] Erro ao checar limite:", limitError)
    } else if (hasLimit === false) {
        return new Response(JSON.stringify({ error: 'Limit reached' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
    if (!DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const autorRaw = processData.titulo_polo_ativo || "Autor";
    const reuRaw = processData.titulo_polo_passivo || "Réu";
    const getFirstName = (fullName: string) => (fullName || "").split(' (')[0].split(' ')[0] || "Parte";
    const nomeAutor = getFirstName(autorRaw);
    const nomeReu = getFirstName(reuRaw);

    const basePersona = `
      IDENTIDADE:
      Você é o assistente virtual oficial da equipe do escritório **Magalhães e Gomes Advogados**.
      
      REGRA DE OURO - LINGUAGEM DE AMIGO (SIMPLIFICAÇÃO RADICAL):
      1. O usuário é leigo. Use analogias do dia a dia.
      2. **NUNCA** use termos técnicos como "exequente", "concluso" ou "arquivamento definitivo" sem explicar.
      3. Use o PRIMEIRO NOME: **${nomeAutor}** e **${nomeReu}**.
    `;

    let systemInstruction = "";

    if (isFirstInteraction) {
      systemInstruction = `
        ${basePersona}
        
        SUA TAREFA: Analise o processo e gere 3 partes separadas RIGOROSAMENTE por "<<<SPLIT>>>".

        PARTE 1: RESUMO (Estruturado)
        ### 📋 Resumo do Processo
        **⚖️ Número CNJ:** [Número]
        **👷🏻‍♂️ Quem entrou com a ação:** ${autorRaw}
        **🏬 Contra quem:** ${reuRaw}
        **📅 Início:** [data]
        **📍 Onde está:** [Unidade/Vara]
        **⚖ Fase:** [Grau]
        **💵 Valor:** [valor]

        <<<SPLIT>>>

        PARTE 2: A ÚLTIMA MOVIMENTAÇÃO
        📅 **Data:** [Data]
        💡 **O que aconteceu:** [Explique como uma fofoca construtiva usando ${nomeAutor} e ${nomeReu}]
        🔮 **Próximos passos:** [Impacto prático para ${nomeAutor}]

        <<<SPLIT>>>

        PARTE 3: HISTÓRICO ANTERIOR (LINHA DO TEMPO)
        Analise até 20 movimentações anteriores (index 1 em diante).
        Formato para cada item:
        📅 [Data]
        💡 **Resumo:** [Explicação visual e clara do que houve]
        (Pule uma linha entre os itens)
      `;
    } else {
      systemInstruction = `
        ${basePersona}
        Responda à dúvida do usuário sobre o processo de forma direta, empática e com emojis.
      `;
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: `DADOS: ${JSON.stringify(processData)}\nPERGUNTA: ${userMessage}` }
        ],
        temperature: 0.5, // Reduzido para maior aderência ao formato, mas permitindo criatividade nas explicações
        stream: false,
        user: user.id
      })
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `DeepSeek API Error` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || "Não consegui gerar uma resposta.";

    await supabaseAdmin.rpc('increment_user_usage', {
        target_user_id: user.id,
        usage_type: 'process'
    });

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
