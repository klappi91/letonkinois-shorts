# Phase 1: Supabase Foundation - Research

**Researched:** 2026-03-26
**Domain:** Supabase SSR integration with Next.js 16 (three-client pattern, RLS, schema)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from PROJECT.md / STATE.md)

### Locked Decisions

- Use `@supabase/ssr@0.9.0` (not deprecated `@supabase/auth-helpers-nextjs`)
- Use `getClaims()` for all auth guards in proxy — never `getSession()` (spoofable)
- Next.js 16: middleware file is `proxy.ts`, not `middleware.ts`; `cookies()` must be awaited
- Videos stay in `public/videos/` — no Supabase Storage for video files
- Auth: Invite-Only (Admin creates accounts via Supabase Dashboard or Admin API — no self-service registration)
- Tech stack: Next.js 16 + Supabase (Auth + DB) + Vercel — no additional services

### Claude's Discretion

- Schema management approach (SQL Editor vs migration files) — project has no existing local Supabase setup
- Three-client file structure within `src/lib/supabase/`
- Env var naming for new vs legacy Supabase keys (Supabase is transitioning to new key format)

### Deferred Ideas (OUT OF SCOPE for Phase 1)

- AUTH-01 through AUTH-05 (Login page, session refresh, route protection) — Phase 2
- DATA-01 through DATA-04 (JSON migration, Supabase queries in dashboard) — Phase 2
- FEED-01 through FEED-04 (Star rating UI, feedback storage) — Phase 3
- PROM-01 through PROM-03 (Prompt versioning UI) — Phase 4
- Instagram API — later milestone
- Cron jobs — v2
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SUPA-01 | Supabase project configured with env vars (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) in Vercel and locally | Env var naming section; Vercel CLI env workflow |
| SUPA-02 | `@supabase/ssr` integrated with browser client, server client, admin client via three-client pattern | Three-client pattern section; exact import paths documented |
| SUPA-03 | `videos` table with correct columns and FKs | Schema section; SQL examples |
| SUPA-04 | `feedback` table with correct columns and FKs | Schema section; SQL examples |
| SUPA-05 | `prompt_versions` table with correct columns | Schema section; SQL examples |
| SUPA-06 | RLS enabled on all three tables with tested policies | RLS section; policy SQL patterns; test patterns |
</phase_requirements>

---

## Summary

Phase 1 establishes the Supabase infrastructure for the Le Tonkinois Shorts feedback system. The technical work splits into three independent workstreams: (1) package installation and three-client pattern wiring, (2) database schema creation with three tables, and (3) RLS policy configuration and testing.

The stack is `@supabase/ssr@0.9.0` (released 2026-03-02) with `@supabase/supabase-js@2.100.0` as the peer dependency. Next.js 16 uses `proxy.ts` at the project root (renamed from `middleware.ts` in v16.0.0 — middleware.ts is now deprecated). The `cookies()` function from `next/headers` must be `await`ed. The three-client pattern separates browser, server, and admin concerns into three distinct factory functions.

Supabase is in a key-format transition: new projects get both legacy JWT keys (anon/service_role) and new format keys (sb_publishable_.../sb_secret_...). Either format works during the transition period (legacy keys fully removed late 2026). For this project, use the legacy naming convention (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) since all existing Supabase Next.js tooling and templates use these names. The new publishable key can be used in place of the anon key if preferred — but the env var name stays `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or can be renamed to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).

**Primary recommendation:** Install `@supabase/supabase-js@^2.100.0` and `@supabase/ssr@^0.9.0`, create `src/lib/supabase/` with three client files, run schema SQL directly in the Supabase Dashboard SQL Editor (no local Supabase CLI setup needed for this phase), then set env vars in `.env.local` and Vercel dashboard.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | 2.100.0 | Supabase client SDK (data, auth, admin) | Official JS SDK; required peer dep of @supabase/ssr |
| `@supabase/ssr` | 0.9.0 | SSR-safe cookie-based auth helpers | Official package for Next.js App Router; replaces deprecated auth-helpers-nextjs |

### Supporting

None required for Phase 1. Phase 2 may add `@supabase/auth-ui-react` for login UI.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@supabase/ssr` | `@supabase/auth-helpers-nextjs` | auth-helpers is deprecated — do not use |
| `@supabase/ssr` | Direct `@supabase/supabase-js` createClient | Would require manual cookie handling — ssr package handles this |
| Dashboard SQL Editor | Supabase CLI + local stack | CLI requires Docker + local setup overhead; Dashboard is faster for initial schema on small teams |

**Installation:**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Version verification:** Confirmed on 2026-03-26 against npm registry.

- `@supabase/ssr@0.9.0` — released 2026-03-02 (current latest)
- `@supabase/supabase-js@2.100.0` — current latest; required `^2.97.0` peer dep of ssr@0.9.0

---

## Architecture Patterns

### Recommended Project Structure

```
src/lib/supabase/
├── client.ts        # Browser client (use in 'use client' components)
├── server.ts        # Server client (use in Server Components, Server Actions, Route Handlers)
└── admin.ts         # Admin client (service role — server-only, bypasses RLS)
src/
proxy.ts             # Session refresh on every request (project root, same level as src/)
.env.local           # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

### Pattern 1: Browser Client (client.ts)

**What:** Singleton-safe browser client using `createBrowserClient`. Safe to call multiple times — `@supabase/ssr` handles deduplication.
**When to use:** In `'use client'` components that need to query Supabase or check auth state on the browser side.

```typescript
// src/lib/supabase/client.ts
// Source: @supabase/ssr official docs + supabase.com/docs/guides/auth/server-side/nextjs
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Pattern 2: Server Client (server.ts)

**What:** Async factory that creates a server-side Supabase client wired to Next.js cookie store. Must be called once per request (not at module level).
**When to use:** In Server Components, Route Handlers (`app/api/**/route.ts`), and Server Actions.

```typescript
// src/lib/supabase/server.ts
// Source: supabase.com/docs/guides/auth/server-side/nextjs + verified community patterns
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()  // MUST be awaited in Next.js 16

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from Server Component — proxy handles token refresh
          }
        },
      },
    }
  )
}
```

### Pattern 3: Admin Client (admin.ts)

**What:** Service-role client that bypasses RLS. Uses `@supabase/supabase-js` `createClient` directly (not `@supabase/ssr`). Must NEVER be imported in browser code.
**When to use:** Server-only operations that need to bypass RLS (e.g., `inviteUserByEmail`, seeding data, admin data reads).

```typescript
// src/lib/supabase/admin.ts
// Source: supabase.com community pattern + official troubleshooting docs
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
```

### Pattern 4: Proxy (Session Refresh)

**What:** Next.js 16 `proxy.ts` at project root that refreshes Supabase auth tokens on every request. Without this, Server Components get stale tokens.
**When to use:** Always — runs on every non-static route automatically.

```typescript
// proxy.ts (project root — same level as src/, NOT inside src/)
// Source: Next.js 16 proxy.ts convention + supabase.com/docs/guides/auth/server-side/nextjs
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Use getClaims() not getSession() — getClaims verifies JWT against
  // published public keys; getSession() reads from cookie without server verification
  await supabase.auth.getClaims()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, and image files
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Pattern 5: Database Schema (SQL)

Run these in the Supabase Dashboard SQL Editor. No local CLI required.

```sql
-- Source: REQUIREMENTS.md SUPA-03, SUPA-04, SUPA-05 + RLS docs

-- Videos table (SUPA-03)
create table if not exists public.videos (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  caption_de    text,
  caption_fr    text,
  hashtags      text[] default '{}',
  type          text not null check (type in ('showcase','before-after','how-to','seasonal','heritage','lifestyle')),
  duration      integer,
  pipeline      text,
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  prompt_version text,
  video_url     text,
  created_at    timestamptz not null default now()
);

-- Feedback table (SUPA-04)
create table if not exists public.feedback (
  id           uuid primary key default gen_random_uuid(),
  video_id     uuid not null references public.videos(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  stars        integer not null check (stars between 1 and 5),
  pros         text,
  cons         text,
  created_at   timestamptz not null default now(),
  processed_at timestamptz
);

-- Prompt versions table (SUPA-05)
create table if not exists public.prompt_versions (
  id             uuid primary key default gen_random_uuid(),
  version_number integer not null,
  content        jsonb not null,
  created_at     timestamptz not null default now(),
  created_by     uuid references auth.users(id)
);

-- Enable RLS on all three tables (SUPA-06)
alter table public.videos enable row level security;
alter table public.feedback enable row level security;
alter table public.prompt_versions enable row level security;
```

### Pattern 6: RLS Policies

```sql
-- Source: supabase.com/docs/guides/database/postgres/row-level-security

-- Videos: any authenticated user can read
create policy "Authenticated users can read videos"
  on public.videos for select
  to authenticated
  using (true);

-- Feedback: users can insert their own feedback
create policy "Users can insert own feedback"
  on public.feedback for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Feedback: users can read their own feedback
create policy "Users can read own feedback"
  on public.feedback for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Feedback: service role can read all (admin access bypasses RLS anyway)
-- No extra policy needed — service_role bypasses RLS by default

-- Prompt versions: any authenticated user can read
create policy "Authenticated users can read prompt versions"
  on public.prompt_versions for select
  to authenticated
  using (true);
```

### Anti-Patterns to Avoid

- **Using `getSession()` in proxy/server code:** Reads session from cookie without server verification — spoofable. Always use `getClaims()` in proxy and server-side guards.
- **Creating server client at module level:** Server clients must be created inside request handlers. Module-level clients don't have access to request cookies.
- **Importing admin.ts in 'use client' components:** The service role key would be exposed to the browser. Admin client is server-only.
- **Using `@supabase/auth-helpers-nextjs`:** Deprecated. Always use `@supabase/ssr`.
- **Using `middleware.ts` filename:** Deprecated in Next.js 16 — use `proxy.ts`. Next.js provides a codemod: `npx @next/codemod@canary middleware-to-proxy .`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie-based session management | Custom cookie read/write in server components | `@supabase/ssr` `createServerClient` with `getAll`/`setAll` | Token refresh timing, httpOnly cookie edge cases, concurrent refresh race conditions |
| JWT validation on server | Manual JWT decode + verify | `supabase.auth.getClaims()` | Fetches public keys, handles key rotation, validates expiry |
| Admin operations bypassing RLS | Modifying RLS to be permissive | `createAdminClient()` with service_role key | Keeps RLS intact for all regular users; admin access is explicit and auditable |
| RLS "admin role" detection | Custom user metadata `is_admin` field + policy | Supabase service_role client | Service role bypasses RLS entirely; no policy complexity needed for Phase 1 |

**Key insight:** The `@supabase/ssr` package exists specifically to solve the cookie-in-SSR problem. The 3-year history of versions shows this is genuinely hard to get right — don't attempt custom solutions.

---

## Common Pitfalls

### Pitfall 1: `cookies()` Not Awaited

**What goes wrong:** TypeScript error or runtime crash — `cookies()` returns a Promise in Next.js 15+ but many tutorials show it without `await`.
**Why it happens:** Next.js 15 made `cookies()` async. Older tutorials pre-date this change.
**How to avoid:** Always `const cookieStore = await cookies()` in server.ts. The proxy.ts uses `request.cookies` directly (not the `cookies()` function), so no await needed there.
**Warning signs:** `TypeError: cookieStore.getAll is not a function` or build warnings about unresolved promises.

### Pitfall 2: `proxy.ts` Name (Not `middleware.ts`)

**What goes wrong:** Session refresh never runs — cookies don't get refreshed, Server Components see expired tokens, users get logged out unexpectedly.
**Why it happens:** Next.js 16 deprecated `middleware.ts` and renamed it to `proxy.ts`. The exported function name also changed from `middleware` to `proxy`.
**How to avoid:** Create `proxy.ts` at project root (same level as `src/`). Export `export async function proxy(request: NextRequest)` and `export const config`.
**Warning signs:** Auth works in browser but server components show unauthenticated even when user is logged in.

### Pitfall 3: Admin Client in Browser Bundle

**What goes wrong:** `SUPABASE_SERVICE_ROLE_KEY` exposed in browser — visible in JS bundle, gives anyone full database access bypassing RLS.
**Why it happens:** `admin.ts` accidentally imported in a client component or page that renders client-side.
**How to avoid:** Name the env var WITHOUT `NEXT_PUBLIC_` prefix so Next.js won't include it in client bundles. TypeScript will error if you try to use it in a 'use client' component. Add a `server-only` guard import if needed.
**Warning signs:** `process.env.SUPABASE_SERVICE_ROLE_KEY` appearing in browser DevTools → Network → JS files.

### Pitfall 4: RLS Blocks Service Role Queries

**What goes wrong:** Admin client queries return empty results despite service role key.
**Why it happens:** Misconfigured RLS policies that explicitly check `auth.uid()` can sometimes interact oddly — but more commonly, the admin client is misconfigured and uses the anon key instead of service_role.
**How to avoid:** The service_role key bypasses RLS by default — no special policy needed. Verify the correct key is in `SUPABASE_SERVICE_ROLE_KEY` env var (get from Supabase Dashboard → Settings → API → service_role).
**Warning signs:** Admin client queries return 0 rows; checking with raw SQL in Dashboard shows rows exist.

### Pitfall 5: Missing `supabaseResponse` Cookie Forwarding in Proxy

**What goes wrong:** Token refresh happens in proxy but refreshed cookies don't reach Server Components — they still see old (potentially expired) tokens.
**Why it happens:** A common mistake is creating a new `NextResponse.next()` after the `setAll` call but not using it as the return value.
**How to avoid:** Follow the proxy pattern exactly — `supabaseResponse` must be the response object that gets mutated by `setAll` AND returned from the proxy function.
**Warning signs:** Intermittent auth failures; users get logged out after token expiry even though they're active.

### Pitfall 6: Supabase Key Transition Confusion

**What goes wrong:** Mixing up old-format (JWT) env var names with new-format (sb_publishable_) key values, or vice versa.
**Why it happens:** Supabase is mid-transition to new key formats. Docs sometimes show new format names, sometimes old.
**How to avoid:** Use legacy env var names (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) with whichever key format the project provides (both work during transition until late 2026). Check the Supabase Dashboard under Settings → API Keys for your project's actual key format.
**Warning signs:** `supabaseUrl or supabaseKey required` error; 401 responses from all Supabase calls.

---

## Code Examples

### Verify RLS is Working (Test Pattern)

```typescript
// Server-side test: unauthenticated query should return empty array (not error)
// Source: RLS docs + direct verification pattern
const supabase = createClient(url, anonKey) // plain @supabase/supabase-js, no session
const { data, error } = await supabase.from('videos').select('id')
// Expected: data = [], error = null  (not a permission error — RLS returns empty)

// Authenticated query should return rows
const supabase2 = createClient(url, anonKey)
await supabase2.auth.signInWithPassword({ email, password })
const { data: rows } = await supabase2.from('videos').select('id')
// Expected: data = [...rows], error = null
```

### Environment Variables (.env.local)

```bash
# .env.local (never commit this file)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  (or sb_publishable_... for new key format)
SUPABASE_SERVICE_ROLE_KEY=eyJ...       (or sb_secret_... for new key format)
# NOTE: SERVICE_ROLE_KEY must NOT have NEXT_PUBLIC_ prefix — keeps it server-only
```

### Vercel Environment Variables (CLI)

```bash
# Add to Vercel production environment
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Or set via Vercel Dashboard → Project Settings → Environment Variables
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2023-late | auth-helpers is deprecated; must migrate |
| `middleware.ts` | `proxy.ts` | Next.js 16.0.0 | Rename required; function export also renamed |
| `getSession()` in server code | `getClaims()` | 2024-mid | getSession is spoofable in server context |
| Edge runtime middleware | Node.js runtime proxy | Next.js 15.2+ (stable 15.5) | @supabase/ssr requires Node APIs; Edge was incompatible |
| Legacy JWT anon key | sb_publishable_ key | Mid-2025 (preview), Late 2026 (required) | Both work now; old keys removed late 2026 |
| `cookies()` synchronous | `cookies()` async (must `await`) | Next.js 15 | Breaking change for server.ts pattern |

**Deprecated/outdated:**

- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr` — do not use
- `middleware.ts` + `export function middleware()`: Renamed to `proxy.ts` + `export function proxy()` in Next.js 16
- `supabase.auth.getSession()` in server/proxy code: Use `getClaims()` instead

---

## Open Questions

1. **New key format vs legacy key format for this project**
   - What we know: Both formats work until late 2026. New Supabase projects created in 2025+ may default to new format.
   - What's unclear: Whether the project's Supabase account has already created the project (and in which format keys were issued).
   - Recommendation: Check Supabase Dashboard → Settings → API Keys. Use whatever keys are shown. Env var names stay the same regardless.

2. **`getClaims()` availability in @supabase/ssr@0.9.0**
   - What we know: STATE.md says to use `getClaims()`. The Supabase JS reference docs confirm `auth.getClaims()` exists. The method verifies JWT against published public keys.
   - What's unclear: Exactly when `getClaims()` was added to `@supabase/supabase-js` (appears to be mid-2025 with asymmetric key support).
   - Recommendation: `getClaims()` is available in `@supabase/supabase-js@2.100.0`. If the method is unavailable at runtime, fall back to `getUser()` (network call to auth server, but secure).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | Yes | 22.22.0 | — |
| npm | Package manager | Yes | 10.9.4 | — |
| vercel CLI | Env var deployment | Yes | 50.28.0 | Vercel Dashboard UI |
| supabase CLI | Migration management | Yes (via npx) | 2.84.4 | Dashboard SQL Editor (recommended for Phase 1) |
| Supabase project | Database + Auth | Unknown | — | Must be created before execution |
| .env.local | Local dev auth | Not present | — | Must be created in Wave 0 |

**Missing dependencies with no fallback:**

- Supabase project must exist before execution — executor needs to create project at supabase.com if not already done.

**Missing dependencies with fallback:**

- `supabase` CLI: Available via `npx supabase@latest` but not needed for Phase 1. SQL runs directly in Dashboard SQL Editor.
- `.env.local`: Not present — Wave 0 task creates it with placeholder values.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None configured — no test scripts in package.json |
| Config file | None detected |
| Quick run command | `npm run build` (build verification as proxy for unit tests) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SUPA-01 | App starts without missing-env errors | smoke | `npm run build` | N/A — env check at build time |
| SUPA-02 | Three clients importable without TypeScript errors | type-check | `npm run build` | ❌ Wave 0 creates files |
| SUPA-03 | `videos` table exists with correct columns | manual | Supabase Dashboard → Table Editor | ❌ SQL run manually |
| SUPA-04 | `feedback` table exists with correct columns | manual | Supabase Dashboard → Table Editor | ❌ SQL run manually |
| SUPA-05 | `prompt_versions` table exists with correct columns | manual | Supabase Dashboard → Table Editor | ❌ SQL run manually |
| SUPA-06 | RLS active: auth'd query returns rows, anon query returns empty | manual | Run test queries in SQL Editor (see Code Examples) | ❌ Manual verification |

### Sampling Rate

- **Per task commit:** `npm run build` (catches TypeScript errors in new client files)
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** All 6 success criteria verified before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/supabase/client.ts` — covers SUPA-02 (browser client)
- [ ] `src/lib/supabase/server.ts` — covers SUPA-02 (server client)
- [ ] `src/lib/supabase/admin.ts` — covers SUPA-02 (admin client)
- [ ] `proxy.ts` at project root — session refresh infrastructure
- [ ] `.env.local` with placeholder structure — covers SUPA-01

---

## Project Constraints (from CLAUDE.md)

- **GSD Workflow:** All file changes must go through a GSD command (`/gsd:quick`, `/gsd:debug`, `/gsd:execute-phase`). No direct repo edits outside GSD workflow.
- **No `next dev` in background shells:** Validate with `npm run build` and `npm run lint` only. Browser tests only against an already-running dev server.
- **Tech stack locked:** Next.js 16, Supabase, Vercel — no additional services.
- **Video storage:** Videos stay in `public/videos/` — no Supabase Storage for video files.
- **Branding:** All UI must follow Le Tonkinois brand (Rot #B50606, Lora + Lato, Premium-Look).
- **Produktfotos:** NEVER use AI-generated product images — always use real photos from the catalog.

---

## Sources

### Primary (HIGH confidence)

- `supabase.com/docs/guides/auth/server-side/nextjs` — SSR setup, proxy pattern, getClaims security note
- `supabase.com/docs/guides/database/postgres/row-level-security` — RLS SQL syntax, auth.uid(), policy patterns
- `nextjs.org/docs/app/api-reference/file-conventions/proxy` — proxy.ts API, migration from middleware.ts, v16.0.0 changelog
- `npm view @supabase/ssr` — confirmed version 0.9.0 released 2026-03-02 (current latest)
- `npm view @supabase/supabase-js` — confirmed version 2.100.0 (current latest)

### Secondary (MEDIUM confidence)

- Medium guide (the-shubham.medium.com) — complete proxy.ts + server.ts + client.ts code patterns verified against official docs
- `supabase.com/docs/guides/api/api-keys` — new key format (sb_publishable_/sb_secret_) transition status
- GitHub discussion #29260 — key transition timeline confirmed (legacy keys removed late 2026)
- `supabase.com/docs/reference/javascript/auth-getclaims` — getClaims() vs getUser() security distinction

### Tertiary (LOW confidence)

- Community patterns for admin client `createAdminClient()` with `persistSession: false` — consistent across multiple sources but not in a single official page.

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — versions confirmed via npm registry on research date
- Architecture patterns (three-client): HIGH — official Supabase docs + verified community implementations
- proxy.ts pattern: HIGH — official Next.js 16 docs confirm rename from middleware.ts
- RLS policies: HIGH — official Supabase RLS docs with SQL examples
- Env var naming during key transition: MEDIUM — docs show both old and new formats; recommendation is pragmatic

**Research date:** 2026-03-26
**Valid until:** 2026-06-26 (90 days — Supabase SSR is relatively stable; key transition may accelerate)
