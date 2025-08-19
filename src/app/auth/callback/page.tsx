'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/pricing?error=auth_failed')
          return
        }

        if (data.session) {
          // Successfully authenticated, redirect to pricing or wherever they came from
          router.push('/pricing?success=authenticated')
        } else {
          router.push('/pricing')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/pricing?error=auth_failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F13] via-[#0F1417] to-[#0D1116] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D1FF] mx-auto mb-4"></div>
        <p className="text-white/60">Completing authentication...</p>
      </div>
    </div>
  )
}
