# Phase 2: Auth + Data Migration - Research

**Researched:** 2026-03-26
**Domain:** Supabase Auth (email/password) + Next.js 16 App Router route protection + Supabase data queries
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Users are created exclusively by Chris manually via Supabase Dashboard. No `inviteUserByEmail()`, no email invite link, no password reset flow. Users receive credentials directly.
- **D-02:** Admin recognition via `app_metadata.role = 'admin'` (from Phase 1 D-01).
- **D-03:** Minimal Branded Layout — centered form on Cream background (#FFF8F0). Le Tonkinois logo at top, "Content Review" subtitle. Email and password fields, red login button (#B50606).
- **D-04:** Inline error messages below the form as red text ("Ungültige Anmeldedaten"). No popup, no toast.
- **D-05:** German labels only: "E-Mail", "Passwort", "Anmelden". Team is German-speaking.
- **D-06:** proxy.ts (already present) is extended with Auth-Check: `getUser()` checks if session exists, redirect to /login if not. Static assets and /login itself are exempt.
- **D-07:** After successful login, redirect to / (Gallery Dashboard).
- **D-08:** One-time seed script migrates all entries from `videos.json` into the Supabase `videos` table. Video URLs remain relative paths to `public/videos/`.
- **D-09:** Gallery (/) and Video-Detail (/video/[id]) are switched to Supabase queries. `videos.json` is removed after successful migration.
- **D-10:** Filter functionality (type, status) is rebuilt on Supabase queries with WHERE clauses.

### Claude's Discretion

- Auth-Redirect behavior (Loading-State during Auth-Check)
- Logout button placement and design
- Seed-Script format (Node.js script vs. SQL insert)
- Whether `/assets` page also needs Supabase data or remains unchanged

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | User can log in via email/password on a dedicated login page | signInWithPassword() confirmed, Server Action pattern documented below |
| AUTH-02 | Admin can invite new users via `inviteUserByEmail()` or Supabase Dashboard | D-01 overrides: manual Supabase Dashboard only, no code needed |
| AUTH-03 | All dashboard pages (/, /video/[id], /assets) are protected — unauthenticated users redirected to /login | proxy.ts extension pattern documented, getClaims() return type verified |
| AUTH-04 | Next.js proxy.ts refreshes sessions automatically and sets auth cookies correctly | proxy.ts already implements this; needs auth-redirect extension only |
| AUTH-05 | User can log out from any page | signOut() on browser client + redirect pattern documented |
| DATA-01 | All existing video metadata from `videos.json` is migrated into Supabase `videos` table | Field mapping table below, seed script approach decided |
| DATA-02 | Gallery dashboard (/) reads video data from Supabase instead of JSON | Server Component async query pattern documented |
| DATA-03 | Video detail page (/video/[id]) reads data from Supabase instead of JSON | Supabase .eq() single-row query pattern documented |
| DATA-04 | Filter functionality (type, status) works correctly with Supabase data | Two-filter URL param + Supabase .eq() WHERE pattern documented |
</phase_requirements>

---

## Summary

Phase 2 has a well-established infrastructure foundation from Phase 1: the Three-Client-Pattern (`@supabase/ssr` 0.9.0) is in place, `proxy.ts` already handles session refresh via `getClaims()`, and the `Video` TypeScript type in `src/lib/types.ts` already mirrors the Supabase schema. The two main work streams — auth gating and data migration — are independent and can be planned in parallel waves.

The auth gating extends `proxy.ts` to check session existence and redirect unauthenticated users to `/login`. A new `src/app/login/page.tsx` handles the login form as a client component calling `signInWithPassword()` on the browser client. Logout can be a simple client-side button calling `signOut()` followed by `router.push('/login')`.

The data migration has a precise field mapping requirement: `VideoEntry` (camelCase, JSON) must be transformed to `Video` (snake_case, Supabase). The critical non-obvious issue is that `videos.json` uses `rating: "pending"` which does not exist in the Supabase schema — it must be migrated as `status: "draft"`. After migration, `src/app/page.tsx` and `src/app/video/[id]/page.tsx` switch from static JSON imports to async Supabase server queries. `VideoGrid.tsx` and `VideoCard.tsx` must be updated from `VideoEntry` to `Video` types.

**Primary recommendation:** Implement in two waves — Wave 1: auth infrastructure (proxy extension + login page + logout), Wave 2: data migration (seed script + query migration + component updates).

---

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | 0.9.0 | Server-side Supabase client with cookie handling | Current replacement for deprecated `@supabase/auth-helpers-nextjs` |
| `@supabase/supabase-js` | 2.100.1 | Supabase JS client (auth + queries) | Official Supabase JS client |
| `next` | 16.2.1 | App Router, Server Components, Server Actions | Already in project |
| `react` | 19.2.4 | UI components | Already in project |

No new npm installs required for this phase.

**Version verification:** All versions confirmed against npm registry on 2026-03-26.
- `@supabase/ssr`: published 0.9.0 (installed matches)
- `@supabase/supabase-js`: published 2.100.1 (installed matches)
- `next`: published 16.2.1 (installed matches)

---

## Architecture Patterns

### Recommended Project Structure Changes

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx          # NEW: Login form (client component)
│   ├── page.tsx              # MODIFIED: async server component, Supabase query
│   └── video/[id]/
│       └── page.tsx          # MODIFIED: async server component, Supabase query
├── components/
│   ├── VideoCard.tsx         # MODIFIED: VideoEntry -> Video type
│   ├── VideoGrid.tsx         # MODIFIED: VideoEntry -> Video type, filter props change
│   └── LogoutButton.tsx      # NEW: client component, calls signOut()
├── data/
│   └── videos.json           # REMOVED after migration
└── lib/
    └── types.ts              # UNCHANGED (Video type already correct)
proxy.ts                      # MODIFIED: add auth redirect logic
scripts/
└── seed-videos.ts            # NEW: one-time migration script
```

### Pattern 1: Extending proxy.ts with Auth Guard

**What:** After the existing `getClaims()` call, check if the user is authenticated and redirect to `/login` if not. Protected paths: everything except `/login` and static assets.

**When to use:** This is the only pattern for Next.js 16 with `proxy.ts`. Do not add auth checks in individual page Server Components — that creates N separate auth calls per request and does not centralize redirect logic.

**Critical insight from `@supabase/ssr` README:** The README specifies using `getClaims()` for performance-sensitive middleware (no network call when JWT is valid). For the auth guard redirect, `getClaims()` is sufficient — `getUser()` makes a network call on every request. HOWEVER, D-06 explicitly requires `getUser()`. Use `getUser()` as specified.

**Example:**
```typescript
// proxy.ts — extended with auth guard
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']

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

  // Refresh session (existing behavior)
  await supabase.auth.getClaims()

  // Auth guard (new)
  const pathname = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  if (!isPublic) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
}
```

**IMPORTANT:** The existing `proxy.ts` matcher already excludes `*.mp4` files and static assets. The PUBLIC_PATHS check handles `/login`. This preserves all existing cookie-setting behavior.

### Pattern 2: Login Page (Client Component + Browser Client)

**What:** Client component form that calls `signInWithPassword()` on the browser client, then uses `useRouter().push('/')` on success.

**When to use:** Login requires client-side interaction (form state, error display). Cannot use Server Actions for this because after login the browser needs to hold the session cookie — `signInWithPassword()` on the browser client handles this automatically.

**Example:**
```typescript
// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Ungültige Anmeldedaten')
      setLoading(false)
    } else {
      router.push('/')   // D-07: redirect to gallery after login
      router.refresh()   // Force Server Components to re-render with new session
    }
  }

  return (
    // D-03: Cream background, centered form, logo, "Content Review" subtitle
    // D-04: Inline error below form as red text
    // D-05: German labels
    <main className="min-h-screen bg-bg-cream flex items-center justify-center px-4">
      {/* form JSX here */}
    </main>
  )
}
```

**Critical:** `router.refresh()` after `router.push('/')` is required. Without it, Next.js Server Components may still use cached data before the session cookie is set.

### Pattern 3: Logout Button (Client Component)

**What:** A client component that calls `signOut()` on the browser client and redirects to `/login`.

**Placement (Claude's discretion):** In the header of `src/app/page.tsx` (gallery), `src/app/video/[id]/page.tsx` (detail), and `src/app/assets/page.tsx` (assets). Since the header is duplicated across pages, extract to a `LogoutButton.tsx` client component.

**Example:**
```typescript
// src/components/LogoutButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1.5 rounded-lg bg-bg-sepia text-text-muted hover:bg-wood-amber/30 transition-colors font-medium text-sm"
    >
      Abmelden
    </button>
  )
}
```

### Pattern 4: Gallery Page as Async Server Component (DATA-02)

**What:** `src/app/page.tsx` becomes an async Server Component that queries Supabase.

**When to use:** Server Components provide the query at render time — no client-side fetch needed, no loading state required, data is fresh on every page load.

**Example:**
```typescript
// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import { Video } from '@/lib/types'

export default async function Home() {
  const supabase = await createClient()
  const { data: videos, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  const videoList: Video[] = videos ?? []

  const stats = {
    total: videoList.length,
    pending: videoList.filter((v) => v.status === 'draft').length,
    approved: videoList.filter((v) => v.status === 'approved').length,
  }

  // Pass videoList to VideoGrid (must accept Video[] not VideoEntry[])
}
```

### Pattern 5: Supabase Queries for Filter (DATA-04)

**What:** Filter by type and status with Supabase `.eq()` WHERE clauses. Since `VideoGrid` is a client component handling filter state, the approach is either (a) fetch all videos server-side and pass to client component for client-side filtering, or (b) use URL search params + server-side filtered queries.

**Recommendation (Claude's discretion):** Keep client-side filtering in `VideoGrid`. Fetch all videos in the Server Component and pass the full list. `VideoGrid` filters in memory. This is simpler and matches the current architecture. The dataset is small (5-50 videos), making client-side filtering appropriate.

**Filter on VideoGrid must switch from `VideoEntry` fields to `Video` fields:**
- `v.type` — unchanged, same field name
- `v.rating` (VideoEntry) → `v.status` (Video)

### Pattern 6: Video Detail Page as Async Server Component (DATA-03)

**What:** `src/app/video/[id]/page.tsx` needs to fetch a single video by ID from Supabase. The current page is `'use client'` — this must change to a Server Component wrapper with a client component for the copy buttons.

**Example:**
```typescript
// src/app/video/[id]/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server'

export default async function VideoDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params  // Server Component: await params directly
  const supabase = await createClient()
  const { data: video } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single()

  if (!video) {
    // 404 handling
  }
  // render
}
```

**CRITICAL:** The current `page.tsx` uses `use(params)` (client-side unwrapping). In a Server Component, use `await params` directly.

### Pattern 7: Data Migration Field Mapping

**VideoEntry (videos.json) → Video (Supabase)**

| VideoEntry field | Video field | Transformation |
|-----------------|-------------|----------------|
| `id` | `id` | Direct copy (string) |
| `title` | `title` | Direct copy |
| `type` | `type` | Direct copy |
| `createdAt` | `created_at` | camelCase → snake_case |
| `videoFile` | `video_url` | Direct copy (e.g., `/videos/foo.mp4`) |
| `duration` | `duration` | Direct copy (number) |
| `captionDe` | `caption_de` | camelCase → snake_case |
| `captionFr` | `caption_fr` | camelCase → snake_case, undefined → null |
| `hashtags` | `hashtags` | Direct copy (string[]) |
| `rating` | `status` | `"pending"` → `"draft"` (REQUIRED — "pending" is NOT a valid VideoStatus) |
| `products` | `products` | Direct copy (string[]) |
| `pipeline` | `pipeline` | Direct copy (string) |
| *(not in JSON)* | `prompt_version` | `null` |

**CRITICAL:** All 5 videos in `videos.json` have `rating: "pending"`. The Supabase schema uses `TEXT CHECK (status IN ('draft', 'approved', 'rejected'))`. The seed script MUST map `"pending"` → `"draft"`.

### Anti-Patterns to Avoid

- **Using `getSession()` for auth guard:** Returns unverified cookies — can be spoofed. Always use `getUser()` for redirect decisions (D-06 compliant) or `getClaims()` for page-level checks.
- **Auth check in individual Server Components instead of proxy.ts:** Creates race conditions between redirect and render, breaks cookie refresh flow.
- **Server Action for login form:** Works but creates complexity with redirect handling. `signInWithPassword()` on browser client is simpler and the correct pattern for SPA-style login.
- **`router.push()` without `router.refresh()`:** Next.js will serve stale Server Component HTML after login — user sees old (unauthenticated) content until hard refresh.
- **Importing `videos.json` after migration:** Remove the import in both page files, or TypeScript will still compile against the old type.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie-based session management | Custom JWT cookie handling | `@supabase/ssr` `createServerClient` / `createBrowserClient` | Cookie chunking, encoding, expiry, and concurrent-request safety are all handled |
| Token refresh on page load | Custom refresh middleware | `supabase.auth.getClaims()` in proxy.ts | Already implemented in existing proxy.ts |
| Password hashing / user auth | Any custom auth system | Supabase Auth | Bcrypt, session management, rate limiting all done |
| SQL parameterization | String interpolation in queries | Supabase `.from().select().eq()` chain | Prevents SQL injection, handles type coercion |
| Protected route HOC | Custom `withAuth()` wrapper | proxy.ts redirect | Middleware-level redirect is more reliable than component-level |

**Key insight:** The proxy.ts pattern is the correct centralization point for auth — it runs before any rendering and can set/read cookies bidirectionally.

---

## Runtime State Inventory

> Step 2.5: SKIPPED — This phase is NOT a rename/refactor/migration of identifiers. The data migration (videos.json → Supabase) is a data seeding operation, not a string rename. No runtime state inventory required.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Seed script execution | ✓ | (system) | — |
| `@supabase/ssr` | Auth clients | ✓ | 0.9.0 | — |
| `@supabase/supabase-js` | Supabase queries | ✓ | 2.100.1 | — |
| Supabase project (remote) | All auth + data | ✓ | (configured Phase 1) | — |
| `NEXT_PUBLIC_SUPABASE_URL` | Client init | ✓ | Set in Phase 1 | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client init | ✓ | Set in Phase 1 | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed script (admin client) | ✓ | Set in Phase 1 | — |

**Missing dependencies with no fallback:** None.

**Note on seed script:** Uses `createAdminClient()` (already in `src/lib/supabase/admin.ts`) to bypass RLS during seeding. Requires `SUPABASE_SERVICE_ROLE_KEY` in environment, which was set in Phase 1.

---

## Common Pitfalls

### Pitfall 1: Double Auth Call in proxy.ts

**What goes wrong:** The existing proxy.ts calls `supabase.auth.getClaims()` for session refresh. Adding another `supabase.auth.getUser()` for the auth guard means two auth operations per request.

**Why it happens:** `getClaims()` is for refresh; `getUser()` is for auth check. They serve different purposes.

**How to avoid:** Per the `@supabase/ssr` README: `getClaims()` validates the JWT locally (fast). `getUser()` calls the Auth server (slower, always fresh). Since D-06 specifies `getUser()`, keep both calls — `getClaims()` first for token refresh, then `getUser()` only for non-public paths. This avoids the network call on `/login` itself.

**Warning signs:** Slow page loads (every request hitting Supabase Auth server).

### Pitfall 2: VideoDetail Page "use client" Conflict

**What goes wrong:** The current `src/app/video/[id]/page.tsx` has `'use client'` at the top. After migration, it needs to be an async Server Component to call `await createClient()`. You cannot use `'use client'` and `async` together in the same component.

**Why it happens:** The CopyButton component requires `useState` (client-side). Previously the whole page was client-side.

**How to avoid:** Extract `CopyButton` into its own file (`src/components/CopyButton.tsx`, already client-component). The page itself becomes a server component and imports CopyButton as a leaf client component. The `use(params)` pattern (client-side) becomes `await params` (server-side).

**Warning signs:** TypeScript error "async Server Component cannot use 'use client'" or runtime error on params unwrapping.

### Pitfall 3: "pending" rating in videos.json Not Valid in Supabase Schema

**What goes wrong:** The seed script inserts `status: "pending"` which violates the `CHECK (status IN ('draft', 'approved', 'rejected'))` constraint.

**Why it happens:** The `VideoEntry` type has `rating: Rating` where `Rating = VideoStatus` which has been updated, but the actual JSON still contains the old value `"pending"`.

**How to avoid:** Seed script must map: `entry.rating === 'pending' ? 'draft' : entry.rating`.

**Warning signs:** Supabase insert error "new row for relation 'videos' violates check constraint 'videos_status_check'".

### Pitfall 4: VideoCard.tsx Using VideoEntry.videoFile, VideoEntry.createdAt, VideoEntry.captionDe

**What goes wrong:** After switching to `Video` type, these field names change: `videoFile` → `video_url`, `createdAt` → `created_at`, `captionDe` → `caption_de`, `captionFr` → `caption_fr`, `rating` → `status`.

**Why it happens:** `VideoEntry` used camelCase (JS convention); `Video` uses snake_case (Supabase/DB convention).

**How to avoid:** Systematic TypeScript migration of both `VideoCard.tsx` and `VideoGrid.tsx`. TypeScript will catch all mismatches at compile time once the prop type changes from `VideoEntry` to `Video`.

**Warning signs:** TypeScript errors on `video.videoFile`, `video.createdAt`, `video.captionDe`, `video.rating`.

### Pitfall 5: supabaseResponse Cookie Propagation in proxy.ts

**What goes wrong:** If the auth redirect returns `NextResponse.redirect(url)` instead of `supabaseResponse`, the refreshed session cookies from `getClaims()` / `setAll()` are lost.

**Why it happens:** The `supabaseResponse` object accumulates `Set-Cookie` headers via `setAll`. A bare `NextResponse.redirect()` does not carry these headers.

**How to avoid:** When redirecting, copy cookies from `supabaseResponse` to the redirect response:
```typescript
const redirectResponse = NextResponse.redirect(url)
supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
  redirectResponse.cookies.set(name, value)
})
return redirectResponse
```
Or simply create the redirect response after the Supabase client is set up, using the same pattern.

---

## Code Examples

### Login Server Action Alternative (if needed)

Per pattern decided (browser client), login uses client-side `signInWithPassword`. No server action needed. The browser client handles cookie storage automatically.

### Supabase Query: All Videos (Gallery)

```typescript
// Source: @supabase/supabase-js docs, verified against installed 2.100.1
const { data, error } = await supabase
  .from('videos')
  .select('*')
  .order('created_at', { ascending: false })
```

### Supabase Query: Single Video by ID (Detail)

```typescript
// Source: @supabase/supabase-js docs
const { data, error } = await supabase
  .from('videos')
  .select('*')
  .eq('id', id)
  .single()
// .single() returns null data (not array) when no row found, no error
// .single() returns error if multiple rows match
```

### Seed Script Structure (Node.js)

```typescript
// scripts/seed-videos.ts
import { createAdminClient } from '../src/lib/supabase/admin'
import videosJson from '../src/data/videos.json'

async function seed() {
  const supabase = createAdminClient()

  const rows = videosJson.map((entry) => ({
    id: entry.id,
    title: entry.title,
    type: entry.type,
    created_at: entry.createdAt,
    video_url: entry.videoFile,
    duration: entry.duration,
    caption_de: entry.captionDe,
    caption_fr: entry.captionFr ?? null,
    hashtags: entry.hashtags,
    status: entry.rating === 'pending' ? 'draft' : entry.rating,
    products: entry.products ?? [],
    pipeline: entry.pipeline,
    prompt_version: null,
  }))

  const { error } = await supabase.from('videos').upsert(rows)
  if (error) throw error
  console.log(`Seeded ${rows.length} videos.`)
}

seed().catch(console.error)
```

**Run with:** `npx tsx scripts/seed-videos.ts` (tsx is available via Next.js devDependencies chain or installable standalone)

### getClaims() Return Shape

```typescript
// getClaims() returns:
// { data: { claims: JwtPayload, header, signature }, error: null } — valid session
// { data: null, error: AuthError } — invalid/expired session
// { data: null, error: null } — no session at all
// Check: const isAuthed = data?.claims?.sub != null
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2023-2024 | Package renamed; `@supabase/ssr` 0.4.0+ requires `getAll`/`setAll` (not `get`/`set`/`remove`) |
| `middleware.ts` (Next.js standard naming) | `proxy.ts` (Next.js 16 renamed) | Next.js 16.x | Must export `proxy` function, not `middleware` — already correct in this project |
| `getSession()` for auth guards | `getUser()` or `getClaims()` | @supabase/ssr 0.4.0+ | `getSession()` is spoofable; README explicitly warns against using it for authorization |
| `cookies()` synchronous | `await cookies()` | Next.js 15/16 | `cookies()` returns a Promise in Next.js 15+; must be awaited |
| Client-side `use(params)` in page.tsx | `await params` in Server Component | Next.js 15+ | `params` is a Promise in App Router — server components use `await`, client components use `use()` |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: deprecated, replaced by `@supabase/ssr`
- `get`/`set`/`remove` cookie methods in `createServerClient`: deprecated since 0.4.0, replaced by `getAll`/`setAll`
- `getSession()` for authorization: unsafe, use `getUser()` or `getClaims()`

---

## Open Questions

1. **Does `/assets` page need auth guard?**
   - What we know: D-06 says "all Dashboard-Seiten (/, /video/[id], /assets)" are protected
   - What's unclear: Whether `/assets` should also migrate data to Supabase (it uses `asset-catalog.ts`, not `videos.json`)
   - Recommendation: Auth guard via proxy.ts covers it automatically (no special handling needed). `asset-catalog.ts` stays as TypeScript static import — no Supabase data needed for assets (Claude's discretion area per CONTEXT.md).

2. **tsx availability for seed script**
   - What we know: Next.js 16 devDependencies don't explicitly include `tsx`
   - What's unclear: Whether `npx tsx` works without explicit installation
   - Recommendation: Add `"seed": "npx tsx scripts/seed-videos.ts"` to package.json scripts. If `tsx` is unavailable, use `ts-node` or compile with `tsc` first. Alternatively, write seed script as `.js` with explicit field names.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — Next.js project has no test runner configured |
| Config file | None |
| Quick run command | `npm run build && npm run lint` |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Login form renders and submits | manual-only | — | ❌ no test infra |
| AUTH-02 | N/A (manual Supabase Dashboard) | N/A | — | — |
| AUTH-03 | Unauthenticated redirect to /login | manual-only | — | ❌ no test infra |
| AUTH-04 | proxy.ts session refresh | smoke: `npm run build` | `npm run build` | ✅ build check |
| AUTH-05 | Logout redirects to /login | manual-only | — | ❌ no test infra |
| DATA-01 | Seed script inserts correct rows | manual: run seed + verify in Supabase dashboard | — | ❌ no test infra |
| DATA-02 | Gallery shows videos from Supabase | smoke: `npm run build` | `npm run build` | ✅ build check |
| DATA-03 | Detail page shows correct video | smoke: `npm run build` | `npm run build` | ✅ build check |
| DATA-04 | Filter works with Supabase data | manual-only (runtime filter logic) | — | ❌ no test infra |

**Manual-only justification:** No test runner (Jest/Vitest/Playwright) is configured. AUTH-01, AUTH-03, AUTH-05, DATA-04 require browser interaction or a live Supabase session — not automatable without E2E infrastructure. `npm run build` catches TypeScript type errors (including wrong field names after VideoEntry → Video migration).

### Sampling Rate
- **Per task commit:** `npm run build` — catches TypeScript errors and import failures
- **Per wave merge:** `npm run build && npm run lint` — full static check
- **Phase gate:** `npm run build && npm run lint` green, plus manual browser test of auth flow

### Wave 0 Gaps
- No test framework installation needed — project uses build + lint as validation gate
- Manual test checklist should be added to PLAN.md verification steps

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 2 |
|-----------|-------------------|
| Tech Stack: Next.js 16 + Supabase + Vercel | Auth via Supabase Auth only, no third-party auth |
| Auth: Supabase Auth, Invite-Only | No self-registration UI; user creation is manual |
| Video-Storage: `public/videos/` (Vercel-hosted) | `video_url` field stays as relative path, not Supabase Storage URL |
| Branding: Rot+Weiß+Playfair Display | Login page uses `bg-bg-cream`, `text-brand-red`, Lora font |
| No `next dev` in background shells | Use `npm run build` for validation |
| `getUser()` for auth guards, never `getSession()` | Auth guard in proxy.ts uses `getUser()` (D-06 aligned) |
| `cookies()` must be awaited (Next.js 16) | `await cookies()` in `server.ts` — already correct |
| proxy.ts (not middleware.ts) for Next.js 16 | Extend existing `proxy.ts` |

---

## Sources

### Primary (HIGH confidence)
- Installed `@supabase/ssr@0.9.0` source — `README.md` and `docs/design.md` — getClaims vs getUser vs getSession distinction, cookie handling patterns
- Installed `@supabase/auth-js` dist — `getClaims()` TypeScript signature and return type verified
- Existing codebase (`proxy.ts`, `src/lib/supabase/*.ts`, `src/lib/types.ts`) — direct inspection, patterns already in use
- `src/data/videos.json` — actual field values including `rating: "pending"` in all 5 records
- npm registry — verified package versions 2026-03-26

### Secondary (MEDIUM confidence)
- Supabase official docs (https://supabase.com/docs/guides/auth/server-side/nextjs) — general patterns confirmed; specific code examples not fully available via WebFetch
- Supabase JS docs (https://supabase.com/docs/reference/javascript/auth-signinwithpassword) — `signInWithPassword` signature confirmed

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry and installed node_modules
- Architecture patterns: HIGH — derived from direct inspection of existing codebase and installed library source
- Pitfalls: HIGH — derived from actual code inspection (videos.json "pending" value, VideoEntry camelCase fields, "use client" on detail page)
- Field mapping: HIGH — both VideoEntry and Video types directly inspected

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable libraries; Supabase Auth API is stable)
