import 'server-only';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


function parsePaddleSignatureHeader(header?: string | null) {
  if (!header) return null;
  const m = header.match(/ts=(\d+).*h1=([0-9a-fA-F]+)/);
  if (!m) return null;
  return { ts: m[1], h1: m[2] };
}

// Byte-accurate Paddle signature verification with debug logs
export async function verifyPaddleRequest(req: Request) {
  const header = req.headers.get('paddle-signature') ?? req.headers.get('Paddle-Signature') ?? '';
  const parsed = parsePaddleSignatureHeader(header);
  if (!parsed) return { ok: false, reason: 'bad_header', parsed: null };

  // get secret (trim to be safe)
  const secretRaw = process.env.PADDLE_WEBHOOK_SECRET ?? process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET;
  const secret = secretRaw?.trim();
  if (!secret) return { ok: false, reason: 'no_secret' };

  // IMPORTANT: use arrayBuffer to preserve exact bytes
  const ab = await req.arrayBuffer();
  const bodyBuf = Buffer.from(ab); // exact raw bytes Paddle sent

  // Construct message buffer: ts + ":" + raw bytes (note: ":" is single byte)
  const prefixBuf = Buffer.from(`${parsed.ts}:`, 'utf8');
  const msgBuf = Buffer.concat([prefixBuf, bodyBuf]);

  // Compute hmac over _bytes_
  const computedHex = crypto.createHmac('sha256', Buffer.from(secret, 'utf8')).update(msgBuf).digest('hex');

  // Compare hex -> use Buffer with 'hex'
  const computedBuf = Buffer.from(computedHex, 'hex');
  const headerBuf = Buffer.from(parsed.h1, 'hex');

  const ok = computedBuf.length === headerBuf.length && crypto.timingSafeEqual(computedBuf, headerBuf);

  // Debug info (safe): lengths and hex prefixes
  console.log('[PaddleWebhook] header:', header);
  console.log('[PaddleWebhook] ts:', parsed.ts);
  console.log('[PaddleWebhook] rawBody length bytes:', bodyBuf.length);
  console.log('[PaddleWebhook] rawBody hex preview:', bodyBuf.slice(0, 80).toString('hex'));
  console.log('[PaddleWebhook] computedHex:', computedHex);
  console.log('[PaddleWebhook] header.h1:', parsed.h1);

  return { ok, parsed, computedHex };
}

// (Old verifyPaddleSignature removed; use verifyPaddleRequest instead)

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

type PaddlePayload = Record<string, unknown> & {
  data?: Record<string, unknown>;
  subscription?: Record<string, unknown>;
  custom_data?: unknown;
};

function extractUserIdFromPayload(payload: PaddlePayload): string | { fallbackEmail: string | undefined } {
  // Preferred: custom_data.user_id (string)
  const cd = payload.custom_data
    ?? (payload.data && typeof payload.data === 'object' ? (payload.data as Record<string, unknown>).custom_data : undefined)
    ?? (payload.subscription && typeof payload.subscription === 'object' ? (payload.subscription as Record<string, unknown>).custom_data : undefined);
  if (cd) {
    if (typeof cd === 'string') {
      try {
        const parsed = JSON.parse(cd);
        if (parsed && typeof parsed === 'object' && 'user_id' in parsed) return (parsed as { user_id: string }).user_id;
      } catch {}
    } else if (typeof cd === 'object' && cd !== null && 'user_id' in cd) {
      return (cd as { user_id: string }).user_id;
    }
  }
  // fallback: customer email
  const data = payload.data && typeof payload.data === 'object' ? payload.data as Record<string, unknown> : undefined;
  const customer = data?.customer && typeof data.customer === 'object' ? data.customer as Record<string, unknown> : undefined;
  const email =
    (customer?.email as string | undefined) ??
    (data?.customer_email as string | undefined) ??
    (payload.customer_email as string | undefined) ??
    (payload.customer && typeof payload.customer === 'object' ? (payload.customer as Record<string, unknown>).email as string | undefined : undefined);
  return { fallbackEmail: email };
}

function derivePlanFromPayload(payload: PaddlePayload, PRICE_TO_PLAN: Record<string, { plan: string; credits: number }>): { plan: string; credits: number } | null {
  const candidates: string[] = [];
  const data = payload.data && typeof payload.data === 'object' ? payload.data as Record<string, unknown> : undefined;
  const subscription = payload.subscription && typeof payload.subscription === 'object' ? payload.subscription as Record<string, unknown> : undefined;
  const items =
    (data?.items as unknown[] | undefined)
    ?? (payload.items as unknown[] | undefined)
    ?? (subscription?.items as unknown[] | undefined);
  if (Array.isArray(items)) {
    for (const it of items) {
      if (it && typeof it === 'object') {
        const item = it as Record<string, unknown>;
        if (item.price && typeof item.price === 'object' && 'id' in item.price) candidates.push((item.price as Record<string, unknown>).id as string);
        if ('price_id' in item) candidates.push(item.price_id as string);
        if (item.price && typeof item.price === 'object' && 'id_raw' in item.price) candidates.push((item.price as Record<string, unknown>).id_raw as string);
      }
    }
  }
  if (data && 'price_id' in data) candidates.push(data.price_id as string);
  if ('price_id' in payload) candidates.push(payload.price_id as string);
  for (const p of candidates) {
    if (!p) continue;
    const found = PRICE_TO_PLAN[p];
    if (found) return found;
  }
  return null;
}


export async function POST(req: Request): Promise<Response> {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_SR = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Map price -> plan
  const PRICE_TO_PLAN: Record<string, { plan: string; credits: number }> = {
    'pro_01k31r0qph9p8xrhx5g13pntk3': { plan: 'basic', credits: 25 },
    'pro_01k31r5v69z9e8x0eg0skxsvfd': { plan: 'pro', credits: 60 },
    'pro_01k31r7qt97szpn7hpq3r6ys47': { plan: 'ultimate', credits: 200 },
  };

  if (!SUPA_URL || !SUPA_SR) {
    console.error('[PaddleWebhook] Missing Supabase env keys. NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    return new Response('Missing Supabase env', { status: 500 });
  }

  // Use byte-accurate verification
  const verified = await verifyPaddleRequest(req);
  if (!verified.ok) {
    console.error('[PaddleWebhook] signature verification failed', verified);
    return new Response('Invalid Paddle signature', { status: 400 });
  }

  // parse payload robustly (must re-read body)
  // Use arrayBuffer to get raw bytes, then decode as utf8 string
  const ab = await req.arrayBuffer();
  const rawBody = Buffer.from(ab).toString('utf8');
  const payload = parsePaddlePayload(rawBody, req.headers.get('content-type')) as PaddlePayload;

  const eventType = typeof payload.event_type === 'string' ? payload.event_type
    : typeof payload.alert_name === 'string' ? payload.alert_name
    : typeof payload.event === 'string' ? payload.event
    : undefined;
  const data = typeof payload.data === 'object' && payload.data !== null ? payload.data as Record<string, unknown> : payload;

  // Prepare supabase client (service role)
  const supabase = createClient(SUPA_URL, SUPA_SR, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // find user id via custom_data or email
    const userIdOrEmail = extractUserIdFromPayload(payload);
    let userId: string | undefined;
    if (typeof userIdOrEmail === 'string') userId = userIdOrEmail;
    else if (userIdOrEmail && typeof userIdOrEmail === 'object' && 'fallbackEmail' in userIdOrEmail && userIdOrEmail.fallbackEmail) {
      const lookup = await supabase.from('profiles').select('id,email').eq('email', userIdOrEmail.fallbackEmail).maybeSingle();
      if (lookup.error) console.error('[PaddleWebhook] user lookup by email error', lookup.error);
      else if (lookup.data) userId = lookup.data.id;
    }

    if (!userId) {
      console.warn('[PaddleWebhook] Could not map webhook to a user (no custom_data.user_id and no matching email). eventType=', eventType);
      // you can choose to return 200 to ack or 400 to trigger redelivery. We'll return 200 but log.
      return new Response('no-user', { status: 200 });
    }

    // Determine mapping from price -> plan/credits
    const mapping = derivePlanFromPayload(payload, PRICE_TO_PLAN);
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
    let subId: string | null = null;
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      if (d.subscription && typeof d.subscription === 'object' && d.subscription !== null && 'id' in d.subscription) {
        subId = String((d.subscription as Record<string, unknown>).id);
      } else if ('id' in d && typeof d.id === 'string') {
        subId = d.id;
      } else if ('subscription_id' in d && typeof d.subscription_id === 'string') {
        subId = d.subscription_id;
      }
    }
    if (subId) {
      let price_id: string | null = null;
      let quantity = 1;
      if ('items' in data && Array.isArray((data as Record<string, unknown>).items)) {
        const itemsArr = (data as Record<string, unknown>).items as unknown[];
        if (itemsArr.length > 0 && typeof itemsArr[0] === 'object' && itemsArr[0] !== null) {
          const item = itemsArr[0] as Record<string, unknown>;
          if (item.price && typeof item.price === 'object' && 'id' in item.price) price_id = (item.price as Record<string, unknown>).id as string;
          else if ('price_id' in item) price_id = item.price_id as string;
          if ('quantity' in item && typeof item.quantity === 'number') quantity = item.quantity;
        }
      }
      let current_period_end: string | null = null;
      if ('current_billing_period' in data) {
        const cbp = (data as Record<string, unknown>).current_billing_period;
        if (cbp && typeof cbp === 'object' && 'ends_at' in cbp && typeof (cbp as Record<string, unknown>).ends_at === 'string') {
          current_period_end = (cbp as { ends_at: string }).ends_at;
        }
      }
      const subObj = {
        id: subId,
        user_id: userId,
        status: 'status' in data ? (data as Record<string, unknown>).status : 'active',
        price_id,
        plan: mapping?.plan ?? null,
        quantity,
        current_period_end
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
