---
phase: 05-tech-debt-cleanup
plan: 01
subsystem: database
tags: [typescript, supabase, types, schema, npm-scripts, dead-code]

# Dependency graph
requires:
  - phase: 02-auth-data-migration
    provides: Supabase schema and seed scripts
  - phase: 04-prompt-versioning
    provides: prompt_versions table and seed-prompt-versions.ts script
provides:
  - Clean types.ts with only actively-used exports (Video, Feedback, VideoType, VideoStatus, lookup maps)
  - seed:prompts npm script alias for scripts/seed-prompt-versions.ts
  - schema.sql with uuid FK constraint on videos.prompt_version
affects: [all-future-phases, schema-migrations]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dead code removal: deprecated type aliases removed when migration period ends"
    - "Schema FK pattern: prompt_version uuid references public.prompt_versions(id)"

key-files:
  created: []
  modified:
    - src/lib/types.ts
    - package.json
    - supabase/schema.sql

key-decisions:
  - "schema.sql FK change is documentation-only — live DB migration is a separate step via Supabase SQL Editor"
  - "PromptVersion and PromptVersionContent interfaces removed from types.ts — scripts use their own inline types"

patterns-established:
  - "Seed scripts use inline types, not shared types.ts — avoids coupling between app types and admin scripts"

requirements-completed: [PROM-01, PROM-02]

# Metrics
duration: 2min
completed: 2026-03-28
---

# Phase 05 Plan 01: Tech Debt Cleanup Summary

**Removed 51 lines of dead code from types.ts (deprecated VideoEntry, Rating, PromptVersion aliases), added seed:prompts npm script, and upgraded schema.sql videos.prompt_version to uuid FK referencing prompt_versions.id**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-28T11:49:31Z
- **Completed:** 2026-03-28T11:51:50Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Removed all deprecated/unused types from types.ts: VideoEntry interface, Rating type alias, PromptVersion interface, PromptVersionContent interface, Legacy Compatibility comment block
- Added `seed:prompts` npm script alias pointing to `scripts/seed-prompt-versions.ts` (follows same pattern as existing `seed` script)
- Changed `videos.prompt_version` column in schema.sql from `text` to `uuid references public.prompt_versions(id)` for proper referential integrity in fresh installs

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove dead code from types.ts and add seed:prompts npm script** - `66f0be4` (refactor)
2. **Task 2: Add FK constraint to schema.sql for videos.prompt_version** - `301af9a` (chore)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/lib/types.ts` - Removed 51 lines of deprecated/unused code; retains Video, Feedback, VideoType, VideoStatus, lookup maps
- `package.json` - Added seed:prompts script alias for seed-prompt-versions.ts
- `supabase/schema.sql` - Changed prompt_version from text to uuid FK referencing public.prompt_versions(id)

## Decisions Made
- schema.sql FK is a documentation change only — the live Supabase DB already has TEXT values that are valid UUIDs; live migration (ALTER TABLE + ADD CONSTRAINT) must be run separately via Supabase SQL Editor or MCP
- PromptVersion/PromptVersionContent removed from shared types.ts — these types were never imported by app code (scripts/seed-prompt-versions.ts used its own inline types); removing from shared types avoids confusion

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

The live DB migration for the FK constraint requires a separate manual step if desired:
```sql
ALTER TABLE public.videos
  ALTER COLUMN prompt_version TYPE uuid USING prompt_version::uuid;
ALTER TABLE public.videos
  ADD CONSTRAINT videos_prompt_version_fkey
  FOREIGN KEY (prompt_version) REFERENCES public.prompt_versions(id);
```

## Next Phase Readiness
- Phase 05 Plan 01 complete — all tech debt items from v1.0 milestone audit resolved
- types.ts is clean and minimal; ready for any future type additions without legacy noise
- schema.sql is authoritative for fresh installs with proper FK constraint

## Self-Check: PASSED

- FOUND: src/lib/types.ts (in worktree)
- FOUND: package.json (in worktree)
- FOUND: supabase/schema.sql (in worktree)
- FOUND: 05-01-SUMMARY.md (at /home/chris/projects/letonkinois-shorts/.planning/phases/05-tech-debt-cleanup/05-01-SUMMARY.md)
- FOUND commit: 66f0be4 (Task 1)
- FOUND commit: 301af9a (Task 2)

---
*Phase: 05-tech-debt-cleanup*
*Completed: 2026-03-28*
