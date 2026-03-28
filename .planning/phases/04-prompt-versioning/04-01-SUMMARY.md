---
phase: 04-prompt-versioning
plan: 01
subsystem: database
tags: [supabase, prompt-versioning, seed-script, typescript, nextjs]

# Dependency graph
requires:
  - phase: 02-auth-data-migration
    provides: Supabase client setup (createAdminClient, createClient), videos table schema
  - phase: 03-feedback-ui
    provides: Video detail page structure (video/[id]/page.tsx)
provides:
  - prompt_versions table seeded with v1.0 baseline (before-after and showcase prompts)
  - All existing videos linked to v1.0 via prompt_version UUID
  - Video detail page displays version number ("v1.0") in metadata line
affects: [future prompt improvement workflow, cron-job phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Seed scripts use createAdminClient + idempotency check (re-run safe)"
    - "version_number stored as integer in DB, displayed as v{n}.0 on frontend"
    - "Prompt version query is inline conditional — only fires if video.prompt_version is non-null"

key-files:
  created:
    - scripts/seed-prompt-versions.ts
  modified:
    - src/app/video/[id]/page.tsx

key-decisions:
  - "version_number is integer in DB (not decimal), display convention adds .0 suffix (v1.0)"
  - "Unproduced video types (how-to, seasonal, heritage, lifestyle) stored as null in v1.0 content — intentional placeholder"
  - "Prompt version query uses server client (not admin) on detail page — read-only, no elevated permissions needed"

patterns-established:
  - "Seed script pattern: import createAdminClient → idempotency check → insert → update → log"

requirements-completed: [PROM-01, PROM-02, PROM-03]

# Metrics
duration: 2min
completed: 2026-03-28
---

# Phase 4 Plan 01: Prompt Versioning Seed Summary

**prompt_versions table seeded with v1.0 (before-after + showcase prompts), all videos linked, version label "v1.0" shown on detail page**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-28T10:19:00Z
- **Completed:** 2026-03-28T10:21:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created idempotent seed script that inserts v1.0 prompt content into prompt_versions table
- Linked all existing video rows to v1.0 via prompt_version UUID (updates only null rows)
- Added conditional version label query on video detail page — shows "v1.0" between date and pipeline metadata

## Task Commits

Each task was committed atomically:

1. **Task 1: Create seed script for prompt v1.0 and link existing videos** - `a757271` (feat)
2. **Task 2: Display prompt version on video detail page** - `53da778` (feat)

## Files Created/Modified

- `scripts/seed-prompt-versions.ts` - Idempotent seed script: inserts v1.0 into prompt_versions, links all videos to v1.0 UUID
- `src/app/video/[id]/page.tsx` - Added prompt_versions query + conditional "v1.0" span in metadata line

## Decisions Made

- `version_number` is integer in schema, `".0"` suffix is a display convention on the frontend
- Unproduced types (how-to, seasonal, heritage, lifestyle) stored as `null` in content JSONB — marks them as unimplemented rather than absent
- Server client used for prompt_versions query on detail page (no elevated permissions needed for read)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Seed script requires environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) — resolved by using `--env-file=.env.local` flag with tsx. Script itself is correctly designed; this is standard local development practice.

## User Setup Required

None - no external service configuration required. Seed script already executed against the Supabase project.

## Known Stubs

None - all data is wired. prompt_versions table has real content, videos reference it, detail page renders it.

## Next Phase Readiness

- Prompt versioning data infrastructure is complete
- Phase 4 plan 01 completes the prompt-versioning phase (only 1 plan)
- Future improvement workflow (cron job reading feedback → bumping prompt version) can now read from prompt_versions and write new version rows
- All video rows have non-null prompt_version — no orphaned videos

---
*Phase: 04-prompt-versioning*
*Completed: 2026-03-28*
