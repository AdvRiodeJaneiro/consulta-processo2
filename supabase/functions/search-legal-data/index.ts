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

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const { type, query, processNumber } = await req.json()
    const ESC_API_KEY = Deno.env.get('ESCAVADOR_API_KEY')
    const BASE_URL = "https://api.escavador.com/api/v2"

    if (!ESC_API_KEY) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const usageType = type === 'involved' ? 'search' : (type === 'process' ? 'process' : null)

    // 1. Verificação de Limites
    if (usageType) {
        const { data: hasLimit, error: limitError } = await supabaseAdmin.rpc('check_user_usage_limit', {
            target_user_id: user.id,
            usage_type: usageType
        })

        if (limitError) {
            console.error("[search-legal-data] Limit check error:", limitError)
        } else if (hasLimit === false) {
            return new Response(JSON.stringify({ error: 'Limit reached' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }
    }

    // 2. Chamada ao Escavador
    let endpoint = ""
    if (type === 'process') {
      endpoint = `${BASE_URL}/processos/numero_cnj/${processNumber}`
    } else if (type === 'involved') {
      const digitsOnly = query.replace(/\D/g, '')
      const isCpfCnpj = digitsOnly.length === 11 || digitsOnly.length === 14
      endpoint = `${BASE_URL}/envolvido/processos`
      if (isCpfCnpj) {
        endpoint += `?cpf_cnpj=${digitsOnly}`
      } else {
        const sanitizedQuery = query.replace(/[^\w\s\u00C0-\u017F.-]/g, '')
        endpoint += `?nome=${encodeURIComponent(sanitizedQuery)}`
      }
    } else if (type === 'movements') {
      endpoint = `${BASE_URL}/processos/numero_cnj/${processNumber}/movimentacoes`
    }

    const escResponse = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ESC_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    if (!escResponse.ok) {
      if (escResponse.status === 404) {
          return new Response(null, { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      const errorText = await escResponse.text()
      return new Response(errorText, { status: escResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const data = await escResponse.json()

    // 3. Incremento de uso em caso de sucesso
    const isRealSuccess = (type === 'process' && data?.numero_cnj) || 
                          (type === 'involved' && data?.items);

    if (usageType && isRealSuccess) {
        // Incrementamos via RPC, mas sem travar a resposta em caso de erro no log
        supabaseAdmin.rpc('increment_user_usage', {
            target_user_id: user.id,
            usage_type: usageType
        }).then(({ error }) => {
            if (error) console.error("[search-legal-data] Increment error:", error);
        });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    console.error("[search-legal-data] Unexpected error:", err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})