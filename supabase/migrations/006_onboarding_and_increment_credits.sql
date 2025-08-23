-- Add has_seen_onboarding column if missing
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_seen_onboarding boolean NOT NULL DEFAULT false;

-- Atomic credits increment RPC
create or replace function public.increment_credits(p_user_id uuid, p_amount integer)
returns void language sql security definer as $$
  update public.profiles
  set credits = coalesce(credits,0) + p_amount,
      updated_at = now()
  where id = p_user_id;
$$;
