import { Suspense } from 'react';
import AccountContent from './AccountContent';
import { createClient } from '@/lib/supabase/server';

// Server component to fetch user plan/credits
async function fetchUserPlanCreditsServer(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').select('credits, selected_plan').eq('id', userId).single();

  if (error || !data) {
    console.error('Error fetching user profile:', error?.message);
    return { credits: 0, plan: 'none' };
  }

  return { credits: data.credits ?? 0, plan: data.selected_plan ?? 'none' };
}

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialCredits = 0;
  let initialPlan = 'none';

  if (user) {
    const { credits, plan } = await fetchUserPlanCreditsServer(user.id);
    initialCredits = credits;
    initialPlan = plan;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F13] via-[#0F1417] to-[#0D1116] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AccountContent initialCredits={initialCredits} initialPlan={initialPlan} user={user} />
    </Suspense>
  );
}
