# Phase 2: Auth + Data Migration - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Invite-Only Authentication schützt alle Dashboard-Seiten (/, /video/[id], /assets) — unauthentifizierte User werden auf /login redirected. Alle Video-Metadaten werden von `videos.json` nach Supabase migriert, Dashboard liest ab dann aus der Datenbank. Kein Self-Service-Registration, kein Email-Invite-Link.

</domain>

<decisions>
## Implementation Decisions

### User-Verwaltung
- **D-01:** User werden ausschließlich von Chris manuell per Supabase Dashboard angelegt. Kein `inviteUserByEmail()`, kein Email-Invite-Link, kein Passwort-Reset-Flow. User bekommen Zugangsdaten direkt mitgeteilt.
- **D-02:** Admin-Erkennung über `app_metadata.role = 'admin'` (aus Phase 1, D-01).

### Login-Seite Design
- **D-03:** Minimal Branded Layout — zentriertes Formular auf Cream-Hintergrund (#FFF8F0). Le Tonkinois Logo oben, darunter "Content Review" als Subtitle. Email- und Passwort-Felder, roter Login-Button (#B50606).
- **D-04:** Fehlermeldungen inline unter dem Formular als roter Text ("Ungültige Anmeldedaten"). Kein Popup, kein Toast.
- **D-05:** Nur deutsche Labels: "E-Mail", "Passwort", "Anmelden". Team ist deutschsprachig.

### Auth-Schutz
- **D-06:** proxy.ts (bereits vorhanden) wird erweitert um Auth-Check: `getUser()` prüft ob Session existiert, Redirect auf /login falls nicht. Statische Assets und /login selbst sind ausgenommen.
- **D-07:** Nach erfolgreichem Login Redirect auf / (Gallery Dashboard).

### Daten-Migration
- **D-08:** Einmaliges Seed-Script migriert alle Einträge aus `videos.json` in die Supabase `videos`-Tabelle. Video-URLs bleiben relative Pfade zu `public/videos/`.
- **D-09:** Gallery (/) und Video-Detail (/video/[id]) werden auf Supabase-Queries umgestellt. `videos.json` wird nach erfolgreicher Migration entfernt.
- **D-10:** Filter-Funktionalität (Typ, Status) wird auf Supabase-Queries mit WHERE-Clauses umgebaut.

### Claude's Discretion
- Auth-Redirect Verhalten (Loading-State während Auth-Check)
- Logout-Button Platzierung und Design
- Seed-Script Format (Node.js Script vs. SQL Insert)
- Ob `/assets`-Seite auch Supabase-Daten braucht oder unverändert bleibt

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Projekt-Kontext
- `.planning/PROJECT.md` — Projekt-Vision, Constraints (Invite-Only, Supabase Auth)
- `.planning/REQUIREMENTS.md` — AUTH-01 bis AUTH-05 und DATA-01 bis DATA-04 definieren die Phase-2-Requirements
- `.planning/ROADMAP.md` — Phase-2-Goal und Success Criteria

### Phase-1-Entscheidungen
- `.planning/phases/01-supabase-foundation/01-CONTEXT.md` — Admin-Erkennung (D-01), Video-Status (D-03/D-04), TypeScript-Typen (D-05/D-06)

### Bestehende Infrastruktur
- `proxy.ts` — Existierender Session-Refresh, muss um Auth-Redirect erweitert werden
- `src/lib/supabase/server.ts` — Server-Client für SSR-Queries
- `src/lib/supabase/client.ts` — Browser-Client für Client-Components
- `src/lib/supabase/admin.ts` — Admin-Client (Service-Role)
- `src/lib/types.ts` — Video (neu) und VideoEntry (deprecated) Types

### Datenquelle
- `src/data/videos.json` — Aktuelle Video-Metadaten die migriert werden müssen

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `proxy.ts` — Session-Refresh-Logik vorhanden, Auth-Redirect muss ergänzt werden
- `src/lib/supabase/server.ts` — `createClient()` für serverseitige Supabase-Queries ready
- `src/lib/supabase/client.ts` — Browser-Client für Client-Components ready
- `src/lib/types.ts` — `Video` Interface matcht Supabase-Schema, `VideoEntry` als deprecated Fallback
- `src/app/globals.css` — Brand-Farben und Fonts bereits als Tailwind Theme definiert

### Established Patterns
- Next.js 16 App Router mit `proxy.ts` (nicht middleware.ts) für Request-Interception
- `cookies()` muss awaited werden (Next.js 16)
- `getUser()` für Auth-Guards, nie `getSession()` (spoofbar)
- Tailwind CSS v4 mit `@theme` Block für Brand-Tokens
- Lora (Headlines) + Lato (Body) Fonts via CSS Variables

### Integration Points
- `src/app/login/page.tsx` — Neue Route für Login-Seite
- `proxy.ts` — Auth-Redirect-Logik ergänzen
- `src/app/page.tsx` — Gallery umstellen von JSON-Import auf Supabase-Query
- `src/app/video/[id]/page.tsx` — Detail-Seite umstellen auf Supabase-Query
- `src/components/VideoGrid.tsx` — Filter-Logik von Client-Side auf Supabase-Query

</code_context>

<specifics>
## Specific Ideas

- Login-Seite soll wie die Website wirken: Premium, clean, Le Tonkinois Branding. Kein generisches Auth-UI.
- User-Anlage ist bewusst manuell und simpel — das Team ist klein (2-5 Leute), kein Onboarding-Flow nötig.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-auth-data-migration*
*Context gathered: 2026-03-26*
