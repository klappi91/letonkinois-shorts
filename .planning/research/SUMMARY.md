# Project Research Summary

**Project:** Le Tonkinois Shorts — v1.1 Content Quality Foundation
**Domain:** AI-generated product showcase content pipeline for Instagram Reels (premium heritage brand)
**Researched:** 2026-03-28
**Confidence:** HIGH

## Executive Summary

Le Tonkinois Shorts v1.1 is a content quality milestone, not a feature milestone. The technical pipeline (Remotion, Supabase, Next.js dashboard, asset catalog) is already validated and running from v1.0. The gap is entirely on the content side: producing the first Vernis product showcase reel that is actually postable to Instagram — visually premium, brand-compliant, and structurally sound. The research makes clear that this requires solving three sequential problems: locking a machine-readable channel style identity (hex codes, font names, prohibited aesthetics), producing premium visual assets anchored to that identity via Gemini Image, and compositing those assets into a Remotion composition that passes the postability gate (safe zones, timing, brand compliance, real product photos).

The recommended approach is a four-phase execution: define the Vernis channel identity before touching a single pixel of composition work; generate and validate AI scene assets against that identity (including "The Soak" macro money shot — oil first touching dry wood grain — which is the strongest unoccupied visual in the category); build a parametrized `ProductShowcase` composition with three style variants (Film Noir, Golden Hour, Clean Studio) for team review; then run technical pipeline tests comparing real photos vs. Gemini Image vs. 3D model approaches to determine the permanent composition pattern. The architecture makes style variants independent, renderable, and reviewable without touching existing compositions or the Supabase schema.

The dominant risk is brand drift — every research file converges on it from a different angle. Pitfalls research documents how v1.0 already failed this way (dark brown backgrounds, Lora used as a headline font, amber accents). The mitigation is non-negotiable: all color references import from `colors.ts`, all font references import from `fonts.ts`, zero inline hex values in composition files, and the style guide must be validated against 5 generated test images before any Remotion work begins. Secondary risk is the AI-generated can constraint: Gemini must never produce product packaging — every product can appearance sources exclusively from `assets/products/`. Third risk is composition timing — scenes under 3.3 seconds and text in unsafe zones will produce a technically broken reel even if the visual quality is excellent.

---

## Key Findings

### Recommended Stack

The existing stack (Next.js 16, Remotion 4.0.261, Supabase, Vercel) requires no architectural changes. New packages are additive, not replacement. The most important first step is upgrading all `@remotion/*` packages from 4.0.261 to the current 4.0.441 before installing any new ones — version mismatch across Remotion packages causes silent render failures. After upgrade, add `@remotion/noise` (organic camera movement, deterministic across frames), `@remotion/shapes` (geometric wipe masks, reveal effects), `@remotion/lottie` (LottieFiles.com motion elements), and `@remotion/three` (3D product can model test). For image pre-processing: `sharp` (product photo compositing, background replacement — Node.js API routes only, not Vercel Edge). For color grading: CSS filters inside Remotion compositions first; reach for `fluent-ffmpeg` LUT post-processing only if CSS grade is insufficient for cinema-grade results.

**Core technologies (new additions):**
- `@remotion/noise@4.0.441`: Deterministic organic animation — camera drift, grain textures. Replaces `Math.random()` which breaks Remotion's frame scrubbing.
- `@remotion/shapes@4.0.441`: SVG geometric wipes and reveal masks without external SVG files.
- `@remotion/lottie@4.0.441`: Import LottieFiles.com animations (product sparkle, checkmarks). 400K+ free MIT-licensed animations.
- `@remotion/three@4.0.441`: 3D Vernis can model test. Requires `three` peer dep + `chromiumOptions: { gl: "angle" }` in remotion config.
- `sharp@0.34.5`: Product photo background removal and compositing. Local/API routes only — Vercel Edge runtime does not support libvips binaries.
- CSS color grading (Tier 1): `sepia(0.2) saturate(1.35) hue-rotate(-8deg)` for Nachher scenes; `saturate(0.6) brightness(0.92)` for Vorher. Zero additional dependencies.

**What not to install:** Framer Motion, react-spring (both time-based, incompatible with Remotion frame model), `@remotion/lambda` (adds AWS cost/complexity with no benefit at current scale).

---

### Expected Features

The research distinguishes sharply between audience-facing features (what makes a reel postable) and production features (what makes the pipeline workable). Both matter for v1.1.

**Must have — postability gates (any failure = not postable):**
- Strong hook in first 1.5 seconds — algorithm distributes based on watch-time; starting with a logo kills reach to non-followers
- Real Vernis product photo in `ProductReveal` — AI-generated cans are disqualifying (brand and trust damage)
- All text within Instagram safe zones (top > 220px, bottom < 1600px, right < 960px)
- Maximum 1-3 words per text overlay — full sentences signal "advertisement" and trigger skip reflex
- Scene duration minimum 3.3 seconds for text-bearing scenes (validated from v1.0 post-mortem)
- Brand Red `#B50606` present — without it, the reel has no visual identity
- Warm color grade on Nachher scenes, cool/desaturated on Vorher scenes
- EndCard with logo + "Seit 1906" + single CTA

**Should have — competitive differentiators:**
- "The Soak" money shot: macro close-up of oil first soaking into dry wood grain. No competitor owns this shot. Equivalent to car detailing's "water beading" moment.
- 50/50 split frame: single image showing treated vs. untreated wood with the boundary line animated across the frame. Most powerful thumbnail composition in the category.
- Warm/cool color contrast amplifying the Vorher-Nachher transformation beyond what the actual product difference delivers
- Marine/nautical context shots (boat deck, teak planks): unoccupied niche in German wood care Instagram
- Heritage anchoring in hook text ("Seit 1906 vertrauen Segler diesem Öl") — builds trust without advertising copy

**Defer to v1.x (after first reel is posted and performance data exists):**
- ASMR Foley sound layer (brush-on-wood, oil drip, wood tap) — HIGH complexity, requires curated recording library
- Loop-optimized ending (last frame connects to first frame for re-watch signal)
- Marine context variant as standalone composition
- Style A/B testing via Instagram Trial Reels (requires 1,000+ followers — account does not yet exist independently)

**Defer to v2+:**
- UGC compilation format (requires active community with tagged content)
- Voiceover narration track (adds production complexity without proven payoff for satisfying-content genre)
- Automated split-test infrastructure (premature before 10+ reels posted)

---

### Architecture Approach

The architecture follows a strict "extend, don't fork" principle applied to the existing Remotion monorepo. All existing compositions, components, and utilities remain unchanged. New functionality layers on top through a `StylePreset` interface system: a TypeScript object capturing all visual variation points (background, hook text color, gradient strength, accent color) that compositions accept as a prop. Three style preset files (`film-noir.ts`, `golden-hour.ts`, `clean-studio.ts`) export constants satisfying this interface. A parametrized base `ProductShowcase` composition accepts a `StylePreset` prop; three thin style wrappers (`ProductStyleA/B/C`) each provide one preset as `defaultProps`. This produces three independently renderable, independently previewable composition IDs in Remotion Studio — one maintenance target, three comparison outputs.

**Major components (new):**
1. `StylePreset` interface + three style preset files — visual variation vocabulary; all downstream components consume it
2. `ProductShowcase.tsx` (parametrized base) + `ProductStyleA/B/C.tsx` (thin wrappers) — the three showcase variants for review
3. `SoakScene.tsx` — "The Soak" money shot component (animated macro close-up with fade-in)
4. `FiftyFiftySplit.tsx` — animated clip-path split reveal (50/50 treated vs. untreated wood)
5. `ThreeProductModel.tsx` — 3D cylindrical can model via `@remotion/three`, frame-controlled rotation
6. `scripts/` (monorepo root) — `generate-gemini-scene.ts`, `render-variants.sh`, `seed-variant-videos.ts` — local orchestration, never on Vercel
7. Supabase schema: no changes required; variants are regular `videos` rows (optional: `video_group` text column for dashboard filtering)

**Build order is strictly sequential:** style presets first (unblocks everything) → new scene components → base composition → style wrappers → Gemini asset generation (can run parallel with composition) → pipeline test compositions → team review.

---

### Critical Pitfalls

1. **Style definition doesn't transfer to AI generation** — Natural language adjectives ("warm", "heritage") are interpreted by Gemini according to its training distribution, not the letonkinois.de brand. "Heritage" generates sepia tones; "premium" generates dark dramatic backgrounds — both wrong. Prevention: define the style guide in machine-readable terms only (hex codes, font names, explicit negative prompts: `NOT rustic, NOT dark background, NOT brown wood tones, NOT amber`). Validate by generating 5 test images before starting any Remotion composition.

2. **Branding entropy — compositions drift until the feed looks incoherent** — Inline hex values and font strings in composition files are the root cause. After 3-4 compositions, the feed looks like multiple brands. v1.0 experienced this directly (dark brown backgrounds, Lora as headline font). Prevention: zero inline hex values in any `.tsx` composition file, all colors from `colors.ts`, all fonts from `fonts.ts`, lint check for `#` characters in composition files.

3. **AI-generated content looks like stock photography** — Gemini suppresses ugly mundane reality. "Before" wood looks artistically weathered rather than neglected. Prevention: JSON-mode prompting for all multi-image sequences (single scene description, controlled delta per image), reference actual `assets/blog/` photos as generation anchors, require `photojournalistic realism, NOT styled, NOT magazine shoot`.

4. **Composition timing violations** — Scenes under 3.3 seconds with text feel stressful, not satisfying. This was the documented failure mode of v1.0's first draft ("zu schnell, zu viel Text"). Prevention: minimum 100 frames (3.3s at 30fps) for any text-bearing scene, enforced by checking `durationInFrames` per scene segment before marking composition done.

5. **AI-generated product cans reaching the pipeline** — A prompt for a "product showcase scene" may produce a plausible-but-wrong Le Tonkinois can label. This is brand damage. Prevention: every Gemini prompt that could include a product must explicitly exclude packaging (`NO product cans, NO bottles`). Every product appearance in a composition must trace to `assets/products/`.

---

## Implications for Roadmap

Based on research, the v1.1 work breaks into four phases with strict dependency ordering. The temptation to build the Remotion composition first must be resisted — the style guide and AI asset generation must precede composition work, otherwise the composition will need to be rebuilt when it doesn't match the brand.

### Phase 1: Channel Identity Definition

**Rationale:** Everything downstream depends on this. Gemini prompts cannot be written without knowing the visual world. Remotion style presets cannot be created without hex codes and font choices locked. v1.0 built two compositions that both required revision because this step was skipped.

**Delivers:** A machine-readable Channel Style Identity Document for Vernis: exact hex color scheme (primary `#B50606`, background `#FFF8F0`, Vernis secondary accent color TBD), font usage rules (Playfair Display for headlines, Lora for scene labels, Lato for badges), scene context choices (garden primary, marine secondary), time of day (golden hour), Vorher state descriptors (dull/dusty/grey), Nachher state descriptors (warm/glowing/oiled), explicitly forbidden aesthetics (dark backgrounds, amber tones, rustic craft aesthetic). Validated by generating 5 test images against the spec before any Remotion work begins.

**Addresses:** FEATURES.md P1 — brand-compliant visual identity, style iteration Phase 1 ("Define Before Building")

**Avoids:** Pitfall 1 (style definition doesn't transfer to AI), Pitfall 6 (branding entropy)

**Research flag:** Standard patterns — brand system is fully documented in `colors.ts`, `fonts.ts`, and `feedback_branding_identity.md`. Define and validate against known sources; no additional research needed.

---

### Phase 2: AI Scene Asset Generation

**Rationale:** Composition work requires assets to exist. "The Soak" money shot specifically requires 2-3 rounds of Gemini prompt iteration — it will not succeed on the first attempt. Generating assets in parallel with or after composition development creates a blocking dependency at render time. Assets must be validated against the Phase 1 style guide before proceeding.

**Delivers:** 5-7 Gemini Image scenes keyed to the defined style: 3 hook candidates (The Soak, 50/50, Golden Hour Glow), 2 Vorher scenes (different weathering severity), 1-2 Nachher scenes (warm-graded), 1 product reveal background test (cream vs. white). All generated at 1080x1920 using JSON-mode scene descriptions with explicit scene-locking (same table, same garden, controlled delta per image). All validated against Phase 1 style guide before proceeding to composition.

**Uses:** STACK.md — Gemini Image generation scripts (`scripts/generate-gemini-scene.ts`), `sharp` for background removal/compositing if needed

**Implements:** ARCHITECTURE.md — Gemini Image Scene Generation Flow, `scripts/` orchestration layer

**Avoids:** Pitfall 2 (uncanny clean AI aesthetic), Pitfall 3 (scene inconsistency across multi-image sequences)

**Research flag:** Needs attention during planning — Gemini Image 2.0-flash vs. imagen-3 quality difference for 9:16 portrait product scenes is not definitively resolved. Test both with identical prompts in early Phase 2 execution; keep whichever produces better consistency.

---

### Phase 3: ProductShowcase Composition + Style Variants

**Rationale:** With the style guide locked and assets generated, the Remotion composition can be built to specification without guessing. The style preset system enables three renderable variants from a single composition, which is the team's review mechanism. This phase is the primary deliverable of v1.1.

**Delivers:** `StylePreset` interface + three style presets (Film Noir, Golden Hour, Clean Studio), `ProductShowcase.tsx` base composition, `ProductStyleA/B/C.tsx` wrappers, new components (`SoakScene`, `FiftyFiftySplit`, `HookText`), all three variants rendered to MP4 and seeded to Supabase for team review via the existing dashboard. Every composition passes the full postability gate: safe zones, timing floor, brand compliance, real product photo.

**Uses:** STACK.md — `@remotion/noise` (camera drift), `@remotion/shapes` (wipe masks), upgraded Remotion packages at 4.0.441

**Implements:** ARCHITECTURE.md — Style Preset System (Pattern 1), Parametrized Base Composition with Style Wrappers (Pattern 2), Style Variant Build-Review Flow

**Avoids:** Pitfall 4 (composition timing violations), Pitfall 5 (Instagram safe zone violations), Pitfall 6 (branding entropy), Pitfall 7 (Ken Burns easing missing), Pitfall 8 (product can rule violated), Pitfall 10 (style variants without comparison framework)

**Research flag:** Standard patterns — Remotion composition patterns are fully documented in official docs and validated in the existing codebase. The `StylePreset` system architecture is fully specified in ARCHITECTURE.md.

---

### Phase 4: Technical Pipeline Tests

**Rationale:** The v1.1 milestone requires determining whether the permanent pipeline for future product showcase compositions uses real catalog photos, Gemini Image AI scenes, Gemini Video clips, or 3D model renders. This comparison can only be done after the composition structure is established in Phase 3, so pipeline test compositions have a clear baseline to compare against. The winner becomes the documented pattern for all future showcase compositions.

**Delivers:** Four pipeline test compositions under `compositions/PipelineTest/`: `TestRealPhoto`, `TestGeminiImage`, `TestGeminiVideo`, `TestThreeDModel`. Each rendered, seeded to Supabase, reviewed by team with star rating and pros/cons. Winner style and pipeline documented in project memory and CLAUDE.md for all future compositions.

**Uses:** STACK.md — `@remotion/three` + `three` + `@react-three/fiber` for 3D test, `@remotion/lottie` for motion elements

**Implements:** ARCHITECTURE.md — 3D Model Test Flow, Pipeline Test Compositions structure, `compositions/PipelineTest/` subfolder

**Avoids:** Pitfall 9 (Gemini Video temporal inconsistency — establishes the "camera motion on static subjects only" rule before any video clips are composited into final outputs)

**Research flag:** Needs attention — `@remotion/three` + Spline vs. manual Three.js geometry for Vernis can model; Spline export is labeled experimental in official docs. 3D model render performance at 1080x1920 (potential +200ms/frame overhead) should be benchmarked before committing to the 3D path.

---

### Phase Ordering Rationale

- **Style before assets, assets before composition:** This is the dependency chain that v1.0 violated. Each phase is a prerequisite for the next — no phase can start without the prior phase output validated.
- **Style variants as independent composition IDs, not conditional branches:** Each variant gets its own Remotion composition ID, independently previewable and renderable. The "one giant composition with if-style branches" anti-pattern prevents this.
- **Pipeline tests after composition:** Test compositions need a validated composition structure to compare against. Running pipeline tests without a known-good baseline produces noise, not signal.
- **Supabase schema unchanged throughout:** All variants are standard `videos` rows; the existing dashboard feedback UI handles review without modification. Engineering surface stays small.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (AI Asset Generation):** Gemini Image 2.0-flash vs. imagen-3 for portrait 9:16 product scenes; current best practices for multi-image consistency prompting need iteration-based validation.
- **Phase 4 (3D Pipeline):** `@remotion/three` performance at 1080x1920 and Spline export reliability need empirical measurement before committing 3D to the permanent pipeline.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Channel Identity):** Brand system is fully documented. Define and validate against known sources.
- **Phase 3 (Composition):** Remotion parametrized rendering patterns are fully documented in official docs and validated in the existing codebase.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All new packages verified on npmjs.com and official Remotion docs 2026-03-28. Version compatibility rules confirmed. CSS color grading approach validated against existing working compositions. |
| Features | HIGH | Table stakes features validated against v1.0 post-mortem (direct failure evidence). Differentiators validated against competitor analysis (TotalBoat 163K, Rubio Monocoat) + viral content case studies (38M views). "The Soak" money shot identified as unoccupied visual niche. |
| Architecture | HIGH (composition patterns) / MEDIUM (3D integration) | Remotion parametrized rendering and Folder grouping from official docs — HIGH. `@remotion/three` integration is documented but Spline export path is explicitly labeled experimental — MEDIUM for 3D specifically. |
| Pitfalls | HIGH | Top 6 pitfalls derived from direct v1.0 post-mortem failures (observed, not theoretical). Pitfall 9 (Gemini Video temporal inconsistency) from official Google docs + community evidence — MEDIUM. |

**Overall confidence:** HIGH

### Gaps to Address

- **Vernis accent color:** The Channel Identity Document needs to define Vernis' secondary accent color (Navy? Gold?). This is a product-level design decision not yet made. Address in Phase 1 before any generation.
- **Gemini Image model choice (2.0-flash vs. imagen-3):** Research does not provide a definitive recommendation for 9:16 portrait product scenes. Test both in Phase 2 with identical prompts.
- **`@remotion/three` render performance:** The `chromiumOptions: { gl: "angle" }` requirement is documented but per-frame render overhead at 1080x1920 resolution is unknown. Measure in Phase 4 before committing to the 3D pipeline.
- **Le Tonkinois Instagram account existence:** There is no dedicated @letonkinois account (only @hermannsachse with 3.5K). Instagram Trial Reels (post-1,000 followers) is not immediately available. Manual posting analytics will be the feedback mechanism for the first several compositions.

---

## Sources

### Primary (HIGH confidence)

- `.planning/research/STACK.md` — Remotion package versions, sharp/ffmpeg integration, CSS color grading strategy (verified npmjs.com + official docs 2026-03-28)
- `.planning/research/FEATURES.md` — Content format features, postability gate, competitor comparison (verified against multi-source synthesis + actual account data)
- `.planning/research/ARCHITECTURE.md` — StylePreset system, composition patterns, 3D integration (verified against official Remotion docs + existing codebase analysis)
- `.planning/research/PITFALLS.md` — Brand drift, timing violations, safe zones (verified against v1.0 post-mortem direct failure evidence)
- `memory/feedback_branding_identity.md` — Brand red+white+Playfair Display constraint, what was rejected in v1.0
- `memory/feedback_reel_composition_template.md` — Validated composition template, timing floors, safe zone positions
- `memory/feedback_reel_design_rules.md` — Min 3.3s/scene, max 1-3 words text, hook requirements
- `memory/feedback_gemini_image_realismus.md` — Anti-stock-photography prompting rules
- `memory/feedback_before_after_realismus.md` — JSON-mode prompting for scene consistency
- [remotion.dev](https://www.remotion.dev/docs/) — Official Remotion 4.0.x documentation for @remotion/three, Folder, parametrized rendering

### Secondary (MEDIUM confidence)

- [Instagram Trial Reels — Official Creator Guide](https://creators.instagram.com/blog/instagram-trial-reels) — Trial Reels workflow, 1,000 follower threshold
- [Google Developers Blog: Gemini 2.5 Flash Image Generation](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/) — Reference image technique, negative prompts
- [Instagram Reels Safe Zone Guide 2026](https://kreatli.com/guides/instagram-reels-safe-zone) — UI overlay pixel dimensions
- `research/competitor-content-research-2026.md` — TotalBoat (163K), Rubio Monocoat, @earthandflax competitive positions
- `research/car-detailing-aesthetic-transfer.md` — "The Soak" money shot, ASMR strategy, warm color grading
- [Hootsuite: Instagram Reels for Business 2026](https://blog.hootsuite.com/instagram-reels/) — 3-5 reels/week quality-first frequency recommendation
- [Wood Floor Business: Dony Buendia 38M views case study](https://www.woodfloorbusiness.com/business/social-media/article/15447867/applying-finish-to-the-tune-of-38million-instagram-views) — Viral content format validation

### Tertiary (LOW confidence)

- [Cloudinary Ken Burns Effect Guide](https://cloudinary.com/guides/image-effects/ken-burns-effect-complete-guide-and-how-to-apply-it) — Easing requirement for professional motion (needs validation on Remotion's specific `interpolate()` API)
- [Gemini + Veo temporal consistency — DEV Community](https://dev.to/jubinsoni/gemini-veo-a-deep-dive-into-googles-high-fidelity-video-generation-pipeline-78m) — Gemini Video limitations (community analysis, not official benchmark)

---

*Research completed: 2026-03-28*
*Ready for roadmap: yes*
