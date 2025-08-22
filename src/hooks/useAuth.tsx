'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlanService } from '@/services/planService'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  plan: string | null
  credits: number | null
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
  const supabase = createClient()

  // Debug: Log environment variables (only URL for security)
  useEffect(() => {
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Anon Key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  }, [])

  const fetchUserPlan = async (currentUser: User | null) => {
    if (currentUser) {
      const { success, plan, credits } = await PlanService.getUserCredits()
      if (success) {
        setPlan(plan === 'none' ? null : (plan ?? null))
        setCredits(credits || 0)
      } else {
        setPlan(null)
        setCredits(0)
      }
    } else {
      setPlan(null)
      setCredits(0)
    }
  }

  useEffect(() => {
    const getSessionAndPlan = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      await fetchUserPlan(currentUser)
      setLoading(false)
    }

    getSessionAndPlan()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        await fetchUserPlan(currentUser)
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          await fetchUserPlan(currentUser)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

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
