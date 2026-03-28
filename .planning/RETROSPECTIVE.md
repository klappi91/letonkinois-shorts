# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-28
**Phases:** 5 | **Plans:** 7 | **Tasks:** 15

### What Was Built
- Supabase Three-Client-Pattern (Browser/Server/Admin) mit komplettem Schema + RLS
- Email/Password Auth mit Proxy-Session-Refresh + branded German Login
- JSON→Supabase Migration — Gallery + Detail lesen live aus Datenbank
- Star-Rating (1-5) + Pros/Cons Feedback mit Upsert + Pre-Population
- Prompt-Versioning mit v1.0 Seed + Detail-Page Version-Label
- Tech-Debt Cleanup: 51 Zeilen Dead Code, Schema-FK, npm-Script

### What Worked
- Wave-basierte Parallelisierung hat gut funktioniert (Phase 1 mit 2 parallelen Plans)
- Supabase MCP-Integration hat Live-Deployment in Phase 1 automatisiert (Tabellen + RLS per MCP erstellt)
- Strikte Dependency-Chain (1→2→3→4→5) hat saubere Builds ohne Regressionen ermöglicht
- Milestone-Audit nach Phase 4 hat Tech-Debt sofort sichtbar gemacht → Phase 5 als Cleanup

### What Was Inefficient
- Phase 1 Checkbox in ROADMAP.md wurde nie als `[x]` markiert (nur disk_status war complete)
- Einige SUMMARY.md Frontmatter-Felder fehlten (requirements_completed) — musste in Phase 5 nachgepflegt werden
- Kein Test-Framework eingerichtet — Regression Gate konnte nur Build-Check machen

### Patterns Established
- Three-Client-Pattern für Supabase (@supabase/ssr): Browser, Server, Admin
- Proxy.ts als kombinierter Auth-Guard + Session-Refresh
- Upsert-Pattern für Single-Rating-per-User-per-Video
- Milestone-Audit → Gap-Closure-Phase als Standard-Workflow

### Key Lessons
1. Frontmatter-Pflege in SUMMARYs sollte vom Executor strenger geprüft werden — fehlende requirement-IDs führen zu falschen Audit-Ergebnissen
2. Ein minimales Test-Setup (Vitest) sollte in Phase 1 jedes Projekts stehen — Build-only ist kein Regressions-Schutz
3. Supabase MCP eliminiert den manuellen "Supabase Dashboard"-Schritt komplett — künftig als Standard-Pattern nutzen

### Cost Observations
- Model mix: ~10% opus (orchestration), ~90% sonnet (execution + verification)
- Sessions: ~6 sessions over 5 days
- Notable: Phase 5 (Tech Debt) war die günstigste Phase — 1 Plan, 2 Tasks, minimaler Agent-Overhead

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 5 | 7 | Established wave execution + milestone audit workflow |

### Top Lessons (Verified Across Milestones)

1. Milestone-Audit vor Completion fängt Tech-Debt auf, bevor es sich akkumuliert
2. Supabase MCP reduziert Infrastructure-Setup von Stunden auf Minuten
