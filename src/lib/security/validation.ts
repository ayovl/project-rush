import Joi from 'joi'

// Validation schemas for API endpoints
export const signupSchema = Joi.object({
  email: Joi.string().email().required().max(254),
  password: Joi.string().min(8).max(128).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .message('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  fullName: Joi.string().trim().min(1).max(100).optional()
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required().max(254),
  password: Joi.string().required().max(128)
})

export const generateImageSchema = Joi.object({
  prompt: Joi.string().trim().min(1).max(500).required(),
  aspectRatio: Joi.string().valid(
    '1:1', '16:10', '3:2', '2:3', '4:5', '5:4', '9:16', '16:9', '3:4', '4:3', '10:16'
  ).default('1:1'),
  styleType: Joi.string().valid('REALISTIC', 'DESIGN', 'GENERAL', 'AUTO').default('REALISTIC'),
  numImages: Joi.number().integer().min(1).max(4).default(4)
})

// File validation
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
    }
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'File too large. Maximum size is 10MB.' 
    }
  }

  if (file.size === 0) {
    return { 
      valid: false, 
      error: 'File is empty.' 
    }
  }

  return { valid: true }
}

// Content sanitization
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

export const sanitizePrompt = (prompt: string): string => {
  return prompt
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 500) // Limit length
}

// Rate limiting helpers
export const createRateLimitKey = (identifier: string, endpoint: string): string => {
  return `rate_limit:${endpoint}:${identifier}`
}

// Validate request origin (for CSRF protection)
export const validateOrigin = (request: Request): boolean => {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  
  if (!origin || !host) return false
  
  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    return origin.includes('localhost') || origin.includes('127.0.0.1')
  }
  
  // In production, validate against allowed origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  return allowedOrigins.includes(origin)
}
