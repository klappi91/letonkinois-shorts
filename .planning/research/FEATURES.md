# Feature Research

**Domain:** Content review/feedback dashboard + AI content generation pipeline
**Researched:** 2026-03-26
**Confidence:** HIGH (core features), MEDIUM (cron/pipeline architecture specifics)

---

## Context

This research covers the milestone being added to an existing Next.js video dashboard. The app already has: gallery view, video detail pages, Remotion video pipeline, asset catalog, branding, Vercel deployment. The new milestone adds: Supabase auth (invite-only), star-rating + pros/cons feedback, feedback persistence, cron-based generation, and cron-based prompt improvement from feedback.

The audience is a small internal team (2-5 reviewers). This is not a public product. The core value is the feedback loop: generate shorts → team rates → feedback improves the next generation.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features the review team assumes exist. Missing these = the workflow breaks and reviewers give up.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Login / Auth gate | Without auth, any rating is anonymous noise — can't attribute feedback | LOW | Supabase Auth + `@supabase/ssr` for Next.js App Router. Cookie-based sessions for SSR compatibility. |
| Invite-only access | Team is 2-5 people; no self-registration should exist | LOW | `supabase.auth.admin.inviteUserByEmail()` — admin sends invite from Supabase dashboard or a thin admin UI. Disable email signups in Supabase Auth settings. |
| Star rating per video | Core feedback signal — 1-5 stars. Every review tool has this. | LOW | Single row per (user, video) in Supabase. Upsert on re-rating. Display aggregate (average + count). |
| Pros/Cons text fields | Structured free text is more actionable than open comments. Star rating without text = weak signal for prompt improvement. | LOW | Two `text` fields per feedback row: `pros`, `cons`. Optional, but prompted. |
| Feedback persistence | Ratings must survive page reload. JSON-only is the current gap — this is why the milestone exists. | MEDIUM | Migrate `videos.json` → Supabase `videos` table. Feedback table with `video_id`, `user_id`, `stars`, `pros`, `cons`, `created_at`. |
| My rating visible on return | Reviewer must see their existing rating when revisiting a video — otherwise they re-rate blind | LOW | Query own feedback row on page load. Pre-fill stars + text. |
| Pending / Approved / Rejected status | Gallery currently has these states in JSON. Status must persist to Supabase and be changeable. | LOW | `status` column on `videos` table. Admin-only mutation. Filter by status remains functional. |
| "New feedback" indicator for cron agent | Improvement cron must know what feedback is unprocessed | LOW | `processed_at` nullable timestamp on feedback rows. Cron queries WHERE `processed_at IS NULL`. After processing: set `processed_at = now()`. |

### Differentiators (Competitive Advantage)

Features that go beyond what a generic review tool offers — specific to this feedback-loop use case.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Aggregate rating display on gallery cards | Reviewers see consensus at a glance without opening each video. Reduces review fatigue. | LOW | Compute average stars + count from feedback table. Show on VideoCard. Optional: badge for "needs attention" (< 3 stars). |
| Feedback-status tracking (new vs. processed) | Closes the loop: the improvement cron knows what it has already incorporated. Without this, the agent re-reads the same feedback repeatedly. | LOW | `processed_at` column + admin-visible "X feedbacks pending" counter on dashboard header. |
| Per-video generation metadata display | Reviewers can see which pipeline, which prompts, which assets were used — so their feedback is specific ("the Schleifen scene is too dark") not vague. | LOW | Already partially in VideoEntry type (pipeline field). Extend to show composition name + asset paths on detail page. |
| Cron-based daily generation | Removes the need for a developer to manually trigger each new video. Enables rhythm: 1 new Short per day, team reviews the next morning. | MEDIUM | Vercel cron job → Next.js API route → Claude Code CLI subprocess OR separate GitHub Action. Key constraint: Vercel Hobby = once/day max; Pro = per-minute. Generation likely exceeds 60s → needs Fluid Compute or external trigger. |
| Prompt improvement workflow (automated) | The core value proposition. Human ratings + text feedback flow back into the Gemini/Remotion prompts automatically. No other small-team video tool does this. | HIGH | Separate cron or manual trigger → Claude Code reads unprocessed feedback → updates prompt files or composition parameters → marks feedback as processed. Requires careful prompt versioning strategy. |
| Prompt version history | Know what prompt produced each video. When quality improves, understand why. When it regresses, roll back. | MEDIUM | Store `prompt_version` on each generated video record. Keep prompt snapshots in git or a `prompt_versions` Supabase table. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time collaborative review (WebSockets, live cursors) | Feels modern; teams like seeing each other's activity | Adds significant infra complexity (Supabase Realtime or Pusher). For a 2-5 person team reviewing async, it provides zero workflow value. | Simple page refresh or SWR polling every 60s is sufficient. Mark feedback with reviewer name so others see who has rated. |
| In-browser video editing / trimming | Reviewers might want to suggest edits inline | Remotion renders server-side. Browser video editing (WebCodecs/FFmpeg.wasm) is complex, slow, and redundant — feedback text achieves the same goal. | Pros/Cons text fields. Reviewer writes "cut first 2 seconds of Schleifen scene" — cron agent acts on that text. |
| Self-service account registration | Simpler onboarding | Public registration defeats the invite-only control requirement. Any account could rate videos or see brand strategy content. | Invite-only via Supabase admin. Permanent policy, not a temporary shortcut. |
| Per-frame timestamp comments (like Frame.io) | Precise feedback on specific video moments | Overkill for 25-30 second Reels with 6-7 fixed scenes. Adds UI complexity that slows review. The scene structure is already fixed by Remotion compositions. | Reference scenes by name in Pros/Cons: "Vorher scene: too dark". Scene labels are already on the detail page. |
| Email notifications on new videos | Keeps team informed automatically | Adds SMTP/email service dependency. For a 2-5 person team, a Slack message or manual ping is operationally simpler. | Manual notification or a single Slack webhook call from the generation cron (one `fetch()` call, no dependency). |
| Voting / upvote system (separate from star rating) | Gamification of review | Two parallel rating systems create confusion. Which one feeds the prompt improvement agent? | Keep a single signal: 1-5 star rating with optional pros/cons. One signal, one source of truth. |
| Video storage in Supabase Storage | Centralized asset management | Videos are already in `public/videos/` (Vercel-served). Migrating to Supabase Storage adds CDN cost, URL changes across all metadata, and a new dependency — for no user-facing improvement. | Keep videos in `public/videos/`. Supabase stores metadata only. This is explicitly in project constraints. |

---

## Feature Dependencies

```
[Supabase Integration]
    └──required by──> [Auth / Login Gate]
    └──required by──> [Feedback Persistence]
    └──required by──> [Status Persistence]
    └──required by──> [Feedback-Status Tracking]

[Auth / Login Gate]
    └──required by──> [Star Rating]
    └──required by──> [Pros/Cons Text Feedback]
    └──required by──> [My Rating Visible on Return]

[Star Rating] ──enhances──> [Aggregate Rating on Gallery Cards]

[Feedback Persistence]
    └──required by──> [Feedback-Status Tracking (new vs. processed)]
    └──required by──> [Prompt Improvement Workflow]

[Feedback-Status Tracking]
    └──required by──> [Prompt Improvement Workflow]
    └──enables──> [Cron-based Prompt Improvement]

[Cron-based Daily Generation]
    └──independent of──> [Feedback features]
    └──feeds into──> [Feedback Persistence] (generates new videos to rate)

[Prompt Improvement Workflow]
    └──requires──> [Feedback-Status Tracking]
    └──enhanced by──> [Prompt Version History]

[Video Metadata in Supabase]
    └──required by──> [Feedback Persistence] (foreign key: video_id)
    └──required by──> [Aggregate Rating Display]
    └──required by──> [Status Persistence]
```

### Dependency Notes

- **Supabase Integration is the foundation gate:** Everything in this milestone depends on it. Must be Phase 1.
- **Auth before Feedback:** Rating without identity is noise. Auth and feedback must be built together or auth before.
- **Video metadata migration is a prerequisite for feedback persistence:** The feedback table needs a `videos` table with stable IDs as foreign keys. JSON IDs are not stable foreign keys.
- **Feedback-status tracking is cheap but critical:** A single `processed_at` nullable column. Must exist before the improvement cron is built, otherwise the cron has no way to de-duplicate.
- **Cron-based generation is independent:** Does not depend on auth or feedback. Can be built in parallel or after. However, its output (new videos) needs the Supabase `videos` table to exist.
- **Prompt improvement workflow is the most complex and the last in the chain:** Requires everything else to be working. Appropriate for the final phase of this milestone.

---

## MVP Definition

### Launch With (v1 — This Milestone)

Minimum feature set to activate the feedback loop.

- [ ] Supabase project setup (Auth + DB schema) — foundation for everything
- [ ] Video metadata migrated from JSON to Supabase `videos` table — required for feedback FK
- [ ] Invite-only auth: Admin invites users via Supabase dashboard, login/logout in Next.js — access control
- [ ] Star rating (1-5) per video, persisted per user — core feedback signal
- [ ] Pros/Cons text per video, persisted per user — qualitative signal for prompt improvement
- [ ] Feedback-status tracking: `processed_at` column, "X pending feedbacks" counter — enables cron agent
- [ ] Cron job: daily video generation via Vercel cron + API route — content rhythm
- [ ] Cron job: feedback improvement workflow (Claude Code reads pending feedback → updates prompts → marks processed) — closes the loop

### Add After Validation (v1.x)

Add once the loop is proven to improve quality:

- [ ] Aggregate rating display on VideoCard — after enough feedback exists to show meaningful averages (5+ ratings)
- [ ] Prompt version history — after the improvement workflow has run 3-5 cycles and the team wants to audit changes
- [ ] Per-video generation metadata expansion — after reviewers ask "what settings made this one good?"

### Future Consideration (v2+)

Defer until post-milestone:

- [ ] Instagram API one-click publish — separate milestone, already in project roadmap
- [ ] Admin UI for user management — Supabase dashboard is sufficient for 2-5 users; build only if team grows
- [ ] Slack webhook notification on new generation — low value for current team size

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Supabase integration (Auth + DB) | HIGH | MEDIUM | P1 |
| Invite-only auth (login/logout) | HIGH | LOW | P1 |
| Video metadata migration to Supabase | HIGH | MEDIUM | P1 |
| Star rating (1-5), persisted | HIGH | LOW | P1 |
| Pros/Cons text feedback, persisted | HIGH | LOW | P1 |
| Feedback-status tracking (processed_at) | HIGH | LOW | P1 |
| Cron: daily video generation | HIGH | MEDIUM | P1 |
| Cron: prompt improvement from feedback | HIGH | HIGH | P1 |
| Aggregate rating on gallery cards | MEDIUM | LOW | P2 |
| Prompt version history | MEDIUM | MEDIUM | P2 |
| Per-video generation metadata display | LOW | LOW | P2 |
| Admin UI for user management | LOW | MEDIUM | P3 |
| Slack webhook on new generation | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for this milestone — the feedback loop does not function without it
- P2: Should have, add after core loop is validated
- P3: Nice to have, future milestone consideration

---

## Competitor Feature Analysis

Relevant reference tools: Frame.io, Filestage (professional video review), Planable (social content approval).

| Feature | Frame.io / Filestage | Planable | Our Approach |
|---------|----------------------|----------|--------------|
| Rating system | No star rating — comments + approve/reject | Approve/reject/needs revision | 1-5 stars + pros/cons — richer signal for ML feedback loop |
| Status workflow | Pending → In Review → Approved → Published | Draft → Review → Approved → Scheduled | Pending → Approved → Rejected — minimal states matching team size |
| Auth model | Enterprise multi-org | Team workspaces, invite-link | Supabase invite-only email — simplest that works |
| Feedback targeting | Timestamped frame comments | In-line comments on content | Scene-name reference in text — Reels have fixed scene structure, timestamps add no value |
| Automation | Limited (reminders, version tracking) | Publish scheduling | Generation cron + prompt improvement — no competitor does this at all |
| Prompt feedback loop | Does not exist | Does not exist | Core differentiator — unique to this system |

**Key insight from competitor analysis:** No existing video review tool has a feedback-to-prompt-improvement loop. Frame.io and Filestage treat feedback as a human-to-human communication channel. This project's cron-based improvement workflow is genuinely novel for this use case and is the primary reason to build custom rather than use an existing tool.

---

## Technical Constraints That Shape Features

**Vercel cron on Hobby plan:** Once per day maximum. If the project runs on Hobby, the generation cron can only fire daily — which is acceptable (one new Short per day). For multiple crons per day, Pro plan is required. (Source: Vercel cron docs — confirmed HIGH confidence.)

**Vercel Function timeout:** Default is 10s on Hobby, 60s on Pro. Video generation (Claude Code + Gemini + Remotion render) will exceed 60s. Options: (a) Vercel Fluid Compute (up to 800s on Pro), (b) trigger a separate process (GitHub Actions, external script) from the cron endpoint rather than running the full pipeline in the Function itself. The cron endpoint should be a lightweight trigger, not the pipeline runner. This is a critical architectural constraint.

**Supabase free tier:** Sufficient for 2-5 users with feedback records. No concern at this scale.

**RLS (Row Level Security):** Must be enabled on feedback table. Policy: users can read/write their own rows only. Admins (role-based) can read all rows. This is standard Supabase pattern and required for the multi-user feedback model.

---

## Sources

- [Vercel Cron Jobs — Usage and Pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing) — HIGH confidence, official docs
- [Vercel Functions — Duration configuration](https://vercel.com/docs/functions/configuring-functions/duration) — HIGH confidence, official docs
- [Supabase Auth — inviteUserByEmail](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail) — HIGH confidence, official docs
- [Supabase Auth with Next.js App Router](https://supabase.com/docs/guides/auth/quickstarts/nextjs) — HIGH confidence, official docs
- [Filestage — Video Feedback Tools comparison](https://filestage.io/blog/video-feedback-tools/) — MEDIUM confidence, vendor analysis
- [Frame.io vs Filestage comparison](https://filestage.io/filestage-vs-frame-io/) — MEDIUM confidence, vendor analysis
- [Top Video Feedback Platforms 2025](https://www.clixie.ai/blog/best-video-feedback-platforms-in-2025-ultimate-guide-for-teams-creators) — MEDIUM confidence, review aggregator
- [Mastering AI Feedback Loops — Prompt Engineering](https://www.arsturn.com/blog/navigating-ai-feedback-loops-with-smart-prompt-engineering) — LOW confidence, blog post
- [Agentic AI Workflows 2026](https://www.myaiassistant.blog/2026/02/agentic-autonomous-ai-workflows-in-2026.html) — LOW confidence, blog post

---

*Feature research for: Content review dashboard + AI generation pipeline (Le Tonkinois Shorts)*
*Researched: 2026-03-26*
