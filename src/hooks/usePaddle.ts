'use client';

import { useState, useEffect } from 'react';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';

let paddleInstance: Paddle | null = null;

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function init() {
      try {
        // Skip if already initialized
        if (paddleInstance) {
          setPaddle(paddleInstance);
          setLoading(false);
          return;
        }

        // Initialize Paddle with proper error handling
        const paddle = await initializePaddle({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
          environment: process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox',
          checkout: {
            settings: {
              displayMode: 'overlay',
              theme: 'dark',
              locale: 'en',
            }
          }
        });

        if (paddle) {
          paddleInstance = paddle;
          setPaddle(paddle);
        } else {
          throw new Error('Failed to initialize Paddle');
        }
      } catch (err) {
        console.error('Failed to initialize Paddle:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize payment system'));
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  return { paddle, loading, error };
}
