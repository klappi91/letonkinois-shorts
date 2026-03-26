---
phase: 1
slug: supabase-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None configured — no test scripts in package.json |
| **Config file** | None detected |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | SUPA-01 | smoke | `npm run build` | N/A | ⬜ pending |
| 1-01-02 | 01 | 1 | SUPA-02 | type-check | `npm run build` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | SUPA-03 | manual | Supabase Dashboard | ❌ SQL | ⬜ pending |
| 1-01-04 | 01 | 1 | SUPA-04 | manual | Supabase Dashboard | ❌ SQL | ⬜ pending |
| 1-01-05 | 01 | 1 | SUPA-05 | manual | Supabase Dashboard | ❌ SQL | ⬜ pending |
| 1-01-06 | 01 | 1 | SUPA-06 | manual | SQL Editor test queries | ❌ Manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/supabase/client.ts` — covers SUPA-02 (browser client)
- [ ] `src/lib/supabase/server.ts` — covers SUPA-02 (server client)
- [ ] `src/lib/supabase/admin.ts` — covers SUPA-02 (admin client)
- [ ] `proxy.ts` at project root — session refresh infrastructure
- [ ] `.env.local` with placeholder structure — covers SUPA-01

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tables exist with correct columns | SUPA-03, SUPA-04, SUPA-05 | Schema created via Supabase SQL Editor | Open Supabase Dashboard → Table Editor → verify `videos`, `feedback`, `prompt_versions` tables |
| RLS active: auth'd returns rows, anon returns empty | SUPA-06 | Requires authenticated Supabase session | Run test queries in SQL Editor with/without auth context |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
