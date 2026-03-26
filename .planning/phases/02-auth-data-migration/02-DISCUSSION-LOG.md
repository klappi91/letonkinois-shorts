# Phase 2: Auth + Data Migration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 02-auth-data-migration
**Areas discussed:** Login-Seite Design

---

## Area Selection

| Area | Selected | Notes |
|------|----------|-------|
| Login-Seite Design | Yes | — |
| Invite-Flow Erlebnis | No | User: "Es werden user nur von mir angelegt es gibt kein E-Maillink etc." |
| Auth-Redirect & Loading | No | Delegiert an Claude's Discretion |
| Migration-Strategie | No | Delegiert an Claude's Discretion |

**Key input during selection:** Chris legt User manuell per Supabase Dashboard an. Kein Email-Invite-Link, kein inviteUserByEmail()-Flow. Dies vereinfacht AUTH-02 erheblich.

---

## Login-Seite Design

### Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal Branded (Recommended) | Zentriertes Formular auf Cream-Hintergrund. Le Tonkinois Logo oben, Email + Passwort Felder, roter Login-Button. | Yes |
| Split-Screen mit Produktbild | Links: Login-Formular. Rechts: Großes Holz-/Produktfoto als Stimmungsbild. | |
| Du entscheidest | Claude wählt das passendste Design. | |

**User's choice:** Minimal Branded
**Notes:** —

### Fehlermeldungen

| Option | Description | Selected |
|--------|-------------|----------|
| Inline unter dem Formular (Recommended) | Roter Text unter dem Formular: 'Ungültige Anmeldedaten'. Schlicht, kein Popup/Toast. | Yes |
| Toast-Benachrichtigung | Kurze Notification oben rechts die nach 3-4s verschwindet. | |
| Du entscheidest | Claude wählt die passendste Variante. | |

**User's choice:** Inline unter dem Formular
**Notes:** —

### Sprache

| Option | Description | Selected |
|--------|-------------|----------|
| Nur Deutsch (Recommended) | Alles auf Deutsch: 'E-Mail', 'Passwort', 'Anmelden'. Team ist deutschsprachig. | Yes |
| Deutsch + Französisch | Toggle oder automatisch nach Browser-Sprache. Le Tonkinois ist französische Marke. | |
| Englisch | Internationaler Standard: 'Email', 'Password', 'Sign in'. | |

**User's choice:** Nur Deutsch
**Notes:** —

---

## Claude's Discretion

- Auth-Redirect Verhalten und Loading-State
- Logout-Button Platzierung und Design
- Seed-Script Format für Datenmigration
- Assets-Seite: ob Supabase-Daten nötig oder unverändert

## Deferred Ideas

None — discussion stayed within phase scope
