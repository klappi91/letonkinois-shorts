# Phase 3: Feedback UI - Context

**Gathered:** 2026-03-28 (assumptions mode)
**Status:** Ready for planning

<domain>
## Phase Boundary

Reviewers can rate any video with stars (1-5) and pros/cons text. Feedback persists to Supabase across sessions. One feedback per reviewer per video (upsert). No prompt editing, no video status changes, no aggregate ratings on gallery cards.

</domain>

<decisions>
## Implementation Decisions

### Component Architecture
- **D-01:** FeedbackForm is a `'use client'` component using the browser Supabase client — consistent with LoginPage, CopyButton, LogoutButton patterns. Not a Server Action.
- **D-02:** Existing feedback (if any) is fetched server-side in the video detail Server Component and passed as a prop to FeedbackForm — satisfies "visible after page reload" criterion.

### Upsert Mechanism
- **D-03:** Use `.upsert()` on the browser client targeting the `(video_id, user_id)` unique index. The schema already has `feedback_video_user_unique` index and both INSERT + UPDATE RLS policies.
- **D-04:** After successful upsert, `window.location.reload()` to refresh server-side data (consistent with login pattern using `window.location.href`).

### UI Placement & Design
- **D-05:** Replace the existing placeholder buttons ("Freigeben / Ablehnen / Zur Seite legen" at lines 162-171 of video detail page) with the FeedbackForm. These buttons have no handlers and write nothing — they are stubs.
- **D-06:** Video `status` field (draft/approved/rejected) is NOT part of Phase 3 scope. Status management is a separate concern.
- **D-07:** Star rating uses clickable star icons (1-5). Brand red (#B50606) for filled stars, muted for empty.
- **D-08:** Pros and Cons as two separate textarea fields with German labels ("Was gefällt dir?", "Was könnte besser sein?").
- **D-09:** Submit button in Brand red, German label "Bewertung speichern". Disabled state while submitting.

### Data Flow
- **D-10:** Server Component fetches existing feedback: `supabase.from('feedback').select('*').eq('video_id', id).eq('user_id', user.id).single()` — passed as `existingFeedback` prop.
- **D-11:** processed_at stays null on insert/update — set only by the future improvement workflow (Phase 4+).

### Claude's Discretion
- Star icon implementation (SVG inline vs icon library)
- Exact form layout and spacing
- Success feedback after save (subtle text vs toast)
- Textarea placeholder text

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — FEED-01 through FEED-04
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria

### Schema & Types
- `src/lib/types.ts` — `Feedback` type (stars, pros, cons, video_id, user_id, processed_at)
- Phase 1 schema defined feedback table with unique index on (video_id, user_id)

### Existing UI to modify
- `src/app/video/[id]/page.tsx` — Video detail Server Component, placeholder buttons at lines 162-171
- `src/lib/supabase/client.ts` — Browser client for form submission
- `src/lib/supabase/server.ts` — Server client for fetching existing feedback

### Pattern references
- `src/app/login/page.tsx` — Client component form pattern (useState, submit handler, error display)
- `src/components/CopyButton.tsx` — Client component with feedback state pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase/client.ts` — `createClient()` for browser-side Supabase calls
- `src/lib/supabase/server.ts` — `createClient()` for server-side queries (fetch existing feedback)
- `src/lib/types.ts` — `Feedback` interface already defined with correct fields
- `src/app/login/page.tsx` — Form pattern: useState for fields, async submit, error handling, loading state

### Established Patterns
- `'use client'` for all interactive components
- Browser Supabase client for mutations
- Server Supabase client for data fetching in async Server Components
- Brand colors via Tailwind: `bg-brand-red`, `text-text-dark`, `bg-bg-cream`
- German labels throughout UI

### Integration Points
- `src/app/video/[id]/page.tsx` — Add feedback query + pass to FeedbackForm
- `src/components/FeedbackForm.tsx` — New component (star rating + pros/cons + submit)
- Supabase `feedback` table — already exists with RLS policies

</code_context>

<specifics>
## Specific Ideas

- Stars should feel premium — not generic. Brand red filled stars on cream background.
- Form should be immediately visible below the video, not hidden behind a tab or accordion.
- "Bewertung speichern" not "Absenden" — implies persistence, not messaging.

</specifics>

<deferred>
## Deferred Ideas

- Aggregate ratings on gallery cards (v2 requirement)
- Video status management (draft/approved/rejected) — separate concern, not Phase 3
- Admin view of all feedback — separate phase
- Feedback notification system — v2

</deferred>

---

*Phase: 03-feedback-ui*
*Context gathered: 2026-03-28*
