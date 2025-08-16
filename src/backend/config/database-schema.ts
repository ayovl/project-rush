/**
 * Supabase Database Schema
 * This file contains the SQL commands to create tables in your Supabase database
 * Run these commands in your Supabase SQL Editor
 */

export const DATABASE_SCHEMA = `
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create generations table
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  style_type TEXT DEFAULT 'REALISTIC',
  aspect_ratio TEXT DEFAULT '1:1',
  num_images INTEGER DEFAULT 4,
  rendering_speed TEXT DEFAULT 'TURBO',
  magic_prompt BOOLEAN DEFAULT FALSE,
  character_reference_url TEXT, -- URL to uploaded character reference image
  generated_images JSONB, -- Array of generated image URLs and metadata
  ideogram_request_id TEXT, -- Ideogram API request ID
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage bucket for character reference images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('character-references', 'character-references', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for generated images (if you want to store them locally)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for generations table
CREATE POLICY "Users can view own generations" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations" ON public.generations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for storage
CREATE POLICY "Users can upload character references" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'character-references' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view character references" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'character-references' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generations_updated_at 
  BEFORE UPDATE ON public.generations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

export const ASPECT_RATIOS = [
  '1:1',
  '16:9',
  '9:16',
  '4:3',
  '3:4',
  '3:2',
  '2:3',
  '16:10',
  '10:16'
] as const;

export const STYLE_TYPES = [
  'AUTO',
  'GENERAL',
  'REALISTIC',
  'DESIGN',
  'FICTION'
] as const;

export const RENDERING_SPEEDS = [
  'TURBO',
  'DEFAULT',
  'QUALITY'
] as const;
