# LearnVault LMS — Setup Guide

## 1. Create Supabase Project
1. Go to https://supabase.com → New Project (free)
2. Copy your **Project URL** and **anon key** from Settings → API

## 2. Configure Environment Variables
Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  (from Settings > API > service_role)
```

## 3. Run Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Paste and run the entire contents of `supabase/schema.sql`

## 4. Enable pg_cron (auto-delete)
1. Supabase Dashboard → Database → Extensions
2. Search "pg_cron" → Enable it
3. Re-run the `SELECT cron.schedule(...)` part of schema.sql

## 5. Create First Admin User
1. Run the app: `npm run dev`
2. Register at http://localhost:3000/auth/register
3. In Supabase → Table Editor → profiles
4. Find your user → change `role` from `user` to `admin`
5. Now you can log in as admin and upload videos

## 6. Run the App
```bash
npm run dev
```

## How It Works
- **Admin** → uploads videos, manages users, can delete videos manually
- **User** → watches videos only, cannot download, cannot right-click
- **Watermark** → user's name + email overlaid on video, moves every 8 seconds
- **Auto-delete** → pg_cron deletes videos older than 7 days automatically
- **Signed URLs** → video links expire every 2 hours, can't be shared

## Folder Structure
```
src/
  app/
    auth/login        → Login page
    auth/register     → Register page
    admin/dashboard   → Admin: upload + manage videos
    admin/users       → Admin: view all users
    dashboard         → User: browse videos
    watch/[id]        → Protected video player
  components/
    admin/            → Admin UI components
    user/             → User UI components
    player/           → Video player with watermark
  lib/supabase/       → Supabase client (browser + server)
supabase/
  schema.sql          → Full DB schema + RLS + cron
```
