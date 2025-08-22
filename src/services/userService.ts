import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export class UserService {
  private static supabase = createClient()

  // Get user by ID
  static async getUserById(id: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting user by email:', error)
      return null
    }
  }

  // Update user
  static async updateUser(id: string, updates: ProfileUpdate): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  }

  // Deduct credits from user
  static async deductCredits(userId: string, amount: number): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data.credits < amount) {
        return false // Insufficient credits
      }

      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({ 
          credits: data.credits - amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) throw updateError
      return true
    } catch (error) {
      console.error('Error deducting credits:', error)
      return false
    }
  }

  // Add credits to user
  static async addCredits(userId: string, amount: number): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      if (error) throw error

      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({ 
          credits: data.credits + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) throw updateError
      return true
    } catch (error) {
      console.error('Error adding credits:', error)
      return false
    }
  }

  /**
   * Mark the onboarding tutorial as seen for the current user.
   */
  static async markOnboardingAsSeen(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { error } = await this.supabase
        .from('profiles')
        .update({ has_seen_onboarding: true })
        .eq('id', user.id);

      if (error) {
        console.error('Error marking onboarding as seen:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error in markOnboardingAsSeen:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
