# Phase 4: Prompt Versioning - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Every video is linked to the prompt version that generated it. Prompt versions are stored in the `prompt_versions` table. The video detail page shows which prompt version was used (version number only, not content). No prompt editor, no prompt content visible to users — the system is a "Black Box" that learns autonomously from feedback.

</domain>

<decisions>
## Implementation Decisions

### Seed-Inhalt
- **D-01:** Seed v1.0 with real prompts extracted from existing Remotion compositions (GartenmobelRenovation, BootDeckRenovation) for the produced VideoTypes (before-after, showcase). Other types (how-to, seasonal, heritage, lifestyle) get placeholder markers indicating "not yet produced".
- **D-02:** v1.0 is an initial baseline that the user will manually refine. Once satisfied, it becomes the real v1.0 from which the automated improvement workflow generates and iterates.
- **D-03:** Content structure follows Phase 1 D-07: `{ "before-after": { "image_prompt": "...", "video_prompt": "...", "composition_config": {...} }, "showcase": { ... }, "how-to": null, ... }`

### Migrations-Strategie
- **D-04:** Bestehende 2 Videos (Gartenmöbel, Bootsdeck) bleiben in der DB und bekommen `prompt_version` = v1.0 UUID zugewiesen.
- **D-05:** Seed-Script (ähnlich dem bestehenden `scripts/seed-videos.ts`) erstellt v1.0 in `prompt_versions` und verlinkt bestehende Videos. Kein SQL-Migration-Ansatz — Script ist konsistent mit dem bestehenden Pattern.
- **D-06:** User plant, nach Phase 4 manuell neu zu experimentieren und v1.0 zu verfeinern. Ab dann wird automatisch generiert und verbessert. Die Infrastruktur muss also stehen, aber der Inhalt von v1.0 wird noch überarbeitet.

### Versions-Anzeige
- **D-07:** Versionsnummer erscheint in der bestehenden Metadaten-Zeile unter dem Video-Player, zwischen Datum und Pipeline. Format: "v1.0" als Text im gleichen Stil wie die anderen Metadaten (text-xs text-text-muted).
- **D-08:** Nur Versionsnummer anzeigen, kein Prompt-Inhalt (Phase 1, D-09 bestätigt).
- **D-09:** Wenn `prompt_version` null ist (Fallback), keinen Versions-Text anzeigen — graceful degradation.

### Claude's Discretion
- FK-Constraint Implementierung (ob `prompt_version` auf `videos` als echte FK oder soft reference)
- Seed-Script Technologie (TypeScript mit tsx wie seed-videos.ts, oder anderes Format)
- Exakter Prompt-Extraktions-Prozess aus Remotion-Compositions
- Version-Nummer-Format im Display (Dezimalstellen, Prefix)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — PROM-01, PROM-02, PROM-03
- `.planning/ROADMAP.md` — Phase 4 goal and success criteria

### Schema & Types
- `src/lib/types.ts` — `Video` (prompt_version: string | null), `PromptVersion`, `PromptVersionContent` interfaces
- Phase 1 schema: `prompt_versions` table (id, version_number, content jsonb, created_at, created_by)

### Prior Decisions
- `.planning/phases/01-supabase-foundation/01-CONTEXT.md` — D-07 (JSONB content structure), D-08 (Black Box), D-09 (nur Versionsnummer anzeigen)

### Existing Code to Modify
- `src/app/video/[id]/page.tsx` — Video detail page, Metadaten-Zeile at lines 80-95 where version display goes
- `src/lib/supabase/server.ts` — Server client for Supabase queries

### Existing Scripts
- `scripts/seed-videos.ts` — Pattern for seed-script (TypeScript + tsx + admin client)

### Remotion Compositions (Prompt-Extraktion)
- `remotion/src/compositions/GartenmobelRenovation.tsx` — before-after composition with prompts/config
- `remotion/src/Root.tsx` — Composition registry with duration/fps configs

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/types.ts` — `PromptVersion` und `PromptVersionContent` interfaces bereits definiert
- `src/lib/supabase/admin.ts` — Admin-Client für Seed-Script (Service-Role)
- `src/lib/supabase/server.ts` — Server-Client für Queries in Server Components
- `scripts/seed-videos.ts` — Bestehendes Seed-Script als Template für prompt-version-seed

### Established Patterns
- Seed-Scripts in `scripts/` mit tsx ausgeführt, nutzen Admin-Client
- Server Components fetchen Daten via `createClient()` aus `supabase/server.ts`
- Metadaten-Zeile unter Video-Player: flex mit gap-2, text-xs text-text-muted spans
- `'use client'` nur für interaktive Komponenten — Version-Display ist rein serverseitig

### Integration Points
- `src/app/video/[id]/page.tsx` Zeilen 80-95 — Metadaten-Zeile erweitern um Version
- `prompt_versions` Tabelle — Seed-Daten einfügen
- `videos` Tabelle — `prompt_version` Spalte mit UUID der Seed-Version befüllen
- Supabase Query auf Detail-Seite — ggf. JOIN oder separate Query für Versionsnummer

</code_context>

<specifics>
## Specific Ideas

- User will nach Phase 4 manuell experimentieren und Prompts verfeinern bevor der automatische Loop startet. v1.0 ist ein Startpunkt, nicht das Endprodukt.
- "Ab da wird damit generiert und ab da wird das dann entsprechend verbessert und weiter ausgearbeitet" — der Improvement-Workflow baut auf dem finalen v1.0 auf.

</specifics>

<deferred>
## Deferred Ideas

- Prompt-Editor UI — bewusst Out of Scope, System ist Black Box (Phase 1, D-08)
- Automatischer Improvement-Workflow (Feedback → Prompt-Verbesserung) — v2 Milestone
- Cron-basierte Video-Generierung — v2 Milestone
- Admin-Ansicht aller Prompt-Versionen mit Diff — spätere Phase

</deferred>

---

*Phase: 04-prompt-versioning*
*Context gathered: 2026-03-28*
