# Le Tonkinois Shorts

## What This Is

Eine automatisierte Content-Pipeline für Le Tonkinois Instagram Reels & Shorts. Ein kleines Team bewertet generierte Shorts über eine Supabase-gestützte Web-Oberfläche mit Star-Rating und Pros/Cons, und das Feedback fließt in die Verbesserung der Generierungs-Prompts zurück. Die v1.0-Basis steht: Auth, Datenbank, Feedback-UI und Prompt-Versioning sind live.

## Core Value

Der Feedback-Loop muss laufen: Shorts generieren → Team bewertet → Feedback verbessert die nächste Generation.

## Current Milestone: v1.1 Content Quality Foundation

**Goal:** Einen definierten Instagram-Kanal-Stil entwickeln und den ersten postbaren Product Showcase (Kodok) produzieren — als Proof-of-Concept für alle zukünftigen Video-Typen.

**Target features:**
- Instagram-Kanal-Identität: Recherche, Referenzen, visuelles Konzept-Design das für allen Content gilt
- Skill-Audit & -Aufbau: Vorhandene Skills inventarisieren, fehlende identifizieren/installieren
- Kodok Product Showcase: Stil-Varianten testen, iterieren bis postbar
- Technische Pipeline-Tests: Echte Fotos vs. Gemini-Bilder vs. 3D vs. Video-Sequenzen im definierten Stil

## Requirements

### Validated

- ✓ Next.js Gallery Dashboard mit Video-Grid und Filtern — existing
- ✓ Video Detail-Seite mit 9:16 Player und Metadaten — existing
- ✓ Remotion Video-Composition-Pipeline (Gartenmöbel, Bootsdeck) — existing
- ✓ Asset-Katalog mit Kategorien und Lightbox — existing
- ✓ Le Tonkinois Branding (Farben, Fonts, Design Tokens) — existing
- ✓ Vercel Deployment-Konfiguration — existing
- ✓ Supabase Integration (Auth + Datenbank + Row Level Security) — v1.0
- ✓ Invite-Only Login-System (Admin legt Accounts an, kein Self-Service) — v1.0
- ✓ Star-Rating für Shorts (1-5 Sterne pro Video) — v1.0
- ✓ Pros/Cons Textfeedback pro Video — v1.0
- ✓ Feedback-Persistenz in Supabase (Bewertungen, Kommentare) — v1.0
- ✓ Feedback-Status-Tracking (neu vs. eingearbeitet via processed_at) — v1.0
- ✓ Prompt-Versioning: Jede Prompt-Änderung als tracked record, Videos verlinkt auf Prompt-Version — v1.0
- ✓ Video-Metadaten Migration von JSON zu Supabase — v1.0

### Active

- [ ] Instagram-Kanal-Stil: Recherche, Referenzen, visuelles Konzept-Design für den gesamten Kanal
- [ ] Skill-Fundament: Inventar vorhandener Skills, fehlende Skills identifizieren und aufbauen
- [ ] Kodok Product Showcase: Erste postbare Composition im definierten Kanal-Stil
- [ ] Technische Pipelines: Echte Fotos, Gemini-Bilder, 3D, Video-Sequenzen — jeweils im Stil durchtesten

### Out of Scope

- Instagram API Integration (One-Click Publish) — späterer Milestone
- Self-Service Registration — bewusst Invite-Only für kontrolliertes Team
- Echtzeit-Kollaboration / Chat — kein Mehrwert für Review-Workflow
- Mobile App — Web reicht für Review-Workflow
- Video-Editing im Browser — Remotion rendert serverseitig
- Cron-Job: Tägliche Short-Generierung — erst wenn Content-Qualität steht (v1.2+)
- Cron-Job: Improvement-Workflow — erst wenn Content-Qualität steht (v1.2+)

## Context

- **v1.0 shipped:** Supabase-Backend, Auth, Feedback-UI, Prompt-Versioning — 1,224 LOC TypeScript in `src/`
- **Dual-Monorepo:** `src/` (Next.js Dashboard) + `remotion/` (Video-Compositions) als separate npm-Projekte
- **Daten in Supabase:** 3 Tabellen (videos, feedback, prompt_versions) mit RLS
- **Brand-Richtlinien stehen fest:** Rot #B50606, Lora + Lato, Premium-Look, keine KI-generierten Produktdosen
- **Content-Research vorhanden:** Konkurrenzanalyse, Car-Detailing-Ästhetik-Transfer, Reel-Design-Regeln in Memory
- **Team-Größe:** 2-5 Reviewer mit Invite-Only Zugang
- **Generierung:** Claude Code als Orchestrator per Cron-Job, nutzt Gemini Image/Video + Remotion
- **Nächster Fokus:** Automatisierung — Cron-basierte Generierung und Feedback-Loop-Schließung

## Constraints

- **Tech Stack:** Next.js 16 + Supabase (Auth + DB) + Vercel — keine zusätzlichen Services
- **Auth:** Supabase Auth mit Invite-Only (Admin erstellt Accounts per Supabase Dashboard oder API)
- **Video-Storage:** Videos bleiben in `public/videos/` (Vercel-hosted), keine Supabase Storage für Videos
- **Branding:** Strikt nach letonkinois.de — Rot+Weiß+Playfair Display, keine "moderne Craft" Ästhetik
- **Produktfotos:** NIEMALS KI-generierte Dosen/Flaschen — immer echte Fotos aus dem Katalog

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase für Auth + DB | Einfachste Integration mit Next.js, RLS für Multi-User, kostenloser Tier reicht | ✓ Good — RLS + drei-Client-Pattern funktioniert zuverlässig |
| Invite-Only statt Self-Service | Kontrolliertes Team, kein öffentlicher Zugang nötig | ✓ Good — simples Auth-Setup, funktioniert für 2-5 Reviewer |
| Three-Client-Pattern (Browser/Server/Admin) | Klare Trennung der Supabase-Clients nach Kontext | ✓ Good — saubere Architektur, kein Auth-Leak |
| Proxy.ts statt Middleware für Auth | Session-Refresh + Route-Guards in einem Pattern | ✓ Good — Next.js 16 kompatibel |
| Upsert statt Insert für Feedback | Ein Rating pro User pro Video, Überschreiben statt Duplizieren | ✓ Good — einfaches Datenmodell |
| Prompt-Version als UUID FK | Referentielle Integrität statt lose Text-Referenz | ✓ Good — Schema-Safety |
| Cron-Jobs für beide Workflows | Automatisierung ohne manuellen Trigger, Claude Code als Orchestrator | — Pending (v2) |
| Feedback-Status-Flag (neu/eingearbeitet) | Improvement-Workflow muss wissen welches Feedback schon verarbeitet wurde | ✓ Good — processed_at nullable Timestamp |

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
*Last updated: 2026-03-28 after v1.1 milestone start*
