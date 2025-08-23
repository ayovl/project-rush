// Enforce Node.js runtime for Vercel (prevents edge runtime issues)
export const runtime = "nodejs";

export const config = {
  api: { bodyParser: false },
};

import { Webhooks } from "@paddle/paddle-node-sdk";
import { createHmac, timingSafeEqual } from "crypto";
import { PlanService } from '@/services/planService';
import { UserService } from '@/services/userService';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

const webhooks = new Webhooks();

// Log the environment and secret (first 6 chars only for safety)
console.log("[PaddleWebhook] ENV:", process.env.NODE_ENV);
console.log("[PaddleWebhook] Using secret (first 6 chars):", (process.env.PADDLE_WEBHOOK_SECRET || '').slice(0, 6));

export async function POST(req: Request) {
  const signatureHeader = req.headers.get("paddle-signature") || req.headers.get("Paddle-Signature") || req.headers.get("PADDLE-SIGNATURE") || "";
  if (!signatureHeader) {
    console.error("❌ Paddle signature header is missing!");
  }
  const contentType = req.headers.get("content-type") || req.headers.get("Content-Type") || "";
  const contentLength = req.headers.get("content-length") || req.headers.get("Content-Length") || "";
  const rawBody = await req.text();
  const rawBodyBuffer = Buffer.from(rawBody, "utf8");
  // Enhanced debug logging
  const rawBodyHex = rawBodyBuffer.toString("hex");
  console.log("[PaddleWebhook] content-type:", contentType);
  console.log("[PaddleWebhook] content-length header:", contentLength);
  console.log("[PaddleWebhook] rawBody length:", rawBody.length);
  console.log("[PaddleWebhook] rawBodyBuffer length:", rawBodyBuffer.length);
  console.log("[PaddleWebhook] rawBody (first 200 chars):", rawBody.slice(0, 200));
  console.log("[PaddleWebhook] rawBody hex (first 200 bytes):", rawBodyHex.slice(0, 400));
  console.log("[PaddleWebhook] signatureHeader:", signatureHeader);

  let notification = null;
  try {
    notification = await webhooks.unmarshal(rawBody, signatureHeader, process.env.PADDLE_WEBHOOK_SECRET!);
    console.log("✅ Verified Paddle webhook (SDK, string)", notification);
    // --- Business logic: handle only relevant events ---
    const event = typeof notification === 'object' && notification.eventType ? notification : JSON.parse(rawBody);
    const eventType = event.eventType || event.event_type;
    const eventData = event.data;
    console.log('[PaddleWebhook] Event type:', eventType);
    if (eventType === 'transaction.completed' || eventType === 'subscription.created') {
      // Try to get user by email or paddle_customer_id
      const supabase = await createSupabaseServerClient();
      let user = null;
      if (eventData.customer_email) {
        user = await UserService.getUserByEmail(eventData.customer_email);
      }
      if (!user && eventData.customer_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('paddle_customer_id', eventData.customer_id)
          .single();
        if (!error) user = data;
      }
      if (!user) {
        console.error('[PaddleWebhook] No user found for event:', eventData);
        return new Response('User not found', { status: 200 });
      }
      // Determine planId from priceId or planName
      let planId = eventData.items?.[0]?.price?.name?.toLowerCase() || eventData.plan_id || eventData.planId;
      if (!planId && eventData.items?.[0]?.price_id) {
        // Try to map priceId to planId
        const priceId = eventData.items[0].price_id;
        if (priceId.startsWith('pri_01k31r4fkf')) planId = 'basic';
        else if (priceId.startsWith('pri_01k31r6n8')) planId = 'pro';
        else if (priceId.startsWith('pri_01k31r8j3')) planId = 'ultimate';
      }
      if (!planId) {
        console.error('[PaddleWebhook] Could not determine planId from event:', eventData);
        return new Response('Plan not found', { status: 200 });
      }
      // Assign credits
      const assignResult = await PlanService.assignCreditsToUser(user.id, planId);
      if (assignResult.success) {
        console.log(`[PaddleWebhook] Assigned credits for plan '${planId}' to user '${user.id}'`);
      } else {
        console.error('[PaddleWebhook] Failed to assign credits:', assignResult.error);
      }
      return new Response('ok', { status: 200 });
    } else {
      // For other events, just log and return 200
      console.log('[PaddleWebhook] Ignored event type:', eventType);
      return new Response('ok', { status: 200 });
    }
  } catch (err) {
    console.error("❌ SDK verification (string) failed:", err);
  }

  // Manual verification fallback
  try {
    // Parse signature header: ts=...;h1=...
    const parts = signatureHeader.split(';').reduce((acc, part) => {
      const [k, v] = part.split('=');
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {} as Record<string, string>);
    const ts = parts['ts'];
    const h1 = parts['h1'];
    if (!ts || !h1) throw new Error('Missing ts or h1 in signature header');
    const signedPayload = `${ts}:${rawBody}`;
    const secret = process.env.PADDLE_WEBHOOK_SECRET!;
    const hmac = createHmac('sha256', secret).update(signedPayload).digest('hex');
    const valid = timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(h1, 'hex'));
    console.log(`[PaddleWebhook] Manual verification: computed hmac=${hmac.slice(0, 12)}... matches h1=${h1.slice(0, 12)}... ?`, valid);
    if (valid) {
      console.log("✅ Verified Paddle webhook (manual HMAC)");
      return new Response("ok", { status: 200 });
    } else {
      throw new Error('Manual HMAC verification failed');
    } 
  } catch (err) {
    console.error("❌ Manual verification failed:", err);
    console.error("[PaddleWebhook] Secret used:", (process.env.PADDLE_WEBHOOK_SECRET || '').slice(0, 6));
    console.error("[PaddleWebhook] Signature header:", signatureHeader);
    console.error("[PaddleWebhook] Raw body (first 200 chars):", rawBody.slice(0, 200));
    return new Response("Invalid Paddle signature", { status: 400 });
  }
}
