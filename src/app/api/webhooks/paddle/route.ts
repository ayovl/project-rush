import 'server-only';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseSignatureHeader(header?: string | null): Record<string, string> | null {
  if (!header) return null;
  // Accept 'ts=...;h1=...' or 'ts=...; h1=...'
  const parts = header.split(/[;,]/).map(s => s.trim());
  const result: Record<string, string> = {};
  for (const p of parts) {
    const [k, v] = p.split('=');
    if (k && v) result[k] = v;
  }
  return Object.keys(result).length ? result : null;
}

function verifyPaddleSignature(header: string | null, rawBody: string, secret: string) {
  const parsed = parseSignatureHeader(header);
  if (!parsed || !parsed.ts || !parsed.h1) return { ok: false, reason: 'missing_ts_or_h1' };

  const msg = `${parsed.ts}:${rawBody}`;
  const computed = crypto.createHmac('sha256', secret).update(msg, 'utf8').digest('hex');

  // constant-time compare
  const ok = computed.length === parsed.h1.length &&
             crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(parsed.h1));

  // allow 5 minutes skew
  const skewMs = Math.abs(Date.now() - Number(parsed.ts) * 1000);
  if (skewMs > 5 * 60 * 1000) return { ok: false, reason: 'timestamp_skew', skewMs };

  return { ok, computed, h1: parsed.h1 };
}

function parsePaddlePayload(rawBody: string, _contentType?: string | null): Record<string, unknown> | null {
  // Try JSON first
  try {
    const parsed = JSON.parse(rawBody);
    return parsed;
  } catch {
    // Try x-www-form-urlencoded
    try {
      const params = new URLSearchParams(rawBody);
      const obj: Record<string, unknown> = {};
      params.forEach((v, k) => { obj[k] = v; });
      // Some Paddle payloads wrap the data in a `data` field as JSON string. Try to parse it.
      if (obj.data && typeof obj.data === 'string') {
        try { obj.data = JSON.parse(obj.data); } catch {}
      }
      if (obj.custom_data && typeof obj.custom_data === 'string') {
        try { obj.custom_data = JSON.parse(obj.custom_data); } catch {}
      }
      return obj;
    } catch {
      return null;
    }
  }
}

function extractUserIdFromPayload(payload: Record<string, unknown>): string | { fallbackEmail: string | undefined } {
  // Preferred: custom_data.user_id (string)
  const cd = (payload as any)?.custom_data ?? (payload as any)?.data?.custom_data ?? (payload as any)?.subscription?.custom_data;
  if (cd) {
    // custom_data might be a JSON string or an object
    if (typeof cd === 'string') {
      try { const parsed = JSON.parse(cd); if (parsed?.user_id) return parsed.user_id; } catch {}
    } else if ((cd as any)?.user_id) return (cd as any).user_id;
  }
  // fallback: customer email
  const email = (payload as any)?.data?.customer?.email ?? (payload as any)?.data?.customer_email ?? (payload as any)?.customer_email ?? (payload as any)?.customer?.email;
  return { fallbackEmail: email };
}

function derivePlanFromPayload(payload: Record<string, unknown>, PRICE_TO_PLAN: Record<string, { plan: string; credits: number }>): { plan: string; credits: number } | null {
  // Several shapes exist. Try multiple paths for price id
  const candidates: string[] = [];

  // Billing style: payload.data.items[] -> price.id or price_id
  const items = (payload as any)?.data?.items ?? (payload as any)?.items ?? (payload as any)?.subscription?.items;
  if (Array.isArray(items)) {
    for (const it of items) {
      if (it?.price?.id) candidates.push(it.price.id);
      if (it?.price_id) candidates.push(it.price_id);
      if (it?.price?.id_raw) candidates.push(it.price.id_raw);
    }
  }

  // older fields
  if ((payload as any)?.data?.price_id) candidates.push((payload as any).data.price_id);
  if ((payload as any)?.price_id) candidates.push((payload as any).price_id);

  for (const p of candidates) {
    if (!p) continue;
    const found = PRICE_TO_PLAN[p];
    if (found) return found;
  }
  return null;
}

export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();
  const sigHeader = req.headers.get('paddle-signature') ?? req.headers.get('Paddle-Signature');
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_SR = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Map price -> plan
  const PRICE_TO_PLAN: Record<string, { plan: string; credits: number }> = {
    'pro_01k31r0qph9p8xrhx5g13pntk3': { plan: 'basic', credits: 25 },
    'pro_01k31r5v69z9e8x0eg0skxsvfd': { plan: 'pro', credits: 60 },
    'pro_01k31r7qt97szpn7hpq3r6ys47': { plan: 'ultimate', credits: 200 },
  };

  if (!secret) {
    console.error('[PaddleWebhook] Missing PADDLE_WEBHOOK_SECRET env var');
    return new Response('Missing webhook secret', { status: 500 });
  }
  if (!SUPA_URL || !SUPA_SR) {
    console.error('[PaddleWebhook] Missing Supabase env keys. NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    return new Response('Missing Supabase env', { status: 500 });
  }

  const verified = verifyPaddleSignature(sigHeader, rawBody, secret);
  if (!verified.ok) {
    console.error('[PaddleWebhook] signature verification failed', verified);
    return new Response('Invalid Paddle signature', { status: 400 });
  }

  // parse payload robustly
  const payload = parsePaddlePayload(rawBody, req.headers.get('content-type'));

  const eventType = (payload as any)?.event_type ?? (payload as any)?.alert_name ?? (payload as any)?.event;
  const data = (payload as any)?.data ?? payload;

  // Prepare supabase client (service role)
  const supabase = createClient(SUPA_URL, SUPA_SR, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // find user id via custom_data or email
    const userIdOrEmail = extractUserIdFromPayload(payload as Record<string, unknown>);
    let userId: string | undefined;
    if (typeof userIdOrEmail === 'string') userId = userIdOrEmail;
    else if ((userIdOrEmail as { fallbackEmail?: string })?.fallbackEmail) {
      const lookup = await supabase.from('profiles').select('id,email').eq('email', (userIdOrEmail as { fallbackEmail: string }).fallbackEmail).maybeSingle();
      if (lookup.error) console.error('[PaddleWebhook] user lookup by email error', lookup.error);
      else if (lookup.data) userId = lookup.data.id;
    }

    if (!userId) {
      console.warn('[PaddleWebhook] Could not map webhook to a user (no custom_data.user_id and no matching email). eventType=', eventType);
      // you can choose to return 200 to ack or 400 to trigger redelivery. We'll return 200 but log.
      return new Response('no-user', { status: 200 });
    }

    // Determine mapping from price -> plan/credits
    const mapping = derivePlanFromPayload(payload as Record<string, unknown>, PRICE_TO_PLAN);
    if (!mapping) {
      console.warn('[PaddleWebhook] price id not found in PRICE_TO_PLAN mapping. eventType=', eventType);
      // still ack but don't apply credits
    } else {
      // apply credits via RPC (atomic)
      const addRes = await supabase.rpc('increment_credits', { p_user_id: userId, p_amount: mapping.credits });
      if (addRes.error) {
        console.error('[PaddleWebhook] increment_credits failed', addRes.error);
        // fallback: try update (not atomic)
        const cur = await supabase.from('profiles').select('credits').eq('id', userId).single();
        if (!cur.error && cur.data) {
          const newCredits = (cur.data.credits ?? 0) + mapping.credits;
          await supabase.from('profiles').update({ credits: newCredits, selected_plan: mapping.plan }).eq('id', userId);
        } else {
          console.error('[PaddleWebhook] fallback user fetch failed', cur.error);
        }
      } else {
        // Also set selected_plan
        await supabase.from('profiles').update({ selected_plan: mapping.plan }).eq('id', userId);
      }
    }

    // Upsert subscription record if present
    const subId = (data as any)?.subscription?.id ?? (data as any)?.id ?? (data as any)?.subscription_id ?? null;
    if (subId) {
      const subObj = {
        id: String(subId),
        user_id: userId,
        status: (data as any)?.status ?? 'active',
        price_id: ((data as any)?.items?.[0]?.price?.id ?? (data as any)?.items?.[0]?.price_id ?? null),
        plan: mapping?.plan ?? null,
        quantity: (data as any)?.items?.[0]?.quantity ?? 1,
        current_period_end: (data as any)?.current_billing_period?.ends_at ?? null
      };
      const up = await supabase.from('subscriptions').upsert(subObj);
      if (up.error) console.error('[PaddleWebhook] subscriptions upsert error', up.error);
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('[PaddleWebhook] internal error', (err as Error)?.stack ?? err);
    return new Response('internal error', { status: 500 });
  }
}
