-- =============================================
-- LMS DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,        -- path in Supabase Storage bucket
  thumbnail_path TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. Watch history (optional - track who watched what)
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  progress_seconds INT DEFAULT 0
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, admins can read all
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Videos: authenticated users can view active non-expired videos
CREATE POLICY "Authenticated users can view active videos"
  ON public.videos FOR SELECT
  TO authenticated
  USING (is_active = TRUE AND expires_at > NOW());

CREATE POLICY "Admins can insert videos"
  ON public.videos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update videos"
  ON public.videos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete videos"
  ON public.videos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Watch history
CREATE POLICY "Users can manage own watch history"
  ON public.watch_history FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- AUTO-DELETE EXPIRED VIDEOS (pg_cron)
-- Enable pg_cron extension first in Supabase Dashboard > Extensions
-- =============================================

-- Enable the extension (run separately if needed)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2 AM UTC
SELECT cron.schedule(
  'delete-expired-videos',
  '0 2 * * *',
  $$
    -- Delete from storage (mark inactive first)
    UPDATE public.videos
    SET is_active = FALSE
    WHERE expires_at < NOW() AND is_active = TRUE;

    -- Delete expired video records older than 1 extra day
    DELETE FROM public.videos
    WHERE expires_at < NOW() - INTERVAL '1 day' AND is_active = FALSE;
  $$
);

-- =============================================
-- STORAGE BUCKET
-- Run in Supabase Dashboard > Storage > New Bucket
-- Name: videos
-- Public: FALSE (private bucket - we use signed URLs)
-- =============================================

-- Storage RLS policies (run after creating the bucket)
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "Admins can upload videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'videos' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'videos' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view videos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'videos');
