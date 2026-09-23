import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cakto-signature',
  'Content-Type': 'application/json',
}

const successEvents = new Set([
  'purchase_approved',
  'subscription_renewed',
  'paid',
  'approved',
  'order_approved',
  'payment_approved',
])

const failureEvents = new Set(['refunded', 'refund', 'chargeback', 'dispute'])

type CaktoOrder = {
  id?: unknown
  refId?: unknown
  customer?: { email?: unknown }
  customerEmail?: unknown
  product?: { id?: unknown; name?: unknown }
  productId?: unknown
  amount?: unknown
}

type CaktoPayload = {
  secret?: unknown
  event?: unknown
  eventType?: unknown
  status?: unknown
  data?: unknown
  id?: unknown
}

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders })
}

function logError(message: string, details?: Record<string, unknown>) {
  console.error('[cakto-webhook]', message, details ?? {})
}

function normalizeEmail(value: unknown) {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  return email || null
}

function asOrders(data: unknown): CaktoOrder[] {
  if (Array.isArray(data)) return data.filter((item): item is CaktoOrder => !!item && typeof item === 'object')
  if (data && typeof data === 'object') return [data as CaktoOrder]
  return []
}

function getText(value: unknown) {
  return typeof value === 'string' ? value.trim() : null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  let payload: CaktoPayload

  try {
    const rawBody = await req.text()
    payload = JSON.parse(rawBody) as CaktoPayload
  } catch (error) {
    logError('Payload JSON inválido', { error: error instanceof Error ? error.message : String(error) })
    return jsonResponse({ error: 'invalid_json' }, 400)
  }

  const expectedSecret = Deno.env.get('CAKTO_WEBHOOK_KEY')
  if (!expectedSecret) {
    logError('CAKTO_WEBHOOK_KEY não configurada')
    return jsonResponse({ error: 'webhook_not_configured' }, 500)
  }

  if (payload.secret !== expectedSecret) {
    logError('Segredo do webhook inválido')
    return jsonResponse({ error: 'unauthorized' }, 401)
  }

  const event = getText(payload.event) ?? getText(payload.eventType) ?? getText(payload.status)
  const orders = asOrders(payload.data)

  console.info('[cakto-webhook] Evento recebido', { event, orders: orders.length })

  if (!event) {
    logError('Evento ausente')
    return jsonResponse({ error: 'event_missing' }, 400)
  }

  const isRefund = failureEvents.has(event)

  if (!successEvents.has(event) && !isRefund) {
    console.info('[cakto-webhook] Evento ignorado', { event })
    return jsonResponse({ success: true, event, processed: 0 }, 200)
  }

  if (orders.length === 0) {
    logError('Nenhum pedido encontrado no payload', { event })
    return jsonResponse({ error: 'order_missing' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: plan, error: planError } = await supabase
    .from('plans')
    .select('id, name, price, cakto_product_id, search_limit, process_limit, monitoring_limit')
    .eq('name', 'Pacote de créditos')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (planError) {
    logError('Erro ao buscar o pacote de créditos', { error: planError.message })
    return jsonResponse({ error: 'plan_lookup_failed' }, 500)
  }

  if (!plan) {
    logError('Pacote de créditos não configurado')
    return jsonResponse({ error: 'plan_not_configured' }, 500)
  }

  let processed = 0
  const failures: string[] = []

  for (const order of orders) {
    const customerEmail = normalizeEmail(order.customer?.email ?? order.customerEmail)
    const productId = getText(order.product?.id ?? order.productId)
    const productName = getText(order.product?.name)
    const paymentId = getText(order.id) ?? getText(payload.id)
    const referenceId = getText(order.refId)

    if (!customerEmail || !paymentId) {
      failures.push('email_or_payment_id_missing')
      logError('Pedido sem e-mail ou ID', { event })
      continue
    }

    if (productId !== plan.cakto_product_id) {
      failures.push('product_not_configured')
      logError('Produto recebido não corresponde ao pacote de Consulta Processo', {
        customerEmail,
        productId,
        productName,
      })
      continue
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .maybeSingle()

    if (profileError) {
      failures.push('profile_lookup_failed')
      logError('Erro ao buscar usuário', { customerEmail, error: profileError.message })
      continue
    }

    if (!profile) {
      failures.push('user_not_found')
      logError('Usuário não encontrado', { customerEmail, paymentId })
      continue
    }

    if (isRefund) {
      const { data: approvedPurchase, error: purchaseLookupError } = await supabase
        .from('subscription_history')
        .select('id')
        .eq('user_id', profile.id)
        .eq('payment_status', 'approved')
        .eq('cakto_payment_id', paymentId)
        .maybeSingle()

      if (purchaseLookupError) {
        failures.push('refund_lookup_failed')
        logError('Erro ao localizar compra para estorno', { customerEmail, paymentId, error: purchaseLookupError.message })
        continue
      }

      if (!approvedPurchase) {
        failures.push('refund_purchase_not_found')
        logError('Compra aprovada não encontrada para estorno', { customerEmail, paymentId, referenceId })
        continue
      }

      const { data: currentProfile, error: currentProfileError } = await supabase
        .from('profiles')
        .select('search_credits, process_credits, monitoring_credits')
        .eq('id', profile.id)
        .single()

      if (currentProfileError) {
        failures.push('refund_profile_lookup_failed')
        logError('Erro ao consultar saldo para estorno', { customerEmail, paymentId, error: currentProfileError.message })
        continue
      }

      const { error: refundUpdateError } = await supabase
        .from('profiles')
        .update({
          search_credits: Math.max((currentProfile.search_credits ?? 0) - (plan.search_limit ?? 0), 0),
          process_credits: Math.max((currentProfile.process_credits ?? 0) - (plan.process_limit ?? 0), 0),
          monitoring_credits: Math.max((currentProfile.monitoring_credits ?? 0) - (plan.monitoring_limit ?? 0), 0),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (refundUpdateError) {
        failures.push('refund_profile_update_failed')
        logError('Erro ao estornar créditos', { customerEmail, paymentId, error: refundUpdateError.message })
        continue
      }

      const { error: refundHistoryError } = await supabase
        .from('subscription_history')
        .update({ payment_status: 'refunded' })
        .eq('id', approvedPurchase.id)

      if (refundHistoryError) {
        failures.push('refund_history_update_failed')
        logError('Créditos estornados, mas falha ao atualizar histórico', { customerEmail, paymentId, error: refundHistoryError.message })
        continue
      }

      processed += 1
      console.info('[cakto-webhook] Estorno processado', { customerEmail, paymentId })
      continue
    }

    const searchToAdd = plan.search_limit ?? 0
    const processToAdd = plan.process_limit ?? 0
    const monitoringToAdd = plan.monitoring_limit ?? 0
    const amount = typeof order.amount === 'number' && Number.isFinite(order.amount)
      ? order.amount
      : Number(plan.price ?? 0)
    const { data: processResult, error: processError } = await supabase.rpc('process_cakto_purchase', {
      p_user_id: profile.id,
      p_plan_id: plan.id,
      p_plan_name: plan.name,
      p_amount: amount,
      p_payment_id: paymentId,
      p_reference_id: referenceId,
      p_search_credits: searchToAdd,
      p_process_credits: processToAdd,
      p_monitoring_credits: monitoringToAdd,
    })

    if (processError) {
      failures.push('purchase_processing_failed')
      logError('Erro atômico ao creditar e registrar compra', { customerEmail, paymentId, error: processError.message })
      continue
    }

    if (processResult === 'already_processed') {
      console.info('[cakto-webhook] Compra já processada; ignorando duplicidade', { customerEmail, paymentId })
      continue
    }

    processed += 1
    console.info('[cakto-webhook] Compra processada', {
      customerEmail,
      paymentId,
      searchToAdd,
      processToAdd,
      monitoringToAdd,
    })
  }

  if (failures.length > 0) {
    return jsonResponse({ error: 'processing_failed', event, processed, failures }, 422)
  }

  return jsonResponse({ success: true, event, processed }, 200)
})
