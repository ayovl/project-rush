# Supabase Setup Instructions

## Quick Setup (2 minutes):

### 1. Install Supabase CLI:
```bash
npm install -g supabase
```

### 2. Login to Supabase:
```bash
supabase login
```

### 3. Initialize your project:
```bash
supabase init
```

### 4. Link to your Supabase project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
(Get YOUR_PROJECT_REF from your Supabase dashboard URL)

### 5. Run the migration:
```bash
supabase db push
```

## Alternative: Manual Setup (if you prefer dashboard):

1. Go to your Supabase dashboard
2. Click on "SQL Editor"
3. Copy and paste the content from `supabase/migrations/001_initial_schema.sql`
4. Run the SQL

## What This Creates:

### Tables:
- **profiles**: User profiles (extends Supabase auth)
- **generations**: Store image generation requests and results

### Storage Buckets:
- **character-references**: Store uploaded reference images
- **generated-images**: Optional backup of generated images

### Security:
- Row Level Security (RLS) enabled
- Users can only access their own data
- Automatic user profile creation on signup

### Features:
- Automatic timestamps (created_at, updated_at)
- Secure file uploads
- User isolation
