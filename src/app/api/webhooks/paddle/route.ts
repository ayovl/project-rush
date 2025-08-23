// Enforce Node.js runtime for Vercel (prevents edge runtime issues)
export const runtime = "nodejs";

export const config = {
  api: { bodyParser: false },
};

import { Paddle, type TransactionCompletedEvent, type SubscriptionCreatedEvent } from "@paddle/paddle-node-sdk";
import { PlanService, type PlanCredits } from '@/services/planService';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';



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
  // Buffer the request stream to get the raw, unmodified body
  const reader = (req.body as ReadableStream<Uint8Array>).getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
  }
  const rawBodyBuffer = Buffer.concat(chunks);
  console.log("[PaddleWebhook] content-type:", contentType);
  console.log("[PaddleWebhook] content-length header:", contentLength);
  console.log("[PaddleWebhook] rawBody (first 200 chars):", rawBodyBuffer.toString('utf-8').slice(0, 200));
  console.log("[PaddleWebhook] signatureHeader:", signatureHeader);

  try {
    // Use the Paddle SDK to verify and parse the webhook
    const paddle = new Paddle(process.env.PADDLE_API_KEY!);
    const event = await paddle.webhooks.unmarshal(rawBodyBuffer.toString('utf8'), process.env.PADDLE_WEBHOOK_SECRET!, signatureHeader);
    console.log(`✅ Verified Paddle webhook. Event type: ${event?.eventType}`);

    if (!event) {
      console.log('[PaddleWebhook] Event is null or undefined, ignoring.');
      return new Response('ok', { status: 200 });
    }

    const supabase = await createSupabaseServerClient();
    const eventData = event.data as any; // Use 'any' for simplicity across different event types

    // Find user ID from custom data or look up by customer ID
    const getUserId = async (): Promise<string | null> => {
      const customUserId = (eventData.custom_data as { user_id?: string })?.user_id;
      if (customUserId) return customUserId;

      if (eventData.customer_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('paddle_customer_id', eventData.customer_id)
          .single();
        return data?.id || null;
      }
      return null;
    };

    const userId = await getUserId();

    if (!userId) {
      console.error(`[PaddleWebhook] User ID not found for event type ${event.eventType}.`);
      return new Response('User not found', { status: 200 }); // Return 200 to prevent retries
    }

    // Main logic switch
    switch (event.eventType) {
      case 'subscription.created':
      case 'subscription.updated': {
        const planId = PlanService.getPlanIdFromPriceId(eventData.items[0].price.id);
        if (!planId) break;

        const subscriptionData = {
          user_id: userId,
          paddle_subscription_id: eventData.id,
          plan_id: planId,
          status: eventData.status,
          current_period_start: new Date(eventData.current_billing_period.starts_at),
          current_period_end: new Date(eventData.current_billing_period.ends_at),
          cancel_at_period_end: eventData.cancel_at_period_end,
        };

        await supabase.from('subscriptions').upsert(subscriptionData, {
          onConflict: 'paddle_subscription_id',
        });
        console.log(`[PaddleWebhook] Upserted subscription ${eventData.id} for user ${userId}`);
        break;
      }

      case 'subscription.canceled': {
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', cancel_at_period_end: true })
          .eq('paddle_subscription_id', eventData.id);
        console.log(`[PaddleWebhook] Canceled subscription ${eventData.id} for user ${userId}`);
        break;
      }

      case 'transaction.completed': {
        // Only assign credits for one-time purchases or the first payment of a subscription
        if (eventData.origin === 'subscription' && eventData.details.line_items[0].proration) {
            console.log('[PaddleWebhook] Ignoring prorated subscription transaction to avoid double-crediting.');
            break;
        }
        
        const planId = PlanService.getPlanIdFromPriceId(eventData.items[0].price.id);
        if (!planId) break;

        const { success, error } = await PlanService.assignCreditsToUser(userId, planId);
        if (success) {
          console.log(`[PaddleWebhook] Assigned credits for plan '${planId}' to user '${userId}'`);
        } else {
          console.error(`[PaddleWebhook] Failed to assign credits for user ${userId}:`, error);
        }
        break;
      }

      default:
        console.log(`[PaddleWebhook] Ignored event type: ${event.eventType}`);
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error("❌ Paddle webhook verification failed:", err);
    return new Response("Invalid Paddle signature", { status: 400 });
  }
}
