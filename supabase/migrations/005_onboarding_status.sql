-- Add a flag to the profiles table to track if a user has seen the onboarding tutorial.
-- This is more reliable than localStorage as it's tied to the user account.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_seen_onboarding BOOLEAN DEFAULT FALSE;
