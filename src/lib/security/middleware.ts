import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface SecurityOptions {
  requireAuth?: boolean
  rateLimit?: {
    requests: number
    windowMs: number
  }
  validateContentType?: string[]
  maxBodySize?: number
}

export function withSecurity(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: SecurityOptions = {}
) {
  return async (req: NextRequest, context?: any) => {
    try {
      // 1. Rate Limiting
      if (options.rateLimit) {
        const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous'
        const key = `rate_limit:${clientIp}`
        const now = Date.now()
        const limit = rateLimitStore.get(key)

        if (limit) {
          if (now < limit.resetTime) {
            if (limit.count >= options.rateLimit.requests) {
              return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
              )
            }
            limit.count++
          } else {
            // Reset window
            rateLimitStore.set(key, { count: 1, resetTime: now + options.rateLimit.windowMs })
          }
        } else {
          rateLimitStore.set(key, { count: 1, resetTime: now + options.rateLimit.windowMs })
        }
      }

      // 2. Content-Type Validation
      if (options.validateContentType && req.method !== 'GET') {
        const contentType = req.headers.get('content-type')
        const isValidContentType = options.validateContentType.some(type => 
          contentType?.includes(type)
        )
        
        if (!isValidContentType) {
          return NextResponse.json(
            { error: 'Invalid content type' },
            { status: 400 }
          )
        }
      }

      // 3. Body Size Validation
      if (options.maxBodySize && req.method !== 'GET') {
        const contentLength = req.headers.get('content-length')
        if (contentLength && parseInt(contentLength) > options.maxBodySize) {
          return NextResponse.json(
            { error: 'Request body too large' },
            { status: 413 }
          )
        }
      }

      // 4. Authentication Check
      if (options.requireAuth) {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }

        // Add user to request context
        ;(req as any).user = user
      }

      // 5. Security Headers
      const response = await handler(req, context)
      
      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

      return response

    } catch (error) {
      console.error('Security middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Input sanitization utilities
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .slice(0, 1000) // Limit length
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' }
  }

  return { valid: true }
}
