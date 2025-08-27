import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow of Supabase.
  // It exchanges an auth code for the user's session.
  //
  // For more information, please visit:
  // https://supabase.com/docs/guides/auth/server-side-rendering
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      // Check if the user has a plan
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('selected_plan')
        .eq('id', user.id)
        .single()

      // If there's no profile or no plan, redirect to pricing
      if (error || !profile || !profile.selected_plan || profile.selected_plan === 'none') {
        return NextResponse.redirect(`${origin}/pricing`)
      }
    }
  }

  // For existing users with a plan, or if something went wrong, redirect to demo
  return NextResponse.redirect(`${origin}/demo`)
}
