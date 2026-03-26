# Pitfalls Research

**Domain:** Next.js dashboard with Supabase Auth, star-rating feedback system, and cron-based AI content generation pipeline
**Researched:** 2026-03-26
**Confidence:** HIGH (Supabase Auth/RLS pitfalls verified via official docs + community post-mortems), MEDIUM (cron pipeline pitfalls based on official Vercel docs + multiple community sources), MEDIUM (feedback loop drift based on multiple expert sources)

---

## Critical Pitfalls

### Pitfall 1: RLS Enabled But No Policies — Silently Returns Empty Results

**What goes wrong:**
You enable Row Level Security on a table but forget to add any policies. Every query returns zero rows with no error message. The dashboard appears broken: videos show nothing, ratings return nothing. Because empty results are valid SQL responses, there is no error in the logs — it just looks like the database is empty. This is the most common Supabase mistake by a significant margin: 83% of exposed or broken Supabase databases involve RLS misconfigurations.

**Why it happens:**
Developers enable RLS thinking it is sufficient, then test by looking at the table in the Supabase Studio SQL Editor — which runs as the postgres superuser and bypasses all RLS. Everything looks fine in the editor, but real users see nothing.

**How to avoid:**
1. Enable RLS on every table: `ALTER TABLE videos ENABLE ROW LEVEL SECURITY;`
2. Immediately create policies before any frontend testing
3. Always test through the Supabase JavaScript client with a real authenticated user session — never via the SQL editor for auth-sensitive queries
4. For this project: ratings and feedback tables need `SELECT` policies tied to `auth.uid()`, videos table needs a blanket `SELECT` policy for all authenticated users

**Warning signs:**
- Dashboard shows 0 videos after Supabase migration despite data in the table
- Rating submissions appear to succeed but nothing persists
- No errors in the console, just empty arrays

**Phase to address:** Supabase integration phase (Auth + DB setup). Define all RLS policies in the same task as the schema migration — never separate them.

---

### Pitfall 2: Using `getSession()` Instead of `getClaims()` for Route Protection

**What goes wrong:**
Protecting dashboard routes with `supabase.auth.getSession()` appears to work during development but is a security vulnerability. `getSession()` reads the session from the cookie without revalidating it against the Supabase Auth server. A stolen or expired token can still pass as "authenticated." Any protected route using this pattern is technically unprotected in production.

**Why it happens:**
`getSession()` is prominent in tutorials and older documentation. The official Supabase docs for Next.js SSR now explicitly warn against it for server-side protection, but many examples on the internet still use it.

**How to avoid:**
Use `supabase.auth.getClaims()` (or `getUser()` — verify current API name before implementing) in all Server Components that gate protected content. This makes a network call to the Supabase Auth server to verify the token is valid. The cost is one extra network round-trip per protected page load, which is acceptable for a small-team internal tool.

**Warning signs:**
- Route protection copied from a tutorial or blog post using `getSession()`
- Dashboard is accessible with a manually crafted or expired cookie

**Phase to address:** Supabase Auth implementation phase. Document the distinction between `getSession()` and `getClaims()` in the code as a comment at the point of use.

---

### Pitfall 3: Missing Middleware — Server Components Cannot Refresh Auth Tokens

**What goes wrong:**
Without a `middleware.ts` file, Supabase session tokens expire and are never refreshed. The user's browser holds an expired token, Server Components render unauthenticated content, and the user is silently logged out on next page load with no clear error. This is particularly insidious because it only manifests after the JWT expiry window (typically 1 hour), so it passes all development testing.

**Why it happens:**
Server Components in Next.js cannot write cookies. Only middleware (which runs before the request reaches any component) can intercept the request, refresh the session token with Supabase, and write the updated token back to the response cookies for both the browser and downstream Server Components.

**How to avoid:**
Implement `middleware.ts` using `@supabase/ssr` at project root. The middleware must:
1. Call `supabase.auth.getClaims()` (triggers refresh if needed)
2. Set refreshed cookies on both `request.cookies` (for Server Components) and `response.cookies` (for the browser)
3. Apply to protected routes using a `matcher` config, not globally (avoid matching static assets)

The `@supabase/ssr` package handles this pattern — follow the official "Server-Side Auth for Next.js" guide precisely.

**Warning signs:**
- Auth works perfectly for the first hour of testing, then mysteriously breaks
- Users are logged out after leaving the tab idle for >1 hour
- No middleware file exists in the project root

**Phase to address:** Supabase Auth implementation phase. The middleware is non-optional — implement it before building any protected routes.

---

### Pitfall 4: CDN Caching Auth Responses — Wrong User Gets Another User's Token

**What goes wrong:**
When the Supabase middleware refreshes a session, it sets a `Set-Cookie` header on the response. If Vercel's Edge Network or any CDN caches that response (even for a fraction of a second) and serves it to a different user, that second user's browser stores the first user's auth token and is logged in as the wrong person.

**Why it happens:**
Vercel caches aggressively by default for performance. Auth middleware responses that include `Set-Cookie` headers are not automatically excluded from caching unless explicitly configured.

**How to avoid:**
Set `Cache-Control: private, no-store` on every response from any route that touches authentication. In Next.js App Router middleware, this means adding the header to the response returned from middleware for all protected paths.

```typescript
response.headers.set('Cache-Control', 'private, no-store')
```

**Warning signs:**
- Two users testing simultaneously, one sees the other's data
- Intermittent "wrong user" reports after deployment

**Phase to address:** Supabase Auth implementation phase. Add cache headers as part of middleware setup — not as a separate hardening step.

---

### Pitfall 5: Vercel Cron Runs Duplicate Instances — AI Pipeline Runs Twice

**What goes wrong:**
If the daily content generation cron job takes longer than 24 hours (or is triggered twice for any reason), Vercel will run a second instance while the first is still executing. This means two Claude Code processes run simultaneously, both generating videos, both writing to the same database, producing duplicate content. Vercel explicitly documents that the same cron event can be delivered more than once due to their event-driven system.

**Why it happens:**
Vercel cron jobs have no built-in deduplication. They are HTTP GET requests to your route — if the route is slow or the event fires twice, two instances run in parallel.

**How to avoid:**
Implement an idempotency lock in the cron route handler:
1. On cron trigger, write a `generation_lock` record to Supabase with timestamp and UUID
2. Check if a lock created in the last N hours already exists before proceeding
3. On success or failure, release the lock
4. Design all database writes as upserts rather than inserts (use video ID as unique key)

Additionally: the cron route must complete within Vercel's function duration limit. For Hobby tier this is 60 seconds maximum — completely insufficient for AI video generation. The cron route should only trigger the generation process (write a "pending" job to the database and return 200), not execute it inline. Actual generation must happen in a separate worker or GitHub Actions workflow.

**Warning signs:**
- Database shows duplicate video entries after a cron run
- Two Claude Code processes visible in process logs simultaneously
- Cron route timing out with 504 errors

**Phase to address:** Cron pipeline architecture phase. Design for idempotency before writing a single line of the generation pipeline.

---

### Pitfall 6: Vercel Hobby Tier Cron Limit — Once Per Day Maximum

**What goes wrong:**
On Vercel's Hobby (free) plan, cron jobs can only fire **once per 24 hours**. Any expression more frequent than daily (e.g., `0 */6 * * *` for every 6 hours) will cause deployment to fail with a validation error. Additionally, on Hobby tier, the exact trigger time within the specified hour is unpredictable — Vercel runs it at a random point within the configured hour to distribute load.

**Why it happens:**
The project currently uses Vercel for deployment. The roadmap assumes "daily cron generation" which technically fits within Hobby limits, but Pro is required for any flexibility in scheduling.

**How to avoid:**
Confirm the deployment tier before designing the cron schedule. If Hobby tier is used, the daily generation cron is the only allowed cron job — the feedback improvement cron must be folded into the same daily run or triggered manually. Alternatively, use GitHub Actions `schedule` trigger as an alternative to Vercel crons — GitHub Actions free tier allows frequent scheduling without this restriction.

**Warning signs:**
- Deployment fails with cron validation errors
- "More than one cron job exceeds hobby limits" error in Vercel dashboard

**Phase to address:** Cron pipeline architecture phase. Decide deployment tier before implementing cron schedule.

---

### Pitfall 7: Prompt Drift — Automated Improvement Loop Degrades Generation Quality

**What goes wrong:**
The feedback improvement cron reads user ratings and pros/cons text, then modifies the generation prompts. Over time, the prompts accumulate micro-changes based on each batch of feedback. Without version control and rollback, the prompts gradually drift away from the original intent and start producing lower-quality or off-brand content. This is sometimes called "prompt overfitting" — the prompts become too specific to recent feedback and lose the broader generation capability.

**Why it happens:**
Small-team feedback (2-5 reviewers) is a statistically thin sample. A few negative ratings can push the prompt in a direction that pleases those reviewers but degrades output overall. Without a baseline to compare against, degradation is invisible until it is severe.

**How to avoid:**
1. Store all prompt versions in Supabase with timestamps — never overwrite, always append
2. Tag each generated video with the prompt version used to generate it
3. The improvement cron should produce a new prompt version, not replace the old one — a human reviews and approves before the new version is activated
4. Keep a "golden baseline" prompt that is never auto-modified, only updated manually
5. Flag automated prompt changes in the dashboard so reviewers can see what changed

**Warning signs:**
- Generation output gradually loses Le Tonkinois brand identity (dark backgrounds, non-Lora fonts)
- Ratings that were previously high start dropping after several improvement cycles
- Generated content starts showing AI-generated product cans (violating the explicit constraint)

**Phase to address:** Feedback loop implementation phase. Version control for prompts must be designed before the improvement cron is written.

---

### Pitfall 8: Email Prefetching Breaks Invite-Only Confirmation Links

**What goes wrong:**
When an admin uses `supabase.auth.admin.inviteUserByEmail()` to create a new reviewer account, Supabase sends a confirmation email with a one-time token in the URL. Microsoft Outlook's "Safe Links" feature (and similar corporate email security tools) automatically follows all links in incoming emails to scan them for malware. This consumes the one-time token, rendering the confirmation link expired by the time the actual user clicks it. The invited reviewer sees "Token has expired or is invalid."

**Why it happens:**
This is a common pattern for teams using Microsoft 365 email. The token is valid for a single use — the security scanner uses it first.

**How to avoid:**
Use a custom email template in Supabase that sends users to a landing page where they enter their email address first, and then the page verifies the token via `supabase.auth.verifyOtp()`. This pattern forces a human interaction before the token is consumed. Alternatively, use "magic link" style where the token is not in the URL but submitted via a form.

Set token expiry in Supabase Auth settings to at least 24 hours for invite links (default is typically 1 hour — dangerously short for an invite flow where users may not check email immediately).

**Warning signs:**
- Invited users receive "invalid or expired token" on first click
- The pattern is consistent across specific email domains (corporate Microsoft 365)
- Invite works fine with personal Gmail but fails with business email

**Phase to address:** Supabase Auth + invite-only implementation phase.

---

### Pitfall 9: Feedback Status Flag Not Set — Improvement Cron Reprocesses Old Feedback

**What goes wrong:**
The improvement cron reads all feedback marked as `status = 'new'` and updates prompts based on it. If the cron fails to mark processed feedback as `status = 'processed'` (e.g., the cron crashes after reading but before updating), the same feedback is reprocessed on the next run. Over multiple runs, the same negative comment about one video disproportionately influences the prompt, amplifying its effect beyond what was intended.

**Why it happens:**
The feedback status update and the prompt update are two separate database operations. If the cron crashes or times out between them, only one operation completes.

**How to avoid:**
Use a database transaction or idempotency pattern:
1. Read feedback, generate new prompt version
2. In a single transaction: write new prompt version + mark all processed feedback as `status = 'processed'`
3. Use the `processed_in_prompt_version` field (a foreign key to the prompt versions table) as the idempotency check — if a feedback row already has a prompt version ID, skip it

**Warning signs:**
- Prompt changes seem larger than expected given the feedback received
- Same feedback comment appears to influence multiple consecutive generation runs

**Phase to address:** Feedback loop implementation phase.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep videos.json alongside Supabase during migration | Zero downtime, easy rollback | Two sources of truth, data drift, confusing for future developers | Only during migration phase — remove JSON source once Supabase is confirmed working |
| Skip prompt version control, overwrite prompts in place | Simpler implementation | Cannot recover from prompt drift, no audit trail | Never — implement versioning from day one |
| Use Supabase service_role key in Next.js API routes instead of per-user client | Simpler code, bypasses RLS complexity | Completely defeats RLS — all users can read/write all data | Only in genuinely server-side-only, never-exposed code paths; never in route handlers users can reach |
| Hard-code reviewer user IDs in RLS policies instead of using auth roles | Fast initial setup | Must update policy SQL every time a reviewer is added/removed | Never — use a `profiles` table with a `role` column |
| Inline AI generation in the cron route handler | Simplest architecture | Guaranteed timeout on Vercel (60s Hobby, 800s Pro max vs. multi-minute generation runs) | Never — always decouple trigger from execution |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase + Next.js App Router | Creating a single Supabase client used across Server and Client Components | Create two separate clients: one for Server Components (using `@supabase/ssr` `createServerClient` with cookie handlers), one for Client Components (using `createBrowserClient`) |
| Supabase Admin API (inviteUserByEmail) | Calling admin API from a client component or exposed API route using the service_role key | Admin operations (invite user, delete user) must only be called from server-side code (Server Actions, Route Handlers) with the service_role key stored as a secret env variable — never exposed to the browser |
| Vercel Cron + Next.js | Not verifying the `Authorization: Bearer CRON_SECRET` header — the endpoint is publicly reachable | Always check `request.headers.get('authorization') === \`Bearer ${process.env.CRON_SECRET}\`` as the first thing in the route handler |
| Remotion CLI + cron | Running `npx remotion render` inside a Vercel serverless function | Remotion requires Chrome Headless Shell and significant memory — Vercel functions are not suitable for rendering. Rendering must happen in a different environment (local machine triggered via cron, GitHub Actions, or a dedicated server) |
| Supabase RLS + service_role | Using service_role key in a function and assuming RLS still applies | The service_role key bypasses all RLS policies entirely — it is a superuser key. Use it only when you explicitly need to bypass RLS (admin operations), never as a general-purpose server key |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No indexes on RLS policy columns | Dashboard loads slowly, rating queries are slow | Add `CREATE INDEX ON videos(created_by); CREATE INDEX ON ratings(user_id, video_id);` at schema creation time | At ~1,000+ rows (this project: probably never, but still adds up when policies run on every row) |
| Fetching all videos from Supabase in a single client query without pagination | Initial page load slow as video count grows | Implement cursor-based pagination from the start; Supabase returns 1,000 rows max by default anyway | At ~50+ videos (this project will reach this quickly with daily generation) |
| Running heavy aggregation (average rating across all videos) on every page render | Gallery page is slow; Supabase query takes >500ms | Cache aggregated stats in a separate `video_stats` table updated by trigger, or compute in a daily cron and store result | At ~100+ ratings |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing Supabase service_role key in `NEXT_PUBLIC_*` env variables | Key is embedded in the browser bundle — anyone can extract it and make admin API calls bypassing all RLS | Service_role key must only be in server-side env variables (no `NEXT_PUBLIC_` prefix) |
| Not validating `CRON_SECRET` in the generation route | Anyone who discovers the cron endpoint URL can trigger unlimited AI generation, burning API credits | Check `CRON_SECRET` as the first guard in every cron route handler, before any async operations |
| Using `user_metadata` in RLS policies | Users can modify their own `user_metadata` via the client SDK, potentially escalating their own permissions | Use `raw_app_meta_data` (only writable server-side) for role/permission data referenced in RLS policies |
| Rating endpoint without user ownership check | A user could overwrite another user's rating by supplying a different `user_id` in the request | RLS WITH CHECK clause must enforce `auth.uid() = user_id` on INSERT and UPDATE for the ratings table — never rely on client-supplied user_id |
| Exposing video generation prompts via an unauthenticated API endpoint | Competitors can copy the exact prompt strategy | Gate all prompt-reading endpoints behind Supabase Auth + an `is_admin` role check |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No optimistic updates on star rating click | Rating feels unresponsive — user clicks a star, nothing visually changes until the Supabase write completes (200-400ms) | Update local React state immediately on click, persist to Supabase in the background, roll back on error |
| Requiring reviewers to re-enter feedback after a session timeout | Reviewer writes a detailed pros/cons note, submits it, gets redirected to the login page — feedback is lost | Auto-save draft feedback to localStorage on each keystroke; restore it after re-authentication |
| No feedback confirmation after submission | Reviewer cannot tell if their rating saved; they may rate the same video multiple times | Show a toast notification on successful save; display the reviewer's existing rating when they return to a video |
| Showing all generated videos regardless of status to all reviewers | Reviewers see rejected or already-reviewed videos mixed with new ones | Default filter to `status = 'pending'`; let reviewers opt-in to see reviewed content |
| No indication when improvement cron ran and what changed | Team has no visibility into whether the feedback loop is working | Show "Last improvement run: [date], [N] feedback items processed, prompt version [X]" in the dashboard header |

---

## "Looks Done But Isn't" Checklist

- [ ] **Supabase Auth:** Middleware refreshes tokens AND sets headers on both `request` and `response` cookies — verify with a 2-hour idle session test
- [ ] **RLS policies:** All policies tested through the JS client as a real authenticated user (not via SQL editor) — verify each table has explicit SELECT/INSERT/UPDATE policies
- [ ] **Invite flow:** Test with a Microsoft 365 corporate email address, not just Gmail — one-time token prefetching is invisible in Gmail testing
- [ ] **Cron security:** `CRON_SECRET` check fires before any async operation in the route handler — verify the endpoint returns 401 when called without the header
- [ ] **Cron idempotency:** Trigger the cron route twice in quick succession — verify no duplicate video entries appear in the database
- [ ] **Rating persistence:** After submitting a rating, hard-refresh the page — verify the rating is still displayed (it was written to Supabase, not just local state)
- [ ] **Prompt versioning:** After the improvement cron runs, verify a new prompt version row exists in the database AND the old one is still present (not overwritten)
- [ ] **videos.json migration:** After Supabase migration, verify the gallery loads from Supabase and videos.json is no longer imported by any component
- [ ] **Generation pipeline:** Verify the Remotion render step does NOT run inside a Vercel serverless function — it must run in a non-serverless environment

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| RLS misconfiguration causing data exposure | MEDIUM | Enable RLS immediately on exposed tables; audit query logs for unauthorized access; rotate Supabase anon key if exposure was significant |
| Prompt drift degrades generation quality | MEDIUM | Roll back to a previous prompt version from the versions table; retrain the improvement logic with a larger feedback window or higher minimum rating threshold |
| Duplicate cron runs created duplicate videos | LOW | Delete duplicate rows from the database; add unique constraint on video ID or content hash; implement idempotency lock |
| Invite tokens expired for all pending reviewers | LOW | Re-send invites via Supabase Admin API; increase token TTL in auth settings |
| videos.json and Supabase out of sync after partial migration | MEDIUM | Define a clear cutover point; use the Supabase row count as the authoritative truth; re-import from JSON if needed |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| RLS enabled, no policies (silent empty results) | Phase: Supabase Auth + DB | Run all gallery and rating queries as authenticated user via JS client; confirm non-empty results |
| `getSession()` vs `getClaims()` for route protection | Phase: Supabase Auth + DB | Attempt to access protected route with an expired token; must redirect to login |
| Missing middleware (token refresh breaks) | Phase: Supabase Auth + DB | Leave a session idle for 65 minutes; confirm auto-refresh and continued access |
| CDN caching auth responses | Phase: Supabase Auth + DB | Inspect response headers on auth-touching routes; confirm `Cache-Control: private, no-store` |
| Duplicate cron runs / no idempotency | Phase: Cron pipeline architecture | Trigger cron endpoint twice rapidly; confirm single execution via database state |
| Vercel Hobby tier cron limit | Phase: Cron pipeline architecture | Confirm deployment tier before designing cron schedule |
| Prompt drift from automated improvement | Phase: Feedback loop implementation | Verify prompt versions table exists with append-only writes before first improvement run |
| Email prefetching breaks invite tokens | Phase: Supabase Auth + DB | Test invite flow end-to-end with a corporate email address |
| Feedback status flag / reprocessing | Phase: Feedback loop implementation | Crash the improvement cron mid-run; verify next run skips already-processed feedback |

---

## Sources

- [Supabase Server-Side Auth for Next.js (Official Docs)](https://supabase.com/docs/guides/auth/server-side/nextjs) — HIGH confidence
- [Supabase Row Level Security (Official Docs)](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence
- [Supabase RLS Troubleshooting: Hidden Dangers of RLS (DEV Community, CVE-2025-48757 post-mortem)](https://dev.to/fabio_a26a4e58d4163919a53/supabase-security-the-hidden-dangers-of-rls-and-how-to-audit-your-api-29e9) — HIGH confidence
- [Vercel Cron Jobs (Official Docs)](https://vercel.com/docs/cron-jobs) — HIGH confidence
- [Vercel Managing Cron Jobs — Idempotency, Concurrency, Duration (Official Docs)](https://vercel.com/docs/cron-jobs/manage-cron-jobs) — HIGH confidence
- [Next.js + Supabase CDN Caching Issue — GitHub Discussion](https://github.com/vercel/next.js/discussions/81445) — MEDIUM confidence
- [Supabase Auth Email Prefetching (inviteUserByEmail Reference)](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail) — HIGH confidence
- [AI Prompt Drift and Feedback Loop Degradation (Maxim AI, 2025)](https://www.getmaxim.ai/articles/a-comprehensive-guide-to-preventing-ai-agent-drift-over-time/) — MEDIUM confidence
- [Vercel Cron Jobs Hobby Tier Accuracy Limits (Official Docs)](https://vercel.com/docs/cron-jobs/manage-cron-jobs#cron-jobs-accuracy) — HIGH confidence
- [Remotion Chrome Headless Shell for Server Rendering (Official Docs)](https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell) — HIGH confidence

---
*Pitfalls research for: Next.js + Supabase Auth + Rating System + Cron AI Content Pipeline*
*Researched: 2026-03-26*
