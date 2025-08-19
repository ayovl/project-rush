'use client'

import { initializePaddle, type Paddle } from '@paddle/paddle-js'

// Paddle instance
let paddle: Paddle | undefined;

// Initialize Paddle
async function initPaddle() {
  if (!paddle) {
    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    
    if (!clientToken) {
      throw new Error('Paddle client token is not configured. Please add NEXT_PUBLIC_PADDLE_CLIENT_TOKEN to your environment variables.');
    }
    
    paddle = await initializePaddle({
      token: clientToken,
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox',
      checkout: {
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          locale: 'en',
        }
      }
    });
  }
  return paddle;
}

export interface PaddleCheckoutOptions {
  priceId: string
  email?: string
  customData?: Record<string, unknown>
  successUrl?: string
  closeUrl?: string
}

export interface PaddleProduct {
  priceId: string
  planId: string
  name: string
  price: string
  description: string
}

// Product catalog - these will be your actual Paddle price IDs
export const PADDLE_PRODUCTS: Record<string, PaddleProduct> = {
  basic: {
    priceId: 'pri_01j5w8xm7n9q8r3p2k4f6g7h8j', // Replace with your actual Paddle price ID
    planId: 'basic',
    name: 'Basic Plan',
    price: '$4/month',
    description: 'Founding Member Price'
  },
  pro: {
    priceId: 'pri_01j5w8xm7n9q8r3p2k4f6g7h8k', // Replace with your actual Paddle price ID
    planId: 'pro',
    name: 'Pro Plan',
    price: '$9/month',
    description: 'Founding Member Price'
  },
  ultimate: {
    priceId: 'pri_01j5w8xm7n9q8r3p2k4f6g7h8l', // Replace with your actual Paddle price ID
    planId: 'ultimate',
    name: 'Ultimate Plan',
    price: '$29/month',
    description: 'Founding Member Price'
  }
}

export class PaddleService {
  static async openCheckout(options: PaddleCheckoutOptions): Promise<void> {
    try {
      // Initialize Paddle first
      const paddleInstance = await initPaddle();
      
      if (!paddleInstance) {
        throw new Error('Failed to initialize Paddle');
      }

      // Create checkout session on server first (this creates/gets customer)
      const response = await fetch('/api/paddle/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: options.priceId,
          email: options.email,
          customData: options.customData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { customerId } = await response.json();

      // Open Paddle checkout with customer ID
      await paddleInstance.Checkout.open({
        items: [
          {
            priceId: options.priceId,
            quantity: 1,
          }
        ],
        customer: {
          id: customerId,
          email: options.email
        },
        customData: options.customData,
        settings: {
          successUrl: options.successUrl || `${window.location.origin}/success`,
        }
      })
    } catch (error) {
      console.error('Paddle checkout error:', error)
      throw new Error('Failed to open checkout')
    }
  }

  static getProduct(planId: string): PaddleProduct | undefined {
    return PADDLE_PRODUCTS[planId]
  }

  static getAllProducts(): PaddleProduct[] {
    return Object.values(PADDLE_PRODUCTS)
  }
}

const paddleExports = { PaddleService, initPaddle };
export default paddleExports;
