-- Update profiles table to track selected plan and give plan-appropriate credits
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selected_plan TEXT DEFAULT 'basic';
ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 0; -- Start with 0, assign based on plan

-- Create function to assign credits based on plan
CREATE OR REPLACE FUNCTION assign_plan_credits(user_id UUID, plan_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  credits_to_assign INTEGER := 0;
BEGIN
  -- Assign credits based on plan
  CASE plan_id
    WHEN 'basic' THEN credits_to_assign := 25;
    WHEN 'pro' THEN credits_to_assign := 60;
    WHEN 'ultimate' THEN credits_to_assign := 200;
    ELSE credits_to_assign := 0; -- No plan selected
  END CASE;

  -- Update user profile with plan and credits
  UPDATE public.profiles 
  SET 
    selected_plan = plan_id,
    credits = credits_to_assign,
    updated_at = NOW()
  WHERE id = user_id;

  RETURN credits_to_assign;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle new user profile creation with plan
CREATE OR REPLACE FUNCTION handle_new_user_with_plan()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits, selected_plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    0, -- Start with 0 credits, will be assigned when plan is selected
    'none' -- No plan selected initially
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_with_plan();

-- Create RPC function that can be called from the frontend to assign plan credits
CREATE OR REPLACE FUNCTION rpc_assign_plan_credits(plan_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_user_id UUID;
  credits_assigned INTEGER;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Assign credits based on plan
  credits_assigned := assign_plan_credits(current_user_id, plan_id);
  
  RETURN credits_assigned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION rpc_assign_plan_credits(TEXT) TO authenticated;
