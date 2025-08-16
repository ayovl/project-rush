import { supabase, supabaseAdmin } from '@/lib/supabase'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export class UserService {
  // Create a new user profile
  static async createProfile(profileData: ProfileInsert): Promise<Profile | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating profile:', error)
      return null
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data.credits < amount) {
        return false // Insufficient credits
      }

      const { error: updateError } = await supabase
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
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      if (error) throw error

      const { error: updateError } = await supabase
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
}
