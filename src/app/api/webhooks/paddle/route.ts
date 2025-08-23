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
  const rawBody = await req.text(); // Still needed for logging
  console.log("[PaddleWebhook] content-type:", contentType);
  console.log("[PaddleWebhook] content-length header:", contentLength);
  console.log("[PaddleWebhook] rawBody (first 200 chars):", rawBody.slice(0, 200));
  console.log("[PaddleWebhook] signatureHeader:", signatureHeader);

  try {
    const event = await webhooks.unmarshal(rawBody, signatureHeader, process.env.PADDLE_WEBHOOK_SECRET!);
    console.log(`✅ Verified Paddle webhook. Event type: ${event?.eventType}`);

    if (event && (event.eventType === 'transaction.completed' || event.eventType === 'subscription.created')) {
      const eventData = event.data as any;
      const supabase = await createSupabaseServerClient();
      let user = null;

      // Try to get user by email or paddle_customer_id
      if (eventData.customer?.email) {
        user = await UserService.getUserByEmail(eventData.customer.email);
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
        return new Response('User not found', { status: 200 }); // Return 200 to prevent retries
      }

      // Determine planId from priceId or planName
      let planId = eventData.items?.[0]?.price?.name?.toLowerCase();
      if (!planId && eventData.items?.[0]?.price_id) {
        const priceId = eventData.items[0].price_id;
        if (priceId.startsWith('pri_01k31r4fkf')) planId = 'basic';
        else if (priceId.startsWith('pri_01k31r6n8')) planId = 'pro';
        else if (priceId.startsWith('pri_01k31r8j3')) planId = 'ultimate';
      }

      if (!planId) {
        console.error('[PaddleWebhook] Could not determine planId from event:', eventData);
        return new Response('Plan not found', { status: 200 }); // Return 200
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
      console.log(`[PaddleWebhook] Ignored event type: ${event?.eventType}`);
      return new Response('ok', { status: 200 });
    }
  } catch (err) {
    console.error("❌ Paddle webhook verification failed:", err);
    return new Response("Invalid Paddle signature", { status: 400 });
  }
}
