-- Le Tonkinois Shorts — Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- Phase 1: SUPA-03, SUPA-04, SUPA-05, SUPA-06

-- ============================================
-- TABLES
-- ============================================

-- Videos table (SUPA-03)
-- Status uses TEXT + CHECK per D-04 (not ENUM — more flexible for later extensions)
-- Status values: draft, approved, rejected per D-03
create table if not exists public.videos (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  caption_de      text,
  caption_fr      text,
  hashtags        text[] default '{}',
  type            text not null check (type in ('showcase','before-after','how-to','seasonal','heritage','lifestyle')),
  duration        integer,
  pipeline        text,
  status          text not null default 'draft' check (status in ('draft','approved','rejected')),
  prompt_version  uuid references public.prompt_versions(id),
  video_url       text,
  products        text[] default '{}',
  created_at      timestamptz not null default now()
);

-- Feedback table (SUPA-04)
create table if not exists public.feedback (
  id             uuid primary key default gen_random_uuid(),
  video_id       uuid not null references public.videos(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  stars          integer not null check (stars between 1 and 5),
  pros           text,
  cons           text,
  created_at     timestamptz not null default now(),
  processed_at   timestamptz
);

-- Unique constraint: one feedback per user per video (enables upsert)
create unique index if not exists feedback_video_user_unique
  on public.feedback (video_id, user_id);

-- Prompt versions table (SUPA-05)
-- Content is JSONB structured per VideoType per D-07:
-- { "showcase": { "image_prompt": "...", "video_prompt": "...", "composition_config": {...} }, ... }
create table if not exists public.prompt_versions (
  id               uuid primary key default gen_random_uuid(),
  version_number   integer not null,
  content          jsonb not null,
  created_at       timestamptz not null default now(),
  created_by       uuid references auth.users(id)
);

-- ============================================
-- ROW LEVEL SECURITY (SUPA-06)
-- ============================================

-- Enable RLS on all tables
alter table public.videos enable row level security;
alter table public.feedback enable row level security;
alter table public.prompt_versions enable row level security;

-- Videos: any authenticated user can read (D-01: admin uses service_role which bypasses RLS)
create policy "Authenticated users can read videos"
  on public.videos for select
  to authenticated
  using (true);

-- Feedback: users can insert their own feedback
create policy "Users can insert own feedback"
  on public.feedback for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Feedback: users can update their own feedback (for upsert/re-rating)
create policy "Users can update own feedback"
  on public.feedback for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Feedback: users can read their own feedback
create policy "Users can read own feedback"
  on public.feedback for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Feedback: admins can read ALL feedback (per D-01: app_metadata.role = 'admin')
create policy "Admins can read all feedback"
  on public.feedback for select
  to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- Prompt versions: any authenticated user can read
create policy "Authenticated users can read prompt versions"
  on public.prompt_versions for select
  to authenticated
  using (true);
