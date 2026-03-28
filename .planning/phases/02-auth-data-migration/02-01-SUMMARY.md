---
phase: 02-auth-data-migration
plan: 01
subsystem: auth
tags: [supabase, nextjs, middleware, auth, login]

# Dependency graph
requires:
  - phase: 01-gallery-dashboard
    provides: proxy.ts session refresh via getClaims(), Supabase client utilities (createBrowserClient, createServerClient)
provides:
  - proxy.ts auth guard: redirects unauthenticated users to /login for all non-public paths
  - /login page: branded email/password login form using signInWithPassword
  - LogoutButton.tsx: standalone signOut component redirecting to /login
  - CopyButton.tsx: extracted standalone clipboard copy component
affects: [02-02-data-migration, all future plans requiring auth context]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Auth guard in proxy.ts: getClaims() first (JWT refresh), then getUser() for non-public paths"
    - "Cookie propagation on redirect: copy supabaseResponse cookies to redirect response"
    - "Login as 'use client' component: signInWithPassword + router.push('/') + router.refresh()"
    - "Logout pattern: signOut() + router.push('/login') + router.refresh()"

key-files:
  created:
    - src/app/login/page.tsx
    - src/components/LogoutButton.tsx
    - src/components/CopyButton.tsx
  modified:
    - proxy.ts

key-decisions:
  - "Use getUser() after getClaims() — never getSession() (getSession is spoofable per D-06)"
  - "PUBLIC_PATHS = ['/login'] at module top — keeps /login exempt from auth check"
  - "Cookie propagation: copy cookies from supabaseResponse to redirect response to preserve session state during redirect"
  - "router.push('/') + router.refresh() after login — refresh forces Server Components to re-render with new session"

patterns-established:
  - "Pattern: proxy.ts auth guard — getClaims() then getUser() for non-public paths only"
  - "Pattern: login page as use client with inline German error text, no toast"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05]

# Metrics
duration: 2min
completed: 2026-03-28
---

# Phase 2 Plan 01: Auth Infrastructure Summary

**Supabase email/password auth gating via proxy.ts + branded German login page + LogoutButton and CopyButton components**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-28T07:00:36Z
- **Completed:** 2026-03-28T07:02:20Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Extended proxy.ts auth guard: all non-public routes redirect unauthenticated visitors to /login, cookies properly propagated during redirect
- Created branded /login page with Lora headline, cream background, brand-red button, German labels (E-Mail, Passwort, Anmelden), inline error text
- Created LogoutButton.tsx as standalone component calling signOut() and redirecting to /login
- Extracted CopyButton.tsx from video detail page inline definition into its own component file

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend proxy.ts with auth guard + create login page** - `f0f73f5` (feat)
2. **Task 2: Create LogoutButton component + extract CopyButton** - `dd96f53` (feat)

**Plan metadata:** (docs commit — pending)

## Files Created/Modified

- `proxy.ts` - Added PUBLIC_PATHS, getUser() check, redirect to /login with cookie propagation
- `src/app/login/page.tsx` - Branded login form: signInWithPassword, German labels, inline error, router.push('/') on success
- `src/components/LogoutButton.tsx` - signOut() + router.push('/login') + router.refresh()
- `src/components/CopyButton.tsx` - Extracted from video detail page; navigator.clipboard.writeText + 2s copied feedback

## Decisions Made

- Used `getUser()` not `getSession()` — getSession is spoofable per D-06, getUser verifies against Supabase server
- Cookie propagation on redirect: copying cookies from supabaseResponse to the redirect response ensures session cookie is preserved during the redirect
- router.push('/') + router.refresh() after login ensures Server Components re-render with new session context
- AUTH-02 satisfied by design: users are created manually via Supabase Dashboard per D-01, no code needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required for this plan. Supabase project was already configured in Phase 1.

## Next Phase Readiness

- Auth guard is live — /login, LogoutButton, CopyButton are all ready for Plan 02 wiring
- Plan 02 will: wire LogoutButton into gallery header, convert video detail page to Server Component using CopyButton, run seed script to migrate videos.json to Supabase, switch queries to Supabase
- No blockers.

## Known Stubs

None — all components are fully functional. Login page wires to real Supabase auth. LogoutButton and CopyButton are wired to real browser APIs.

---
*Phase: 02-auth-data-migration*
*Completed: 2026-03-28*

## Self-Check: PASSED

- FOUND: proxy.ts
- FOUND: src/app/login/page.tsx
- FOUND: src/components/LogoutButton.tsx
- FOUND: src/components/CopyButton.tsx
- FOUND: .planning/phases/02-auth-data-migration/02-01-SUMMARY.md
- FOUND: f0f73f5 (Task 1 commit)
- FOUND: dd96f53 (Task 2 commit)
