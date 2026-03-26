# Phase 1: Supabase Foundation - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Supabase-Projekt aufsetzen mit komplettem DB-Schema (videos, feedback, prompt_versions), Row Level Security Policies und dem Three-Client-Pattern (`@supabase/ssr`) integriert in die bestehende Next.js 16 App. Keine UI-Änderungen, keine Auth-Flows, keine Datenmigration — reine Backend-Infrastruktur.

</domain>

<decisions>
## Implementation Decisions

### Admin-Erkennung
- **D-01:** Admin wird über `app_metadata.role = 'admin'` identifiziert. RLS-Policies prüfen `auth.jwt()->'app_metadata'->>'role'`. User können app_metadata nicht selbst ändern — nur per Supabase Dashboard oder Service-Role-API.
- **D-02:** Initial nur 1 Admin (Chris). Account wird per Supabase Dashboard konfiguriert.

### Video-Status-Werte
- **D-03:** 3 Status-Werte: `draft`, `approved`, `rejected`. Mappt auf das bestehende Rating-Konzept.
- **D-04:** Status als `TEXT` mit `CHECK`-Constraint gespeichert, kein Postgres ENUM. Flexibler bei späteren Erweiterungen.

### TypeScript-Typen
- **D-05:** Supabase CLI generiert `database.types.ts` automatisch. Zusätzlich dünne Wrapper-Types (z.B. `Video`, `Feedback`) für bessere DX.
- **D-06:** Bestehendes `VideoEntry` Interface in `src/lib/types.ts` wird durch Supabase-Wrapper-Type ersetzt. Bestehende Komponenten werden umgestellt.

### Prompt-Content-Struktur
- **D-07:** JSONB `content`-Feld in `prompt_versions` ist pro VideoType strukturiert: `{ "showcase": { "image_prompt": "...", "video_prompt": "...", "composition_config": {...} }, "before-after": {...}, ... }`. Ermöglicht gezielte Verbesserung einzelner Typen.
- **D-08:** Prompt-Versioning ist rein internes Tracking für den autonomen Improvement-Workflow. Kein Prompt-Editor im UI, kein Prompt-Content sichtbar für User. User haben keinen Einfluss auf Prompts — das System lernt selbst aus dem Feedback.
- **D-09:** Auf der Video-Detail-Seite wird lediglich eine Versionsnummer (z.B. "v1.2") angezeigt, nicht der Prompt-Inhalt. Hilft dem Team nachzuvollziehen ob neuere Versionen bessere Videos erzeugen.

### Claude's Discretion
- Keine Bereiche an Claude delegiert — alle Entscheidungen explizit getroffen.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Projekt-Kontext
- `.planning/PROJECT.md` — Projekt-Vision, Constraints, Key Decisions
- `.planning/REQUIREMENTS.md` — SUPA-01 bis SUPA-06 definieren die Phase-1-Requirements im Detail
- `.planning/ROADMAP.md` — Phase-1-Goal und Success Criteria

### Supabase-Patterns
- `.planning/phases/01-supabase-foundation/01-RESEARCH.md` — Research zu Supabase-Integration (falls vorhanden)

### Bestehende Types
- `src/lib/types.ts` — Bestehendes VideoEntry Interface das durch Supabase-Wrapper ersetzt wird

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/types.ts` — VideoEntry, VideoType, Rating Types. VideoEntry wird durch Supabase-Wrapper ersetzt, VideoType und VIDEO_TYPE_LABELS/COLORS bleiben nutzbar.
- `src/data/videos.json` — Bestehende Video-Metadaten. Wird in Phase 2 migriert, Schema muss kompatibel sein.

### Established Patterns
- Tailwind CSS v4 mit `@theme` Block für Brand-Farben und Fonts
- `@/*` Path-Alias mappt auf `./src/*`
- Next.js 16 App Router mit file-based Routing
- Keine bestehenden Supabase-Abhängigkeiten — Greenfield-Integration

### Integration Points
- `src/lib/supabase/` — Neues Verzeichnis für Three-Client-Pattern (browser, server, admin)
- `src/lib/types.ts` — Wrapper-Types über auto-generierte Supabase-Types
- `package.json` — `@supabase/ssr` und `@supabase/supabase-js` als neue Dependencies

</code_context>

<specifics>
## Specific Ideas

- Prompt-System ist bewusst "Black Box" für User — das System soll autonom aus Feedback lernen und Prompts selbst anpassen. Kein User-Einfluss auf Prompt-Inhalte erwünscht.
- Versionsnummer auf Video-Detail-Seite dient nur der Nachvollziehbarkeit, nicht der Steuerung.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-supabase-foundation*
*Context gathered: 2026-03-26*
