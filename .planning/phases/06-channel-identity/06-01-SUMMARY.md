---
phase: 06-channel-identity
plan: 01
subsystem: ui
tags: [typescript, brand-tokens, remotion, tailwind, css-variables]

# Dependency graph
requires: []
provides:
  - src/lib/brand.ts as single source of truth for all Le Tonkinois visual tokens
  - COLORS (14 tokens), PRODUCT_ACCENTS, SAFE_ZONES, COLOR_GRADE, FONTS, FORBIDDEN_AESTHETICS, PROMPT_FRAGMENTS
  - remotion/src/utils/colors.ts re-exports COLORS from brand.ts
  - globals.css synced with --color-navy and sync comment
affects:
  - 06-02 (ColorGrade component imports COLOR_GRADE from brand.ts)
  - 06-03 (moodboard page, future Remotion compositions)
  - All future Remotion compositions (import brand.ts for color/font/safe-zone tokens)
  - All future Gemini prompts (reference PROMPT_FRAGMENTS and FORBIDDEN_AESTHETICS)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "brand.ts single source of truth: all visual tokens in one TypeScript file, re-exported via layer-specific files"
    - "colors.ts as thin re-export: zero breaking changes to Remotion component imports"
    - "remotion/tsconfig.json include expansion: cross-directory TS resolution via explicit include path"
    - "globals.css manual sync: MANUELLER SYNC comment documents sync obligation and last-sync date"

key-files:
  created:
    - src/lib/brand.ts
  modified:
    - remotion/src/utils/colors.ts
    - remotion/tsconfig.json
    - src/app/globals.css

key-decisions:
  - "COLORS keys match existing colors.ts exactly (14 keys) — zero type surface change on re-export"
  - "PRODUCT_ACCENTS uses literal hex strings (not COLORS references) — avoids circular-like indirection in as const"
  - "remotion/tsconfig.json include array extended with ../src/lib/brand.ts — cleanest cross-directory resolution without path aliases"
  - "globals.css wood-amber/honey/walnut tokens retained — dashboard-only tokens, explicitly documented as NOT in brand.ts"

patterns-established:
  - "Pattern: All new Remotion compositions import COLORS, SAFE_ZONES, FONTS from src/lib/brand.ts via colors.ts re-export"
  - "Pattern: Never add hex values directly to remotion/src/utils/colors.ts — add to brand.ts, appears automatically"
  - "Pattern: globals.css sync comment format: MANUELLER SYNC AUS src/lib/brand.ts — zuletzt synchronisiert YYYY-MM-DD"
  - "Pattern: FONTS stores string names only — loadFont calls remain in remotion/src/utils/fonts.ts"

requirements-completed: [IDENT-01, IDENT-02]

# Metrics
duration: 3min
completed: 2026-03-28
---

# Phase 06 Plan 01: Brand Token System Summary

**TypeScript brand.ts with 7 typed constant exports + Remotion colors.ts re-export + globals.css navy token — single source of truth established**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-28T16:29:43Z
- **Completed:** 2026-03-28T16:32:12Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `src/lib/brand.ts` with all 7 token exports: COLORS (14 keys), PRODUCT_ACCENTS, SAFE_ZONES, COLOR_GRADE, FONTS, FORBIDDEN_AESTHETICS, PROMPT_FRAGMENTS
- Migrated `remotion/src/utils/colors.ts` to a 5-line re-export from brand.ts — EndCard, StepBadge, SceneLabel, ProductReveal component imports unchanged
- Extended `remotion/tsconfig.json` include to resolve cross-directory TypeScript imports
- Synced `src/app/globals.css` with `--color-navy: #1A2744` and manual sync comment

## Task Commits

Each task was committed atomically:

1. **Task 1: Create brand.ts single source of truth** - `4247be9` (feat)
2. **Task 2: Migrate colors.ts to re-export + fix Remotion tsconfig + sync globals.css** - `df01bda` (feat)

## Files Created/Modified

- `src/lib/brand.ts` - Single source of truth: COLORS, PRODUCT_ACCENTS, SAFE_ZONES, COLOR_GRADE, FONTS, FORBIDDEN_AESTHETICS, PROMPT_FRAGMENTS
- `remotion/src/utils/colors.ts` - Replaced with re-export from brand.ts (5 lines)
- `remotion/tsconfig.json` - Added `../src/lib/brand.ts` to include array
- `src/app/globals.css` - Added --color-navy token + MANUELLER SYNC comment

## Decisions Made

- Used literal hex strings in PRODUCT_ACCENTS rather than referencing COLORS values — avoids indirection in `as const` objects and makes values immediately readable
- Extended tsconfig include path rather than adding path aliases — simpler, no alias resolution needed since only one cross-directory import exists
- Retained wood-amber/honey/walnut tokens in globals.css (not in brand.ts) — these are dashboard UI tokens, explicitly forbidden in Remotion compositions per FORBIDDEN_AESTHETICS

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Both `npm run build` (root) and `cd remotion && npx tsc --noEmit` passed on first attempt.

## Known Stubs

None — brand.ts exports concrete values, no placeholders or TODOs.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- brand.ts is ready for Plan 02 (ColorGrade component imports `COLOR_GRADE` from brand.ts)
- All Remotion compositions can now import COLORS, SAFE_ZONES, FONTS from brand.ts via colors.ts re-export
- Plan 03 (moodboard page) can reference brand tokens via Tailwind classes (--color-navy now available)
- No blockers

## Self-Check: PASSED

- FOUND: src/lib/brand.ts
- FOUND: remotion/src/utils/colors.ts (re-export)
- FOUND: remotion/tsconfig.json (expanded include)
- FOUND: src/app/globals.css (navy + sync comment)
- FOUND: .planning/phases/06-channel-identity/06-01-SUMMARY.md
- Commits 4247be9 and df01bda confirmed in git log

---
*Phase: 06-channel-identity*
*Completed: 2026-03-28*
