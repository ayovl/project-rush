/**
 * Supabase Configuration for Server-Side Operations
 * This file contains server-side Supabase client configuration for backend operations
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

// Server-side Supabase client with service role key
// This client has elevated permissions and should only be used on the server
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Rate limiting configuration
export const RATE_LIMITS = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
}

// File upload configuration
export const FILE_CONFIG = {
  maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
}
