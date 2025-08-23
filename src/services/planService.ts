import { createClient } from '@/lib/supabase/client'

export interface PlanCredits {
  basic: 25
  pro: 60  
  ultimate: 200
}

export const PLAN_CREDITS: PlanCredits = {
  basic: 25,
  pro: 60,
  ultimate: 200
}

export class PlanService {
  private static supabase = createClient()

  /**
   * Assign credits to user based on selected plan
   */
  static async assignPlanCredits(planId: keyof PlanCredits): Promise<{ 
    success: boolean
    credits?: number
    error?: string 
  }> {
    try {
      console.log('PlanService: Assigning credits for plan:', planId)
      
      const { data, error } = await this.supabase
        .rpc('rpc_assign_plan_credits', { plan_id: planId })

      if (error) {
        console.error('PlanService: Error assigning credits:', error)
        return { success: false, error: error.message }
      }

      console.log('PlanService: Credits assigned successfully:', data)
      return { success: true, credits: data }
    } catch (error) {
      console.error('PlanService: Unexpected error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Get user's current credits and plan
   */
  static async getUserCredits(): Promise<{
    success: boolean
    credits?: number
    plan?: string
    error?: string
  }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'Not authenticated' }
      }

      const { data, error } = await this.supabase
        .from('profiles')
        .select('credits, selected_plan')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('PlanService: Error fetching user credits:', error)
        return { success: false, error: error.message }
      }

      return { 
        success: true, 
        credits: data.credits, 
        plan: data.selected_plan 
      }
    } catch (error) {
      console.error('PlanService: Unexpected error fetching credits:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Assign credits to a specific user (for server-side use)
   */
  static async assignCreditsToUser(userId: string, planId: keyof PlanCredits): Promise<{
    success: boolean
    credits?: number
    error?: string
  }> {
    try {
      console.log(`PlanService: Assigning credits for plan '${planId}' to user '${userId}'`);
      // Try RPC first
      const { data, error } = await this.supabase
        .rpc('admin_assign_plan_credits', {
          user_id: userId,
          plan_id: planId
        });

      if (!error) {
        console.log('PlanService: Credits assigned successfully to user (RPC):', { userId, credits: data });
        return { success: true, credits: data };
      }

      // If RPC fails, fallback to direct update
      console.error('PlanService: RPC failed, falling back to direct update:', error?.message);
      const credits = PLAN_CREDITS[planId];
      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({
          credits,
          selected_plan: planId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('PlanService: Fallback direct update failed:', updateError.message);
        return { success: false, error: updateError.message };
      }

      console.log('PlanService: Credits assigned successfully to user (direct update):', { userId, credits });
      return { success: true, credits };
    } catch (error) {
      console.error('PlanService: Unexpected error assigning credits to user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Deduct credits when user generates images
   */
  static async deductCredits(amount: number): Promise<{
    success: boolean
    remainingCredits?: number
    error?: string
  }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'Not authenticated' }
      }

      // Get current credits
      const { data: profile, error: fetchError } = await this.supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        return { success: false, error: fetchError.message }
      }

      const currentCredits = profile.credits
      const newCredits = Math.max(0, currentCredits - amount)

      if (currentCredits < amount) {
        return { success: false, error: 'Insufficient credits' }
      }

      // Update credits
      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({ 
          credits: newCredits,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        return { success: false, error: updateError.message }
      }

      return { success: true, remainingCredits: newCredits }
    } catch (error) {
      console.error('PlanService: Error deducting credits:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Get plan ID from Paddle price ID
   */
  static getPlanIdFromPriceId(priceId: string): keyof PlanCredits | null {
    // NOTE: These price IDs should be stored as environment variables for security and flexibility.
    // Hardcoding them here for simplicity based on the existing webhook logic.
    if (priceId.startsWith('pri_01k31r4fkf')) return 'basic';
    if (priceId.startsWith('pri_01k31r6n8')) return 'pro';
    if (priceId.startsWith('pri_01k31r8j3')) return 'ultimate';
    
    console.warn(`[PlanService] Unknown or unhandled priceId: ${priceId}`);
    return null;
  }
}
