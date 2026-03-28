# Phase 6: Channel Identity - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 06-channel-identity
**Areas discussed:** Vernis Akzentfarbe, Color Grading Umsetzung, Style Guide Architektur, Moodboard Format

---

## Vernis Akzentfarbe

**Critical finding:** "Kodok" war ein halluzinierter Produktname aus der Roadmap-Erstellung. Alle Referenzen wurden durch "Vernis" ersetzt.

### Welches Produkt bekommt den ersten Showcase?

| Option | Description | Selected |
|--------|-------------|----------|
| Vernis | Flaggschiff — klassischer Bootslack, Heritage "Seit 1906", meiste Katalogfotos | ✓ |
| Marine No.1 | Explizit maritim, weniger Fotos | |
| Bio Impression | Modern, nachhaltig | |
| Alle Produkte | Sortiment als Ganzes | |

**User's choice:** Vernis
**Notes:** Vernis ist das Flaggschiff-Produkt mit der stärksten Brand-Verbindung.

### Akzentfarbe

| Option | Description | Selected |
|--------|-------------|----------|
| Navy (#1A2744) | Maritim, premium, bereits in colors.ts | |
| Gold (#FBBC34) | Warm, wertig, Holz/Öl-Charakter | |
| Petrol/Teal | Frischer, moderner (~#1A6B5A) | |

**User's choice:** Custom — "Vernis = Brand Red, Marine No.1 = Navy"
**Notes:** Vernis IST die Marke, daher Brand Red. Navy passt besser zu Marine No.1 als explizit maritimes Produkt.

---

## Color Grading Umsetzung

### Technischer Ansatz

| Option | Description | Selected |
|--------|-------------|----------|
| CSS-Filter-Wrapper | React-Component mit filter (sepia, saturate, brightness, contrast, hue-rotate) | ✓ |
| Overlay-Layer | Halbtransparentes Overlay mit multiply blend-mode | |
| Beides kombinieren | Filter + Overlay | |

**User's choice:** CSS-Filter-Wrapper
**Notes:** Einfach, performant, in einer Zeile auf jede Szene anwendbar.

### Anwendungsbereich

| Option | Description | Selected |
|--------|-------------|----------|
| Global | Jede Composition hat ColorGrade standardmäßig, opt-out per prop | ✓ |
| Pro Szene | Jede Szene entscheidet selbst | |

**User's choice:** Global mit opt-out

---

## Style Guide Architektur

### Zentrale vs. verteilte Architektur

| Option | Description | Selected |
|--------|-------------|----------|
| Single Source of Truth | Zentrale brand.ts, Remotion + Dashboard referenzieren daraus | ✓ |
| Remotion-zentriert | Style Guide in remotion/src/utils/, Dashboard unabhängig | |
| Getrennt lassen | Neues JSON daneben, beide Systeme referenzieren lose | |

**User's choice:** Single Source of Truth in src/lib/brand.ts

### Migration bestehender Dateien

| Option | Description | Selected |
|--------|-------------|----------|
| Re-Exports | colors.ts/fonts.ts importieren aus brand.ts, bestehende Imports bleiben | ✓ |
| Alles in brand.ts | Alte Dateien löschen, alle Imports ändern | |

**User's choice:** Re-Exports — sanfte Migration

### Style Guide Inhalte (multiSelect)

| Option | Description | Selected |
|--------|-------------|----------|
| Verbotene Ästhetiken | Blacklist für Gemini-Prompts | |
| Instagram Safe Zones | Pixel-Konstanten für 1080x1920 | ✓ |
| Color Grading Werte | CSS-Filter-Formel als Konstanten | ✓ |
| Gemini Prompt Fragments | Wiederverwendbare Stil-Beschreibungen | ✓ |

**User's choice:** Safe Zones, Color Grading Werte, Gemini Prompt Fragments
**Notes:** Verbotene Ästhetiken nicht explizit gewählt, aber bereits in Memory/CLAUDE.md dokumentiert — werden als Claude's Discretion in Kommentarform eingefügt.

---

## Moodboard Format

### Darstellungsform

| Option | Description | Selected |
|--------|-------------|----------|
| Dashboard-Seite | Neue Route /moodboard mit Screenshot-Grid und Notizen | ✓ |
| Markdown + Assets | MOODBOARD.md in .planning/ | |
| Nur Asset-Katalog | Screenshots in bestehendem /assets Browser | |

**User's choice:** Dashboard-Seite unter /moodboard

### Screenshot-Beschaffung

| Option | Description | Selected |
|--------|-------------|----------|
| Manuell curated | Screenshots als Dateien ablegen + JSON-Beschreibung | |
| Auto-Scrape | Claude scraped Top-Posts von Referenz-Accounts | ✓ |

**User's choice:** Auto-Scrape von Referenz-Accounts

### Zugangsschutz

| Option | Description | Selected |
|--------|-------------|----------|
| Login-geschützt | Konsistent mit Dashboard, Supabase Auth | ✓ |
| Öffentlich | Jeder mit Link kann sehen | |

**User's choice:** Login-geschützt

---

## Claude's Discretion

- Exakte CSS-Filter-Werte für Golden-Hour-Look
- Moodboard-Datenstruktur
- Verbotene Ästhetiken als Kommentare in brand.ts
- Auswahl der konkreten Instagram-Posts für Moodboard

## Deferred Ideas

- Vollständiges Produktfarben-System für alle 13+ Produkte
- ~~"Kodok" → "Vernis" Umbenennung~~ — ERLEDIGT
