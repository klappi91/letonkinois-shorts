# Milestones

## v1.0 MVP (Shipped: 2026-03-28)

**Phases completed:** 5 phases, 7 plans, 14 tasks

**Key accomplishments:**

- @supabase/ssr three-client pattern (browser/server/admin) + proxy.ts session refresh + complete SQL schema (videos/feedback/prompt_versions + RLS) + Supabase-compatible TypeScript types
- Live Supabase project with 3 tables, RLS policies, and real credentials via MCP automation
- Supabase email/password auth gating via proxy.ts + branded German login page + LogoutButton and CopyButton components
- Supabase seed script + async Server Components replacing videos.json — gallery and detail pages now read live from Supabase with LogoutButton in all headers
- Star rating (1-5, brand red) + pros/cons textareas wired to Supabase upsert with server-side pre-population on revisit
- prompt_versions table seeded with v1.0 (before-after + showcase prompts), all videos linked, version label "v1.0" shown on detail page
- Removed 51 lines of dead code from types.ts (deprecated VideoEntry, Rating, PromptVersion aliases), added seed:prompts npm script, and upgraded schema.sql videos.prompt_version to uuid FK referencing prompt_versions.id

---
