'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  plan: string | null
  credits: number | null
  hasSeenOnboarding: boolean | null
  signUp: (email: string, password:string, name: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signInWithGoogle: () => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null)
  const supabase = createClient()

  // Debug: Log environment variables (only URL for security)
  useEffect(() => {
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Anon Key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }, [])

  const fetchUserProfile = useCallback(async (currentUser: User | null) => {
    if (currentUser) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('credits, selected_plan, has_seen_onboarding')
        .eq('id', currentUser.id)
        .single()

      if (profile && !error) {
        setPlan(profile.selected_plan === 'none' ? null : profile.selected_plan)
        setCredits(profile.credits || 0)
        setHasSeenOnboarding(profile.has_seen_onboarding || false)
      } else {
        setPlan(null)
        setCredits(0)
        setHasSeenOnboarding(false)
      }
    } else {
      setPlan(null)
      setCredits(0)
      setHasSeenOnboarding(false)
    }
  }, [supabase])

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      await fetchUserProfile(currentUser)
      setLoading(false)
    }

    getSessionAndProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        // Fetch profile on every auth change to ensure data is fresh
        await fetchUserProfile(currentUser)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, fetchUserProfile])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Attempting to sign up with:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      })

      console.log('Sign up response:', { data, error })

      if (error) {
        console.error('Sign up error:', error)
        return { error: error.message }
      }

      // Always create a profile row for the new user
      const userId = data.user?.id;
      if (userId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ id: userId, email })
          .select();
        if (profileError) {
          // If duplicate row error, ignore; else log
          if (!profileError.message.includes('duplicate')) {
            console.error('Error creating profile row:', profileError)
          }
        } else {
          console.log('Profile row created for user:', userId)
        }
      }

      // For demo purposes, inform user about email confirmation
      if (data.user && !data.session) {
        console.log('User created but needs email confirmation')
        return { 
          error: 'Account created! Please check your email and click the confirmation link to complete your registration. Check your spam folder if you don\'t see it.' 
        }
      }

      // If we have a session, the user is confirmed and logged in
      if (data.session) {
        console.log('Sign up successful with immediate session:', data.user?.email)
        return {}
      }

      console.log('Sign up completed, waiting for confirmation:', data.user?.email)
      return { 
        error: 'Account created! Please check your email for a confirmation link.' 
      }
    } catch (error) {
      console.error('Sign up catch error:', error)
      return { error: 'An unexpected error occurred during sign up' }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Sign in response:', { data, error })

      if (error) {
        console.error('Sign in error:', error)
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Sign in catch error:', error)
      return { error: 'An unexpected error occurred during sign in' }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      plan,
      credits,
      hasSeenOnboarding,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
