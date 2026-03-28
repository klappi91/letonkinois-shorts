# Roadmap: Le Tonkinois Shorts

## Milestones

- v1.0 MVP -- Phases 1-5 (shipped 2026-03-28)
- v1.1 Content Quality Foundation -- Phases 6-9 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-5) -- SHIPPED 2026-03-28</summary>

- [x] **Phase 1: Supabase Foundation** -- Supabase project, DB schema, RLS policies, three-client pattern (2/2 plans)
- [x] **Phase 2: Auth + Data Migration** -- Invite-only login gates the dashboard; videos.json migrated to Supabase (2/2 plans, completed 2026-03-28)
- [x] **Phase 3: Feedback UI** -- Star rating + pros/cons form persists per reviewer per video (1/1 plan, completed 2026-03-28)
- [x] **Phase 4: Prompt Versioning** -- Prompt version table + video linkage + detail-page display (1/1 plan, completed 2026-03-28)
- [x] **Phase 5: Tech Debt Cleanup** -- Dead code entfernen, npm-Script ergänzen, Schema-FK (1/1 plan, completed 2026-03-28)

</details>

### v1.1 Content Quality Foundation (In Progress)

**Milestone Goal:** Ersten postbaren Vernis Product Showcase produzieren — visuell premium, brand-konform, Instagram-ready. Kanal-Identität als maschinenlesbares Fundament für alle zukünftigen Generierungen.

- [ ] **Phase 6: Channel Identity** -- Maschinenlesbarer Style Guide, Safe Zone Constants, Color Grading Preset, Referenz-Moodboard
- [ ] **Phase 7: AI Scene Assets** -- Gemini-Szenen für Vernis generieren, JSON-Prompt-Templates, Produktfoto-Compositing, Gemini Video Test
- [ ] **Phase 8: ProductShowcase Composition** -- Parametrisierte Remotion Composition mit Hook→Szenen→Produkt→EndCard + "The Soak" Money Shot
- [ ] **Phase 9: Pipeline Tests** -- Foto vs. Gemini vs. 3D Vergleich, Variant-Management in Supabase

## Phase Details

### Phase 6: Channel Identity
**Goal**: Ein maschinenlesbares visuelles Fundament existiert, das alle KI-Generierung und alle Remotion-Compositions eindeutig steuert
**Depends on**: Phase 5 (v1.0 complete)
**Requirements**: IDENT-01, IDENT-02, IDENT-03, IDENT-04
**Success Criteria** (what must be TRUE):
  1. Ein TypeScript/JSON Style Guide existiert mit exakten Hex-Werten, Font-Namen, Vernis-Akzentfarbe und explizit verbotenen Ästhetiken — kein Gemini-Prompt muss mehr raten
  2. Instagram Safe Zone Constants sind als TypeScript-Konstanten importierbar und alle neuen Compositions nutzen sie statt Magic Numbers
  3. Ein Color Grading CSS-Filter-Wrapper ist in Remotion einsetzbar und liefert den definierten Golden-Hour-Look reproduzierbar
  4. Ein Referenz-Moodboard mit 5+ konkreten Instagram-Screenshots dokumentiert den Ziel-Stil visuell und ist im Dashboard verlinkbar
  5. 5 Testbilder gegen den Style Guide generiert und validiert — Style Guide ist damit nicht nur geschrieben sondern bewiesen
**Plans:** 4 plans
Plans:
- [x] 06-01-PLAN.md — brand.ts single source of truth + colors.ts re-export + globals.css sync (completed 2026-03-28)
- [x] 06-02-PLAN.md — ColorGrade wrapper component + StepBadge/SceneLabel SAFE_ZONES migration (completed 2026-03-28)
- [ ] 06-03-PLAN.md — /moodboard page with real reference images + dashboard nav link
- [ ] 06-04-PLAN.md — 5 Gemini test images generated and validated against Style Guide
**UI hint**: yes

### Phase 7: AI Scene Assets
**Goal**: 5-7 Vernis-Szenen existieren, die dem definierten Style Guide entsprechen und bereit für das Compositing in Phase 8 sind
**Depends on**: Phase 6
**Requirements**: GEN-01, GEN-02, GEN-03, GEN-04
**Success Criteria** (what must be TRUE):
  1. 5-7 Gemini-Image-Szenen für Vernis sind generiert (Hook-Kandidaten, Vorher-Szenen, Nachher-Szenen) und alle bei 1080x1920px im korrekten Seitenverhältnis
  2. Wiederverwendbare JSON-Prompt-Templates existieren als Dateien, sodass die gleiche Szene mit kontrollierten Deltas reproduzierbar generierbar ist
  3. Mindestens ein echtes Produktfoto ist per sharp auf einen Gemini-generierten Hintergrund composited — kein KI-generiertes Produktbild erreicht die Pipeline
  4. Ein Gemini Video Test belegt ob ambience-only Kamerabewegung auf einer statischen Szene taugt oder nicht (Ergebnis dokumentiert in PROJECT.md)
**Plans**: TBD

### Phase 8: ProductShowcase Composition
**Goal**: Drei renderfähige Vernis Style-Varianten existieren in Remotion Studio, die alle Postability-Gates bestehen und vom Team über das Dashboard bewertbar sind
**Depends on**: Phase 7
**Requirements**: COMP-01, COMP-02
**Success Criteria** (what must be TRUE):
  1. ProductShowcase Remotion-Composition ist parametrisiert mit StylePreset-Interface — eine Code-Basis erzeugt drei unabhängig renderbare Varianten
  2. "The Soak" Money Shot Component ist in die Composition integriert und zeigt Öl auf trockenem Holz als viralen Hook-Moment
  3. Alle drei Varianten sind als MP4 gerendert, in Supabase geseedeted und im Dashboard mit Star-Rating bewertbar
  4. Jede Szene hat mindestens 100 Frames (3.3s bei 30fps), alle Texte liegen innerhalb der Instagram Safe Zones, und das echte Produktfoto stammt aus assets/products/
**Plans**: TBD
**UI hint**: yes

### Phase 9: Pipeline Tests
**Goal**: Die permanente Generierungs-Pipeline für Product Showcase Compositions ist entschieden — Ergebnis dokumentiert und als Standard in CLAUDE.md eingetragen
**Depends on**: Phase 8
**Requirements**: PIPE-01, PIPE-02, PIPE-03
**Success Criteria** (what must be TRUE):
  1. Foto vs. Gemini Vergleich: gleiche Szene in beiden Varianten ist im Dashboard Side-by-Side reviewbar mit eigenen Ratings
  2. 3D-Modell Test: ein Vernis-Modell via @remotion/three ist gerendert, Machbarkeit und Frame-Render-Overhead sind dokumentiert
  3. video_group ist in Supabase ergänzt, Dashboard-Filter zeigt Varianten-Gruppen, Team kann gezielt Varianten eines Typs vergleichen
  4. Gewinner-Pipeline ist in PROJECT.md Key Decisions eingetragen und CLAUDE.md beschreibt das Standard-Pattern für alle zukünftigen Compositions
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Supabase Foundation | v1.0 | 2/2 | Complete | 2026-03-28 |
| 2. Auth + Data Migration | v1.0 | 2/2 | Complete | 2026-03-28 |
| 3. Feedback UI | v1.0 | 1/1 | Complete | 2026-03-28 |
| 4. Prompt Versioning | v1.0 | 1/1 | Complete | 2026-03-28 |
| 5. Tech Debt Cleanup | v1.0 | 1/1 | Complete | 2026-03-28 |
| 6. Channel Identity | v1.1 | 2/4 | Executing | - |
| 7. AI Scene Assets | v1.1 | 0/? | Not started | - |
| 8. ProductShowcase Composition | v1.1 | 0/? | Not started | - |
| 9. Pipeline Tests | v1.1 | 0/? | Not started | - |
