# Requirements: Le Tonkinois Shorts

**Defined:** 2026-03-28
**Core Value:** Der Feedback-Loop muss laufen: Shorts generieren → Team bewertet → Feedback verbessert die nächste Generation.

## v1.1 Requirements

Requirements for Content Quality Foundation milestone. Each maps to roadmap phases.

### Channel Identity

- [ ] **IDENT-01**: Maschinenlesbarer Style Guide als TypeScript/JSON — Hex-Codes, Fonts, Kodok-Akzentfarbe, verbotene Ästhetik
- [ ] **IDENT-02**: Instagram Safe Zone Constants als TypeScript-Konstanten für alle Compositions
- [ ] **IDENT-03**: Color Grading Preset — CSS-Filter-Formel für warmen Golden-Hour-Look als wiederverwendbarer Wrapper
- [ ] **IDENT-04**: Referenz-Moodboard mit 5+ Screenshots von Instagram-Accounts die den Ziel-Stil zeigen

### Composition

- [ ] **COMP-01**: KodokShowcase Remotion-Composition mit parametrisierter Hook→Szenen→Produkt→EndCard Struktur
- [ ] **COMP-02**: "The Soak" Money Shot — Macro-Szene wo Öl trockenes Holz trifft, als viraler Moment

### AI Generation

- [ ] **GEN-01**: 5-7 Gemini-Image-Szenen für Kodok per JSON-Mode-Prompting generiert
- [ ] **GEN-02**: Wiederverwendbare JSON-Prompt-Templates für konsistente Szenen-Generierung
- [ ] **GEN-03**: Echte Produktfotos via sharp auf generierte Hintergründe composited
- [ ] **GEN-04**: Gemini Video Test — Kamerabewegung auf statischer Szene (nur Ambience)

### Pipeline Tests

- [ ] **PIPE-01**: Foto vs. Gemini Vergleich — gleiche Szene, Side-by-Side im Dashboard reviewbar
- [ ] **PIPE-02**: 3D-Modell Test — @remotion/three + einfaches Kodok-Modell, Machbarkeit und Performance
- [ ] **PIPE-03**: Variant-Management — video_group in Supabase + Dashboard-Filter für Varianten-Vergleich

## v1.2+ Requirements

Deferred to future release. Tracked but not in current roadmap.

### Style Variants

- **STYLE-01**: 3 Style-Varianten (Film Noir, Golden Hour, Clean Studio) unabhängig renderbar
- **STYLE-02**: Neue Scene-Komponenten (HookText, SoakScene, FiftyFiftySplit) als wiederverwendbare Bausteine

### Quality Automation

- **QA-01**: Quality Gate Checklist — automatische 8-Punkte-Prüfung vor Review-Freigabe
- **QA-02**: Sound Design / ASMR-Layer für Reels

### Automation

- **AUTO-01**: Cron-Job: Tägliche Short-Generierung (Claude Code + Remotion + Gemini)
- **AUTO-02**: Cron-Job: Improvement-Workflow (Claude Code liest neues Feedback → verbessert Prompts)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Instagram API Integration (One-Click Publish) | Späterer Milestone — erst Content-Qualität |
| Self-Service Registration | Bewusst Invite-Only für kontrolliertes Team |
| Echtzeit-Kollaboration / Chat | Kein Mehrwert für Review-Workflow |
| Mobile App | Web reicht für Review-Workflow |
| Video-Editing im Browser | Remotion rendert serverseitig |
| Sound Design / ASMR | HIGH complexity, nicht kritisch für erste postbare Version |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| IDENT-01 | — | Pending |
| IDENT-02 | — | Pending |
| IDENT-03 | — | Pending |
| IDENT-04 | — | Pending |
| COMP-01 | — | Pending |
| COMP-02 | — | Pending |
| GEN-01 | — | Pending |
| GEN-02 | — | Pending |
| GEN-03 | — | Pending |
| GEN-04 | — | Pending |
| PIPE-01 | — | Pending |
| PIPE-02 | — | Pending |
| PIPE-03 | — | Pending |

**Coverage:**
- v1.1 requirements: 13 total
- Mapped to phases: 0
- Unmapped: 13 ⚠️

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after initial definition*
