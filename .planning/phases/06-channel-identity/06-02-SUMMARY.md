---
phase: 06-channel-identity
plan: 02
subsystem: ui
tags: [remotion, typescript, css-filter, brand-tokens, safe-zones, color-grade]

# Dependency graph
requires:
  - phase: 06-01
    provides: src/lib/brand.ts with COLOR_GRADE and SAFE_ZONES exports
provides:
  - remotion/src/components/ColorGrade.tsx as Golden-Hour CSS filter wrapper
  - StepBadge.tsx and SceneLabel.tsx using SAFE_ZONES constants (no magic numbers)
affects:
  - 06-03 (moodboard page, future compositions can use ColorGrade at root)
  - All future Remotion compositions (import ColorGrade at root for consistent grading)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ColorGrade applied at composition root only — never inside Sequence children to avoid double-grading"
    - "CSS filter string built from COLOR_GRADE constants — no hardcoded values in component"
    - "SAFE_ZONES constants replace magic numbers in all positioning styles"

key-files:
  created:
    - remotion/src/components/ColorGrade.tsx
  modified:
    - remotion/src/components/StepBadge.tsx
    - remotion/src/components/SceneLabel.tsx

key-decisions:
  - "ColorGrade uses AbsoluteFill wrapper pattern (not inline style on parent) — consistent with existing Remotion component conventions"
  - "enabled prop defaults to true — opt-out semantics mean all compositions get grading unless explicitly disabled"
  - "Import path ../../../src/lib/brand for Remotion components — matches Pattern established in 06-01 (remotion/tsconfig include expansion)"

patterns-established:
  - "ColorGrade pattern: root-level AbsoluteFill wrapper, CSS filter built from constants, enabled=true default with opt-out"
  - "SAFE_ZONES pattern: all Remotion component positioning uses named constants from brand.ts, never magic numbers"

requirements-completed: [IDENT-02, IDENT-03]

# Metrics
duration: 8min
completed: 2026-03-28
---

# Phase 06 Plan 02: ColorGrade + SAFE_ZONES Migration Summary

**Golden-Hour CSS filter wrapper built from COLOR_GRADE constants; StepBadge and SceneLabel migrated from magic numbers to SAFE_ZONES — zero hardcoded positioning values remain**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-28T16:29:00Z
- **Completed:** 2026-03-28T16:37:53Z
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 updated)

## Accomplishments
- Created ColorGrade.tsx: AbsoluteFill wrapper that builds CSS filter from COLOR_GRADE constants (sepia, saturate, brightness, contrast, hue-rotate), enabled by default with opt-out via `enabled={false}`
- Migrated StepBadge.tsx: replaced `top: 140` and `right: 60` with `SAFE_ZONES.topSafe` and `SAFE_ZONES.sideSafe`
- Migrated SceneLabel.tsx: replaced `bottom: 380`, `left: 80`, `right: 80` with `SAFE_ZONES.bottomSafe` and `SAFE_ZONES.contentSide`
- All builds pass: `npm run build` (Next.js) and `npx tsc --noEmit` (Remotion)

## Task Commits

1. **Task 1: Create ColorGrade wrapper component** - `c13d44a` (feat)
2. **Task 2: Migrate StepBadge and SceneLabel to SAFE_ZONES constants** - `e98847b` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `remotion/src/components/ColorGrade.tsx` - CSS filter wrapper for Golden-Hour look; imports COLOR_GRADE from brand.ts; enabled=true default
- `remotion/src/components/StepBadge.tsx` - Removed magic numbers (140, 60); now uses SAFE_ZONES.topSafe + SAFE_ZONES.sideSafe
- `remotion/src/components/SceneLabel.tsx` - Removed magic numbers (380, 80); now uses SAFE_ZONES.bottomSafe + SAFE_ZONES.contentSide

## Decisions Made
- ColorGrade uses AbsoluteFill wrapper (not inline style on parent element) — matches AbsoluteFill convention across all Remotion components
- enabled prop defaults to true with opt-out semantics — every composition gets grading automatically unless explicitly disabled
- CSS filter string joined by " " (space-separated) — correct CSS syntax for filter chains

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- `npm run lint` fails in worktree environment (Next.js 16 path resolution issue unrelated to this plan's changes). Pre-existing constraint. Verified via `npm run build` (passes) and `npx tsc --noEmit` (passes) instead.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None — ColorGrade contains no placeholder values. All filter values come from COLOR_GRADE constants which were established in Plan 01. Values are marked as "starting values" in brand.ts comments and will be tuned visually in Remotion Studio during Phase 7/8.

## Next Phase Readiness
- ColorGrade ready for use at composition root in GartenmobelRenovation and BootDeckRenovation
- All Remotion components now use SAFE_ZONES constants — migration is complete
- Plan 03 (moodboard page) can proceed independently

---
*Phase: 06-channel-identity*
*Completed: 2026-03-28*
