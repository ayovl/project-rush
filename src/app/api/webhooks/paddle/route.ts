// Enforce Node.js runtime for Vercel (prevents edge runtime issues)
export const runtime = "nodejs";

export const config = {
  api: { bodyParser: false },
};

import { Paddle, type SubscriptionCreatedEvent, type SubscriptionUpdatedEvent, type SubscriptionCanceledEvent, type TransactionCompletedEvent } from "@paddle/paddle-node-sdk";
import { PlanService } from '@/services/planService';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

// Log the environment and secret (first 6 chars only for safety)
console.log("[PaddleWebhook] ENV:", process.env.NODE_ENV);
console.log("[PaddleWebhook] Using secret (first 6 chars):", (process.env.PADDLE_WEBHOOK_SECRET || '').slice(0, 6));

export async function POST(req: Request) {
  const signatureHeader = req.headers.get("paddle-signature") || req.headers.get("Paddle-Signature") || "";
  const rawBodyBuffer = Buffer.from(await req.arrayBuffer());

  try {
    const paddle = new Paddle(process.env.PADDLE_API_KEY!);
    const event = await paddle.webhooks.unmarshal(rawBodyBuffer.toString('utf8'), process.env.PADDLE_WEBHOOK_SECRET!, signatureHeader);

    if (!event) {
      console.log('[PaddleWebhook] Event is null or undefined, ignoring.');
      return new Response('ok', { status: 200 });
    }

    console.log(`[PaddleWebhook] ✅ Verified event: ${event.eventType}`);

    const supabase = await createSupabaseServerClient();

    const handleSubscriptionEvent = async (data: SubscriptionCreatedEvent['data'] | SubscriptionUpdatedEvent['data']) => {
      const userId = await getUserId(data.customerId, data.customData);
      if (!userId) {
          console.error(`[PaddleWebhook] User ID not found for event`);
          return;
      }

      if (!data.items || data.items.length === 0 || !data.items[0].price?.id) return;
      const planId = PlanService.getPlanIdFromPriceId(data.items[0].price.id);
      if (!planId) return;

      const subscriptionData = {
        user_id: userId,
        paddle_subscription_id: data.id,
        plan_id: planId,
        status: data.status,
        current_period_start: data.currentBillingPeriod ? new Date(data.currentBillingPeriod.startsAt) : null,
        current_period_end: data.currentBillingPeriod ? new Date(data.currentBillingPeriod.endsAt) : null,
        cancel_at_period_end: data.scheduledChange?.action === 'cancel',
      };

      await supabase.from('subscriptions').upsert(subscriptionData, { onConflict: 'paddle_subscription_id' });
      console.log(`[PaddleWebhook] Upserted subscription ${data.id} for user ${userId}`);
    }

    const getUserId = async (customerId: string | null, customData: unknown): Promise<string | null> => {
      // Handle customData which might be a string or an object
      if (customData) {
        try {
          // If customData is a string, parse it as JSON
          const parsedData = typeof customData === 'string' ? JSON.parse(customData) : customData;
          // Safely access user_id from the parsed data
          if (parsedData && typeof parsedData === 'object' && 'user_id' in parsedData && parsedData.user_id) {
            return String(parsedData.user_id);
          }
        } catch (error) {
          console.error('[PaddleWebhook] Error parsing customData:', error);
        }
      }

      // If no user_id in customData, try to find by customerId
      if (customerId) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('paddle_customer_id', customerId)
            .single();

          if (error) {
            console.error('[PaddleWebhook] Error fetching user by customer ID:', error);
            return null;
          }

          return data?.id || null;
        } catch (error) {
          console.error('[PaddleWebhook] Unexpected error in getUserId:', error);
          return null;
        }
      }

      return null;
    };

    switch (event.eventType) {
      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionEvent(event.data as SubscriptionCreatedEvent['data'] | SubscriptionUpdatedEvent['data']);
        break;

      case 'subscription.canceled': {
        const typedData = event.data as SubscriptionCanceledEvent['data'];
        const userId = await getUserId(typedData.customerId, typedData.customData);
         if (!userId) {
            console.error(`[PaddleWebhook] User ID not found for event ${event.eventType}`);
            break;
        }

        await supabase.from('subscriptions').update({ status: 'canceled', cancel_at_period_end: true }).eq('paddle_subscription_id', typedData.id);
        console.log(`[PaddleWebhook] Canceled subscription ${typedData.id} for user ${userId}`);
        break;
      }

      case 'transaction.completed': {
        const typedData = event.data as TransactionCompletedEvent['data'];
        if (!typedData.customerId) {
          console.error(`[PaddleWebhook] No customer ID found in transaction`);
          break;
        }
        const userId = await getUserId(typedData.customerId, typedData.customData);
        if (!userId) {
            console.error(`[PaddleWebhook] User ID not found for event ${event.eventType}`);
            break;
        }

        // From this point, userId is guaranteed to be a string.
        if (!typedData.details) {
          console.log('[PaddleWebhook] No transaction details found');
          break;
        }

        if (typedData.origin === 'subscription_recurring' && typedData.details.lineItems?.[0]?.proration) {
          console.log('[PaddleWebhook] Ignoring prorated subscription transaction to avoid double-crediting.');
          break;
        }

        const priceId = typedData.details?.lineItems?.[0]?.priceId;
        if (!priceId) {
          console.log('[PaddleWebhook] No price ID found in transaction details');
          break;
        }

        const planId = PlanService.getPlanIdFromPriceId(priceId);
        if (!planId) {
          break;
        }

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
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ Paddle webhook verification failed: ${errorMessage}`);
    return new Response(`Invalid Paddle signature: ${errorMessage}`, { status: 400 });
  }
}
