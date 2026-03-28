# Le Tonkinois Shorts

## What This Is

Eine automatisierte Content-Pipeline für Le Tonkinois Instagram Reels & Shorts. Täglich werden neue Shorts per Cron-Job generiert (Claude Code + Gemini + Remotion), ein kleines Team bewertet sie über eine Web-Oberfläche mit Star-Rating und Pros/Cons, und das Feedback fließt automatisch in die Verbesserung der Generierungs-Prompts zurück.

## Core Value

Der Feedback-Loop muss laufen: Shorts generieren → Team bewertet → Feedback verbessert die nächste Generation.

## Requirements

### Validated

- ✓ Next.js Gallery Dashboard mit Video-Grid und Filtern — existing
- ✓ Video Detail-Seite mit 9:16 Player und Metadaten — existing
- ✓ Remotion Video-Composition-Pipeline (Gartenmöbel, Bootsdeck) — existing
- ✓ Asset-Katalog mit Kategorien und Lightbox — existing
- ✓ Le Tonkinois Branding (Farben, Fonts, Design Tokens) — existing
- ✓ Vercel Deployment-Konfiguration — existing

### Active

- [ ] Supabase Integration (Auth + Datenbank + Row Level Security)
- [ ] Invite-Only Login-System (Admin legt Accounts an, kein Self-Service)
- [ ] Star-Rating für Shorts (1-5 Sterne pro Video)
- [ ] Pros/Cons Textfeedback pro Video
- [ ] Feedback-Persistenz in Supabase (Bewertungen, Kommentare)
- [ ] Feedback-Status-Tracking (neu vs. eingearbeitet)
- ✓ Prompt-Versioning: Jede Prompt-Änderung als tracked record, Videos verlinkt auf Prompt-Version — Validated in Phase 04
- [ ] Cron-Job: Tägliche Short-Generierung (Claude Code + Remotion + Gemini)
- [ ] Cron-Job: Improvement-Workflow (Claude Code liest neues Feedback → verbessert Prompts)
- [ ] Video-Metadaten Migration von JSON zu Supabase

### Out of Scope

- Instagram API Integration (One-Click Publish) — späterer Milestone
- Self-Service Registration — bewusst Invite-Only für kontrolliertes Team
- Echtzeit-Kollaboration / Chat — kein Mehrwert für Review-Workflow
- Mobile App — Web reicht für Review-Workflow
- Video-Editing im Browser — Remotion rendert serverseitig

## Context

- **Bestehendes Projekt:** Next.js 16 + React 19 + Remotion 4 + Tailwind CSS 4 bereits aufgesetzt
- **Dual-Monorepo:** `src/` (Next.js Dashboard) + `remotion/` (Video-Compositions) als separate npm-Projekte
- **Daten aktuell JSON-basiert:** `src/data/videos.json` — muss zu Supabase migriert werden
- **Brand-Richtlinien stehen fest:** Rot #B50606, Lora + Lato, Premium-Look, keine KI-generierten Produktdosen
- **Content-Research vorhanden:** Konkurrenzanalyse, Car-Detailing-Ästhetik-Transfer, Reel-Design-Regeln in Memory
- **Team-Größe:** 2-5 Reviewer mit Invite-Only Zugang
- **Generierung:** Claude Code als Orchestrator per Cron-Job, nutzt Gemini Image/Video + Remotion

## Constraints

- **Tech Stack:** Next.js 16 + Supabase (Auth + DB) + Vercel — keine zusätzlichen Services
- **Auth:** Supabase Auth mit Invite-Only (Admin erstellt Accounts per Supabase Dashboard oder API)
- **Video-Storage:** Videos bleiben in `public/videos/` (Vercel-hosted), keine Supabase Storage für Videos
- **Branding:** Strikt nach letonkinois.de — Rot+Weiß+Playfair Display, keine "moderne Craft" Ästhetik
- **Produktfotos:** NIEMALS KI-generierte Dosen/Flaschen — immer echte Fotos aus dem Katalog

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase für Auth + DB | Einfachste Integration mit Next.js, RLS für Multi-User, kostenloser Tier reicht | — Pending |
| Invite-Only statt Self-Service | Kontrolliertes Team, kein öffentlicher Zugang nötig | — Pending |
| Cron-Jobs für beide Workflows | Automatisierung ohne manuellen Trigger, Claude Code als Orchestrator | — Pending |
| Feedback-Status-Flag (neu/eingearbeitet) | Improvement-Workflow muss wissen welches Feedback schon verarbeitet wurde | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-28 after Phase 05 completion — v1.0 milestone tech debt resolved*
