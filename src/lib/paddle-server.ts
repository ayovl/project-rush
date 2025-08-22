import { Paddle, Environment, LogLevel } from '@paddle/paddle-node-sdk';

// Initialize Paddle server client with environment configuration
const paddleApiKey = process.env.PADDLE_API_KEY;
const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? Environment.production : Environment.sandbox;

if (!paddleApiKey) {
  console.error('PADDLE_API_KEY environment variable is required');
}

export const paddleServer = new Paddle(paddleApiKey || '', {
  environment: paddleEnv,
  logLevel: process.env.NODE_ENV === 'development' ? LogLevel.verbose : LogLevel.error
});

// Paddle server configuration constants
export const PADDLE_SERVER_CONFIG = {
  environment: paddleEnv,
  webhookSecret: process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET,
  isProduction: process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
} as const;

// Validate required server environment variables
export function validatePaddleServerConfig() {
  const required = [
    'PADDLE_API_KEY',
    'PADDLE_NOTIFICATION_WEBHOOK_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Paddle server environment variables: ${missing.join(', ')}`);
  }
}

// Types for Paddle webhook events
export interface PaddleWebhookEvent {
  eventType: string;
  data: {
    id: string;
    status?: string;
    customerId?: string;
    customerEmail?: string;
    subscriptionId?: string;
    transactionId?: string;
    [key: string]: unknown;
  };
  eventId: string;
  notificationId: string;
  occurredAt: string;
}

// Helper to verify webhook signatures
export async function verifyPaddleWebhook(
  rawBody: string,
  signature: string
): Promise<PaddleWebhookEvent | null> {
  try {
    validatePaddleServerConfig();
    
    const webhookSecret = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET!;
    const eventData = await paddleServer.webhooks.unmarshal(rawBody, webhookSecret, signature);
    
    return eventData as unknown as PaddleWebhookEvent;
  } catch (error) {
    console.error('Error verifying Paddle webhook:', error);
    return null;
  }
}

// Helper to create customers
export async function createPaddleCustomer(email: string, name: string) {
  try {
    validatePaddleServerConfig();
    
    const customer = await paddleServer.customers.create({
      email,
      name
    });
    
    return customer;
  } catch (error) {
    console.error('Error creating Paddle customer:', error);
    throw new Error('Failed to create customer');
  }
}

// Helper to get customer by email
export async function getPaddleCustomerByEmail(email: string) {
  try {
    validatePaddleServerConfig();
    
    const customers = await paddleServer.customers.list({
      email: [email]
    });
    
    const customerList = await customers.next();
    return customerList.length > 0 ? customerList[0] : null;
  } catch (error) {
    console.error('Error getting Paddle customer:', error);
    return null;
  }
}

// Helper to get subscription by customer ID
export async function getCustomerSubscriptions(customerId: string) {
  try {
    validatePaddleServerConfig();
    
    const subscriptions = await paddleServer.subscriptions.list({
      customerId: [customerId]
    });
    
    return await subscriptions.next();
  } catch (error) {
    console.error('Error getting customer subscriptions:', error);
    return [];
  }
}

// Helper to update subscription
export async function updateSubscription(subscriptionId: string, updates: Record<string, unknown>) {
  try {
    validatePaddleServerConfig();
    
    const subscription = await paddleServer.subscriptions.update(subscriptionId, updates);
    return subscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription');
  }
}

// Webhook event handlers
export const PADDLE_WEBHOOK_EVENTS = {
  TRANSACTION_COMPLETED: 'transaction.completed',
  TRANSACTION_UPDATED: 'transaction.updated',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_CANCELED: 'subscription.canceled',
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated'
} as const;

export type PaddleWebhookEventType = typeof PADDLE_WEBHOOK_EVENTS[keyof typeof PADDLE_WEBHOOK_EVENTS];
