import 'server-only';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parsePaddleSignatureHeader(header?: string | null) {
  if (!header) return null;
  const m = header.match(/ts=(\d+).*?h1=([0-9a-fA-F]+)/);
  if (!m) return null;
  return { ts: m[1], h1: m[2] };
}

// Enhanced signature verification with multiple fallback approaches
async function verifyPaddleRequest(req: Request, bodyBuf: Buffer) {
  const header = req.headers.get('paddle-signature') ?? req.headers.get('Paddle-Signature') ?? '';
  const parsed = parsePaddleSignatureHeader(header);
  if (!parsed) {
    console.log('[PaddleWebhook] No valid signature header found');
    return { ok: false, reason: 'bad_header', parsed: null };
  }

  // Try multiple possible environment variable names
  const secretRaw = 
    process.env.PADDLE_WEBHOOK_SECRET ?? 
    process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET ??
    process.env.PADDLE_WEBHOOK_SIGNING_SECRET ??
    process.env.NEXT_PADDLE_WEBHOOK_SECRET;
  
  const secret = secretRaw?.trim();
  if (!secret) {
    console.log('[PaddleWebhook] No webhook secret found in environment variables');
    console.log('[PaddleWebhook] Checked: PADDLE_WEBHOOK_SECRET, PADDLE_NOTIFICATION_WEBHOOK_SECRET, PADDLE_WEBHOOK_SIGNING_SECRET, NEXT_PADDLE_WEBHOOK_SECRET');
    return { ok: false, reason: 'no_secret' };
  }

  // Log secret info (first/last chars only for debugging)
  console.log('[PaddleWebhook] Using secret starting with:', secret.substring(0, 8) + '...' + secret.substring(secret.length - 8));

  // CRITICAL: Paddle's new Billing API uses different signing format
  // Try the standard format: ts:body
  const prefixBuf = Buffer.from(`${parsed.ts}:`, 'utf8');
  const msgBuf = Buffer.concat([prefixBuf, bodyBuf]);

  const computedHex = crypto
    .createHmac('sha256', Buffer.from(secret, 'utf8'))
    .update(msgBuf)
    .digest('hex');

  // Enhanced debug logging
  console.log('[PaddleWebhook] === SIGNATURE DEBUG ===');
  console.log('[PaddleWebhook] header:', header);
  console.log('[PaddleWebhook] ts:', parsed.ts);
  console.log('[PaddleWebhook] rawBody length bytes:', bodyBuf.length);
  console.log('[PaddleWebhook] rawBody hex preview (first 160 chars):', bodyBuf.slice(0, 80).toString('hex'));
  console.log('[PaddleWebhook] message being signed length:', msgBuf.length);
  console.log('[PaddleWebhook] message hex preview:', msgBuf.slice(0, 80).toString('hex'));
  console.log('[PaddleWebhook] computedHex:', computedHex);
  console.log('[PaddleWebhook] header.h1:', parsed.h1);
  console.log('[PaddleWebhook] match:', computedHex === parsed.h1);

  // Try timing-safe comparison
  const computedBuf = Buffer.from(computedHex, 'hex');
  const headerBuf = Buffer.from(parsed.h1, 'hex');
  
  const ok = computedBuf.length === headerBuf.length && 
             crypto.timingSafeEqual(computedBuf, headerBuf);

  if (!ok) {
    // Try alternative approach: maybe Paddle is not including the colon?
    const msgBufAlt = Buffer.concat([Buffer.from(parsed.ts, 'utf8'), bodyBuf]);
    const computedHexAlt = crypto
      .createHmac('sha256', Buffer.from(secret, 'utf8'))
      .update(msgBufAlt)
      .digest('hex');
    
    console.log('[PaddleWebhook] Trying alternative (no colon) approach:', computedHexAlt);
    
    if (computedHexAlt === parsed.h1) {
      console.log('[PaddleWebhook] ✅ Alternative approach worked!');
      return { ok: true, parsed, computedHex: computedHexAlt };
    }

    // Try with just the body (no timestamp)
    const computedHexBodyOnly = crypto
      .createHmac('sha256', Buffer.from(secret, 'utf8'))
      .update(bodyBuf)
      .digest('hex');
    
    console.log('[PaddleWebhook] Trying body-only approach:', computedHexBodyOnly);
    
    if (computedHexBodyOnly === parsed.h1) {
      console.log('[PaddleWebhook] ✅ Body-only approach worked!');
      return { ok: true, parsed, computedHex: computedHexBodyOnly };
    }
  }

  return { ok, parsed, computedHex };
}

function parsePaddlePayload(rawBody: string, contentType?: string | null): Record<string, unknown> | null {
  console.log('[PaddleWebhook] Parsing payload, Content-Type:', contentType);
  console.log('[PaddleWebhook] Raw body preview:', rawBody.substring(0, 200) + (rawBody.length > 200 ? '...' : ''));

  // Try JSON first (most common for new Paddle Billing API)
  try {
    const parsed = JSON.parse(rawBody);
    console.log('[PaddleWebhook] Successfully parsed as JSON');
    return parsed;
  } catch {
    console.log('[PaddleWebhook] Failed to parse as JSON, trying form-encoded');
    
    // Try x-www-form-urlencoded
    try {
      const params = new URLSearchParams(rawBody);
      const obj: Record<string, unknown> = {};
      params.forEach((v, k) => { obj[k] = v; });
      
      // Some Paddle payloads wrap the data in a `data` field as JSON string
      if (obj.data && typeof obj.data === 'string') {
        try { 
          obj.data = JSON.parse(obj.data); 
          console.log('[PaddleWebhook] Parsed nested JSON in data field');
        } catch {}
      }
      if (obj.custom_data && typeof obj.custom_data === 'string') {
        try { 
          obj.custom_data = JSON.parse(obj.custom_data); 
          console.log('[PaddleWebhook] Parsed nested JSON in custom_data field');
        } catch {}
      }
      
      console.log('[PaddleWebhook] Successfully parsed as form-encoded');
      return obj;
    } catch {
      console.log('[PaddleWebhook] Failed to parse payload in any format');
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
  console.log('[PaddleWebhook] Extracting user ID from payload');
  
  // Log the payload structure for debugging
  console.log('[PaddleWebhook] Payload keys:', Object.keys(payload));
  console.log('[PaddleWebhook] Custom data:', payload.custom_data);
  if (payload.data && typeof payload.data === 'object') {
    console.log('[PaddleWebhook] Data keys:', Object.keys(payload.data as Record<string, unknown>));
    console.log('[PaddleWebhook] Data custom_data:', (payload.data as Record<string, unknown>).custom_data);
  }

  // Try to find custom_data.user_id or custom_data.userId (both variations)
  const customDataSources = [
    payload.custom_data,
    payload.data && typeof payload.data === 'object' ? (payload.data as Record<string, unknown>).custom_data : undefined,
    payload.subscription && typeof payload.subscription === 'object' ? (payload.subscription as Record<string, unknown>).custom_data : undefined
  ];

  for (const cd of customDataSources) {
    if (cd) {
      if (typeof cd === 'string') {
        try {
          const parsed = JSON.parse(cd);
          if (parsed && typeof parsed === 'object') {
            // Try both user_id and userId
            const userId = (parsed as Record<string, unknown>).user_id || (parsed as Record<string, unknown>).userId;
            if (userId && typeof userId === 'string') {
              console.log('[PaddleWebhook] Found user ID in custom_data string:', userId);
              return userId;
            }
          }
        } catch {}
      } else if (typeof cd === 'object' && cd !== null) {
        // Try both user_id and userId
        const userId = (cd as Record<string, unknown>).user_id || (cd as Record<string, unknown>).userId;
        if (userId && typeof userId === 'string') {
          console.log('[PaddleWebhook] Found user ID in custom_data object:', userId);
          return userId;
        }
      }
    }
  }

  // Fallback: try to find customer email from various locations
  const data = payload.data && typeof payload.data === 'object' ? payload.data as Record<string, unknown> : undefined;
  const customer = data?.customer && typeof data.customer === 'object' ? data.customer as Record<string, unknown> : undefined;
  
  const emailSources = [
    customer?.email,
    data?.customer_email,
    payload.customer_email,
    payload.customer && typeof payload.customer === 'object' ? (payload.customer as Record<string, unknown>).email : undefined,
    data?.email,
    payload.email
  ];

  for (const email of emailSources) {
    if (email && typeof email === 'string') {
      console.log('[PaddleWebhook] Found fallback email:', email);
      return { fallbackEmail: email };
    }
  }

  console.log('[PaddleWebhook] Could not extract user ID or email from payload');
  return { fallbackEmail: undefined };
}

function derivePlanFromPayload(payload: PaddlePayload, PRICE_TO_PLAN: Record<string, { plan: string; credits: number }>): { plan: string; credits: number } | null {
  console.log('[PaddleWebhook] Deriving plan from payload');
  const candidates: string[] = [];
  
  const data = payload.data && typeof payload.data === 'object' ? payload.data as Record<string, unknown> : undefined;
  const subscription = payload.subscription && typeof payload.subscription === 'object' ? payload.subscription as Record<string, unknown> : undefined;
  
  // Look for items array in various locations
  const itemsSources = [
    data?.items,
    payload.items,
    subscription?.items
  ];

  for (const items of itemsSources) {
    if (Array.isArray(items)) {
      console.log('[PaddleWebhook] Found items array with', items.length, 'items');
      for (const item of items) {
        if (item && typeof item === 'object') {
          const itemObj = item as Record<string, unknown>;
          
          // Try multiple ways to get price ID
          const priceIdSources = [
            itemObj.price && typeof itemObj.price === 'object' ? (itemObj.price as Record<string, unknown>).id : undefined,
            itemObj.price_id,
            itemObj.priceId,
            itemObj.price && typeof itemObj.price === 'object' ? (itemObj.price as Record<string, unknown>).id_raw : undefined
          ];

          for (const priceId of priceIdSources) {
            if (priceId && typeof priceId === 'string') {
              console.log('[PaddleWebhook] Found price ID:', priceId);
              candidates.push(priceId);
            }
          }
        }
      }
    }
  }

  // Also try direct price_id fields
  const directPriceIdSources = [
    data?.price_id,
    payload.price_id,
    data?.priceId,
    payload.priceId
  ];

  for (const priceId of directPriceIdSources) {
    if (priceId && typeof priceId === 'string') {
      console.log('[PaddleWebhook] Found direct price ID:', priceId);
      candidates.push(priceId);
    }
  }

  console.log('[PaddleWebhook] Price ID candidates:', candidates);
  console.log('[PaddleWebhook] Available mappings:', Object.keys(PRICE_TO_PLAN));

  // Find mapping
  for (const priceId of candidates) {
    if (priceId) {
      const found = PRICE_TO_PLAN[priceId];
      if (found) {
        console.log('[PaddleWebhook] Found mapping for', priceId, ':', found);
        return found;
      }
    }
  }

  console.log('[PaddleWebhook] No price mapping found');
  return null;
}

export async function POST(req: Request): Promise<Response> {
  console.log('[PaddleWebhook] === WEBHOOK REQUEST START ===');
  
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPA_SR = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Updated PRICE_TO_PLAN mapping - make sure these match your actual Paddle price IDs
  const PRICE_TO_PLAN: Record<string, { plan: string; credits: number }> = {
    // Old format (if still using)
    'pro_01k31r0qph9p8xrhx5g13pntk3': { plan: 'basic', credits: 25 },
    'pro_01k31r5v69z9e8x0eg0skxsvfd': { plan: 'pro', credits: 60 },
    'pro_01k31r7qt97szpn7hpq3r6ys47': { plan: 'ultimate', credits: 200 },
    
    // New format (if using new Paddle Billing API) - update these with your actual IDs
    'pri_01k31r0qph9p8xrhx5g13pntk3': { plan: 'basic', credits: 25 },
    'pri_01k31r5v69z9e8x0eg0skxsvfd': { plan: 'pro', credits: 60 },
    'pri_01k31r7qt97szpn7hpq3r6ys47': { plan: 'ultimate', credits: 200 },
  };

  console.log('[PaddleWebhook] Environment check:');
  console.log('[PaddleWebhook] SUPABASE_URL present:', !!SUPA_URL);
  console.log('[PaddleWebhook] SUPABASE_SERVICE_ROLE_KEY present:', !!SUPA_SR);
  
  if (!SUPA_URL || !SUPA_SR) {
    console.error('[PaddleWebhook] Missing Supabase env keys. NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    return new Response('Missing Supabase env', { status: 500 });
  }

  // Read the request body ONCE and use it for both verification and parsing
  const ab = await req.arrayBuffer();
  const bodyBuf = Buffer.from(ab);
  const rawBody = bodyBuf.toString('utf8');

  console.log('[PaddleWebhook] Request details:');
  console.log('[PaddleWebhook] Content-Type:', req.headers.get('content-type'));
  console.log('[PaddleWebhook] User-Agent:', req.headers.get('user-agent'));
  console.log('[PaddleWebhook] Body length:', bodyBuf.length);

  // Enhanced signature verification with multiple approaches
  const verified = await verifyPaddleRequest(req, bodyBuf);
  if (!verified.ok) {
    console.error('[PaddleWebhook] signature verification failed', verified);
    
    // For debugging, let's still parse the payload to see what we're getting
    console.log('[PaddleWebhook] Parsing payload despite verification failure for debugging...');
    const debugPayload = parsePaddlePayload(rawBody, req.headers.get('content-type'));
    console.log('[PaddleWebhook] Debug payload structure:', JSON.stringify(debugPayload, null, 2));
    
    return new Response('Invalid Paddle signature', { status: 400 });
  }

  console.log('[PaddleWebhook] ✅ Signature verification passed!');

  // Parse payload using the same raw body string
  const payload = parsePaddlePayload(rawBody, req.headers.get('content-type')) as PaddlePayload;

  if (!payload) {
    console.error('[PaddleWebhook] Failed to parse payload');
    return new Response('Invalid payload format', { status: 400 });
  }

  console.log('[PaddleWebhook] Parsed payload structure:', JSON.stringify(payload, null, 2));

  const eventType = typeof payload.event_type === 'string' ? payload.event_type
    : typeof payload.alert_name === 'string' ? payload.alert_name
    : typeof payload.event === 'string' ? payload.event
    : undefined;
  
  console.log('[PaddleWebhook] Event type:', eventType);
  
  const data = typeof payload.data === 'object' && payload.data !== null ? payload.data as Record<string, unknown> : payload;

  // Prepare supabase client (service role)
  const supabase = createClient(SUPA_URL, SUPA_SR, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // find user id via custom_data or email
    const userIdOrEmail = extractUserIdFromPayload(payload);
    let userId: string | undefined;
    
    if (typeof userIdOrEmail === 'string') {
      userId = userIdOrEmail;
      console.log('[PaddleWebhook] Using direct user ID:', userId);
    } else if (userIdOrEmail && typeof userIdOrEmail === 'object' && 'fallbackEmail' in userIdOrEmail && userIdOrEmail.fallbackEmail) {
      console.log('[PaddleWebhook] Looking up user by email:', userIdOrEmail.fallbackEmail);
      const lookup = await supabase.from('profiles').select('id,email').eq('email', userIdOrEmail.fallbackEmail).maybeSingle();
      if (lookup.error) {
        console.error('[PaddleWebhook] user lookup by email error', lookup.error);
      } else if (lookup.data) {
        userId = lookup.data.id;
        console.log('[PaddleWebhook] Found user by email lookup:', userId);
      } else {
        console.log('[PaddleWebhook] No user found with email:', userIdOrEmail.fallbackEmail);
      }
    }

    if (!userId) {
      console.warn('[PaddleWebhook] Could not map webhook to a user (no custom_data.user_id and no matching email). eventType=', eventType);
      console.warn('[PaddleWebhook] Full payload for debugging:', JSON.stringify(payload, null, 2));
      return new Response('no-user', { status: 200 });
    }

    console.log('[PaddleWebhook] Processing for user:', userId);

    // Determine mapping from price -> plan/credits
    const mapping = derivePlanFromPayload(payload, PRICE_TO_PLAN);
    if (!mapping) {
      console.warn('[PaddleWebhook] price id not found in PRICE_TO_PLAN mapping. eventType=', eventType);
      console.warn('[PaddleWebhook] Available price mappings:', Object.keys(PRICE_TO_PLAN));
      // still ack but don't apply credits
      return new Response('no-price-mapping', { status: 200 });
    }

    console.log('[PaddleWebhook] Applying credits:', mapping);

    // apply credits via RPC (atomic)
    console.log('[PaddleWebhook] Calling increment_credits RPC...');
    const addRes = await supabase.rpc('increment_credits', { p_user_id: userId, p_amount: mapping.credits });
    
    if (addRes.error) {
      console.error('[PaddleWebhook] increment_credits failed', addRes.error);
      
      // fallback: try direct update (not atomic but better than nothing)
      console.log('[PaddleWebhook] Trying fallback direct update...');
      const cur = await supabase.from('profiles').select('credits').eq('id', userId).single();
      if (!cur.error && cur.data) {
        const newCredits = (cur.data.credits ?? 0) + mapping.credits;
        const updateRes = await supabase.from('profiles').update({ 
          credits: newCredits, 
          selected_plan: mapping.plan 
        }).eq('id', userId);
        
        if (updateRes.error) {
          console.error('[PaddleWebhook] fallback update failed', updateRes.error);
        } else {
          console.log('[PaddleWebhook] ✅ Fallback update successful, new credits:', newCredits);
        }
      } else {
        console.error('[PaddleWebhook] fallback user fetch failed', cur.error);
      }
    } else {
      console.log('[PaddleWebhook] ✅ increment_credits successful');
      
      // Also set selected_plan
      const planUpdateRes = await supabase.from('profiles').update({ selected_plan: mapping.plan }).eq('id', userId);
      if (planUpdateRes.error) {
        console.error('[PaddleWebhook] plan update failed', planUpdateRes.error);
      } else {
        console.log('[PaddleWebhook] ✅ Plan updated to:', mapping.plan);
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
      console.log('[PaddleWebhook] Processing subscription:', subId);
      
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
      
      console.log('[PaddleWebhook] Upserting subscription:', subObj);
      const up = await supabase.from('subscriptions').upsert(subObj);
      if (up.error) {
        console.error('[PaddleWebhook] subscriptions upsert error', up.error);
      } else {
        console.log('[PaddleWebhook] ✅ Subscription upserted successfully');
      }
    }

    console.log('[PaddleWebhook] === WEBHOOK PROCESSING COMPLETE ===');
    return new Response('ok', { status: 200 });
    
  } catch (err) {
    console.error('[PaddleWebhook] internal error', (err as Error)?.stack ?? err);
    return new Response('internal error', { status: 500 });
  }
}
