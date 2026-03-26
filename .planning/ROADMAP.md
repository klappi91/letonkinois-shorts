# Roadmap: Le Tonkinois Shorts

## Overview

The existing Next.js gallery dashboard evolves from a static JSON-driven prototype into a persistent, multi-user feedback system. Four phases deliver the complete v1 milestone in strict dependency order: the Supabase data layer replaces videos.json and becomes the foundation everything else depends on; auth gates the dashboard to the invited review team; the feedback UI closes the human side of the feedback loop; and prompt versioning creates the data infrastructure that makes AI-driven prompt improvement safe and traceable.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Supabase Foundation** - Supabase project, DB schema, RLS policies, three-client pattern
- [ ] **Phase 2: Auth + Data Migration** - Invite-only login gates the dashboard; videos.json migrated to Supabase
- [ ] **Phase 3: Feedback UI** - Star rating + pros/cons form persists per reviewer per video
- [ ] **Phase 4: Prompt Versioning** - Prompt version table + video linkage + detail-page display

## Phase Details

### Phase 1: Supabase Foundation
**Goal**: The Supabase project is live with the complete DB schema, RLS policies, and the three-client integration pattern wired into the Next.js app
**Depends on**: Nothing (first phase)
**Requirements**: SUPA-01, SUPA-02, SUPA-03, SUPA-04, SUPA-05, SUPA-06
**Success Criteria** (what must be TRUE):
  1. Environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) are set in both local .env.local and Vercel, and the app starts without missing-env errors
  2. The `videos`, `feedback`, and `prompt_versions` tables exist in Supabase with the correct columns and foreign keys
  3. RLS is enabled on all three tables and policies are active — a query from the JS browser client as an authenticated user returns rows; the same query as an unauthenticated user returns zero rows (not an error)
  4. The three-client pattern (browser client, server client, admin client) is importable from `src/lib/supabase/` without TypeScript errors
**Plans:** 2 plans
Plans:
- [x] 01-01-PLAN.md — Install Supabase packages, create three-client pattern, proxy, SQL schema, types
- [x] 01-02-PLAN.md — Create Supabase project, run schema SQL, set real credentials

### Phase 2: Auth + Data Migration
**Goal**: Invite-only authentication gates every dashboard page, and all video metadata is served from Supabase instead of videos.json
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. An unauthenticated visitor navigating to /, /video/[id], or /assets is redirected to /login
  2. A reviewer invited via `inviteUserByEmail()` can click the email link, set a password, and reach the dashboard
  3. A logged-in reviewer can log out from any page and is redirected to /login
  4. The gallery (/) and video detail (/video/[id]) pages display the same videos that were previously in videos.json, now fetched from Supabase
  5. Gallery filter by type and status works correctly with Supabase data
**Plans:** 2 plans
Plans:
- [ ] 02-01-PLAN.md — Auth infrastructure: proxy.ts auth guard, login page, LogoutButton + CopyButton components
- [ ] 02-02-PLAN.md — Data migration: seed script, page/component migration to Supabase queries, wire LogoutButton
**UI hint**: yes

### Phase 3: Feedback UI
**Goal**: Reviewers can rate any video with stars and pros/cons text, and their feedback persists to Supabase across sessions
**Depends on**: Phase 2
**Requirements**: FEED-01, FEED-02, FEED-03, FEED-04
**Success Criteria** (what must be TRUE):
  1. A reviewer on the video detail page can click a star rating (1-5) and it is saved to Supabase — visible after a page reload
  2. A reviewer can type pros and cons text and submit — text is visible after a page reload
  3. If the same reviewer rates the same video again, the previous rating is overwritten (not duplicated) in the database
  4. Every feedback row in the database has a `processed_at` column that is null after submission
**Plans**: TBD
**UI hint**: yes

### Phase 4: Prompt Versioning
**Goal**: Every video is linked to the prompt version that generated it, prompt versions are stored in the database, and the video detail page shows which prompt version was used
**Depends on**: Phase 3
**Requirements**: PROM-01, PROM-02, PROM-03
**Success Criteria** (what must be TRUE):
  1. The `prompt_versions` table exists in Supabase and contains at least one seed row representing the current prompt baseline
  2. Every video row in the `videos` table has a non-null `prompt_version` reference pointing to a valid entry in `prompt_versions`
  3. The video detail page shows the prompt version identifier (e.g., "v1.0") for the displayed video
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Supabase Foundation | 2/2 | Complete |  |
| 2. Auth + Data Migration | 0/2 | Not started | - |
| 3. Feedback UI | 0/? | Not started | - |
| 4. Prompt Versioning | 0/? | Not started | - |
