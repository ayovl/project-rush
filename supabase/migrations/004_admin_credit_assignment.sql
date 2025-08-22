-- Create RPC function that can be called from a trusted server environment
-- to assign plan credits to a specific user.
CREATE OR REPLACE FUNCTION admin_assign_plan_credits(user_id UUID, plan_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  credits_assigned INTEGER;
BEGIN
  -- This function is intended to be called by a service role key from the backend.
  -- It directly calls the internal credit assignment function.

  -- Assign credits based on plan
  credits_assigned := assign_plan_credits(user_id, plan_id);

  RETURN credits_assigned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Do NOT grant execute permission to 'authenticated' role.
-- This function should only be callable via the service_role key.
