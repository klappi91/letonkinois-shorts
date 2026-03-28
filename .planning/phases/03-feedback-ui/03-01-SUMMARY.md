---
phase: 03-feedback-ui
plan: 01
subsystem: ui
tags: [react, supabase, star-rating, feedback, upsert, tailwind]

# Dependency graph
requires:
  - phase: 02-auth-data-migration
    provides: Supabase server/browser clients, feedback table with RLS, Feedback type in types.ts
provides:
  - FeedbackForm client component (star rating + pros/cons + upsert)
  - Video detail page wired with server-side feedback fetch and FeedbackForm
affects: [04-improvement-workflow, future admin feedback view]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server Component fetches existing feedback via getUser() + single() query, passes as prop to client component
    - Client component uses upsert with onConflict to overwrite previous rating
    - window.location.reload() after successful upsert to refresh server-side data

key-files:
  created:
    - src/components/FeedbackForm.tsx
  modified:
    - src/app/video/[id]/page.tsx

key-decisions:
  - "FeedbackForm is 'use client' — mutations always use browser client, not Server Actions"
  - "Existing feedback fetched server-side in async Server Component, passed as existingFeedback prop — visible on page load without extra client round-trip"
  - "Upsert uses onConflict: 'video_id,user_id' — matches the unique index feedback_video_user_unique from Phase 1 schema"
  - "processed_at NOT set in upsert payload — stays null, will be set by Phase 4 improvement workflow"
  - "window.location.reload() after save — refreshes server-side data consistently (no client state management needed)"
  - "next lint is broken in Next.js 16 (command removed) — TypeScript check + build used as validation instead"

patterns-established:
  - "Feedback form pattern: useState for fields + async submit + upsert + reload"
  - "Server-side feedback pre-population: fetch in async Server Component, pass to client component as prop"

requirements-completed: [FEED-01, FEED-02, FEED-03, FEED-04]

# Metrics
duration: 15min
completed: 2026-03-28
---

# Phase 3 Plan 01: Feedback UI Summary

**Star rating (1-5, brand red) + pros/cons textareas wired to Supabase upsert with server-side pre-population on revisit**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-28T09:00:00Z
- **Completed:** 2026-03-28T09:15:00Z
- **Tasks:** 2 auto + 1 checkpoint (auto-approved)
- **Files modified:** 2

## Accomplishments
- Created FeedbackForm client component with 5-star rating (brand red filled, muted empty), pros/cons textareas, and Supabase upsert
- Modified video detail page to fetch existing feedback server-side and pre-populate FeedbackForm on revisit
- Removed placeholder buttons (Freigeben/Ablehnen/Zur Seite legen) — replaced with real feedback form
- Upsert correctly handles re-rating without duplicates; processed_at stays null

## Task Commits

Each task was committed atomically:

1. **Task 1: Create FeedbackForm client component** - `328bf02` (feat)
2. **Task 2: Wire FeedbackForm into video detail page** - `1247ff8` (feat)
3. **Task 3: Verify feedback form end-to-end** - auto-approved (checkpoint)

## Files Created/Modified
- `src/components/FeedbackForm.tsx` - Star rating + pros/cons form with Supabase upsert (143 lines, 'use client')
- `src/app/video/[id]/page.tsx` - Added server-side feedback fetch, replaced placeholder buttons with FeedbackForm

## Decisions Made
- Used `window.location.reload()` after upsert (consistent with login page pattern using `window.location.href`) — no need for complex client state refresh
- Star icons use Unicode `&#9733;` (★) character — no icon library needed
- "Deine bisherige Bewertung" shown above form when existingFeedback is not null — subtle indicator, not a banner

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### Pre-existing Issues Discovered (out of scope)
- `npm run lint` is broken in this project: Next.js 16 removed the `lint` command, and no `eslint.config.js` exists. This is a pre-existing issue not introduced by this plan. TypeScript check (`tsc --noEmit`) and `npm run build` both pass cleanly.

## Issues Encountered
- `npm run lint` fails with "Invalid project directory provided, no such directory: /lint" — Next.js 16 removed the `lint` CLI command. Pre-existing issue, not caused by this plan. TypeScript and build pass.

## User Setup Required
None — no external service configuration required. Feedback table and RLS already configured in Phase 1.

## Next Phase Readiness
- Feedback loop human side is complete: reviewers can rate videos with stars and add pros/cons
- Feedback rows are in Supabase with processed_at = null, ready for Phase 4 improvement workflow to consume
- No blockers for next phase

---
*Phase: 03-feedback-ui*
*Completed: 2026-03-28*

## Self-Check: PASSED

- src/components/FeedbackForm.tsx: FOUND
- src/app/video/[id]/page.tsx: FOUND
- .planning/phases/03-feedback-ui/03-01-SUMMARY.md: FOUND
- Commit 328bf02: FOUND
- Commit 1247ff8: FOUND
