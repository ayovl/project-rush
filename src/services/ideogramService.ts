import axios from 'axios'

export interface IdeogramGenerationRequest {
  prompt: string
  characterReferenceImage?: File | null
  characterReferenceMask?: File | null
  aspectRatio: string
  styleType: string
  numImages: number
  renderingSpeed: string
  magicPrompt: boolean
}

export interface IdeogramImageData {
  url: string
  is_image_safe: boolean
  seed: number
  prompt: string
  resolution: string
  style_type: string
}

export interface IdeogramApiResponse {
  created: string
  data: IdeogramImageData[]
}

class IdeogramService {
  private baseUrl = 'https://api.ideogram.ai'
  private apiKey: string

  constructor() {
    this.apiKey = process.env.IDEOGRAM_API_KEY || ''
    if (!this.apiKey) {
      console.warn('IDEOGRAM_API_KEY is not set in environment variables')
    }
  }

  private getHeaders() {
    return {
      'Api-Key': this.apiKey,
      'Content-Type': 'multipart/form-data',
    }
  }

  /**
   * Generate images using Ideogram 3.0 API
   */
  async generateImages(request: IdeogramGenerationRequest): Promise<IdeogramApiResponse> {
    const formData = new FormData()
    
    // Required parameters
    formData.append('prompt', request.prompt)
    formData.append('aspect_ratio', request.aspectRatio)
    formData.append('style_type', request.styleType)
    formData.append('num_images', request.numImages.toString())
    formData.append('rendering_speed', request.renderingSpeed)
    formData.append('magic_prompt', request.magicPrompt ? 'ON' : 'OFF')

    // Optional character reference image
    if (request.characterReferenceImage) {
      formData.append('character_reference_images', request.characterReferenceImage)
    }

    // Optional character reference mask
    if (request.characterReferenceMask) {
      formData.append('character_reference_images_mask', request.characterReferenceMask)
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/ideogram-v3/generate`,
        formData,
        {
          headers: this.getHeaders(),
          timeout: 120000, // 2 minutes timeout
        }
      )

      return response.data
    } catch (error) {
      console.error('Ideogram API Error:', error)
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message
        const statusCode = error.response?.status || 500
        
        throw new Error(`Ideogram API failed (${statusCode}): ${errorMessage}`)
      }
      
      throw error
    }
  }

  /**
   * Validate image file for character reference
   */
  validateCharacterImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image file size must be less than 10MB'
      }
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Image must be JPEG, PNG, or WebP format'
      }
    }

    return { valid: true }
  }

  /**
   * Get available aspect ratios for Ideogram 3.0
   */
  getAvailableAspectRatios() {
    return [
      { value: '1:1', label: 'Square (1:1)', resolution: '1024x1024' },
      { value: '16:9', label: 'Landscape (16:9)', resolution: '1456x816' },
      { value: '9:16', label: 'Portrait (9:16)', resolution: '816x1456' },
      { value: '4:3', label: 'Standard (4:3)', resolution: '1216x912' },
      { value: '3:4', label: 'Portrait (3:4)', resolution: '912x1216' },
      { value: '21:9', label: 'Ultra Wide (21:9)', resolution: '1568x672' },
      { value: '9:21', label: 'Ultra Tall (9:21)', resolution: '672x1568' },
      { value: '2:3', label: 'Photo (2:3)', resolution: '832x1248' },
      { value: '3:2', label: 'Photo (3:2)', resolution: '1248x832' }
    ]
  }

  /**
   * Get available style types
   */
  getAvailableStyleTypes() {
    return [
      { value: 'REALISTIC', label: 'Realistic' },
      { value: 'DESIGN', label: 'Design' },
      { value: 'GENERAL', label: 'General' },
      { value: 'FICTION', label: 'Fiction' },
      { value: 'AUTO', label: 'Auto' }
    ]
  }

  /**
   * Get available rendering speeds
   */
  getAvailableRenderingSpeeds() {
    return [
      { value: 'TURBO', label: 'Turbo (Fastest)' },
      { value: 'DEFAULT', label: 'Default (Balanced)' },
      { value: 'QUALITY', label: 'Quality (Slowest)' }
    ]
  }

  /**
   * Calculate credits required for a generation
   */
  calculateCredits(numImages: number, renderingSpeed: string, hasCharacterReference: boolean): number {
    let baseCredits = numImages // 1 credit per image
    
    // Character reference adds extra cost
    if (hasCharacterReference) {
      baseCredits += numImages // Double the cost for character reference
    }
    
    // Quality rendering costs more
    if (renderingSpeed === 'QUALITY') {
      baseCredits = Math.ceil(baseCredits * 1.5)
    }
    
    return baseCredits
  }
}

export const ideogramService = new IdeogramService()
