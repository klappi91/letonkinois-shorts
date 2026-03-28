---
phase: 02-auth-data-migration
plan: 02
subsystem: database
tags: [supabase, nextjs, data-migration, server-components, typescript]

# Dependency graph
requires:
  - phase: 02-auth-data-migration/02-01
    provides: LogoutButton.tsx, CopyButton.tsx, proxy.ts auth guard, Supabase client utilities
  - phase: 01-gallery-dashboard
    provides: Video type in types.ts, VideoGrid/VideoCard components, gallery pages
provides:
  - scripts/seed-videos.ts: one-time migration of videos.json to Supabase videos table
  - Gallery page (/) as async Server Component reading from Supabase
  - Video detail page (/video/[id]) as async Server Component reading from Supabase
  - LogoutButton wired in all three page headers (gallery, detail, assets)
  - VideoEntry type fully removed from component files
  - videos.json deleted from repository
affects: [03-feedback-form, all future plans reading video data from Supabase]

# Tech tracking
tech-stack:
  added:
    - tsx 4.21.0 (devDependency for running TypeScript scripts outside Next.js build)
  patterns:
    - "Async Server Component data fetch: const supabase = await createClient() then .from('videos').select('*')"
    - "Seed script idempotency: check if rows exist before inserting, skip if already seeded"
    - "Nullable Supabase fields: use ?? '' or ?? [] for display, not optional chaining"
    - "tsconfig exclude scripts/: one-time scripts excluded from Next.js TypeScript compilation"

key-files:
  created:
    - scripts/seed-videos.ts
  modified:
    - src/app/page.tsx
    - src/app/video/[id]/page.tsx
    - src/app/assets/page.tsx
    - src/components/VideoGrid.tsx
    - src/components/VideoCard.tsx
    - package.json
    - tsconfig.json
  deleted:
    - src/data/videos.json

key-decisions:
  - "Supabase videos.id is UUID — JSON slug IDs (showcase-vernis-001) cannot be upserted; id omitted from seed rows, Supabase generates UUIDs"
  - "Seed idempotency via existence check: query SELECT id LIMIT 1 before inserting, skip if already seeded"
  - "tsconfig.json excludes scripts/ directory — seed script runs via tsx directly, not via Next.js tsc"
  - "Video detail page converted from use client + React.use(params) to async Server Component + await params"

patterns-established:
  - "Pattern: async Server Component data fetch — await createClient() then .from().select() at top of function"
  - "Pattern: seed script excludes id field when DB uses UUID primary key with auto-generate"
  - "Pattern: tsconfig.json exclude: ['node_modules', 'scripts'] — scripts are tsx-only, not part of build"

requirements-completed: [DATA-01, DATA-02, DATA-03, DATA-04]

# Metrics
duration: 3min
completed: 2026-03-28
---

# Phase 2 Plan 02: Data Migration Summary

**Supabase seed script + async Server Components replacing videos.json — gallery and detail pages now read live from Supabase with LogoutButton in all headers**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-28T07:04:51Z
- **Completed:** 2026-03-28T07:08:24Z
- **Tasks:** 2
- **Files modified:** 7 (plus 1 deleted, 1 created)

## Accomplishments

- Created `scripts/seed-videos.ts` — idempotent one-time migration mapping camelCase JSON fields to snake_case Supabase columns (rating:pending -> status:draft per CHECK constraint). Successfully seeded 5 videos.
- Converted gallery page `/` from static JSON import to async Server Component with Supabase query (`from('videos').select('*').order('created_at', { ascending: false })`)
- Converted video detail page `/video/[id]` from `'use client'` + `React.use(params)` to async Server Component with `await params` + `.eq('id', id).single()` query
- Wired `LogoutButton` into all three page headers: gallery (`/`), video detail (`/video/[id]`), and assets (`/assets`)
- Replaced `VideoEntry` with `Video` type throughout `VideoCard.tsx` and `VideoGrid.tsx` (snake_case fields: `video_url`, `created_at`, `status`)
- Deleted `src/data/videos.json` — data fully migrated to Supabase
- Build passes cleanly (`npm run build` exit 0)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create seed script and migrate videos.json to Supabase** - `0528359` (feat)
2. **Task 2: Migrate gallery + detail + assets pages to Supabase queries + wire LogoutButton** - `d721090` (feat)

**Plan metadata:** (docs commit — pending)

## Files Created/Modified

- `scripts/seed-videos.ts` — One-time migration: maps 5 VideoEntry JSON records to Video Supabase rows with field rename and status normalization
- `src/app/page.tsx` — Async Server Component: queries `from('videos').select('*')`, LogoutButton in header, `videoList.filter(v => v.status === 'draft')` for stats
- `src/app/video/[id]/page.tsx` — Async Server Component: `await params`, `.eq('id', id).single()`, snake_case fields, imports CopyButton and LogoutButton from components
- `src/app/assets/page.tsx` — Added LogoutButton import and render in header
- `src/components/VideoCard.tsx` — Video type (not VideoEntry): `video.video_url ?? ''`, `video.created_at`, `video.status`
- `src/components/VideoGrid.tsx` — Video[] prop type (not VideoEntry[])
- `package.json` — Added `"seed": "npx tsx scripts/seed-videos.ts"` script entry; tsx devDependency
- `tsconfig.json` — Added `"scripts"` to exclude array to prevent tsx-only scripts from failing Next.js tsc
- `src/data/videos.json` — DELETED

## Decisions Made

- **UUID vs slug IDs:** Supabase `videos.id` is `uuid primary key default gen_random_uuid()`. The JSON used slug strings ("showcase-vernis-001") which violate the UUID type. Seed script omits `id` from inserted rows — Supabase generates stable UUIDs on first run. The existence check (`SELECT id LIMIT 1`) makes it idempotent.
- **Seed idempotency pattern:** Rather than `upsert` with a conflict column (no unique constraint on non-ID fields), we check for existing rows first and skip. Clean for a one-time migration.
- **tsconfig exclude scripts/:** The `scripts/` dir uses `tsx` directly and imports `videos.json` (now deleted). Excluding it from TypeScript compilation prevents build failures for non-Next.js utility scripts.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] UUID primary key mismatch — seed script cannot insert slug string IDs**
- **Found during:** Task 1 (running seed script)
- **Issue:** `scripts/seed-videos.ts` in the plan mapped `entry.id` (slug: "showcase-vernis-001") to Supabase `id` column which has type `uuid` — Postgres threw `invalid input syntax for type uuid`
- **Fix:** Removed `id` field from upsert rows (let Supabase auto-generate UUID). Added idempotency check: query `SELECT id LIMIT 1` before inserting; skip if data already exists
- **Files modified:** `scripts/seed-videos.ts`
- **Verification:** Script runs and outputs "Seeded 5 videos successfully." Verified 5 rows in Supabase via admin client query.
- **Committed in:** `0528359` (Task 1 commit)

**2. [Rule 3 - Blocking] TypeScript build failed after videos.json deletion**
- **Found during:** Task 2 (after deleting videos.json, re-running build)
- **Issue:** `tsconfig.json` includes `**/*.ts` which picked up `scripts/seed-videos.ts` — its import of the now-deleted `videos.json` caused TypeScript type error in the Next.js build
- **Fix:** Added `"scripts"` to `tsconfig.json` `exclude` array. The seed script runs via `tsx` (which uses its own resolution), not via the Next.js build.
- **Files modified:** `tsconfig.json`
- **Verification:** `npm run build` exits 0
- **Committed in:** `d721090` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes necessary for correctness. Seed script still satisfies all acceptance criteria (upsert, field mapping, idempotent). No scope creep.

## Issues Encountered

- UUID/slug ID mismatch in seed script (see Deviations above — auto-fixed)
- TypeScript compilation of scripts/ after JSON deletion (see Deviations above — auto-fixed)

## User Setup Required

None — Supabase project already configured, seed ran successfully via `npm run seed`.

## Next Phase Readiness

- Gallery and video detail pages now read from Supabase — data is live
- All pages have LogoutButton — auth flow is complete end-to-end
- `VideoEntry` type removed from all component files — only the deprecated alias remains in `types.ts` (can be removed when Phase 3 confirms no remaining usages)
- Phase 3 (feedback form) can now insert feedback rows using the UUID video IDs from Supabase
- No blockers.

## Known Stubs

- Rating action buttons ("Freigeben", "Ablehnen", "Zur Seite legen") in video detail page remain non-functional — Phase 3 will replace them with the actual feedback form
- `video.video_url` renders the URL path (e.g., `/videos/howto-erstanstrich-001.mp4`) — video files exist in `public/videos/` and the paths are valid

---
*Phase: 02-auth-data-migration*
*Completed: 2026-03-28*
