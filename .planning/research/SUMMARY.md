# Project Research Summary

**Project:** Le Tonkinois Shorts — Supabase Auth + DB + Feedback Loop + Cron Pipeline
**Domain:** Internal content review dashboard with AI-driven generation and feedback-to-prompt loop
**Researched:** 2026-03-26
**Confidence:** HIGH

## Executive Summary

Le Tonkinois Shorts is an existing Next.js 16 video dashboard that now needs to evolve from a static JSON-driven gallery into a persistent, multi-user feedback system with an automated AI content generation pipeline. The existing foundation (gallery, video detail pages, Remotion compositions, Vercel deployment) is solid. The new milestone adds exactly four capabilities in strict dependency order: Supabase as the data layer replacing videos.json, invite-only authentication gating the dashboard, a structured star-rating plus pros/cons feedback UI that persists per reviewer per video, and two Vercel cron jobs — one that generates new Shorts daily and one that reads accumulated feedback to improve generation prompts weekly.

The recommended approach is to treat Supabase as the single source of truth for both video metadata and reviewer feedback, use `@supabase/ssr@0.9.0` with Next.js 16's `proxy.ts` pattern for cookie-based auth, and keep all AI generation and Remotion rendering off Vercel serverless functions entirely. The cron endpoint on Vercel is a lightweight trigger only; actual Claude Code invocation and Remotion rendering must happen on a separate machine (local or VPS) that polls Supabase for pending generation jobs. This decoupled architecture sidesteps the Vercel 300s function limit and the absence of ffmpeg in the serverless runtime — both hard blockers for in-function rendering.

The primary risk is attempting to run the full generation pipeline inline in a Vercel serverless function. This will fail silently or with timeouts on Hobby tier (300s limit, no ffmpeg). Secondary risks are RLS misconfiguration (silently empty results with no errors), using the deprecated `getSession()` for route protection (spoofable auth), and prompt drift from the automated improvement loop degrading brand quality over time. All three risks have clear mitigations: define RLS policies in the same task as schema creation, always use `getUser()` for auth guards, and implement append-only prompt versioning with human approval before activation.

## Key Findings

### Recommended Stack

The stack adds Supabase on top of the existing Next.js 16 + Vercel setup. Two packages handle everything: `@supabase/supabase-js@2.100.0` as the universal client and `@supabase/ssr@0.9.0` for cookie-based session management across the RSC/client boundary. The deprecated `@supabase/auth-helpers-nextjs` must not be used — it received no bugfixes since June 2025 and will break on Next.js 16. Next.js 16 introduced a breaking change: `middleware.ts` is now `proxy.ts` with `export function proxy()`, and `cookies()` from `next/headers` must be awaited (async-only). The `@supabase/ssr` docs already reflect this for Next.js 16 compatibility.

For cron scheduling, Vercel Hobby allows only one execution per day — sufficient for daily Short generation but requiring the two cron jobs (generate + improve) to either share a single daily slot or use GitHub Actions as an alternative scheduler. Vercel Pro allows per-minute scheduling and 800s function duration. Zod is recommended for runtime validation of all cron payloads and Supabase inserts.

**Core technologies:**
- `@supabase/ssr@0.9.0`: Cookie-based auth for Next.js 16 SSR — the official replacement for deprecated auth-helpers
- `@supabase/supabase-js@2.100.0`: Universal Supabase client for DB queries and admin operations
- `proxy.ts` (Next.js 16): Session token refresh on every request — replaces middleware.ts naming
- Vercel Cron (vercel.json): Daily trigger for generation and improvement — lightweight trigger only, not the runner
- `@anthropic-ai/sdk` (standalone Node.js script): Prompt improvement analysis outside of Vercel functions
- Zod: Runtime validation of all DB writes and cron payloads

### Expected Features

The feature set has a strict dependency chain. Supabase integration is the foundation gate — nothing else works without it. Auth must exist before feedback can be attributed to a user. Video metadata must be in Supabase (not JSON) before feedback rows can reference videos via foreign key. Feedback status tracking (`processed_at` column) must exist before the improvement cron can de-duplicate safely.

**Must have (table stakes — feedback loop does not function without these):**
- Supabase project setup (Auth + DB schema with RLS) — the foundation for everything
- Video metadata migration from videos.json to Supabase `videos` table — required for feedback foreign keys
- Invite-only auth: admin sends invite email, reviewer clicks link, session stored in HTTP-only cookies
- Star rating (1-5) per video per user, persisted to Supabase with upsert on re-rating
- Pros/Cons text feedback per video per user, persisted — qualitative signal for prompt improvement
- Feedback-status tracking: `processed_at` nullable timestamp — enables cron de-duplication
- Cron: daily video generation (Vercel cron triggers, separate worker executes)
- Cron: weekly prompt improvement from unprocessed feedback with append-only prompt versioning

**Should have (add after core loop is validated):**
- Aggregate star rating display on VideoCard gallery thumbnails — needs 5+ ratings to be meaningful
- Prompt version history UI — after improvement workflow has run 3-5 cycles
- Per-video generation metadata display (pipeline used, composition name, assets) — after reviewers ask for it

**Defer (v2+):**
- Instagram API one-click publish — already a separate roadmap milestone
- Admin UI for user management — Supabase dashboard is sufficient for 2-5 users
- Slack webhook notification on new generation — low value for current team size
- Real-time collaborative review — overkill for async 2-5 person team

**Anti-features (never build for this milestone):**
- Self-service account registration — defeats invite-only security requirement
- Per-frame timestamp comments — overkill for 25-30s Reels with fixed Remotion scene structure
- Video storage in Supabase Storage — videos stay in `public/videos/` on Vercel CDN (metadata only in Supabase)
- Parallel voting/upvote system alongside star rating — creates conflicting signals for the prompt improvement agent

### Architecture Approach

The system splits into four clearly bounded layers: the Next.js App Router frontend (Server Components for reads, Server Actions for mutations, no direct DB calls from client components), Supabase as the auth and data layer (three distinct clients: browser, server, admin/service_role — never mixed), Vercel cron endpoints as lightweight triggers that write job records to Supabase, and a separate persistent worker that polls Supabase for pending jobs and executes Claude Code + Remotion rendering. Remotion remains a standalone npm project in `remotion/` with no runtime coupling to the Next.js app — only the output MP4 files are shared via the filesystem.

**Major components:**
1. `proxy.ts` (middleware) — Refreshes Supabase auth tokens on every request, protects all routes, sets `Cache-Control: private, no-store` on auth responses
2. `src/lib/supabase/` (three clients) — `client.ts` for browser components, `server.ts` for Server Components, `admin.ts` for cron/admin operations only
3. `src/actions/feedback.ts` + `src/actions/admin.ts` — Server Actions for all mutations (feedback submit, user invite)
4. `/api/cron/generate` + `/api/cron/improve` — Route Handlers secured by CRON_SECRET; trigger only, never execute the pipeline inline
5. External worker (local machine or VPS) — Polls Supabase for pending generation jobs, runs `claude` CLI and Remotion render, uploads result
6. `supabase/migrations/` — SQL migrations tracked in version control, including seed migration from videos.json

### Critical Pitfalls

1. **RLS enabled with no policies — silently returns empty results** — Define all RLS policies in the same task as the schema migration. Test every query through the JS client as an authenticated user, never via the SQL editor (which bypasses RLS as postgres superuser).

2. **Using `getSession()` for route protection** — `getSession()` does not validate the JWT signature; use `supabase.auth.getUser()` exclusively for auth guards in middleware and Server Components. Document this in code comments at every use point.

3. **Running Remotion render inside a Vercel serverless function** — Vercel functions do not include ffmpeg. Even if the timeout were not an issue, the render would fail. The cron endpoint must only write a job record to Supabase and return 200. A separate worker with full Node.js + ffmpeg executes the pipeline.

4. **Prompt drift from automated improvement loop** — Small-team feedback (2-5 reviewers) is a thin sample. Never overwrite prompt files in place. Always write a new prompt version to the database (append-only) and require human approval before activating it. Tag every generated video with its prompt version.

5. **Vercel Hobby cron limitations** — Hobby plan allows only one execution per day per cron expression, with ±59 minute timing imprecision. Two cron jobs (generate + improve) require either Pro plan or GitHub Actions as the scheduler. Decide deployment tier before designing the cron schedule; deploying with sub-daily expressions on Hobby causes deployment failure.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Supabase Foundation (Auth + DB Schema)

**Rationale:** Every subsequent feature depends on the Supabase data layer. Auth must exist before feedback can be attributed. The `videos` table must exist before any feedback rows can reference videos. This is the dependency gate — nothing else ships until this is done.

**Delivers:** Working Supabase project with `videos` and `feedback` tables, RLS policies, invite-only auth with middleware route protection, login page, auth callback route, videos.json data migrated to Supabase, gallery reads from Supabase instead of JSON.

**Addresses features:** Supabase integration, invite-only auth, video metadata migration, status persistence.

**Avoids pitfalls:** RLS-with-no-policies (define policies same task as schema), `getSession()` anti-pattern (use `getUser()` from day one), missing middleware (implement before any protected route ships), CDN caching auth responses (add `Cache-Control: private, no-store` in middleware).

**Research flag:** Standard patterns — well-documented in official Supabase + Next.js 16 docs. No additional research needed.

---

### Phase 2: Feedback UI + Persistence

**Rationale:** With auth and the `videos` table live, the feedback layer can be built. This phase closes the human side of the feedback loop: reviewers can rate videos and their ratings persist across sessions. Building auth and feedback together would have been possible, but this ordering ensures data integrity (foreign keys on a live table) before any UX is exposed.

**Delivers:** `FeedbackForm` client component (star rating + pros/cons), `submitFeedback` Server Action, feedback rows persisted to Supabase with upsert semantics, reviewer's existing rating shown on revisit, `processed_at` column enabling cron de-duplication, "pending feedbacks" counter visible in dashboard header.

**Addresses features:** Star rating, pros/cons text feedback, feedback persistence, my-rating-visible-on-return, feedback-status tracking.

**Avoids pitfalls:** Direct DB calls from client components (all mutations via Server Action), rating endpoint without ownership check (RLS `WITH CHECK (auth.uid() = user_id)` enforced), no optimistic updates (update local React state immediately on star click, persist async).

**Research flag:** Standard patterns — no additional research needed.

---

### Phase 3: Generation Cron (Content Rhythm)

**Rationale:** Once the data layer is solid and feedback is flowing, the generation pipeline can be added without blocking the human review workflow. The cron architecture must be designed for idempotency before a single line of generation code is written. This phase establishes the daily content rhythm that gives reviewers something new to rate each morning.

**Delivers:** `vercel.json` cron configuration, `/api/cron/generate` route handler (CRON_SECRET-secured, trigger-only), Supabase `generation_jobs` table for the decoupled worker pattern, external worker script that polls for pending jobs and executes Gemini + Remotion pipeline, rendered MP4 copied to `public/videos/`, new video row inserted into Supabase with `status: 'pending'`.

**Addresses features:** Cron-based daily video generation.

**Avoids pitfalls:** Remotion inside Vercel function (worker runs on external machine), duplicate cron runs (idempotency lock in Supabase before any generation starts), Hobby tier limit (configure exactly one generation cron per day; consider GitHub Actions if more flexibility needed).

**Research flag:** Needs attention — the decoupled cron-trigger + external-worker pattern is MEDIUM confidence (architectural reasoning). The specific mechanism for the worker to receive jobs (polling Supabase vs. GitHub Actions `repository_dispatch`) should be decided during phase planning. `@remotion/lambda` is an alternative worth evaluating if a VPS is undesirable.

---

### Phase 4: Prompt Improvement Cron (Closing the Loop)

**Rationale:** This is the most complex phase and the last in the dependency chain. It requires working feedback data (Phase 2) and established content generation (Phase 3). The improvement cron reads unprocessed feedback, updates prompts, and marks feedback as processed. Prompt versioning must be append-only — never overwrite — with human approval before activation.

**Delivers:** `/api/cron/improve` route handler, prompt version history in Supabase (`prompt_versions` table), improvement logic that groups feedback by video type and passes to Claude for prompt refinement, new prompt version written to DB and flagged for human review, feedback rows marked `processed_at = now()` in the same transaction as the prompt write, dashboard indicator showing last improvement run date and pending feedback count.

**Addresses features:** Automated prompt improvement workflow, prompt version history, feedback-status tracking closure.

**Avoids pitfalls:** Feedback status flag not set on crash (atomic transaction: prompt write + mark processed together), prompt drift (append-only versioning, human approval before activation, "golden baseline" prompt never auto-modified), reprocessing old feedback (`processed_at IS NULL` filter, `processed_in_prompt_version` idempotency field).

**Research flag:** Needs attention — the exact mechanism for Claude to update prompt files (in-process with `@anthropic-ai/sdk` vs. spawning `claude --print`) needs validation. Prompt versioning schema design should be validated against actual prompt structure before implementation.

---

### Phase Ordering Rationale

- **Foundation-first:** Every phase depends on the Supabase DB schema being live. There is no shortcut around this dependency.
- **Auth before feedback:** Anonymous ratings are noise. The invite-only model requires auth to be complete before any reviewer-facing UI is built.
- **Data migration in Phase 1, not later:** videos.json must be migrated before feedback rows can reference video IDs as foreign keys. Deferring migration creates a two-source-of-truth problem (videos.json + Supabase) that complicates every subsequent phase.
- **Generation before improvement:** The improvement cron needs real feedback data from real generated videos. Building improvement first means testing against synthetic data, which increases drift risk.
- **Separate trigger from execution throughout:** The Vercel cron endpoint is always a trigger, never a runner. This architectural decision made in Phase 3 carries through to Phase 4.

### Research Flags

Phases needing deeper research during planning:
- **Phase 3 (Generation Cron):** The external worker implementation pattern needs a concrete decision — polling Supabase vs. GitHub Actions `repository_dispatch` vs. `@remotion/lambda`. Each has different cost and operational complexity tradeoffs.
- **Phase 4 (Prompt Improvement):** The Claude integration mechanism (SDK vs. CLI subprocess) and the prompt versioning schema need validation against the actual prompt structure used by current Remotion compositions.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Supabase Foundation):** Official docs are comprehensive and HIGH confidence. Follow the Next.js 16 + `@supabase/ssr` guide exactly.
- **Phase 2 (Feedback UI):** Standard Server Action + Supabase upsert pattern. No novel integration needed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npmjs.org and official docs. Next.js 16 breaking changes confirmed via official upgrade guide (2026-03-20). |
| Features | HIGH | Core features well-defined with clear dependency chain. Competitor analysis (Frame.io, Filestage, Planable) confirms feature set is appropriate. |
| Architecture | HIGH (Supabase + Next.js), MEDIUM (cron pipeline) | SSR auth, RLS, Server Actions patterns are well-documented. Decoupled cron-worker architecture is architectural reasoning, not a single official source. |
| Pitfalls | HIGH (auth/RLS pitfalls), MEDIUM (cron/pipeline pitfalls) | RLS pitfalls backed by CVE post-mortems and official docs. Cron pitfalls backed by Vercel official docs + community sources. Prompt drift backed by multiple expert sources. |

**Overall confidence:** HIGH for Phases 1-2, MEDIUM for Phases 3-4.

### Gaps to Address

- **External worker mechanism:** The research recommends Pattern A (cron trigger writes to Supabase, worker polls and executes) but does not prescribe the exact worker implementation. Options include: a local cron job on a development machine, a GitHub Actions `repository_dispatch` workflow, or `@remotion/lambda`. Decision needed before Phase 3 implementation begins.

- **`@supabase/ssr` API name for JWT validation:** Research references both `getClaims()` and `getUser()` for JWT validation. The official API name must be verified against `@supabase/ssr@0.9.0` documentation before implementing middleware and Server Component auth guards.

- **Prompt versioning schema:** The improvement cron's prompt versioning design (database table vs. git-tracked JSON files vs. both) is not fully specified. The decision affects Phase 4 complexity significantly and should be made during Phase 4 planning.

- **Vercel plan tier:** The research documents the Hobby (1 cron/day) vs. Pro trade-off but does not confirm the current deployment tier. If both generation and improvement crons are needed independently, Pro plan or GitHub Actions is required. Confirm before Phase 3 begins.

## Sources

### Primary (HIGH confidence)
- [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — proxy.ts setup, createServerClient/createBrowserClient
- [Supabase SSR package (npmjs)](https://registry.npmjs.org/@supabase/ssr/latest) — version 0.9.0 verified
- [Supabase supabase-js package (npmjs)](https://registry.npmjs.org/@supabase/supabase-js/latest) — version 2.100.0 verified
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — proxy.ts breaking change, async cookies() (official, 2026-03-20)
- [Vercel Cron Jobs docs](https://vercel.com/docs/cron-jobs) — cron expression format, CRON_SECRET pattern
- [Vercel Cron Usage and Pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing) — Hobby once/day limit, Pro per-minute
- [Vercel Managing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs) — idempotency, concurrency, duration limits
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS policies and patterns
- [Supabase auth.admin.inviteUserByEmail](https://supabase.com/docs/reference/javascript/auth-admin-createuser) — invite-only pattern
- [Supabase RLS Hidden Dangers (DEV Community, CVE-2025-48757)](https://dev.to/fabio_a26a4e58d4163919a53/supabase-security-the-hidden-dangers-of-rls-and-how-to-audit-your-api-29e9) — RLS misconfiguration post-mortem
- [Remotion Chrome Headless Shell](https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell) — server rendering requirements

### Secondary (MEDIUM confidence)
- [Vercel Functions Limitations](https://vercel.com/docs/functions/limitations) — maxDuration per plan
- [Remotion + Claude Code integration](https://www.remotion.dev/docs/ai/claude-code) — AI integration patterns
- [Next.js + Supabase CDN Caching Issue](https://github.com/vercel/next.js/discussions/81445) — Cache-Control requirement
- [AI Prompt Drift Prevention (Maxim AI, 2025)](https://www.getmaxim.ai/articles/a-comprehensive-guide-to-preventing-ai-agent-drift-over-time/) — feedback loop degradation

### Tertiary (LOW confidence)
- [Mastering AI Feedback Loops — Prompt Engineering (Arsturn)](https://www.arsturn.com/blog/navigating-ai-feedback-loops-with-smart-prompt-engineering) — improvement workflow patterns
- [Agentic AI Workflows 2026](https://www.myaiassistant.blog/2026/02/agentic-autonomous-ai-workflows-in-2026.html) — agentic workflow patterns
- [Filestage — Video Feedback Tools comparison](https://filestage.io/blog/video-feedback-tools/) — competitor feature analysis
- [Top Video Feedback Platforms 2025 (Clixie)](https://www.clixie.ai/blog/best-video-feedback-platforms-in-2025-ultimate-guide-for-teams-creators) — competitor feature analysis

---
*Research completed: 2026-03-26*
*Ready for roadmap: yes*
