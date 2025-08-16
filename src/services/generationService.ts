import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { IdeogramApiResponse } from './ideogramService'

type Generation = Database['public']['Tables']['generations']['Row']
type GenerationInsert = Database['public']['Tables']['generations']['Insert']
type GenerationUpdate = Database['public']['Tables']['generations']['Update']

export class GenerationService {
  // Create a new generation record
  static async createGeneration(generationData: GenerationInsert): Promise<Generation | null> {
    try {
      const { data, error } = await supabase
        .from('generations')
        .insert(generationData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating generation:', error)
      return null
    }
  }

  // Get generation by ID
  static async getGenerationById(id: string): Promise<Generation | null> {
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting generation:', error)
      return null
    }
  }

  // Get user's generations with pagination
  static async getUserGenerations(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<Generation[]> {
    try {
      const offset = (page - 1) * limit

      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting user generations:', error)
      return []
    }
  }

  // Update generation status
  static async updateGenerationStatus(
    id: string, 
    status: Generation['status'],
    additionalData?: Partial<GenerationUpdate>
  ): Promise<Generation | null> {
    try {
      const updateData: GenerationUpdate = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData
      }

      const { data, error } = await supabase
        .from('generations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating generation status:', error)
      return null
    }
  }

  // Update generation with completed images
  static async completeGeneration(
    id: string,
    generatedImages: string[],
    ideogramResponse: IdeogramApiResponse
  ): Promise<Generation | null> {
    try {
      const { data, error } = await supabase
        .from('generations')
        .update({
          status: 'completed',
          generated_images: generatedImages,
          ideogram_response: ideogramResponse,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error completing generation:', error)
      return null
    }
  }

  // Mark generation as failed
  static async failGeneration(id: string, error: unknown): Promise<Generation | null> {
    try {
      const { data, error: updateError } = await supabase
        .from('generations')
        .update({
          status: 'failed',
          ideogram_response: { error },
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return data
    } catch (error) {
      console.error('Error marking generation as failed:', error)
      return null
    }
  }

  // Get generation statistics for user
  static async getGenerationStats(userId: string): Promise<{
    total: number
    completed: number
    failed: number
    pending: number
    creditsUsed: number
  }> {
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('status, credits_used')
        .eq('user_id', userId)

      if (error) throw error

      const stats = {
        total: data.length,
        completed: data.filter(g => g.status === 'completed').length,
        failed: data.filter(g => g.status === 'failed').length,
        pending: data.filter(g => g.status === 'pending' || g.status === 'generating').length,
        creditsUsed: data.reduce((sum, g) => sum + (g.credits_used || 0), 0)
      }

      return stats
    } catch (error) {
      console.error('Error getting generation stats:', error)
      return { total: 0, completed: 0, failed: 0, pending: 0, creditsUsed: 0 }
    }
  }
}