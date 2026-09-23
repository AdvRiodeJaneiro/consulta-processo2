import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cakto-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  let rawBody = "";
  try {
    rawBody = await req.text();
    console.log("[cakto-webhook] Raw Request Body:", rawBody);

    const payload = JSON.parse(rawBody);
    
    // Mapeamento de Campos
    const event = payload.event || payload.eventType || payload.status; 
    const customerEmail = payload.data?.customerEmail || payload.data?.customer?.email || payload.customer?.email;
    const productName = payload.data?.product?.name || payload.product?.name || "Plano Pro";
    const productId = payload.data?.product?.id || payload.product?.id;
    const amount = payload.data?.amount || payload.amount || 0;
    const paymentId = payload.data?.id || payload.id;

    console.log(`[cakto-webhook] Evento: ${event} | Cliente: ${customerEmail}`);

    if (!customerEmail) {
      return new Response(JSON.stringify({ status: "ignored", reason: "no email found" }), { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Localizar o Plano / Pacote de Créditos
    const { data: plan } = await supabase
      .from('plans')
      .select('id, name, price, search_limit, process_limit, monitoring_limit')
      .or(`cakto_product_id.eq.${productId},name.eq."${productName}"`)
      .maybeSingle();

    // 2. Localizar o Usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, search_credits, process_credits, monitoring_credits')
      .eq('email', customerEmail)
      .maybeSingle();

    if (!profile) {
      console.warn(`[cakto-webhook] Usuário ${customerEmail} não encontrado.`);
      return new Response(JSON.stringify({ status: "user_not_found" }), { status: 200 });
    }

    // --- LÓGICA DE ESTADOS DA RECARGA DE CRÉDITOS ---

    const successEvents = [
      'purchase_approved', 
      'subscription_renewed', 
      'paid', 
      'approved', 
      'order_approved',
      'payment_approved'
    ];
    
    const failureEvents = [
      'refunded',
      'chargeback',
      'dispute'
    ];

    if (successEvents.includes(event)) {
      // 1. Soma os novos créditos ao saldo existente do usuário
      const searchToAdd = plan?.search_limit || 0;
      const processToAdd = plan?.process_limit || 0;
      const monitoringToAdd = plan?.monitoring_limit || 0;

      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          current_plan_id: plan?.id || null,
          subscription_expires_at: null, // Créditos avulsos não possuem expiração temporal de 30 dias
          search_credits: (profile.search_credits || 0) + searchToAdd,
          process_credits: (profile.process_credits || 0) + processToAdd,
          monitoring_credits: (profile.monitoring_credits || 0) + monitoringToAdd
        })
        .eq('id', profile.id);

      // 2. Registra no Histórico de compras
      await supabase
        .from('subscription_history')
        .insert({
          user_id: profile.id,
          plan_name: plan?.name || productName,
          amount_paid: amount > 0 ? amount : (plan?.price || 0),
          payment_status: 'approved',
          start_date: new Date().toISOString(),
          end_date: null, // Sem data de término
          cakto_payment_id: paymentId?.toString()
        });

      console.log(`[cakto-webhook] ✅ Créditos adicionados com sucesso para ${customerEmail}. (+${searchToAdd} buscas, +${processToAdd} consultas de processo)`);
      
    } else if (failureEvents.includes(event)) {
      // Se for reembolso ou contestação (chargeback/dispute), estorna os créditos caso o plano correspondente seja localizado
      if (plan) {
        const searchToSubtract = plan.search_limit || 0;
        const processToSubtract = plan.process_limit || 0;
        const monitoringToSubtract = plan.monitoring_limit || 0;

        await supabase
          .from('profiles')
          .update({
            search_credits: Math.max((profile.search_credits || 0) - searchToSubtract, 0),
            process_credits: Math.max((profile.process_credits || 0) - processToSubtract, 0),
            monitoring_credits: Math.max((profile.monitoring_credits || 0) - monitoringToSubtract, 0)
          })
          .eq('id', profile.id);
      }

      // Se encontrar o ID do pagamento, atualiza histórico para reembolsado
      if (paymentId) {
        await supabase
          .from('subscription_history')
          .update({ payment_status: 'refunded' })
          .eq('cakto_payment_id', paymentId.toString())
          .eq('user_id', profile.id);
      }

      console.log(`[cakto-webhook] ❌ Compra estornada/reembolsada. Créditos removidos para ${customerEmail}`);
    }

    return new Response(JSON.stringify({ success: true, event }), { status: 200, headers: corsHeaders });

  } catch (err) {
    console.error("[cakto-webhook] Erro:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});