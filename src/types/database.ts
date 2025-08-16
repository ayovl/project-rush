import { IdeogramApiResponse } from '../services/ideogramService';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          credits: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      generations: {
        Row: {
          id: string
          user_id: string
          prompt: string
          character_reference_url: string | null
          character_reference_mask_url: string | null
          generated_images: string[] // Array of image URLs
          aspect_ratio: string
          style_type: string
          num_images: number
          rendering_speed: string
          magic_prompt: boolean
          ideogram_response: IdeogramApiResponse // Store full Ideogram API response
          status: 'pending' | 'generating' | 'completed' | 'failed'
          credits_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          character_reference_url?: string | null
          character_reference_mask_url?: string | null
          generated_images?: string[]
          aspect_ratio: string
          style_type: string
          num_images: number
          rendering_speed: string
          magic_prompt: boolean
          ideogram_response?: IdeogramApiResponse
          status: 'pending' | 'generating' | 'completed' | 'failed'
          credits_used: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          character_reference_url?: string | null
          character_reference_mask_url?: string | null
          generated_images?: string[]
          aspect_ratio?: string
          style_type?: string
          num_images?: number
          rendering_speed?: string
          magic_prompt?: boolean
          ideogram_response?: IdeogramApiResponse
          status?: 'pending' | 'generating' | 'completed' | 'failed'
          credits_used?: number
          created_at?: string
          updated_at?: string
        }
      }
      prompt_templates: {
        Row: {
          id: string
          title: string
          prompt: string
          category: string
          description: string | null
          image_url: string | null
          is_premium: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          prompt: string
          category: string
          description?: string | null
          image_url?: string | null
          is_premium?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          prompt?: string
          category?: string
          description?: string | null
          image_url?: string | null
          is_premium?: boolean
          created_at?: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
