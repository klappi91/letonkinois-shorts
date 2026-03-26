# Architecture Research

**Domain:** Video content dashboard with AI generation pipeline and persistent feedback loop
**Researched:** 2026-03-26
**Confidence:** HIGH (Supabase + Next.js patterns), MEDIUM (cron pipeline orchestration)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BROWSER (Reviewer)                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Gallery /   │  │  Video       │  │  Login       │  │  Asset       │    │
│  │  Dashboard   │  │  Detail +    │  │  /auth       │  │  Browser     │    │
│  │  (filter,    │  │  Feedback    │  │              │  │              │    │
│  │   grid)      │  │  Form        │  │              │  │              │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────────────┘    │
└─────────┼─────────────────┼────────────────┼──────────────────────────────┘
          │                 │                │
┌─────────▼─────────────────▼────────────────▼──────────────────────────────┐
│                     NEXT.JS (Vercel) — App Router                           │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  middleware.ts  — Supabase token refresh + route protection           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────┐    │
│  │  Server          │  │  Server Actions  │  │  API Route Handlers    │    │
│  │  Components      │  │  (feedback       │  │  /api/cron/generate    │    │
│  │  (gallery,       │  │   submit, admin  │  │  /api/cron/improve     │    │
│  │   video detail)  │  │   user create)   │  │  /api/auth/callback    │    │
│  └──────────────────┘  └──────────────────┘  └────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
          │                      │                        │
          │ (Supabase client)    │ (service_role)         │ (cron HTTP GET)
          │                      │                        │
┌─────────▼──────────────────────▼────────────────┐      │
│               SUPABASE                           │      │
│                                                  │      │
│  ┌──────────────┐  ┌──────────────────────────┐  │      │
│  │  Auth        │  │  Postgres Database       │  │      │
│  │  (invite-    │  │                          │  │      │
│  │   only,      │  │  videos                  │  │      │
│  │   HTTP-only  │  │  feedback                │  │      │
│  │   cookies)   │  │  users (auth.users view) │  │      │
│  └──────────────┘  └──────────────────────────┘  │      │
└──────────────────────────────────────────────────┘      │
                                                          │
┌─────────────────────────────────────────────────────────▼──────────────────┐
│                    CRON HANDLER (Vercel Function)                            │
│                                                                              │
│  /api/cron/generate (daily)          /api/cron/improve (weekly)             │
│  ┌─────────────────────────────┐     ┌────────────────────────────────┐     │
│  │ 1. Read prompt templates    │     │ 1. Query new feedback from DB  │     │
│  │ 2. Pick content rotation    │     │ 2. Pass to Claude Code         │     │
│  │ 3. Invoke Gemini Image API  │     │ 3. Claude updates prompts.json │     │
│  │ 4. Invoke Gemini Video API  │     │ 4. Commit / write back to disk │     │
│  │ 5. Render via Remotion CLI  │     │ 5. Mark feedback as processed  │     │
│  │ 6. Copy MP4 to public/      │     └────────────────────────────────┘     │
│  │ 7. Insert row to DB         │                                             │
│  └─────────────────────────────┘                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                    │
                    │ (subprocess: npx remotion render)
                    ▼
          ┌─────────────────────┐
          │  Remotion (local)   │
          │  renders MP4        │
          └─────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `middleware.ts` | Refresh Supabase auth tokens, redirect unauthenticated to `/login`, block `/` and `/video/*` without session | Supabase Auth (cookie read/write) |
| Gallery page (`/`) | Server-render video grid, read videos from Supabase, show filter + stats | Supabase DB (read), VideoGrid (client) |
| Video detail page (`/video/[id]`) | Server-render player + metadata, pass video to feedback form | Supabase DB (read), FeedbackForm (client) |
| FeedbackForm (client component) | Collect star rating + pros/cons text, submit via Server Action | Server Action: `submitFeedback` |
| Server Action `submitFeedback` | Insert feedback row to DB, update video aggregate rating | Supabase DB (write, service_role not needed — uses session RLS) |
| Server Action `createInviteUser` | Admin-only: call `supabase.auth.admin.inviteUserByEmail()` | Supabase Auth Admin API (service_role) |
| `/api/cron/generate` | Orchestrate daily video generation: prompt → Gemini → Remotion → DB insert | Gemini API, Remotion CLI subprocess, Supabase DB |
| `/api/cron/improve` | Read unprocessed feedback → Claude analysis → update prompt files → mark processed | Supabase DB (read/write), Claude Code API or local script |
| Supabase `videos` table | Source of truth for video metadata (replaces videos.json) | Read by gallery/detail, written by cron/generate |
| Supabase `feedback` table | Stores ratings + text feedback per video per user, tracks processed status | Written by FeedbackForm, read by cron/improve |
| Remotion compositions | Programmatic MP4 rendering from image sequences and brand components | Called via CLI subprocess by cron/generate |

## Recommended Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Gallery (Server Component, reads from Supabase)
│   ├── layout.tsx                  # Root layout (fonts, global styles)
│   ├── login/
│   │   └── page.tsx                # Login form (email/password or magic link)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts            # OAuth/magic link callback handler
│   ├── video/
│   │   └── [id]/page.tsx           # Detail view with FeedbackForm
│   ├── assets/
│   │   └── page.tsx                # Asset browser (unchanged)
│   └── api/
│       ├── cron/
│       │   ├── generate/
│       │   │   └── route.ts        # Daily generation cron endpoint
│       │   └── improve/
│       │       └── route.ts        # Weekly improvement cron endpoint
│       └── auth/
│           └── callback/
│               └── route.ts        # Supabase auth callback
├── components/
│   ├── VideoGrid.tsx               # Filter + grid (client, unchanged)
│   ├── VideoCard.tsx               # Card preview (client, unchanged)
│   └── FeedbackForm.tsx            # Star rating + pros/cons (NEW, client)
├── actions/
│   ├── feedback.ts                 # submitFeedback Server Action
│   └── admin.ts                    # createInviteUser Server Action
├── lib/
│   ├── types.ts                    # VideoEntry, FeedbackEntry (extended)
│   ├── supabase/
│   │   ├── client.ts               # createBrowserClient() helper
│   │   ├── server.ts               # createServerClient() helper (cookies)
│   │   └── admin.ts                # createServiceRoleClient() (server-only)
│   └── cron/
│       ├── generate-video.ts       # Generation pipeline logic
│       └── improve-prompts.ts      # Feedback analysis + prompt update logic
└── data/
    └── asset-catalog.ts            # Asset registry (unchanged)
middleware.ts                       # Supabase token refresh + auth guard
supabase/
├── migrations/
│   ├── 001_create_videos.sql       # videos table
│   ├── 002_create_feedback.sql     # feedback table + RLS policies
│   └── 003_seed_from_json.sql      # One-time migration from videos.json
└── schema.sql                      # Current schema state
```

### Structure Rationale

- **`src/lib/supabase/`:** Three separate clients prevent accidental service_role usage. Browser client only for client components. Server client reads cookies for SSR. Admin client (`service_role`) only for cron handlers and admin actions — never imported in components.
- **`src/actions/`:** Server Actions for mutations keep auth logic server-side. Feedback submission uses session-scoped client (RLS enforced). User creation uses admin client.
- **`src/lib/cron/`:** Generation and improvement logic separated from the route handler. Route handler only validates CRON_SECRET and calls the library function. This enables local testing without HTTP.
- **`supabase/migrations/`:** SQL migrations tracked in version control. Run via Supabase CLI. Seed migration converts existing `videos.json` entries to DB rows once.

## Architectural Patterns

### Pattern 1: Supabase SSR Auth with Next.js Middleware

**What:** Middleware proxy that refreshes the Supabase auth token on every request and writes updated cookies to both the server response and the browser. Route protection via `supabase.auth.getUser()` — not `getSession()`.

**When to use:** All protected pages. The entire dashboard (`/`, `/video/*`, `/assets`) requires auth.

**Trade-offs:** Small overhead on every request; necessary to prevent token expiry on long sessions.

**Example:**
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
```

### Pattern 2: Invite-Only User Creation via Admin API

**What:** Admin creates users server-side via `supabase.auth.admin.inviteUserByEmail()`. No public signup endpoint exists. The service_role key is only used server-side in a protected Server Action.

**When to use:** Initial team setup (2-5 reviewers). New reviewer onboarding.

**Trade-offs:** Requires admin access to Supabase dashboard or a protected admin UI. Simpler than building a full invite-token flow.

**Example:**
```typescript
// src/actions/admin.ts
'use server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function inviteUser(email: string) {
  // Verify the calling user is an admin first
  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  })
  if (error) throw error
  return data
}
```

### Pattern 3: Vercel Cron Secured with CRON_SECRET

**What:** Cron endpoints are standard GET Route Handlers secured by checking the `Authorization: Bearer <CRON_SECRET>` header that Vercel injects automatically. No public access.

**When to use:** Both `/api/cron/generate` and `/api/cron/improve` endpoints.

**Trade-offs:** Security depends entirely on CRON_SECRET being set in Vercel env vars. Vercel does not retry failed cron invocations — errors must be logged and monitored.

**Example:**
```typescript
// src/app/api/cron/generate/route.ts
import { generateVideo } from '@/lib/cron/generate-video'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    await generateVideo()
    return Response.json({ success: true })
  } catch (err) {
    console.error('[cron/generate]', err)
    return Response.json({ success: false, error: String(err) }, { status: 500 })
  }
}
```

### Pattern 4: Remotion Render as CLI Subprocess

**What:** The cron handler spawns `npx remotion render` as a child process. Remotion does not offer a programmatic Node.js rendering API that works outside its own runtime. The subprocess writes to `remotion/out/`, then the handler copies the file to `public/videos/`.

**When to use:** Cron generation pipeline. Local development too.

**Trade-offs:** Subprocess spawning adds latency (~10-30s per render). Must be within Vercel function `maxDuration`. On Hobby plan: 300s hard limit. On Pro: up to 800s. A 24.5s Remotion composition at 30fps renders in ~20-40s on CI. This should fit within Hobby limits for a single video per cron run.

**Critical constraint:** Remotion CLI depends on `ffmpeg` being available in the execution environment. Vercel does not include `ffmpeg` in default Node.js runtime. **Resolution: Use `@remotion/lambda` for cloud rendering, or run Remotion renders locally via a GitHub Actions workflow triggered by the Vercel cron via repository_dispatch.**

### Pattern 5: Feedback Loop Data Flow

**What:** Feedback rows have a `processed: boolean` flag. The improvement cron reads only `WHERE processed = false`, passes them to an analysis step, then marks them `processed = true`. Prevents double-processing.

**When to use:** `/api/cron/improve` weekly workflow.

**Trade-offs:** Simple boolean flag is not idempotent if the cron crashes mid-run. Mitigation: set `processed = true` only after prompt file is confirmed written.

## Data Flow

### Reviewer Submits Feedback

```
Reviewer opens /video/[id]
    ↓
Server Component reads video row from Supabase (server client, anon key + RLS)
    ↓
Renders FeedbackForm (client component, hydrates with video id + current rating)
    ↓
Reviewer sets 1-5 stars + types pros/cons → submits form
    ↓
Server Action `submitFeedback` is called
    ↓
Insert row to `feedback` table: { video_id, user_id, stars, pros, cons, created_at, processed: false }
    ↓
Update `videos.aggregate_rating` (optional denorm) or compute on read
    ↓
Redirect or optimistic update back to detail page
```

### Daily Generation Cron

```
Vercel cron triggers GET /api/cron/generate (UTC midnight)
    ↓
Validate CRON_SECRET header
    ↓
Read `prompts/[type].json` for current content rotation slot
    ↓
Call Gemini Image API → get scene image bytes
    ↓
(Optional) Call Gemini Video API → get short video clip
    ↓
Write image to assets/sequences/[reel-name]/
    ↓
Spawn subprocess: `cd remotion && npx remotion render [CompositionId] out/[id].mp4`
    ↓
Copy rendered MP4 to public/videos/[id].mp4
    ↓
Insert row to `videos` table with metadata, captions, hashtags, status: "pending"
    ↓
Return { success: true, videoId }
```

### Weekly Improvement Cron

```
Vercel cron triggers GET /api/cron/improve (Monday 06:00 UTC)
    ↓
Validate CRON_SECRET header
    ↓
Query `feedback` table: SELECT * FROM feedback WHERE processed = false
    ↓
Group by video type (before-after, showcase, etc.)
    ↓
For each type: pass feedback text + current prompts/[type].json to Claude
    ↓
Claude returns updated prompt JSON
    ↓
Write updated prompts/[type].json to disk
    ↓
UPDATE feedback SET processed = true WHERE id IN (processed_ids)
    ↓
Return { success: true, typesUpdated: [...] }
```

### Auth Flow (First Login)

```
Admin calls inviteUserByEmail("reviewer@example.com")
    ↓
Supabase sends email with magic link → /auth/callback?token=...
    ↓
Reviewer clicks link → Next.js /auth/callback route handler
    ↓
Route handler exchanges token for session (supabase.auth.exchangeCodeForSession)
    ↓
Session stored in HTTP-only cookies
    ↓
Redirect to / (gallery dashboard)
    ↓
middleware.ts validates session on every subsequent request
```

## Database Schema

```sql
-- videos: replaces src/data/videos.json
CREATE TABLE videos (
  id           TEXT PRIMARY KEY,          -- e.g. "before-after-terrasse-001"
  title        TEXT NOT NULL,
  type         TEXT NOT NULL,             -- showcase|before-after|how-to|seasonal|heritage|lifestyle
  video_file   TEXT NOT NULL,             -- path: /videos/[filename].mp4
  duration     INTEGER NOT NULL,          -- seconds
  pipeline     TEXT NOT NULL,             -- remotion-only|gemini-image|gemini-video
  status       TEXT NOT NULL DEFAULT 'pending',  -- pending|approved|rejected
  caption_de   TEXT,
  caption_fr   TEXT,
  hashtags     TEXT[],
  products     TEXT[],
  created_at   TIMESTAMPTZ DEFAULT now(),
  aggregate_stars NUMERIC(3,2)            -- denormalized avg, updated on feedback insert
);

-- feedback: new table
CREATE TABLE feedback (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id     TEXT REFERENCES videos(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stars        SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  pros         TEXT,
  cons         TEXT,
  processed    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- RLS: reviewers can read all videos, insert own feedback, read own feedback
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read videos"
  ON videos FOR SELECT TO authenticated USING (true);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own feedback"
  ON feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own feedback"
  ON feedback FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
-- Cron and admin read all feedback via service_role (bypasses RLS)
```

## Component Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Browser client components ↔ Supabase | Via Server Actions only (no direct DB calls from browser) | Avoids exposing anon key patterns; mutations always server-side |
| Server Components ↔ Supabase | Direct via `createServerClient()` with cookies | Read-only for gallery and detail pages |
| Cron handlers ↔ Supabase | Via `createAdminClient()` (service_role) | Bypasses RLS — only used for trusted server processes |
| Cron handler ↔ Remotion | Child process via `child_process.spawn` or `execSync` | See critical constraint about ffmpeg below |
| Cron handler ↔ Gemini | HTTP via `@google/generative-ai` SDK | Standard async/await, respects maxDuration |
| Next.js app ↔ Remotion compositions | No runtime connection — Remotion is a separate npm project rendered offline | Remotion output (MP4) moved to `public/videos/` manually or by cron |

## Suggested Build Order

Dependencies between components determine this ordering:

1. **Supabase schema + migrations** — Everything else reads from or writes to the DB. Unblocks all other layers.
2. **Supabase auth + middleware** — Protects all routes before any UI changes ship. Unblocks login page and session-aware components.
3. **JSON-to-Supabase data migration** — Replace `videos.json` static import with live DB reads. Gallery and detail pages gain a live data source.
4. **Feedback UI + Server Action** — FeedbackForm, `submitFeedback` action, `feedback` table writes. Can be built once auth and DB are live.
5. **Generation cron** (`/api/cron/generate`) — Orchestrates Gemini + Remotion + DB insert. Depends on DB schema, resolving the Remotion/ffmpeg constraint first.
6. **Improvement cron** (`/api/cron/improve`) — Reads feedback rows (step 4 must produce data), updates prompt files. Last in chain.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 2-5 reviewers (current target) | Single Supabase project (free tier), Vercel Hobby cron (1/day limit), everything as described |
| 10-20 reviewers | Upgrade Supabase to Pro for connection pooling (PgBouncer), Vercel Pro for multiple crons per day |
| Public access | Add rate limiting on feedback endpoints, Supabase connection pooler mandatory |

### Scaling Priorities

1. **First bottleneck:** Remotion render time inside a Vercel function. At Hobby (300s limit) this works for simple compositions. Complex multi-scene renders may exceed limits. Resolution: move renders to GitHub Actions or a dedicated render server.
2. **Second bottleneck:** Supabase free tier (500MB DB, 50MB file storage). Videos stay in `public/videos/` (Vercel-hosted), not Supabase Storage, which avoids the storage limit.

## Anti-Patterns

### Anti-Pattern 1: Direct DB Calls from Client Components

**What people do:** Import `createBrowserClient()` in a client component and call `supabase.from('feedback').insert(...)` directly from the browser.

**Why it's wrong:** Exposes anon key patterns in client bundle. RLS protects data but mutation logic (validation, side effects like updating aggregate_rating) runs in an untrusted environment. Also makes testing harder.

**Do this instead:** All mutations go through Server Actions. Client component calls `submitFeedback(formData)` — a typed server function with access to the session cookie.

### Anti-Pattern 2: Using `getSession()` for Auth Guards

**What people do:** Call `supabase.auth.getSession()` in middleware or Server Components to check if a user is logged in.

**Why it's wrong:** `getSession()` reads the session from the cookie without validating the JWT signature against Supabase's public keys. An attacker who can manipulate cookies can bypass it. Supabase explicitly warns against this in their 2025 docs.

**Do this instead:** Always use `supabase.auth.getUser()` which validates the JWT signature server-side on every call.

### Anti-Pattern 3: Triggering Remotion Render Synchronously in Cron

**What people do:** Call `execSync('npx remotion render ...')` inside the cron route handler, blocking the function until render completes.

**Why it's wrong:** Vercel functions do not have `ffmpeg` in their runtime. Even if they did, synchronous blocking in a serverless function wastes provisioned memory during the render wait time.

**Do this instead:** For Phase 1, trigger a GitHub Actions `repository_dispatch` workflow from the cron handler. The workflow runs on a self-hosted or GitHub-hosted runner with full Node.js + ffmpeg. For Phase 2, evaluate `@remotion/lambda` (renders on AWS Lambda) or Remotion's server-side rendering API.

### Anti-Pattern 4: Storing MP4s in Supabase Storage

**What people do:** Upload rendered MP4s to Supabase Storage and serve them from there.

**Why it's wrong:** Supabase Storage free tier is 1GB. A 24.5s MP4 at reasonable quality is 15-30MB. After 40 videos you hit the limit. Vercel's CDN already serves `public/videos/` efficiently.

**Do this instead:** Keep videos in `public/videos/` for Vercel CDN delivery. Only video metadata lives in Supabase.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | `@supabase/ssr` — cookie-based, server-side token refresh in middleware | `@supabase/auth-helpers-nextjs` is deprecated (June 2025); use `@supabase/ssr` only |
| Supabase Database | `@supabase/supabase-js` with three client types (browser / server / admin) | RLS policies enforce per-user data access; admin (service_role) bypasses RLS |
| Vercel Cron | `vercel.json` `crons` array, GET route handlers with CRON_SECRET validation | Hobby plan: 1 cron/day max, fired within a 1-hour window. Pro: per-minute precision. No retry on failure. |
| Gemini API | `@google/generative-ai` SDK, async calls within cron function | Store `GOOGLE_AI_API_KEY` in Vercel env vars |
| Remotion CLI | Child process subprocess from cron handler, or GitHub Actions dispatch | `ffmpeg` is not available in Vercel serverless — this is the primary deployment blocker for in-function rendering |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `src/app/` pages ↔ `src/actions/` | Direct import (Next.js Server Actions) | `'use server'` directive, called from client components |
| `src/lib/cron/` ↔ cron route handlers | Direct import | Route handler owns auth, library owns domain logic |
| Next.js app ↔ Remotion | File system only (MP4 in `public/videos/`) | No runtime coupling. Remotion remains a standalone project. |
| `supabase/migrations/` ↔ Supabase project | `supabase db push` via Supabase CLI | Run locally before deploy; schema tracked in version control |

## Sources

- [Supabase Auth + Next.js App Router (SSR guide)](https://supabase.com/docs/guides/auth/server-side/nextjs) — HIGH confidence, official docs
- [Supabase auth.admin.createUser / inviteUserByEmail](https://supabase.com/docs/reference/javascript/auth-admin-createuser) — HIGH confidence, official docs
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence, official docs
- [Vercel Cron Jobs overview](https://vercel.com/docs/cron-jobs) — HIGH confidence, official docs
- [Vercel Cron Jobs management (duration, concurrency, idempotency)](https://vercel.com/docs/cron-jobs/manage-cron-jobs) — HIGH confidence, official docs
- [Vercel Functions Limits (maxDuration per plan)](https://vercel.com/docs/functions/limitations) — HIGH confidence, official docs (300s Hobby, 800s Pro with Fluid Compute)
- [Remotion + Claude Code integration](https://www.remotion.dev/docs/ai/claude-code) — MEDIUM confidence, official Remotion docs but AI integration patterns evolving
- Note: `@supabase/auth-helpers-nextjs` deprecated June 2025 — use `@supabase/ssr` package exclusively

---
*Architecture research for: Le Tonkinois Shorts — Supabase + cron AI pipeline integration*
*Researched: 2026-03-26*
