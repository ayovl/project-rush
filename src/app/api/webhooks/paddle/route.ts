import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyPaddleWebhook, 
  PADDLE_WEBHOOK_EVENTS,
  PaddleWebhookEvent,
  PaddleWebhookEventType 
} from '@/lib/paddle-server';
import { createClient } from '@/lib/supabase/server';
import { PlanService, type PlanCredits } from '@/services/planService';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('paddle-signature');

    if (!signature) {
      console.error('Missing Paddle signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const event = await verifyPaddleWebhook(rawBody, signature);
    
    if (!event) {
      console.error('Invalid Paddle webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log(`Received Paddle webhook: ${event.eventType}`, {
      eventId: event.eventId,
      occurredAt: event.occurredAt
    });

    // Handle different webhook events
    await handlePaddleWebhook(event);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing Paddle webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

async function handlePaddleWebhook(event: PaddleWebhookEvent) {
  const { eventType } = event;

  try {
    switch (eventType as PaddleWebhookEventType) {
      case PADDLE_WEBHOOK_EVENTS.TRANSACTION_COMPLETED:
        await handleTransactionCompleted(event);
        break;

      case PADDLE_WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event);
        break;

      case PADDLE_WEBHOOK_EVENTS.SUBSCRIPTION_ACTIVATED:
        await handleSubscriptionActivated(event);
        break;

      case PADDLE_WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event);
        break;

      case PADDLE_WEBHOOK_EVENTS.SUBSCRIPTION_CANCELED:
        await handleSubscriptionCanceled(event);
        break;

      case PADDLE_WEBHOOK_EVENTS.CUSTOMER_CREATED:
        await handleCustomerCreated(event);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }
  } catch (error) {
    console.error(`Error handling webhook event ${eventType}:`, error);
    throw error;
  }
}

async function handleTransactionCompleted(event: PaddleWebhookEvent) {
  const { data } = event;
  
  console.log('Processing completed transaction:', data.id);

  try {
    const supabase = await createClient();
    
    // Update user's subscription status in Supabase
    if (data.customerId) {
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          paddle_customer_id: data.customerId,
          paddle_subscription_id: data.subscriptionId || null,
          paddle_transaction_id: data.id,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating subscription in Supabase:', error);
        throw error;
      }

      // Update user profile if needed
      await updateUserProfile(data.customerId, { 
        subscription_status: 'active',
        paddle_customer_id: data.customerId 
      });

      // Assign credits based on the plan
      const customData = data.custom_data as { planId?: keyof PlanCredits, userId?: string };
      const planId = customData?.planId;
      const userId = customData?.userId;

      if (planId && userId) {
        console.log(`Assigning credits for plan '${planId}' to user '${userId}'`);
        await PlanService.assignCreditsToUser(userId, planId);
      } else {
        console.warn(`Missing planId or userId in customData for transaction:`, data.id);
      }
    }
  } catch (error) {
    console.error('Error handling transaction completed:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(event: PaddleWebhookEvent) {
  const { data } = event;
  
  console.log('Processing created subscription:', data.id);

  try {
    const supabase = await createClient();
    
    // Insert new subscription record
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        paddle_customer_id: data.customerId,
        paddle_subscription_id: data.id,
        status: data.status || 'trialing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating subscription in Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

async function handleSubscriptionActivated(event: PaddleWebhookEvent) {
  const { data } = event;
  
  console.log('Processing activated subscription:', data.id);

  try {
    const supabase = await createClient();
    
    // Update subscription status to active
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('paddle_subscription_id', data.id);

    if (error) {
      console.error('Error activating subscription in Supabase:', error);
      throw error;
    }

    // Update user profile
    if (data.customerId) {
      await updateUserProfile(data.customerId, { 
        subscription_status: 'active' 
      });
    }
  } catch (error) {
    console.error('Error handling subscription activated:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(event: PaddleWebhookEvent) {
  const { data } = event;
  
  console.log('Processing updated subscription:', data.id);

  try {
    const supabase = await createClient();
    
    // Update subscription record
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: data.status || 'active',
        updated_at: new Date().toISOString()
      })
      .eq('paddle_subscription_id', data.id);

    if (error) {
      console.error('Error updating subscription in Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

async function handleSubscriptionCanceled(event: PaddleWebhookEvent) {
  const { data } = event;
  
  console.log('Processing canceled subscription:', data.id);

  try {
    const supabase = await createClient();
    
    // Update subscription status to canceled
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('paddle_subscription_id', data.id);

    if (error) {
      console.error('Error canceling subscription in Supabase:', error);
      throw error;
    }

    // Update user profile
    if (data.customerId) {
      await updateUserProfile(data.customerId, { 
        subscription_status: 'canceled' 
      });
    }
  } catch (error) {
    console.error('Error handling subscription canceled:', error);
    throw error;
  }
}

async function handleCustomerCreated(event: PaddleWebhookEvent) {
  const { data } = event;
  
  console.log('Processing created customer:', data.id);

  // Customer creation is typically handled during user registration
  // This webhook confirms the customer was created successfully
}

async function updateUserProfile(paddleCustomerId: string, updates: Record<string, unknown>) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('paddle_customer_id', paddleCustomerId);

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
}
