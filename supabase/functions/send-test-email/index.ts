import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error("[send-test-email] Erro: RESEND_API_KEY não configurado.");
      return new Response(
        JSON.stringify({ error: "A chave API do Resend (RESEND_API_KEY) não está configurada nas variáveis de ambiente do Supabase." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { to, subject, html, from } = await req.json()
    
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Parâmetros obrigatórios ausentes: 'to', 'subject' e 'html' são necessários." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailPayload = {
      from: from || "consultaprocesso@advogadoriodejaneiro.com",
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
    }

    console.log("[send-test-email] Enviando e-mail para:", emailPayload.to);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json()

    if (!response.ok) {
      console.error("[send-test-email] Erro da API do Resend:", data);
      return new Response(
        JSON.stringify({ error: "Erro no envio pelo Resend", details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log("[send-test-email] E-mail enviado com sucesso!", data);
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error("[send-test-email] Erro técnico inesperado:", error.message);
    return new Response(
      JSON.stringify({ error: "Erro interno no servidor de envio.", details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
