# Phase 6: Channel Identity - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Ein maschinenlesbares visuelles Fundament existiert, das alle KI-Generierung und alle Remotion-Compositions eindeutig steuert. Liefert: Style Guide (TypeScript), Safe Zone Constants, Color Grading Preset, Referenz-Moodboard.

**WICHTIG:** "Kodok" existiert nicht als Produkt. Alle Roadmap-Referenzen auf "Kodok" meinen **Vernis** — das Flaggschiff-Produkt von Le Tonkinois.

</domain>

<decisions>
## Implementation Decisions

### Produkt-Identität
- **D-01:** Erster Product Showcase wird **Vernis** (klassischer Bootslack, Flaggschiff). "Kodok" war halluziniert und wird durchgehend durch "Vernis" ersetzt.
- **D-02:** Vernis Akzentfarbe = Brand Red #B50606 (Vernis IST die Marke)
- **D-03:** Marine No.1 Akzentfarbe = Navy #1A2744 (maritimes Produkt)
- **D-04:** Weitere Produktfarben werden später bei Bedarf ergänzt, kein vollständiges Farbschema für alle Produkte nötig

### Color Grading
- **D-05:** Golden-Hour-Look wird als CSS-Filter-Wrapper React-Component umgesetzt (`<ColorGrade>`)
- **D-06:** Filter-Werte: sepia, saturate, brightness, contrast, hue-rotate — exakte Werte im Style Guide definiert
- **D-07:** Global angewendet auf alle Compositions standardmäßig, opt-out per `enabled={false}` prop für Ausnahmen

### Style Guide Architektur
- **D-08:** Single Source of Truth in `src/lib/brand.ts` — eine zentrale TypeScript-Datei definiert ALLE visuellen Werte
- **D-09:** Bestehende `remotion/src/utils/colors.ts` und `fonts.ts` werden zu Re-Exports aus brand.ts (keine Breaking Changes)
- **D-10:** `src/app/globals.css` Tailwind @theme wird manuell synchronisiert (CSS kann kein TS importieren)
- **D-11:** brand.ts enthält: Farben, Fonts, Produktfarben, Instagram Safe Zones, Color Grading Werte, Gemini Prompt Fragments

### Moodboard
- **D-12:** Neue Dashboard-Seite unter `/moodboard` mit Screenshot-Grid und Notizen pro Referenz
- **D-13:** Screenshots werden auto-scraped von Referenz-Accounts (TotalBoat, Rubio Monocoat, @earthandflax etc. aus Competitor Research)
- **D-14:** Login-geschützt, konsistent mit dem restlichen Dashboard (Supabase Auth)

### Claude's Discretion
- Verbotene Ästhetiken als Kommentare/Konstanten in brand.ts einfügen (bereits in Memory dokumentiert: kein Dark Brown, kein Amber, keine "moderne Craft" Ästhetik)
- Exakte CSS-Filter-Werte für den Golden-Hour-Look (iterativ im Remotion Studio testen)
- Moodboard-Datenstruktur (JSON-Array mit Screenshot-Pfad, Account-Name, Begründung)
- Auswahl der konkreten Instagram-Posts für das Moodboard

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Bestehende Brand-Assets
- `remotion/src/utils/colors.ts` — Aktuelle Farbdefinitionen (wird zu Re-Export)
- `remotion/src/utils/fonts.ts` — Aktuelle Font-Definitionen (wird zu Re-Export)
- `src/app/globals.css` — Tailwind @theme mit Dashboard-Farben (muss synchronisiert werden)

### Branding-Regeln (Memory)
- Memory: `feedback_branding_identity.md` — Rot+Weiß+Playfair Display, verbotene Ästhetiken
- Memory: `feedback_reel_design_rules.md` — Min 3.3s/Szene, max 1-3 Wörter Text, Safe Zones
- Memory: `feedback_reel_composition_template.md` — Hook→Vorher→Schritte→Nachher→Produkt→EndCard Struktur

### Content Research
- `research/competitor-content-research-2026.md` — Referenz-Accounts für Moodboard (TotalBoat 163K, Rubio Monocoat, @earthandflax)
- `research/car-detailing-aesthetic-transfer.md` — Golden Hour Color Grading, "The Soak" Money Shot

### Requirements
- `.planning/REQUIREMENTS.md` §Channel Identity — IDENT-01 bis IDENT-04

### Bestehende Komponenten
- `remotion/src/components/ImageScene.tsx` — Nutzt colors.ts, muss nach Migration aus brand.ts beziehen
- `remotion/src/components/EndCard.tsx` — Nutzt colors.ts + fonts.ts
- `remotion/src/components/ProductReveal.tsx` — Produktfoto-Darstellung
- `remotion/src/components/StepBadge.tsx` — Brand Red Badge
- `remotion/src/components/SceneLabel.tsx` — Text-Overlays

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `remotion/src/utils/colors.ts` — 14 Farbwerte als JS-Objekt, wird zu Re-Export
- `remotion/src/utils/fonts.ts` — Playfair Display, Lora, Lato geladen via @remotion/google-fonts
- `src/app/globals.css` — Tailwind @theme mit 12 CSS Custom Properties
- `src/data/asset-catalog.ts` — Asset-Registry mit Kategorie "references" bereits vorhanden

### Established Patterns
- Brand-Farben als `as const` TypeScript-Objekte exportiert
- Tailwind CSS v4 @theme Block für Dashboard-Styling
- @remotion/google-fonts für Font-Loading in Compositions
- Proxy-Pattern für Auth (konsistent für neue /moodboard Route)

### Integration Points
- `src/lib/brand.ts` (NEU) wird zentrale Quelle — importiert von Remotion UND Dashboard
- `/moodboard` Route braucht Auth-Guard (bestehendes Proxy.ts Pattern)
- Asset-Katalog kann um Moodboard-Einträge erweitert werden (Kategorie "references" existiert)
- `remotion/src/components/*.tsx` müssen nach Migration aus brand.ts importieren statt aus colors.ts direkt

</code_context>

<specifics>
## Specific Ideas

- Vernis = die Marke selbst, daher Brand Red als Akzentfarbe (nicht ein separater Farbton)
- Marine No.1 = Navy weil es das explizit maritime Produkt ist
- Color Grading soll "Golden Hour" Stimmung erzeugen — warme Honig-Töne, wie in der Car-Detailing-Research beschrieben
- Moodboard soll Team zeigen WIE der Instagram-Kanal aussehen soll, bevor wir anfangen Content zu generieren

</specifics>

<deferred>
## Deferred Ideas

- Vollständiges Produktfarben-System für alle 13+ Produkte — erst wenn weitere Product Showcases gebaut werden
- Sound Design / ASMR-Layer — REQUIREMENTS.md Out of Scope
- "Kodok" Roadmap-Korrektur: Alle Referenzen auf "Kodok" in ROADMAP.md, REQUIREMENTS.md, STATE.md durch "Vernis" ersetzen (vor Phase 7)

</deferred>

---

*Phase: 06-channel-identity*
*Context gathered: 2026-03-28*
