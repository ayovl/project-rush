# 🎯 Plan Credit System - Database Migration

## 🚀 **IMMEDIATE ACTION REQUIRED**

You need to run the database migration to enable the plan credit system:

### **Step 1: Run Database Migration**

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your `project-rush` project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste this migration:**

```sql
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
```

4. **Click "Run" to execute the migration**

### **Step 2: Update Existing Users (Optional)**

If you have existing test users, you can reset them:

```sql
-- Reset existing users to 0 credits and no plan
UPDATE public.profiles SET credits = 0, selected_plan = 'none';
```

---

## 🎯 **How It Works Now**

### **New User Flow:**
1. **User signs up** → Gets 0 credits, plan = 'none'
2. **User selects plan on pricing page** → Gets appropriate credits assigned
3. **Credits assigned based on plan:**
   - **Basic**: 25 credits
   - **Pro**: 60 credits  
   - **Ultimate**: 200 credits

### **Database Structure:**
- `profiles.credits` → Actual credits earned
- `profiles.selected_plan` → User's selected plan
- Database functions automatically assign credits

---

## 🧪 **Test After Migration**

1. **Visit your live Vercel app**
2. **Sign up with a new email for each plan**
3. **Expected results:**
   - **Basic signup**: Shows "25 credits" in profile
   - **Pro signup**: Shows "60 credits" in profile
   - **Ultimate signup**: Shows "200 credits" in profile

---

## ✅ **Migration Complete**

After running this migration:
- ✅ New signups will get correct credits
- ✅ ProfileMenu will show real database values
- ✅ Plan tracking works properly
- ✅ Ready for payment integration later

**Run the migration and test each plan signup! 🚀**
