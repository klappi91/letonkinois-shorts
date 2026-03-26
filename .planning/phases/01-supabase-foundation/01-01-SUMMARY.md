---
phase: 01-supabase-foundation
plan: 01
subsystem: database
tags: [supabase, supabase-ssr, postgres, rls, typescript, next-js-16, proxy]

requires: []
provides:
  - "@supabase/supabase-js and @supabase/ssr installed and wired into Next.js 16"
  - "Three-client pattern: browser client (createBrowserClient), server client (createServerClient + await cookies()), admin client (service_role, no NEXT_PUBLIC_ prefix)"
  - "proxy.ts at project root with getClaims() auth and mp4 matcher exclusion"
  - "supabase/schema.sql with videos, feedback, prompt_versions tables, RLS, 6 policies"
  - "src/lib/types.ts updated: Video, Feedback, PromptVersion, VideoStatus interfaces"
  - ".env.example with three Supabase env var placeholders"
affects: [02-auth, 03-feedback-ui, 04-prompt-versioning]

tech-stack:
  added:
    - "@supabase/supabase-js@^2.100.0 — Supabase client SDK"
    - "@supabase/ssr@^0.9.0 — SSR-safe cookie-based auth helpers for Next.js App Router"
  patterns:
    - "Three-client pattern: client.ts (browser), server.ts (server/RSC), admin.ts (service-role)"
    - "proxy.ts at project root (not middleware.ts) for Next.js 16 session refresh"
    - "await cookies() in server.ts — required in Next.js 15+ (breaking change)"
    - "getClaims() in proxy.ts — JWT verified against published public keys (not spoofable)"
    - "SUPABASE_SERVICE_ROLE_KEY without NEXT_PUBLIC_ prefix — prevents browser exposure"
    - "RLS with app_metadata.role = 'admin' check for admin policies (D-01)"

key-files:
  created:
    - src/lib/supabase/client.ts
    - src/lib/supabase/server.ts
    - src/lib/supabase/admin.ts
    - proxy.ts
    - .env.example
    - supabase/schema.sql
  modified:
    - src/lib/types.ts
    - src/app/page.tsx
    - src/components/VideoCard.tsx
    - package.json
    - package-lock.json

key-decisions:
  - "Use @supabase/ssr@0.9.0 (not deprecated auth-helpers-nextjs)"
  - "proxy.ts at project root — Next.js 16 renamed middleware.ts to proxy.ts"
  - "getClaims() in proxy, not getSession() — getClaims verifies JWT server-side"
  - "VideoStatus = draft|approved|rejected replacing Rating = pending|approved|rejected (D-03)"
  - "VideoEntry kept as deprecated alias in types.ts — Phase 2 will migrate components"
  - "Schema uses TEXT + CHECK constraint for status (not Postgres ENUM) — more extensible (D-04)"

patterns-established:
  - "Three-client pattern: import createClient from src/lib/supabase/client.ts in 'use client' components, from server.ts in RSC/Server Actions, createAdminClient from admin.ts for service-role ops"
  - "RLS policies use (select auth.uid()) subquery form for performance"
  - "Admin detection via app_metadata.role = 'admin' — users cannot modify app_metadata"

requirements-completed: [SUPA-01, SUPA-02, SUPA-03, SUPA-04, SUPA-05, SUPA-06]

duration: 4min
completed: 2026-03-26
---

# Phase 1 Plan 01: Supabase Foundation Summary

**@supabase/ssr three-client pattern (browser/server/admin) + proxy.ts session refresh + complete SQL schema (videos/feedback/prompt_versions + RLS) + Supabase-compatible TypeScript types**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-26T10:29:19Z
- **Completed:** 2026-03-26T10:33:30Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Install @supabase/supabase-js and @supabase/ssr, create three-client factories (browser/server/admin) following Next.js 16 SSR patterns
- Create proxy.ts at project root (Next.js 16 session refresh, getClaims() auth, mp4 exclusion in matcher)
- Create complete SQL schema ready for Supabase Dashboard SQL Editor: three tables with CHECK constraints, unique index, RLS enabled, 6 policies (read/insert/update/admin)
- Update src/lib/types.ts with Supabase-compatible Video, Feedback, PromptVersion interfaces and VideoStatus type, while keeping VideoEntry deprecated alias for Phase 2 migration

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Supabase packages and create three-client pattern + proxy + env template** - `ede5142` (feat)
2. **Task 2: Create SQL schema file and update TypeScript types for Supabase compatibility** - `757a0d4` (feat)

**Plan metadata:** (final commit hash recorded after state update)

## Files Created/Modified

- `src/lib/supabase/client.ts` — Browser client factory via createBrowserClient
- `src/lib/supabase/server.ts` — Async server client with await cookies() (Next.js 16 required)
- `src/lib/supabase/admin.ts` — Service-role client, SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix)
- `proxy.ts` — Session refresh proxy, getClaims() auth, mp4 excluded from matcher
- `.env.example` — Three Supabase env var placeholders (committable template)
- `supabase/schema.sql` — Complete DDL: videos/feedback/prompt_versions tables + RLS + 6 policies
- `src/lib/types.ts` — Video, Feedback, PromptVersion, VideoStatus interfaces; VideoEntry kept as deprecated alias
- `src/app/page.tsx` — Updated "pending" comparison to "draft" (Rule 1 fix)
- `src/components/VideoCard.tsx` — Updated "pending" label to "draft"/"Entwurf" (Rule 1 fix)
- `package.json` / `package-lock.json` — Added @supabase/supabase-js + @supabase/ssr

## Decisions Made

- VideoStatus uses `draft | approved | rejected` (per D-03) replacing old `pending | approved | rejected`
- "draft" is semantically equivalent to "pending" for the existing JSON data — Phase 2 will migrate the JSON values
- Schema uses TEXT + CHECK for status column instead of Postgres ENUM for flexibility (D-04)
- proxy.ts uses getClaims() which verifies JWT against Supabase's published public keys — preferred over getUser() (network call) and getSession() (spoofable)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed "pending" rating comparison in page.tsx**
- **Found during:** Task 2 (update TypeScript types)
- **Issue:** src/app/page.tsx compared `v.rating === "pending"` but Rating is now aliased to VideoStatus which only has draft/approved/rejected — TypeScript build error
- **Fix:** Changed comparison to `v.rating === "draft"` (semantic equivalent under new status names)
- **Files modified:** src/app/page.tsx
- **Verification:** npm run build passes
- **Committed in:** 757a0d4 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed "pending" key in VideoCard.tsx RatingBadge component**
- **Found during:** Task 2 (update TypeScript types)
- **Issue:** VideoCard.tsx RatingBadge had `styles["pending"]` and `labels["pending"]` — TypeScript error since VideoStatus has no "pending" key
- **Fix:** Renamed "pending" key to "draft", changed label to "Entwurf" (matches VIDEO_STATUS_LABELS)
- **Files modified:** src/components/VideoCard.tsx
- **Verification:** npm run build passes
- **Committed in:** 757a0d4 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (Rule 1 - Bug, both caused by VideoStatus type change)
**Impact on plan:** Required fixes for TypeScript compilation. No scope creep. JSON data still has "pending" values — they will display as "Entwurf" at runtime once Phase 2 migrates the data to Supabase with "draft" status.

## Issues Encountered

- `npm run lint` fails with "Invalid project directory provided, no such directory: /home/chris/projects/letonkinois-shorts/lint" — this is a pre-existing issue unrelated to Phase 1 changes (no eslint.config.* file present, next lint v16 may require configuration). Deferred — does not affect build or runtime. `npm run build` passes clean.

## Known Stubs

None — no UI rendering stubs introduced. All new files are infrastructure (clients, schema, types). The `.env.local` contains placeholder values; real Supabase credentials must be added by the developer before the app can authenticate with Supabase.

## User Setup Required

External Supabase service requires manual configuration before Phase 2 auth features will work:

1. Create a Supabase project at https://supabase.com/dashboard
2. Run `supabase/schema.sql` in Supabase Dashboard → SQL Editor
3. Add real values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL from Settings → API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon/Publishable key from Settings → API
   - `SUPABASE_SERVICE_ROLE_KEY` — Service Role key from Settings → API
4. Add the same three env vars to Vercel Dashboard → Project Settings → Environment Variables

## Next Phase Readiness

- Three-client pattern fully established — Phase 2 can import createClient from any of the three files
- SQL schema ready for execution — run supabase/schema.sql in Dashboard SQL Editor
- TypeScript types ready — Video, Feedback, PromptVersion interfaces cover all three tables
- VideoEntry deprecated alias allows Phase 2 to migrate components incrementally
- proxy.ts will activate automatically once Supabase credentials are configured

## Self-Check: PASSED

All files verified to exist on disk. All task commits verified in git log.

- src/lib/supabase/client.ts — FOUND
- src/lib/supabase/server.ts — FOUND
- src/lib/supabase/admin.ts — FOUND
- proxy.ts — FOUND
- .env.example — FOUND
- supabase/schema.sql — FOUND
- src/lib/types.ts — FOUND
- .planning/phases/01-supabase-foundation/01-01-SUMMARY.md — FOUND
- Commit ede5142 — FOUND
- Commit 757a0d4 — FOUND

---
*Phase: 01-supabase-foundation*
*Completed: 2026-03-26*
