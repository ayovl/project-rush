import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;
  const planId = requestUrl.searchParams.get('planId');

  if (code) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);

    if (user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('selected_plan')
        .eq('id', user.id)
        .single();

      const isNewUser = error || !profile || !profile.selected_plan || profile.selected_plan === 'none';

      if (isNewUser) {
        // For new users, always redirect to pricing.
        // If they came from the pricing page with a plan selected, preserve that plan.
        let redirectUrl = `${origin}/pricing`;
        if (planId) {
          redirectUrl += `?planId=${planId}`;
        }
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  // For existing users with a plan, or if something went wrong, redirect to demo
  return NextResponse.redirect(`${origin}/`);
}
