---
phase: 6
slug: channel-identity
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed (build + lint only) |
| **Config file** | `next.config.ts`, `remotion.config.ts` |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint && npm run build && cd remotion && npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint && npm run build && cd remotion && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | IDENT-01 | build | `npm run build` | W0: create brand.ts | pending |
| 06-01-02 | 01 | 1 | IDENT-01 | build | `npm run build && cd remotion && npm run build` | colors.ts exists, migrate to re-export | pending |
| 06-02-01 | 02 | 2 | IDENT-03 | build + visual | `npm run build` + manual Remotion Studio | W0: create ColorGrade.tsx | pending |
| 06-02-02 | 02 | 2 | IDENT-02 | build | `npm run build && cd remotion && npm run build` | StepBadge.tsx + SceneLabel.tsx exist, migrate to SAFE_ZONES | pending |
| 06-03-01 | 03 | 2 | IDENT-04 | build + file check | `npm run build && file public/assets/moodboard/* \| grep -v SVG` | W0: create moodboard/page.tsx + download real images | pending |
| 06-03-02 | 03 | 2 | IDENT-04 | visual | manual: verify moodboard page renders real images | checkpoint:human-verify | pending |
| 06-04-01 | 04 | 3 | IDENT-01 | file check + visual | `ls assets/style-guide-tests/test-*.png \| wc -l` returns 5 | W0: generate 5 test images | pending |
| 06-04-02 | 04 | 3 | IDENT-01 | visual | manual: verify test images match target aesthetic | checkpoint:human-verify | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/brand.ts` — central brand tokens (IDENT-01, IDENT-02)
- [ ] `remotion/src/components/ColorGrade.tsx` — CSS filter wrapper (IDENT-03)
- [ ] `src/app/moodboard/page.tsx` — moodboard route (IDENT-04)
- [ ] `src/data/moodboard.ts` — moodboard data layer (IDENT-04)
- [ ] `public/assets/moodboard/` directory + 5 real reference images (IDENT-04)
- [ ] `assets/style-guide-tests/` directory + 5 Gemini test images (IDENT-01 validation)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ColorGrade Golden-Hour look matches intent | IDENT-03 | Visual aesthetic judgement | Open Remotion Studio, render a test composition with ColorGrade wrapper, compare output to car-detailing golden hour reference |
| Moodboard screenshots represent target style | IDENT-04 | Subjective content selection | Review 5+ images in /moodboard route, verify they show premium wood-finishing aesthetic per competitor research |
| 5 Gemini test images match Style Guide | IDENT-01 | Visual style compliance | Review 5 test images in assets/style-guide-tests/, verify golden-hour warmth, no forbidden aesthetics, realistic wood textures |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
