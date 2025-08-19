import axios from 'axios';
import FormData from 'form-data';

const IDEOGRAM_API_BASE_URL = 'https://api.ideogram.ai/v1';
const IDEOGRAM_API_KEY = process.env.IDEOGRAM_API_KEY;

// Check for API key when actually using the service, not at module load
function validateApiKey() {
  if (!IDEOGRAM_API_KEY) {
    console.warn('IDEOGRAM_API_KEY is not set in environment variables');
    throw new Error('Ideogram API key is required for image generation');
  }
}

export interface IdeogramGenerationRequest {
  prompt: string;
  aspectRatio?: string;
  styleType?: string;
  renderingSpeed?: string;
  numImages?: number;
  magicPrompt?: boolean;
  negativePrompt?: string;
  seed?: number;
  characterReferenceImage?: Buffer;
  characterReferenceImageMask?: Buffer;
}

export interface IdeogramGenerationResponse {
  created: string;
  data: {
    prompt: string;
    resolution: string;
    is_image_safe: boolean;
    seed: number;
    url: string;
    style_type: string;
  }[];
}

export class IdeogramService {
  private static instance: IdeogramService;

  public static getInstance(): IdeogramService {
    if (!IdeogramService.instance) {
      IdeogramService.instance = new IdeogramService();
    }
    return IdeogramService.instance;
  }

  async generateImage(params: IdeogramGenerationRequest): Promise<IdeogramGenerationResponse> {
    validateApiKey(); // Check API key when actually called
    
    try {
      const formData = new FormData();
      
      // Required parameters
      formData.append('prompt', params.prompt);
      formData.append('rendering_speed', params.renderingSpeed || 'TURBO');
      
      // Optional parameters
      if (params.aspectRatio) {
        formData.append('aspect_ratio', params.aspectRatio);
      }
      
      if (params.styleType) {
        formData.append('style_type', params.styleType);
      }
      
      if (params.numImages) {
        formData.append('num_images', params.numImages.toString());
      }
      
      if (params.magicPrompt !== undefined) {
        formData.append('magic_prompt', params.magicPrompt ? 'ON' : 'OFF');
      }
      
      if (params.negativePrompt) {
        formData.append('negative_prompt', params.negativePrompt);
      }
      
      if (params.seed) {
        formData.append('seed', params.seed.toString());
      }
      
      // Character reference image (no mask for now - Option 1 approach)
      if (params.characterReferenceImage) {
        formData.append('character_reference_images', params.characterReferenceImage, {
          filename: 'character_reference.jpg',
          contentType: 'image/jpeg',
        });
      }
      
      // Optional mask for character reference (for future implementation)
      if (params.characterReferenceImageMask) {
        formData.append('character_reference_images_mask', params.characterReferenceImageMask, {
          filename: 'character_mask.jpg',
          contentType: 'image/jpeg',
        });
      }

      const response = await axios.post(
        `${IDEOGRAM_API_BASE_URL}/ideogram-v3/generate`,
        formData,
        {
          headers: {
            'Api-Key': IDEOGRAM_API_KEY,
            ...formData.getHeaders(),
          },
          timeout: 60000, // 60 seconds timeout
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorData = error.response?.data;
        
        // Handle specific Ideogram API errors
        switch (statusCode) {
          case 400:
            throw new Error(`Bad Request: ${errorData?.message || 'Invalid request parameters'}`);
          case 401:
            throw new Error('Unauthorized: Invalid API key');
          case 422:
            throw new Error(`Validation Error: ${errorData?.message || 'Request validation failed'}`);
          case 429:
            throw new Error('Rate limit exceeded. Please try again later.');
          default:
            throw new Error(`Ideogram API Error: ${errorData?.message || error.message}`);
        }
      }
      
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async downloadImage(imageUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 seconds timeout
      });
      
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
