# Phase 03: Feedback UI - Research

**Researched:** 2026-03-28
**Domain:** React form patterns, Supabase upsert with RLS, star rating UI, Next.js Server/Client component boundary
**Confidence:** HIGH

## Summary

Phase 3 is a tightly scoped feature: one new client component (`FeedbackForm.tsx`) and one modification to the existing video detail Server Component. The database schema, RLS policies, TypeScript types, and Supabase clients are all already in place from Phase 1. No new dependencies are required.

The core interaction is: Server Component fetches the user's existing feedback for this video → passes it as a prop to `FeedbackForm` → user edits stars/pros/cons → browser-side Supabase `.upsert()` targeting the `(video_id, user_id)` unique index → `window.location.reload()` to re-render with persisted data. This mirrors the login page pattern exactly.

The only genuine design decision left to Claude (per CONTEXT.md) is the star icon implementation (inline SVG vs. unicode), success feedback style, and exact spacing. Everything else is locked.

**Primary recommendation:** Implement `FeedbackForm` as a `'use client'` component following the `LoginPage` pattern (useState fields, async submit handler, loading/error state). Pre-populate from `existingFeedback` prop. Use `window.location.reload()` after successful upsert consistent with D-04.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** FeedbackForm is a `'use client'` component using the browser Supabase client — consistent with LoginPage, CopyButton, LogoutButton patterns. Not a Server Action.
- **D-02:** Existing feedback (if any) is fetched server-side in the video detail Server Component and passed as a prop to FeedbackForm — satisfies "visible after page reload" criterion.
- **D-03:** Use `.upsert()` on the browser client targeting the `(video_id, user_id)` unique index. The schema already has `feedback_video_user_unique` index and both INSERT + UPDATE RLS policies.
- **D-04:** After successful upsert, `window.location.reload()` to refresh server-side data (consistent with login pattern using `window.location.href`).
- **D-05:** Replace the existing placeholder buttons ("Freigeben / Ablehnen / Zur Seite legen" at lines 162-171 of video detail page) with the FeedbackForm. These buttons have no handlers and write nothing — they are stubs.
- **D-06:** Video `status` field (draft/approved/rejected) is NOT part of Phase 3 scope. Status management is a separate concern.
- **D-07:** Star rating uses clickable star icons (1-5). Brand red (#B50606) for filled stars, muted for empty.
- **D-08:** Pros and Cons as two separate textarea fields with German labels ("Was gefällt dir?", "Was könnte besser sein?").
- **D-09:** Submit button in Brand red, German label "Bewertung speichern". Disabled state while submitting.
- **D-10:** Server Component fetches existing feedback: `supabase.from('feedback').select('*').eq('video_id', id).eq('user_id', user.id).single()` — passed as `existingFeedback` prop.
- **D-11:** processed_at stays null on insert/update — set only by the future improvement workflow (Phase 4+).

### Claude's Discretion

- Star icon implementation (SVG inline vs icon library)
- Exact form layout and spacing
- Success feedback after save (subtle text vs toast)
- Textarea placeholder text

### Deferred Ideas (OUT OF SCOPE)

- Aggregate ratings on gallery cards (v2 requirement)
- Video status management (draft/approved/rejected) — separate concern, not Phase 3
- Admin view of all feedback — separate phase
- Feedback notification system — v2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FEED-01 | User kann auf der Video-Detail-Seite ein Star-Rating (1-5) vergeben | Star rating via `useState` in FeedbackForm; stars stored as integer 1-5 in `feedback.stars` column (CHECK constraint already in schema) |
| FEED-02 | User kann auf der Video-Detail-Seite Pros und Cons als Freitext eingeben | Two separate `<textarea>` fields in FeedbackForm; map to `feedback.pros` and `feedback.cons` (both nullable text in schema) |
| FEED-03 | Bewertung wird per Upsert gespeichert — erneutes Bewerten überschreibt die vorherige Bewertung | `.upsert()` with `onConflict: 'video_id,user_id'` targets `feedback_video_user_unique` index; RLS has both INSERT + UPDATE policies for own rows |
| FEED-04 | Feedback-Rows haben ein `processed_at`-Feld das null ist bis der Improvement-Workflow sie verarbeitet hat | `processed_at` column is nullable `timestamptz` defaulting to null; upsert must NOT set this field — it stays null until Phase 4+ cron sets it |
</phase_requirements>

## Standard Stack

No new packages required. All dependencies are already installed.

### Core (all pre-installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | 0.9.0 | Browser + server Supabase clients | Already integrated, Three-Client-Pattern established |
| `@supabase/supabase-js` | 2.100.0 | `.upsert()`, typed queries | Already integrated |
| React `useState` | (React 19.2.4) | Form field state, loading, error | Project-standard client component pattern |
| Tailwind CSS | 4.2.2 | Styling — brand colors already defined | Project-standard |

### No New Packages Needed
The star rating can be implemented with inline SVG (see Code Examples) or Unicode characters (`★` / `☆`). No icon library needed.

**Installation:** No new packages to install.

## Architecture Patterns

### Recommended File Structure
```
src/
├── components/
│   ├── FeedbackForm.tsx      # NEW — 'use client', star rating + textarea + submit
│   ├── CopyButton.tsx        # Existing pattern to follow
│   └── LogoutButton.tsx      # Existing pattern to follow
└── app/
    └── video/
        └── [id]/
            └── page.tsx      # MODIFY — add feedback query + import FeedbackForm
```

### Pattern 1: Server Component Fetches, Client Component Mutates

The video detail page is already a Server Component (`async function VideoDetail`). Add a second Supabase query for existing feedback after the video query:

```typescript
// Source: Established pattern from src/lib/supabase/server.ts + schema.sql
// In src/app/video/[id]/page.tsx (Server Component)
const supabase = await createClient();

// Existing: video query
const { data: video } = await supabase
  .from("videos")
  .select("*")
  .eq("id", id)
  .single<Video>();

// NEW: get current user + their existing feedback
const { data: { user } } = await supabase.auth.getUser();
const { data: existingFeedback } = user
  ? await supabase
      .from("feedback")
      .select("*")
      .eq("video_id", id)
      .eq("user_id", user.id)
      .single<Feedback>()
  : { data: null };
```

Then pass to the form:
```tsx
<FeedbackForm
  videoId={video.id}
  existingFeedback={existingFeedback}
/>
```

### Pattern 2: Client Component — Upsert with Conflict Target

```typescript
// Source: @supabase/supabase-js v2 docs — upsert with onConflict
// In src/components/FeedbackForm.tsx
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();

const { error } = await supabase
  .from("feedback")
  .upsert(
    {
      video_id: videoId,
      user_id: user!.id,
      stars,
      pros: pros || null,
      cons: cons || null,
      // processed_at intentionally omitted — stays null (D-11)
    },
    { onConflict: "video_id,user_id" }
  );

if (!error) {
  window.location.reload(); // D-04
}
```

### Pattern 3: Star Rating UI (Client Component)

```tsx
// 'use client' pattern — brand red filled, muted empty
// Use Unicode or inline SVG — no library needed
{[1, 2, 3, 4, 5].map((n) => (
  <button
    key={n}
    type="button"
    onClick={() => setStars(n)}
    className={`text-2xl transition-colors ${
      n <= stars ? "text-brand-red" : "text-text-muted"
    }`}
    aria-label={`${n} Stern${n > 1 ? "e" : ""}`}
  >
    ★
  </button>
))}
```

### Pattern 4: FeedbackForm Component Skeleton

```tsx
// Source: Mirrors src/app/login/page.tsx structure exactly
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Feedback } from '@/lib/types';

interface FeedbackFormProps {
  videoId: string;
  existingFeedback: Feedback | null;
}

export default function FeedbackForm({ videoId, existingFeedback }: FeedbackFormProps) {
  const [stars, setStars] = useState<number>(existingFeedback?.stars ?? 0);
  const [pros, setPros] = useState(existingFeedback?.pros ?? '');
  const [cons, setCons] = useState(existingFeedback?.cons ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stars === 0) { setError('Bitte wähle eine Sternebewertung'); return; }
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { error: upsertError } = await supabase
        .from('feedback')
        .upsert(
          { video_id: videoId, user_id: user!.id, stars, pros: pros || null, cons: cons || null },
          { onConflict: 'video_id,user_id' }
        );
      if (upsertError) { setError('Fehler beim Speichern'); setLoading(false); return; }
      window.location.reload();
    } catch {
      setError('Verbindungsfehler — bitte erneut versuchen');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star rating row */}
      {/* Pros textarea */}
      {/* Cons textarea */}
      {/* Error display */}
      {/* Submit button — disabled while loading */}
    </form>
  );
}
```

### Anti-Patterns to Avoid

- **Using `getSession()` for auth in client component:** `getSession()` is spoofable; use `getUser()` for user identity in the upsert payload (confirmed by STATE.md decision log).
- **Omitting `onConflict` in upsert:** Without `onConflict: 'video_id,user_id'`, Supabase upsert defaults to primary key conflict. The unique index is on `(video_id, user_id)`, not the primary key — must specify explicitly.
- **Setting `processed_at` in the upsert payload:** D-11 — this field must stay null; only Phase 4+ cron sets it.
- **Using Server Actions:** D-01 locks this as a browser client component mutation. Server Actions would require different patterns and are inconsistent with existing project code.
- **Putting FeedbackForm logic inside the Server Component:** The Server Component cannot use `useState` or event handlers — the form must be a separate `'use client'` file.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Upsert / conflict resolution | Custom INSERT + UPDATE with manual check | `.upsert({ onConflict: 'video_id,user_id' })` | Supabase handles race conditions, atomic operation |
| RLS user identity | Manual user_id lookup or JWT decode | `supabase.auth.getUser()` | Verified against server — not spoofable like getSession |
| Session refresh | Manual cookie management | `proxy.ts` (already in place) | Next.js middleware handles all session refresh |

**Key insight:** The entire data layer is already built. Phase 3 is purely a UI task — no schema migrations, no new packages, no new auth logic.

## Common Pitfalls

### Pitfall 1: `onConflict` Must Match the Index Column Names
**What goes wrong:** `upsert()` silently inserts a duplicate row instead of updating, or throws a unique violation error.
**Why it happens:** If `onConflict` is omitted, Supabase defaults to PK conflict. The unique index is on `(video_id, user_id)` — must pass the string `"video_id,user_id"` exactly.
**How to avoid:** Always specify `{ onConflict: 'video_id,user_id' }` in the upsert options.
**Warning signs:** Multiple rows in `feedback` table for the same (video_id, user_id) pair.

### Pitfall 2: Server Component Cannot Access `user.id` Without Fetching User
**What goes wrong:** `existingFeedback` query in the Server Component returns null for every user because `user` is undefined.
**Why it happens:** The server Supabase client is per-request but `auth.getUser()` must be explicitly called — it does not auto-populate from the session cookie without being called.
**How to avoid:** Always call `await supabase.auth.getUser()` before using `user.id` in any server query.
**Warning signs:** `existingFeedback` is always null even after submitting a rating.

### Pitfall 3: `useState` Initial Value From Prop Not Reactive to Prop Changes
**What goes wrong:** If the parent re-renders with a new `existingFeedback` prop, the form fields don't update.
**Why it happens:** `useState(initialValue)` only uses `initialValue` on mount — subsequent prop changes are ignored.
**How to avoid:** For this use case it's fine — `window.location.reload()` causes a full re-mount, so the prop will always be the current persisted value on mount.
**Warning signs:** N/A — the reload pattern (D-04) avoids this entirely.

### Pitfall 4: Stars of 0 Are Valid Unicode but Invalid DB
**What goes wrong:** User submits without selecting stars, DB rejects with "stars between 1 and 5" constraint violation.
**Why it happens:** The star state initializes to `0` (no selection). If submitted, it violates the CHECK constraint.
**How to avoid:** Validate `stars > 0` before calling upsert; show an inline error message.
**Warning signs:** Supabase returns `{ error: { code: '23514', message: '...' } }` on submit.

### Pitfall 5: TypeScript Type for `existingFeedback` Prop
**What goes wrong:** Type error when the `.single()` call returns `null` for a new reviewer.
**Why it happens:** `.single()` returns `T | null` — must type the prop as `Feedback | null` and handle the null case in `useState` initializers.
**How to avoid:** Use `existingFeedback?.stars ?? 0` pattern for all initializers (shown in skeleton above).
**Warning signs:** TypeScript compilation errors in the Server Component or FeedbackForm props.

## Code Examples

### Complete Upsert Call (Verified Pattern)
```typescript
// Source: @supabase/supabase-js v2.100.0 — upsert API
// onConflict targets the named unique index columns (not the index name)
const { error } = await supabase
  .from('feedback')
  .upsert(
    {
      video_id: videoId,      // string (UUID)
      user_id: user!.id,      // string (UUID from auth.getUser())
      stars,                  // integer 1-5
      pros: pros || null,     // text | null
      cons: cons || null,     // text | null
      // created_at: omitted — Supabase default now()
      // processed_at: omitted — must stay null (D-11)
    },
    { onConflict: 'video_id,user_id' }
  );
```

### Server Component — Fetching Auth User + Feedback
```typescript
// In async Server Component — mirrors getUser() pattern from STATE.md
const { data: { user } } = await supabase.auth.getUser();

const existingFeedback = user
  ? (await supabase
      .from('feedback')
      .select('*')
      .eq('video_id', id)
      .eq('user_id', user.id)
      .single<Feedback>()).data
  : null;
```

### Star Rating Row (Accessible)
```tsx
// Brand red filled (text-brand-red), muted empty (text-text-muted)
// aria-label for screen readers
<div className="flex gap-1" role="group" aria-label="Sternebewertung">
  {[1, 2, 3, 4, 5].map((n) => (
    <button
      key={n}
      type="button"
      onClick={() => setStars(n)}
      className={`text-2xl transition-colors hover:text-brand-red ${
        n <= stars ? 'text-brand-red' : 'text-text-muted'
      }`}
      aria-label={`${n} Stern${n > 1 ? 'e' : ''}`}
      aria-pressed={n === stars}
    >
      ★
    </button>
  ))}
</div>
```

### Textarea Field (Consistent With Project Style)
```tsx
// Matches input styling in src/app/login/page.tsx
<textarea
  id="pros"
  value={pros}
  onChange={(e) => setPros(e.target.value)}
  rows={3}
  placeholder="Was hat dir besonders gefallen?"
  className="w-full px-3 py-2 rounded-lg border border-bg-sepia bg-bg-card text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red resize-none"
/>
```

## State of the Art

No relevant changes in this domain — all patterns are stable.

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2023 | Already migrated in Phase 1 |
| `getSession()` for user identity | `getUser()` | Supabase best practice | Already enforced in project (STATE.md) |

## Open Questions

1. **Does `getUser()` in Server Component work correctly with the proxy.ts cookie refresh pattern?**
   - What we know: `proxy.ts` refreshes sessions by re-setting cookies. Server Component calls `createClient()` which reads cookies.
   - What's unclear: If the session has just refreshed, the new access token is in the response cookies, not yet in the request cookies for the current render.
   - Recommendation: The existing video query already uses `supabase.auth` implicitly — adding a `getUser()` call in the same request should work consistently. If it returns null unexpectedly, the fallback `existingFeedback = null` is safe (user sees empty form, can submit fresh).

2. **Should `stars: 0` (no selection) show a "not yet rated" state vs. empty stars?**
   - What we know: The `useState` default of `0` renders all stars as muted/empty.
   - What's unclear: Whether "no existing feedback" vs "0 stars selected" need visual distinction.
   - Recommendation: This is purely UX — use `0` as "unrated" state, validate on submit, show "Noch nicht bewertet" label when `existingFeedback` is null. Discretionary per CONTEXT.md.

## Environment Availability

Step 2.6: SKIPPED — Phase 3 is purely a UI code change with no new external dependencies. All tools, services, and Supabase infrastructure are already in place from Phase 1 and 2.

## Validation Architecture

Nyquist validation is enabled (`nyquist_validation: true`).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config, vitest.config, or test files exist |
| Config file | None — Wave 0 gap |
| Quick run command | `npm run build && npm run lint` (proxy for correctness — no unit test runner) |
| Full suite command | `npm run build && npm run lint` |

**Note:** The project has no test infrastructure. The proxy for validation is TypeScript compilation (`npm run build`) and ESLint (`npm run lint`). Per CLAUDE.md, `next dev` must NOT be started in background shells — use `npm run build` for validation.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FEED-01 | Star rating renders and captures 1-5 selection | manual | `npm run build && npm run lint` | ❌ Wave 0 (no test infra) |
| FEED-02 | Pros/cons textarea captures and submits text | manual | `npm run build && npm run lint` | ❌ Wave 0 (no test infra) |
| FEED-03 | Upsert overwrites existing feedback (not duplicate) | manual (Supabase dashboard verify) | `npm run build && npm run lint` | ❌ Wave 0 (no test infra) |
| FEED-04 | processed_at is null after submission | manual (Supabase dashboard verify) | `npm run build && npm run lint` | ❌ Wave 0 (no test infra) |

### Sampling Rate
- **Per task commit:** `npm run build && npm run lint`
- **Per wave merge:** `npm run build && npm run lint` + manual browser test against running dev server
- **Phase gate:** Build green + lint clean + manual verification of all 4 success criteria before `/gsd:verify-work`

### Wave 0 Gaps
- No test infrastructure exists — unit testing FEED-01 through FEED-04 requires setting up jest/vitest, which is out of scope for this phase.
- Validation relies on: TypeScript type-checking, ESLint, and manual browser testing.

## Sources

### Primary (HIGH confidence)
- `supabase/schema.sql` — Feedback table structure, `feedback_video_user_unique` index, RLS policies verified
- `src/lib/types.ts` — `Feedback` interface verified (stars, pros, cons, video_id, user_id, processed_at)
- `src/lib/supabase/client.ts` — Browser client pattern verified
- `src/lib/supabase/server.ts` — Server client pattern verified
- `src/app/login/page.tsx` — Client component form pattern verified (useState, async submit, loading, error)
- `src/components/CopyButton.tsx` — Client component with feedback state pattern verified
- `src/app/video/[id]/page.tsx` — Lines 162-171 placeholder buttons confirmed as stubs
- `package.json` — `@supabase/ssr@0.9.0`, `@supabase/supabase-js@2.100.0` versions confirmed
- `.planning/STATE.md` — `getUser()` not `getSession()` decision confirmed; upsert decisions confirmed

### Secondary (MEDIUM confidence)
- Supabase upsert `onConflict` string format — verified from supabase-js v2 usage patterns; must match column names not index name

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed and in use
- Architecture: HIGH — patterns directly copied from existing project files
- Pitfalls: HIGH — derived from schema constraints, existing STATE.md decisions, and TypeScript type analysis
- Validation: MEDIUM — no test infra, relying on build + lint + manual

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable — no fast-moving dependencies)
