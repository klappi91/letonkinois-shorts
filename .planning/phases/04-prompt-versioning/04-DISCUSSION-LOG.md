# Phase 4: Prompt Versioning - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 04-prompt-versioning
**Areas discussed:** Seed-Inhalt, Migrations-Strategie, Versions-Anzeige

---

## Seed-Inhalt

| Option | Description | Selected |
|--------|-------------|----------|
| Echte Baseline (Empfohlen) | Aktuelle Prompts/Configs aus bestehenden Compositions extrahieren als v1.0 | ✓ |
| Minimal-Platzhalter | Nur Struktur-Skeleton mit Dummy-Werten | |
| Leer pro Typ | Nur VideoType-Keys mit leeren Feldern | |

**User's choice:** Echte Baseline
**Notes:** —

### Follow-up: Welche Types mit echten Prompts?

| Option | Description | Selected |
|--------|-------------|----------|
| Nur produzierte Types | before-after und showcase mit echten Prompts, Rest Platzhalter | ✓ |
| Alle Types vorbelegen | Für alle 6 Types initiale Prompts formulieren | |

**User's choice:** Nur produzierte Types
**Notes:** Ehrlich bleiben — es gibt noch keine echten Prompts für how-to, seasonal, heritage, lifestyle.

---

## Migrations-Strategie

| Option | Description | Selected |
|--------|-------------|----------|
| Alle auf v1.0 | Alle bestehenden Videos bekommen prompt_version = v1.0 UUID | |
| SQL Migration | Supabase Migration statt Seed-Script | |
| Manuell lassen | Nur neue Videos verkknüpfen, bestehende bleiben null | |

**User's choice:** Other (free text)
**Notes:** "Eigentlich will ich nochmal von null anfangen. Mir gefällt das alles jetzt nicht und Version 1 ist auch noch ideal. Also würde ich gerne noch einmal manuell alles erproben und quasi Version 1 nochmal neu evaluieren, wenn hier alles durch ist. Das ist dann Version 1 und ab da wird damit generiert und ab da wird das dann entsprechend verbessert und weiter ausgearbeitet."

**Interpretation:** User plant nach Phase 4 manuell zu experimentieren. v1.0 wird als Startpunkt geseeded, User überarbeitet Inhalt manuell. Bestehende Videos bleiben und bekommen v1.0-Link.

### Follow-up: Bestehende Videos behalten oder entfernen?

| Option | Description | Selected |
|--------|-------------|----------|
| Behalten mit v1.0-Link | Videos bleiben als Referenz, bekommen v1.0 zugewiesen | ✓ |
| Jetzt entfernen | Clean Slate — Videos + Feedback löschen | |
| Claude entscheidet | Technisch sinnvollste Lösung | |

**User's choice:** Behalten mit v1.0-Link
**Notes:** —

---

## Versions-Anzeige

| Option | Description | Selected |
|--------|-------------|----------|
| In der Metadaten-Zeile (Empfohlen) | Neben Type-Badge, Dauer, Datum und Pipeline als "v1.0" Text | ✓ |
| Eigene Info-Box | Separate Card/Section mit Version + Erstelldatum | |
| Badge neben Titel | Kleiner Badge "v1.0" neben Video-Titel | |

**User's choice:** In der Metadaten-Zeile
**Notes:** Konsistent mit bestehenden Metadaten, kein neues UI-Element.

---

## Claude's Discretion

- FK-Constraint Implementierung
- Seed-Script Technologie
- Prompt-Extraktions-Prozess aus Remotion-Compositions
- Version-Nummer Display-Format

## Deferred Ideas

- Prompt-Editor UI — Black Box Prinzip
- Automatischer Improvement-Workflow — v2
- Admin-Ansicht Prompt-Versionen mit Diff — spätere Phase
