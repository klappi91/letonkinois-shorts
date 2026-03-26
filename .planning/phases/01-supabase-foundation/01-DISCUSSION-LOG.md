# Phase 1: Supabase Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 01-supabase-foundation
**Areas discussed:** Admin-Erkennung, Video-Status-Werte, TypeScript-Typen, Prompt-Content-Struktur

---

## Admin-Erkennung

| Option | Description | Selected |
|--------|-------------|----------|
| app_metadata Role | Admin setzt per Supabase Dashboard oder API: app_metadata.role = 'admin'. RLS-Policies prüfen auth.jwt()->>'role'. Sicher, da User app_metadata nicht selbst ändern können. | ✓ |
| Hardcoded Email-Liste | Admin-Emails in einer env-Variable oder Config-Datei. Einfachster Ansatz für 1-2 feste Admins, aber unflexibel. | |
| Separate admin-Spalte | Boolean is_admin auf einer profiles-Tabelle. Flexibel, braucht aber eine zusätzliche Tabelle + Trigger für User-Erstellung. | |

**User's choice:** app_metadata Role (Recommended)
**Notes:** Initial nur 1 Admin (Chris).

---

## Video-Status-Werte

| Option | Description | Selected |
|--------|-------------|----------|
| 3 Werte: draft/approved/rejected | Mappt direkt auf das bestehende Rating-System. Draft = neu generiert, noch kein Review. | ✓ |
| 4 Werte: draft/in_review/approved/rejected | Zusätzlicher in_review Status wenn mindestens 1 Reviewer bewertet hat. | |
| 5 Werte: +published | Zusätzlich published für Videos die auf Instagram gepostet wurden. | |

**User's choice:** 3 Werte: draft/approved/rejected (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| TEXT + Check | Flexibler — neue Werte hinzufügen braucht nur ein ALTER CHECK. Supabase-Community empfiehlt das. | ✓ |
| Postgres ENUM | Striktere Typsicherheit auf DB-Ebene. ENUM-Änderungen in Supabase sind umständlich. | |

**User's choice:** TEXT + Check (Recommended)

---

## TypeScript-Typen

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-Gen + Wrapper | Supabase CLI generiert database.types.ts. Zusätzlich dünne Wrapper-Types für bessere DX. | ✓ |
| Nur Auto-Gen | Direkte Nutzung der generierten Types. Weniger Boilerplate, aber verbose Type-Pfade. | |
| Nur manuell | Types per Hand pflegen wie bisher. Kein CLI-Setup nötig. | |

**User's choice:** Auto-Gen + Wrapper (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Ersetzen durch Supabase-Wrapper | VideoEntry wird durch Wrapper-Type über auto-generierte Supabase-Types ersetzt. | ✓ |
| Beides beibehalten | VideoEntry bleibt, neuer Supabase-Type parallel mit Mapping-Funktion. | |
| Du entscheidest | Claude wählt den besten Ansatz. | |

**User's choice:** Ersetzen durch Supabase-Wrapper (Recommended)

---

## Prompt-Content-Struktur

| Option | Description | Selected |
|--------|-------------|----------|
| Pro Video-Typ ein Prompt-Block | JSONB mit Keys pro VideoType. Improvement-Workflow kann gezielt einen Typ verbessern. | ✓ |
| Flat: ein globaler Prompt-String | Einfaches { "prompt": "..." }. Simpel, aber keine gezielte Verbesserung einzelner Typen. | |
| Du entscheidest | Claude wählt basierend auf dem Generierungs-Workflow. | |

**User's choice:** Pro Video-Typ ein Prompt-Block (Recommended)

**User correction (mid-discussion):** Prompts haben im User-facing System nichts verloren. Das System soll autonom aus Feedback lernen und Prompts selbst anpassen. Kein User-Einfluss auf Prompt-Inhalte. Prompt-Versioning ist rein internes Tracking.

| Option | Description | Selected |
|--------|-------------|----------|
| Versionsnummer zeigen | Kleines Label wie 'v1.2' auf der Detail-Seite. Hilft Nachvollziehbarkeit. | ✓ |
| Komplett unsichtbar | Prompt-Versioning rein intern. Keinerlei Prompt-Bezug im UI. | |

**User's choice:** Versionsnummer zeigen

---

## Claude's Discretion

Keine Bereiche an Claude delegiert.

## Deferred Ideas

Keine — Diskussion blieb im Phase-Scope.
