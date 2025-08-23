import 'server-only';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseSignature(header: string | null): { ts: string; h1: string } | null {
  if (!header) return null;
  const parts = Object.fromEntries(
    header.split(';').map((kv: string) => kv.trim().split('=') as [string, string])
  );
  return { ts: parts.ts, h1: parts.h1 };
}

interface VerifySignatureParams {
  header: string | null;
  rawBody: string;
  secret: string;
  toleranceMs?: number;
}

function verifySignature(params: VerifySignatureParams): boolean {
  const { header, rawBody, secret, toleranceMs = 5 * 60 * 1000 } = params;
  const parsed = parseSignature(header);
  if (!parsed?.ts || !parsed?.h1) return false;
  const msg = `${parsed.ts}:${rawBody}`;
  const computed = crypto.createHmac('sha256', secret).update(msg).digest('hex');
  const safeEqual =
    computed.length === parsed.h1.length &&
    crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(parsed.h1));
  if (!safeEqual) return false;
  const skew = Math.abs(Date.now() - Number(parsed.ts) * 1000);
  if (Number.isFinite(skew) && skew > toleranceMs) return false;
  return true;
}

// Map Paddle price IDs to your app plan & credits
const PRICE_TO_PLAN: Record<string, { plan: string; credits: number }> = {
  'pro_01k31r0qph9p8xrhx5g13pntk3': { plan: 'basic', credits: 25 },     // Basic plan
  'pro_01k31r5v69z9e8x0eg0skxsvfd': { plan: 'pro', credits: 60 },       // Pro plan
  'pro_01k31r7qt97szpn7hpq3r6ys47': { plan: 'ultimate', credits: 200 }, // Ultimate plan
};

function deriveFromTx(data: Record<string, unknown> | null | undefined): { plan: string; credits: number } | null {
  const items = (data && (data as { items?: unknown[] }).items) ?? [];
  const priceIds: string[] = (items as Array<{ price?: { id?: string }; price_id?: string }>)
    .map((it) => it?.price?.id ?? it?.price_id)
    .filter(Boolean) as string[];
  for (const pid of priceIds) {
    if (PRICE_TO_PLAN[pid]) return PRICE_TO_PLAN[pid];
  }
  return null;
}

export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();
  const sig = req.headers.get('paddle-signature');
  const secret = process.env.PADDLE_WEBHOOK_SECRET!;
  if (!secret) return new Response('Missing secret', { status: 500 });

  const ok = verifySignature({ header: sig, rawBody, secret });
  if (!ok) return new Response('Invalid Paddle webhook signature', { status: 400 });

  // Now safe to parse
  const evt = JSON.parse(rawBody);
  const eventType: string = evt.event_type;
  const data = evt.data;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Try to locate a userId from customData (preferred)
  const custom = (data?.custom_data ?? data?.subscription?.custom_data ?? {}) as Record<string, unknown>;
  const userId: string | undefined = (custom as { userId?: string }).userId;

  // Handle initial purchase / one-time or first subscription charge
  if (eventType === 'transaction.completed') {
    const mapping = deriveFromTx(data);
    if (userId && mapping) {
      // Upsert subscription row if this transaction created/relates to a sub
      const subId = data.subscription_id ?? null;
      if (subId) {
        await supabase.from('subscriptions').upsert({
          paddle_subscription_id: subId,
          user_id: userId,
          status: 'active',
          plan_id: mapping.plan,
          current_period_end: data.billing_period?.end ?? null
        }, { onConflict: 'paddle_subscription_id' });
      }
      // Grant credits & set plan
      try {
        await supabase.rpc('admin_assign_plan_credits', { user_id: userId, plan_id: mapping.plan });
      } catch {
        await supabase.from('profiles')
          .update({
            selected_plan: mapping.plan,
            credits: (data.items?.[0]?.quantity ?? 1) * mapping.credits
          })
          .eq('id', userId);
      }
    }
  }

  // Keep subscription status in sync
  if (
    eventType === 'subscription.created' ||
    eventType === 'subscription.activated' ||
    eventType === 'subscription.resumed' ||
    eventType === 'subscription.updated' ||
    eventType === 'subscription.paused' ||
    eventType === 'subscription.canceled'
  ) {
    const sub = data;
    const planInfo = deriveFromTx({ items: [{ price: { id: sub?.items?.[0]?.price_id } }] }) || { plan: null, credits: 0 };
    if (userId && sub?.id) {
      await supabase.from('subscriptions').upsert({
        paddle_subscription_id: sub.id,
        user_id: userId,
        status: sub.status,
        plan_id: planInfo.plan ?? null,
        current_period_end: sub?.current_billing_period?.ends_at ?? null
      }, { onConflict: 'paddle_subscription_id' });
    }
  }

  return new Response('ok', { status: 200 });
}
