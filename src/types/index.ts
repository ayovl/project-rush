// Ideogram API types
export interface IdeogramGenerateRequest {
  prompt: string
  seed?: number
  resolution?: string
  aspect_ratio?: string
  rendering_speed?: 'TURBO' | 'DEFAULT' | 'QUALITY'
  magic_prompt?: 'AUTO' | 'ON' | 'OFF'
  negative_prompt?: string
  num_images?: number
  style_type?: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'FICTION'
  character_reference_images?: File[]
  character_reference_images_mask?: File[]
}

export interface IdeogramImageObject {
  prompt: string
  resolution: string
  is_image_safe: boolean
  seed: number
  url: string
  style_type: string
}

export interface IdeogramGenerateResponse {
  created: string
  data: IdeogramImageObject[]
}

// App-specific types
export interface GenerationRequest {
  prompt: string
  characterReferenceImage?: File
  characterReferenceMask?: File
  aspectRatio: string
  styleType: string
  numImages: number
  renderingSpeed: string
  magicPrompt: boolean
}

export interface User {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  credits: number
  createdAt: string
  updatedAt: string
}

export interface Generation {
  id: string
  userId: string
  prompt: string
  characterReferenceUrl?: string
  characterReferenceMaskUrl?: string
  generatedImages: string[]
  aspectRatio: string
  styleType: string
  numImages: number
  renderingSpeed: string
  magicPrompt: boolean
  ideogramResponse: IdeogramGenerateResponse
  status: 'pending' | 'generating' | 'completed' | 'failed'
  creditsUsed: number
  createdAt: string
  updatedAt: string
}

export interface PromptTemplate {
  id: string
  title: string
  prompt: string
  category: string
  description?: string
  imageUrl?: string
  isPremium: boolean
  createdAt: string
}

export const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '16:9', label: 'Landscape (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
  { value: '4:3', label: 'Standard (4:3)' },
  { value: '3:4', label: 'Portrait (3:4)' },
  { value: '21:9', label: 'Cinematic (21:9)' },
  { value: '9:21', label: 'Tall (9:21)' },
] as const

export const STYLE_TYPES = [
  { value: 'REALISTIC', label: 'Realistic' },
  { value: 'GENERAL', label: 'General' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'FICTION', label: 'Fiction' },
  { value: 'AUTO', label: 'Auto' },
] as const

export const RENDERING_SPEEDS = [
  { value: 'TURBO', label: 'Turbo (Fastest)' },
  { value: 'DEFAULT', label: 'Default' },
  { value: 'QUALITY', label: 'Quality (Best)' },
] as const
