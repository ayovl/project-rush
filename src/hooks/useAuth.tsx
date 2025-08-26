'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
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
  signInWithApple: () => Promise<{ error?: string }>
  signInWithMicrosoft: () => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type ServerSession = {
  user: User | null;
  plan: string | null;
  credits: number | null;
  hasSeenOnboarding: boolean | null;
};

type AuthProviderProps = {
  children: React.ReactNode;
  serverSession?: ServerSession;
};

export function AuthProvider({ children, serverSession }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(serverSession?.user ?? null)
  const [loading, setLoading] = useState(!serverSession)
  const [plan, setPlan] = useState<string | null>(serverSession?.plan ?? null)
  const [credits, setCredits] = useState<number | null>(serverSession?.credits ?? null)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(serverSession?.hasSeenOnboarding ?? null)
  const supabase = createClient()

  // In-memory cache for profile, initialized with server data if available
  const profileCache = useRef<{ plan: string | null, credits: number | null, hasSeenOnboarding: boolean | null } | null>(
    serverSession ? {
      plan: serverSession.plan,
      credits: serverSession.credits,
      hasSeenOnboarding: serverSession.hasSeenOnboarding
    } : null
  );

  // Debug: Log environment variables (only URL for security)
  useEffect(() => {
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Anon Key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }, [])

  const fetchUserProfile = useCallback(async (currentUser: User | null, forceRefresh = false) => {
    if (currentUser) {
      if (!forceRefresh && profileCache.current) {
        setPlan(profileCache.current.plan)
        setCredits(profileCache.current.credits)
        setHasSeenOnboarding(profileCache.current.hasSeenOnboarding)
        return
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('credits, selected_plan, has_seen_onboarding')
        .eq('id', currentUser.id)
        .single()
      if (profile && !error) {
        setPlan(profile.selected_plan === 'none' ? null : profile.selected_plan)
        setCredits(profile.credits || 0)
        setHasSeenOnboarding(profile.has_seen_onboarding || false)
        profileCache.current = {
          plan: profile.selected_plan === 'none' ? null : profile.selected_plan,
          credits: profile.credits || 0,
          hasSeenOnboarding: profile.has_seen_onboarding || false
        }
      } else {
        setPlan(null)
        setCredits(0)
        setHasSeenOnboarding(false)
        profileCache.current = { plan: null, credits: 0, hasSeenOnboarding: false }
      }
    } else {
      setPlan(null)
      setCredits(0)
      setHasSeenOnboarding(false)
      profileCache.current = { plan: null, credits: 0, hasSeenOnboarding: false }
    }
  }, [supabase])

  // Expose a method to refresh profile cache
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user, true)
    }
  }, [user, fetchUserProfile])

  useEffect(() => {
    // If we have server data, we don't need to fetch it again on initial load.
    // The onAuthStateChange listener will handle updates.
    if (!serverSession) {
      const getSessionAndProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)
        await fetchUserProfile(currentUser)
        setLoading(false)
      }
      getSessionAndProfile()
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        // Always refresh profile on auth state change to get latest data
        await fetchUserProfile(currentUser, true)
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [supabase.auth, fetchUserProfile, serverSession])

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
  setUser(null)
  setPlan(null)
  setCredits(null)
  setHasSeenOnboarding(null)
  // Force reload to ensure all state is cleared and UI updates
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
  }

  const signInWithApple = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) return { error: error.message }
      return {}
    } catch {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signInWithMicrosoft = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) return { error: error.message }
      return {}
    } catch {
      return { error: 'An unexpected error occurred' }
    }
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
      signInWithApple,
      signInWithMicrosoft,
      signOut,
      refreshProfile, // Expose refresh method
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
