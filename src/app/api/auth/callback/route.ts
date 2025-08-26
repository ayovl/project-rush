import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error.message)
      // Redirect to the pricing page with an error message
      return NextResponse.redirect(`${origin}/pricing?error=auth_error&error_description=${encodeURIComponent(error.message)}`)
    }

    if (data.user) {
      // A user is new if their last_sign_in_at is null.
      // This is a reliable indicator for the first sign-in via an OAuth provider.
      const isNewUser = data.user.last_sign_in_at === null

      if (isNewUser) {
        // Redirect new users to the pricing page to choose a plan.
        return NextResponse.redirect(`${origin}/pricing`)
      } else {
        // Redirect existing users to the main application.
        return NextResponse.redirect(`${origin}/main-app`)
      }
    }
  }

  // If there's no code, redirect to an error page.
  console.error('No auth code found in callback request.')
  return NextResponse.redirect(`${origin}/pricing?error=auth_error&error_description=No_auth_code_provided`)
}
