# Stack Research

**Domain:** Next.js app — adding Supabase Auth + DB, persistent ratings/feedback, cron-based AI content pipeline
**Researched:** 2026-03-26
**Confidence:** HIGH (all critical claims verified against official docs)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @supabase/supabase-js | 2.100.0 | Supabase client — DB queries, auth, admin operations | Current stable. The one client that works across Server Components, Client Components, and Route Handlers. Use it everywhere via wrapper functions. |
| @supabase/ssr | 0.9.0 | Cookie-based auth for Next.js SSR | The official replacement for deprecated `@supabase/auth-helpers-nextjs`. Provides `createServerClient` (for server) and `createBrowserClient` (for browser). Required for session persistence across RSC/client boundary. |

**Source:** npmjs.org registry, Supabase official docs — HIGH confidence

---

### Auth Pattern for Next.js 16

Next.js 16 renamed `middleware.ts` to `proxy.ts` and the exported function from `middleware` to `proxy`. This is a **breaking change** from Next.js 15. The edge runtime is NOT supported in `proxy.ts` — it runs Node.js only.

**Source:** nextjs.org/docs/app/guides/upgrading/version-16 — HIGH confidence (official docs, updated 2026-03-20)

Supabase's `@supabase/ssr` proxy setup requires:

1. `src/lib/supabase/server.ts` — `createServerClient` wrapper using `cookies()` from `next/headers`
2. `src/lib/supabase/client.ts` — `createBrowserClient` wrapper for Client Components
3. `src/proxy.ts` — Refreshes Supabase session tokens on every request using `supabase.auth.getClaims()` (NOT `getSession()` — `getSession` is deprecated server-side because it doesn't validate with Supabase's servers)

**Invite-Only implementation:**

Supabase Admin API (`supabase.auth.admin.inviteUserByEmail`) sends an invite email. Admin calls this from a protected Server Action using the `SUPABASE_SERVICE_ROLE_KEY`. No self-registration. Disable "Enable Signups" in Supabase Auth Settings.

**Source:** supabase.com/docs/reference/javascript/auth-admin-createuser — HIGH confidence

---

### Database / Schema

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase (PostgreSQL) | — | Videos table, ratings table, feedback table | Already chosen per PROJECT.md constraints. Free tier sufficient for this project scale (2-5 reviewers, ~daily video generation). |
| Row Level Security (RLS) | — | Per-user data access control | Mandatory when using Supabase with browser-side client. Without RLS, anon key exposes all data. Enable on every table from day one — retrofitting is painful. |

**Recommended table design:**

```sql
-- videos: migrated from videos.json
CREATE TABLE videos (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL,         -- 'showcase', 'before-after', etc.
  duration    INTEGER,               -- seconds
  file_path   TEXT NOT NULL,         -- relative path in /public/videos/
  captions    JSONB,                 -- { de: "...", fr: "..." }
  hashtags    TEXT[],
  status      TEXT DEFAULT 'draft',  -- 'draft', 'reviewed', 'published'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ratings: one row per user per video
CREATE TABLE ratings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id    TEXT REFERENCES videos(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stars       INTEGER CHECK (stars BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_id)  -- upsert-friendly
);

-- feedback: pros/cons per user per video
CREATE TABLE feedback (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id     TEXT REFERENCES videos(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pros         TEXT,
  cons         TEXT,
  incorporated BOOLEAN DEFAULT FALSE,  -- improvement-workflow reads WHERE incorporated = false
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);
```

The `incorporated` flag on `feedback` is how the improvement cron job knows which feedback to process. After writing improved prompts, it sets `incorporated = TRUE`.

**Source:** Supabase RLS docs, PostgreSQL UNIQUE constraint patterns — HIGH confidence for schema design

---

### Cron Jobs (Vercel)

**CRITICAL CONSTRAINT: Vercel Hobby plan = once per day maximum.**

| Plan | Min Interval | Max Function Duration | Scheduling Precision |
|------|-------------|----------------------|---------------------|
| Hobby | Once per day | 300s (5 min) | ±59 min within hour |
| Pro | Every minute | 800s (13 min) | Per-minute |

**Decision:** Use Vercel Pro plan OR accept once-per-day generation. For an Instagram content pipeline (target: 1 video/day), Hobby is technically sufficient but the ±59min timing imprecision is acceptable.

**Source:** vercel.com/docs/cron-jobs/usage-and-pricing — HIGH confidence

**Cron configuration pattern (`vercel.json`):**

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-video",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/improve-prompts",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Security pattern (mandatory — do not skip):**

Vercel injects `Authorization: Bearer $CRON_SECRET` on every cron invocation. Verify it in every cron Route Handler:

```ts
// src/app/api/cron/generate-video/route.ts
export const maxDuration = 300  // 5 min max on Hobby, 800 on Pro

export function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  // ... trigger generation
}
```

Set `CRON_SECRET` in Vercel environment variables — never in git.

**Source:** vercel.com/docs/cron-jobs/manage-cron-jobs (official code example) — HIGH confidence

**Important cron behavior:**
- Vercel does NOT retry on failure — build in retry logic or idempotent re-runs
- Cron invocations are HTTP GET requests — no request body
- Crons run against production deployment only (not preview)
- Duration limit is the hard ceiling — AI generation must complete within 300s (Hobby) or 800s (Pro)

---

### AI Content Pipeline

The cron Route Handler cannot run Claude Code directly inside Vercel's serverless functions — Claude Code is a CLI tool, not a Node.js library. The pipeline architecture must decouple trigger from execution:

**Pattern A — Vercel cron triggers, Claude Code runs on a separate machine (recommended):**

```
Vercel Cron (daily) → POST /api/cron/generate-video → writes "generation_requested" to Supabase
Long-running worker (separate VPS/local machine) → polls Supabase → spawns claude --print ... → uploads result
```

This sidesteps the 300s function limit entirely. The Vercel cron is just a trigger that writes a job record to Supabase. A separate persistent process (can be a local machine or cheap VPS) polls for pending jobs and runs Claude Code.

**Pattern B — Vercel cron calls @anthropic-ai/sdk directly (no Claude Code):**

```
Vercel Cron → Route Handler → @anthropic-ai/sdk → Gemini API → Remotion render
```

Drawback: Remotion renders require a full Node.js environment with ffmpeg. Vercel serverless functions don't support ffmpeg. Remotion rendering cannot run inside Vercel Functions.

**Conclusion: Use Pattern A.** The cron job is a lightweight trigger. The actual `claude` invocation and Remotion render happen on a machine with full CLI access.

**Source:** Research synthesis — MEDIUM confidence (architectural reasoning, not a single official source)

---

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @anthropic-ai/sdk | latest (~0.x) | Call Claude API directly from Node.js (for improvement-workflow scripts) | When running prompt improvement as a standalone Node.js script, not as a Vercel function |
| zod | ^3.x | Runtime schema validation for cron payloads and Supabase inserts | Validate all data before writing to DB; prevents bad data from corrupting the feedback loop |

---

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Supabase CLI | Local dev with Supabase (migrations, type generation) | `npx supabase gen types typescript --project-id ...` generates TypeScript types from DB schema. Run after every migration. |
| Supabase Studio | Inspect/manage DB, create invite-only users | Admin creates users via Auth → Users tab — no code needed for invite-only setup |
| vercel env | Manage secrets (CRON_SECRET, SUPABASE keys) | `vercel env add CRON_SECRET production` — never commit secrets |

---

## Installation

```bash
# In src/ (Next.js project root)

# Core Supabase
npm install @supabase/supabase-js@2.100.0 @supabase/ssr@0.9.0

# Validation (recommended)
npm install zod

# Dev: Supabase CLI for type generation
npm install -D supabase
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| @supabase/ssr | @supabase/auth-helpers-nextjs | Never — auth-helpers is deprecated, all bugfixes go to @supabase/ssr only |
| proxy.ts (Next.js 16) | middleware.ts | Only if staying on Next.js 15 or below |
| Vercel Cron | External cron (cron-job.org, GitHub Actions) | If on Hobby plan but need more than daily frequency — external crons can call Vercel Route Handlers on any schedule |
| Pattern A (external worker) | Pattern B (Vercel Function renders) | Never — Remotion requires ffmpeg which Vercel Functions do not have |
| Supabase Auth (invite) | NextAuth / Auth.js | If you need OAuth providers (Google, GitHub) — overkill for a 2-5 person internal tool |
| Zod | Yup, io-ts | If the team already uses Yup — Zod is simpler, faster, has better TypeScript inference |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| @supabase/auth-helpers-nextjs | Officially deprecated — bugfixes stopped, will eventually break on newer Next.js | @supabase/ssr |
| supabase.auth.getSession() server-side | Does not validate JWT with Supabase servers — can be spoofed | supabase.auth.getClaims() (verifies signature locally) or supabase.auth.getUser() |
| middleware.ts with function named `middleware` | Deprecated in Next.js 16 — still works but triggers build warnings, will be removed | proxy.ts with export function proxy() |
| Remotion rendering inside Vercel Functions | ffmpeg is not available in serverless environments — render will fail | Render on a local machine or a VPS with full Node.js environment |
| getServerSideProps for auth | Pages Router pattern — not applicable to App Router | Server Components + Server Actions |
| Vercel Hobby cron for sub-daily generation | Hobby enforces once-per-day maximum — deployment fails if expression would run more often | Vercel Pro OR external cron calling your Route Handler |

---

## Stack Patterns by Variant

**If staying on Vercel Hobby:**
- Cron runs once per day at a fixed UTC time
- Accept ±59 minute timing imprecision
- Budget 300s max for the cron function execution
- The cron just triggers a Supabase job record; actual generation runs elsewhere

**If upgrading to Vercel Pro:**
- Cron can run every minute
- maxDuration can be set to 800s
- Still cannot run Remotion/ffmpeg inside the function

**If the team wants to review in the evening (German timezone, UTC+1/+2):**
- Schedule generation cron at `0 6 * * *` UTC (= 7:00-8:00 CET / 8:00-9:00 CEST)
- Schedule improvement cron at `0 7 * * *` UTC (runs after generation)

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @supabase/ssr@0.9.0 | Next.js 16.2.1, React 19 | Uses `cookies()` from `next/headers` async API — must await cookies() in Next.js 16 (breaking change from v15 where sync access existed) |
| @supabase/supabase-js@2.100.0 | @supabase/ssr@0.9.0 | Always keep both in sync — install together |
| Next.js 16 proxy.ts | @supabase/ssr@0.9.0 | @supabase/ssr docs reference "proxy" not "middleware" for Next.js 16 — compatible |
| Vercel cron | Next.js Route Handlers (app/) | Official support — Vercel recommends App Router Route Handlers for cron endpoints |

**Next.js 16 async APIs — breaking change affecting Supabase setup:**

In Next.js 16, `cookies()` and `headers()` are async-only (synchronous access removed). The `@supabase/ssr` `createServerClient` call must use `await cookies()`:

```ts
// Next.js 16 — must be async
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  const cookieStore = await cookies()  // await required in Next.js 16
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

**Source:** Next.js 16 upgrade guide (official, 2026-03-20) — HIGH confidence

---

## Environment Variables Required

```bash
# Supabase (from Supabase project dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...           # safe to expose to browser
SUPABASE_SERVICE_ROLE_KEY=eyJ...               # server-only, never expose to browser

# Vercel Cron security
CRON_SECRET=[random 16+ char string]           # set in Vercel dashboard, not in .env

# AI (for improvement workflow scripts)
ANTHROPIC_API_KEY=sk-ant-...                   # server-only
```

---

## Sources

- [Supabase SSR package docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client) — createServerClient/createBrowserClient API — HIGH confidence
- [Supabase Next.js SSR guide](https://supabase.com/docs/guides/auth/server-side/nextjs) — proxy.ts setup for Next.js 16 — HIGH confidence
- [npmjs.org @supabase/ssr](https://registry.npmjs.org/@supabase/ssr/latest) — version 0.9.0 verified — HIGH confidence
- [npmjs.org @supabase/supabase-js](https://registry.npmjs.org/@supabase/supabase-js/latest) — version 2.100.0 verified — HIGH confidence
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — proxy.ts breaking change, async cookies() — HIGH confidence (official, 2026-03-20)
- [Vercel cron docs](https://vercel.com/docs/cron-jobs) — cron expression format — HIGH confidence
- [Vercel cron usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing) — Hobby once/day limit, Pro every minute — HIGH confidence
- [Vercel managing cron jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs) — CRON_SECRET security pattern — HIGH confidence
- [Vercel function duration](https://vercel.com/docs/functions/configuring-functions/duration) — Hobby 300s, Pro 800s — HIGH confidence
- [Supabase admin inviteUserByEmail](https://supabase.com/docs/reference/javascript/auth-admin-createuser) — invite-only pattern — HIGH confidence

---

*Stack research for: Le Tonkinois Shorts — Supabase Auth + DB + Vercel Cron + AI pipeline*
*Researched: 2026-03-26*
