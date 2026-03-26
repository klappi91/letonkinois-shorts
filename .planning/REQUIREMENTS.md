# Requirements

**Project:** Le Tonkinois Shorts
**Version:** v1
**Created:** 2026-03-26

---

## v1 Requirements

### Supabase Foundation

- [ ] **SUPA-01**: Supabase-Projekt ist konfiguriert mit korrekten Umgebungsvariablen (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) in Vercel und lokal
- [ ] **SUPA-02**: `@supabase/ssr` ist integriert mit Browser-Client, Server-Client und Admin-Client nach Three-Client-Pattern
- [ ] **SUPA-03**: Datenbank-Schema existiert mit `videos`-Tabelle (id, title, caption_de, caption_fr, hashtags, type, duration, pipeline, status, prompt_version, video_url, created_at)
- [ ] **SUPA-04**: Datenbank-Schema existiert mit `feedback`-Tabelle (id, video_id FK, user_id FK, stars 1-5, pros text, cons text, created_at, processed_at nullable)
- [ ] **SUPA-05**: Datenbank-Schema existiert mit `prompt_versions`-Tabelle (id, version_number, content jsonb, created_at, created_by)
- [ ] **SUPA-06**: Row Level Security ist aktiviert auf allen Tabellen mit getesteten Policies (Videos: jeder auth'd User kann lesen; Feedback: User kann eigene erstellen/lesen, Admin kann alle lesen)

### Auth

- [ ] **AUTH-01**: User kann sich per Email/Passwort einloggen auf einer dedizierten Login-Seite
- [ ] **AUTH-02**: Admin kann neue User per `inviteUserByEmail()` einladen (Supabase Dashboard oder Admin-API-Route)
- [ ] **AUTH-03**: Alle Dashboard-Seiten (/, /video/[id], /assets) sind geschützt — unauthentifizierte User werden auf /login redirected
- [ ] **AUTH-04**: Next.js proxy.ts (oder middleware.ts) refresht Sessions automatisch und setzt Auth-Cookies korrekt
- [ ] **AUTH-05**: User kann sich ausloggen von jeder Seite

### Daten-Migration

- [ ] **DATA-01**: Alle bestehenden Video-Metadaten aus `videos.json` sind in die Supabase `videos`-Tabelle migriert
- [ ] **DATA-02**: Gallery-Dashboard (/) liest Video-Daten aus Supabase statt aus JSON
- [ ] **DATA-03**: Video-Detail-Seite (/video/[id]) liest Daten aus Supabase statt aus JSON
- [ ] **DATA-04**: Filter-Funktionalität (Typ, Status) funktioniert weiterhin mit Supabase-Daten

### Feedback

- [ ] **FEED-01**: User kann auf der Video-Detail-Seite ein Star-Rating (1-5) vergeben
- [ ] **FEED-02**: User kann auf der Video-Detail-Seite Pros und Cons als Freitext eingeben
- [ ] **FEED-03**: Bewertung wird per Upsert gespeichert — erneutes Bewerten überschreibt die vorherige Bewertung
- [ ] **FEED-04**: Feedback-Rows haben ein `processed_at`-Feld das null ist bis der Improvement-Workflow sie verarbeitet hat

### Prompt-Versioning

- [ ] **PROM-01**: Jedes generierte Video hat eine Referenz auf die Prompt-Version die es erzeugt hat (`prompt_version` auf videos-Tabelle)
- [ ] **PROM-02**: Prompt-Versionen werden in einer `prompt_versions`-Tabelle gespeichert mit Versionsnummer und Inhalt
- [ ] **PROM-03**: Auf der Video-Detail-Seite ist sichtbar welche Prompt-Version das Video erzeugt hat

---

## v2 Requirements (Deferred)

- [ ] Eigene Bewertung vorausgefüllt beim Wiederbesuchen eines Videos
- [ ] Aggregate-Rating (Durchschnitt + Anzahl) auf Gallery VideoCards
- [ ] Cron-basierte tägliche Short-Generierung (Vercel Cron → externer Worker)
- [ ] Cron-basierter Improvement-Workflow (Feedback → Prompt-Verbesserung)
- [ ] Slack/Email-Benachrichtigung bei neuen Videos
- [ ] Admin-UI zum Einladen neuer User (statt Supabase Dashboard)

---

## Out of Scope

- **Instagram API Integration** — späterer Milestone, nicht v1
- **Self-Service Registration** — bewusst Invite-Only
- **Real-time Collaboration** — kein Mehrwert für 2-5 async Reviewer
- **In-Browser Video Editing** — Remotion rendert serverseitig, Feedback per Text reicht
- **Per-Frame Timestamp Comments** — Reels haben feste Szenenstruktur, Szenennamen reichen
- **Video-Storage in Supabase** — Videos bleiben in public/videos/ (Vercel-hosted)
- **Paralleles Voting-System** — ein Rating-Signal reicht

---

## Traceability

*(Filled by roadmapper — maps requirements to phases)*

| REQ-ID | Phase | Status |
|--------|-------|--------|
| SUPA-01 | Phase 1 | Pending |
| SUPA-02 | Phase 1 | Pending |
| SUPA-03 | Phase 1 | Pending |
| SUPA-04 | Phase 1 | Pending |
| SUPA-05 | Phase 1 | Pending |
| SUPA-06 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 2 | Pending |
| DATA-04 | Phase 2 | Pending |
| FEED-01 | Phase 3 | Pending |
| FEED-02 | Phase 3 | Pending |
| FEED-03 | Phase 3 | Pending |
| FEED-04 | Phase 3 | Pending |
| PROM-01 | Phase 4 | Pending |
| PROM-02 | Phase 4 | Pending |
| PROM-03 | Phase 4 | Pending |
