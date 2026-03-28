# Feature Research

**Domain:** Instagram product showcase reels — premium heritage wood finish brand (Le Tonkinois / Vernis)
**Researched:** 2026-03-28
**Confidence:** HIGH (content formats, visual quality, iteration workflow — verified against multiple sources + existing project research)

---

## Context

This research covers the v1.1 milestone: creating the first post-worthy Vernis Product Showcase reel. The pipeline (Remotion, Gemini Image, asset catalog, Supabase) is already built. The gap is entirely on the content side: what does a postable product showcase reel actually look like, what separates it from amateur output, and how do you iterate toward it systematically?

Focus areas from the milestone:
1. Instagram channel style/identity design
2. Product showcase reel formats that work for premium brands
3. Content creation workflow (concept to postable)
4. Style iteration process (systematic testing and refinement)

Existing validated knowledge from prior research (incorporated here, not re-derived):
- Competitor analysis: TotalBoat (163K), Rubio Monocoat (16K–245K US), Epifanes (3.7K), @hermannsachse (3.5K)
- Viral formats: "First Coat Moment" 10-15s, Before/After, ASMR application, 38M+ views benchmarks
- Car Detailing aesthetic transfer: 12 must-have shots, "The Soak" as money shot equivalent
- Reel design rules: min 3.3s/scene, max 1-3 words text, Playfair Display + Brand Red
- Composition template: Hook→Vorher→Steps→Nachher→Produkt→EndCard, 24-30s total

---

## Feature Landscape

### Table Stakes (Users Expect These)

"Users" here = Instagram audience. Missing these = reel gets skipped, not shared, not saved.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Strong hook in first 1.5 seconds | Algorithm distributes based on watch-time; first 1-3s determines whether a reel reaches non-followers at all | LOW | Either the strongest "satisfying" moment (oil hitting dry wood) or the sharpest "problem" moment (grey weathered surface). Never start with logo or product name. |
| 9:16 vertical format, 1080×1920px | Instagram Reels are exclusively consumed vertical on mobile; horizontal content looks amateur | LOW | Already enforced by Remotion pipeline and existing compositions. |
| Safe zone compliance | Instagram UI overlays username (top) and like/caption (bottom); content outside safe zones is partially hidden | LOW | Top: 140px, Bottom: 380px — already in composition template. |
| Consistent brand visual identity | Viewers associate style with brand; inconsistency reads as "no brand" | MEDIUM | Rot #B50606 + Weiss + Playfair Display. NOT dark brown, NOT amber — strictly per letonkinois.de. |
| Minimum scene duration (3.3s) | Scenes shorter than ~3s feel frantic; audiences abandon over-cut content | LOW | Validated by iteration on 2026-03-25. 3.3–3.7s per scene minimum. |
| Real product photos (no AI-generated cans) | AI-generated cans look wrong; brand trust requires product authenticity | LOW | Hard constraint. Dose from asset catalog only. Never Gemini-generated. |
| Completion-rate optimized length | 7-30s achieves highest completion rates, which is the primary algorithmic distribution signal | LOW | Sweet spot: 15-25s for pure visual satisfaction; 25-35s for how-to/before-after. Existing compositions at 24-30s are in range. |
| Intelligible caption with keyword SEO | Instagram search in 2026 treats captions like Google — keywords determine discoverability | LOW | Caption carries explanatory text that the video deliberately avoids. "Speicher dir das!" CTA drives saves. |

### Differentiators (Competitive Advantage)

These separate a good reel from a forgettable one for Le Tonkinois specifically.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "The Soak" money shot (oil-into-grain macro) | The moment oil first touches dry wood and grain "awakens" is the strongest satisfying moment in the category — no competitor has made it their signature shot | MEDIUM | Requires Gemini Image or real footage macro. Zeitlupe / slow-motion approach if using video. This is Le Tonkinois' equivalent to car detailing's "water beading" shot. |
| 50/50 split frame (oiled/unoiled in one shot) | Single frame shows the entire product benefit; most powerful thumbnail and hook image in the category | MEDIUM | Can be produced with Gemini Image (split-frame prompt) or Remotion Wipe transition. The "border line" moving across the frame is hypnotic. |
| Warm color grading (golden hour palette) | "Vorher" desaturated/cool → "Nachher" warm honey/gold: maximizes perceived transformation even if the real diff is subtle | LOW | Color grading is a Remotion-layer decision, not a separate filming step. Rule: Vorher = cool, Nachher = warm. |
| ASMR sound design layer | 50% of reel impact is audio; brush-on-wood sounds + oil absorption trigger sensorische Befriedigung that silent or music-only content cannot | HIGH | Requires curated Foley library: brush stroke, oil drip, wood tap, linen wipe. Option C hybrid (ambient + foley) is right for AI-generated pipeline. Hard to produce for v1 without real recordings. |
| Product reveal scene (Dose auf Cream-BG) | Connects satisfying content to purchasable product; the dose IS the brand; this moment is what makes the reel an ad without feeling like one | LOW | Already implemented as `ProductReveal` component. Dose prominent 440×440px, red divider, Playfair Display name. |
| Marine/nautical context shots | No German-language competitor makes Instagram Reels about boat wood care; Le Tonkinois' heritage is French maritime — this niche is completely unoccupied | MEDIUM | Requires Gemini Image prompts for boat deck, teak planks, harbor/water context. Strong differentiator vs. Rubio, Osmo, Biopin. |
| Heritage story integration ("Seit 1906") | Heritage positioning builds trust without a single word of advertising copy; no other wood finish brand has 120 years of origin story | LOW | Already in EndCard component. Can be extended to Hook scene ("Seit 1906 vertrauen Segler diesem Öl") |
| Product-specific accent colors | Each Le Tonkinois product variant has a secondary color (Vernis → Gold+Navy; Marine N°1 → Navy+Cream); matching reel style to product reinforces "product family" coherence | LOW | Color map exists in branding memory. Vernis product color scheme needs to be defined before reel production. |
| Loop-optimized ending | Seamless loop tricks watch-time algorithm into counting repeat views; makes reel feel "infinite" | LOW | End frame should match or deliberately contrast with first frame so replaying feels intentional. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Logo/brand intro at start | "Brand recognition" | First 1.5 seconds determine algorithmic distribution; starting with a logo kills watch-time and signals "advertisement" to skip-trained audiences | Show product in scene context; logo belongs only in EndCard (last 3s) |
| Full sentences as text overlays | "More information" | Viewers cannot read full sentences at reel pacing; text becomes visual noise; educational content belongs in caption | Max 1-3 words per scene (validated rule: "Vorher", "Fertig.", "Schritt 2"). Explanation → caption. |
| Voiceover narration (German) | "Professional" | Requires native-quality voice recording, mixing, and re-recording for each variation; dramatically increases production friction; silent ASMR content outperforms narrated in the satisfying genre | Caption carries the narrative voice. For how-to reels: text-on-screen labels only. |
| Stock footage of wood projects | "Fills scenes without filming" | Stock footage reads as generic; the Le Tonkinois positioning requires authenticity and the specific warm-German-garden aesthetic; stock footage undermines premium feel | Gemini Image with precise prompts delivers the exact Le Tonkinois visual world; stock cannot do this at the specificity required. |
| Complex motion graphics / animated infographics | "Explains the product better" | Over-production signals "ad" not "content"; the 2026 audience is highly trained to skip polished ad-style content | Simple Remotion animations (Ken Burns zoom, fade, slide) keep the content feeling authentic while still being produced. |
| Multiple CTAs in one reel | "Maximize conversions" | Competing CTAs dilute each other; audiences do not act on more than one CTA per short video | One CTA per reel. Product showcase → "Link in Bio" (or "Shop jetzt"). How-to → "Speicher dir das!" Educational → "Teile das mit jemandem". |
| AI-generated product cans/bottles in scene | "Easier product integration" | AI-generated product packaging looks wrong at close range; damages trust; this is an absolute brand constraint | Real product photo composited into Remotion scene on cream background. Already implemented in `ProductReveal`. |
| Per-reel music licensing | "Professional soundtrack" | Each track needs a license or must be from Instagram's royalty-free library; custom tracks require a production budget; trending audio requires manual monitoring | Option B for v1: use ambient/Foley-only approach. Trending audio can be added manually in the Instagram app after upload — no Remotion-level integration needed. |
| Posting 3-4 reels per day (Buendia volume) | "More posts = more reach" | Buendia is a flooring contractor posting raw phone footage; Le Tonkinois is a premium heritage brand where over-posting degrades brand value and overwhelms the team's review capacity | 3-5 reels/week is the growth-optimized frequency for quality-first accounts (Hootsuite, TrueFuture Media); 1 high-quality reel/day beats 4 mediocre ones for premium brands. |

---

## Feature Dependencies

```
[Channel Style Identity Document]
    └──required by──> [Vernis Product Showcase Reel]
    └──required by──> [Future reel compositions]
    └──required by──> [Style Iteration Framework]

[Remotion Composition Pipeline]  (already exists)
    └──required by──> [Vernis Product Showcase Reel]
    └──enhanced by──> [ASMR Sound Design Layer]
    └──enhanced by──> [Warm Color Grading Rule]

[Asset Catalog]  (already exists)
    └──required by──> [Product Reveal Scene]
    └──required by──> [Real Product Photo Integration]

[Gemini Image Prompts (Vernis-specific)]
    └──required by──> [The Soak Money Shot]
    └──required by──> [50/50 Split Frame]
    └──required by──> [Marine Context Shots]
    └──requires──> [Channel Style Identity Document]  (prompts must match defined style)

[Style Iteration Framework]
    └──requires──> [v1 Reel Output]  (needs something to iterate on)
    └──enhanced by──> [Instagram Trial Reels Feature]
    └──enables──> [Systematically Postable Quality]

[Instagram Trial Reels Feature]  (external, Instagram-native)
    └──independent of──> [Remotion pipeline]
    └──requires──> [1,000+ followers threshold]

[Postable Quality Gate]
    └──requires──> [Correct safe zones]
    └──requires──> [Brand-compliant visual identity]
    └──requires──> [Hook in first 1.5s]
    └──requires──> [Correct duration range]
    └──enhanced by──> [Money shot present]
    └──enhanced by──> [Product reveal scene]
```

### Dependency Notes

- **Channel Style Identity Document must come first:** Gemini Image prompts cannot be written without knowing what visual world the reel lives in. Defines: color temperature, scene context (garden/boat/interior), time of day, Vernis-specific accent colors, and "forbidden" aesthetics.
- **The Soak money shot requires Gemini Image iteration:** The first-attempt macro prompt for oil-into-grain will almost certainly need 2-3 rounds of refinement. This is not a one-shot generation. Build prompt iteration time into the workflow.
- **ASMR sound design is enhancement, not gate:** A reel without sound design can still be postable (ambient + Remotion-internal audio). ASMR foley elevates to premium but is HIGH complexity for v1. Defer to v1.1 unless real recordings are available.
- **Trial Reels require 1,000 followers:** Le Tonkinois Instagram account does not currently exist independently. Trial Reels feature available only after account creation and initial growth. For v1, standard posting with manual performance monitoring is the iteration method.

---

## MVP Definition

### Launch With (v1 — This Milestone: Vernis Product Showcase)

The minimum that makes a reel "postable" — not embarrassing for the brand, not visually amateurish, structurally sound.

- [ ] Channel style identity defined — color temperature, scene context choices, Vernis accent color, list of forbidden aesthetics
- [ ] 3-5 Gemini Image scenes generated to the defined style (with at least 1 money shot attempt: The Soak or 50/50)
- [ ] Remotion composition using validated template (Hook→Vorher/Produkt→Szene→Nachher→Produkt→EndCard)
- [ ] Safe zone compliance verified (top 140px, bottom 380px clear)
- [ ] Scene timing at minimum 3.3s each
- [ ] Max 1-3 words text per scene
- [ ] Real product photo (Vernis can) in ProductReveal scene
- [ ] EndCard with logo + "Seit 1906" + CTA
- [ ] Warm color grading applied to "Nachher" scenes, cool/neutral for "Vorher"
- [ ] Caption written (German, keywords, "Speicher dir das!" CTA, 20-25 hashtag mix)
- [ ] Team review in dashboard — approved before posting

### Add After Validation (v1.x)

Add once v1 reel is posted and performance signal is available.

- [ ] ASMR Foley sound layer — trigger: v1 reel gets good performance but feedback says "audio is missing something"
- [ ] Marine context variant — boat deck shots with Le Tonkinois — trigger: garden showcase is validated, expand to marine niche
- [ ] Loop optimization — end frame matching start frame — trigger: after first iteration data shows watch-time drop-off at end
- [ ] Style A/B variants — two different color grading or hook approaches in same week — trigger: when team has capacity to review 2 reels simultaneously
- [ ] Instagram Trial Reels workflow — trigger: account has 1,000+ followers

### Future Consideration (v2+)

Defer until content pipeline is in regular rhythm.

- [ ] UGC compilation format — requires active user community with tagged content
- [ ] Voiceover narration track — requires voice talent or quality TTS; adds production complexity without proven payoff for this style
- [ ] Split test infrastructure (automated performance comparison) — premature before 10+ reels posted
- [ ] Full ASMR standalone reel (no text, no music, pure audio) — after ASMR foley library is built

---

## Feature Prioritization Matrix

| Feature | User Value (Audience) | Implementation Cost | Priority |
|---------|----------------------|---------------------|----------|
| Channel style identity document | HIGH — foundation for everything | LOW | P1 |
| Gemini Image prompts (Vernis-specific) | HIGH — determines visual quality | LOW-MEDIUM | P1 |
| Money shot: The Soak or 50/50 | HIGH — most viral single element | MEDIUM | P1 |
| Safe zone + timing compliance | HIGH — postability gate | LOW | P1 |
| Brand-compliant visual identity | HIGH — brand trust | LOW | P1 |
| Real product photo in ProductReveal | HIGH — brand constraint | LOW | P1 |
| Warm color grading rule | HIGH — transformation impact | LOW | P1 |
| Caption with SEO + CTA | MEDIUM — discoverability | LOW | P1 |
| ASMR sound design | HIGH — premium feel | HIGH | P2 |
| Loop optimization | MEDIUM — watch time | LOW | P2 |
| Marine context variant | HIGH — niche differentiation | MEDIUM | P2 |
| Instagram Trial Reels workflow | MEDIUM — safer iteration | LOW | P2 |
| Style A/B testing framework | MEDIUM — systematic improvement | LOW | P2 |
| Voiceover narration | LOW — adds friction | HIGH | P3 |
| UGC compilation | HIGH — community trust | HIGH | P3 |

**Priority key:**
- P1: Required for first postable Vernis reel
- P2: Add after v1 is posted and reviewed; enhances quality or iteration speed
- P3: Future consideration; depends on channel growth or new capabilities

---

## Competitor Feature Analysis

What the benchmark accounts do — and how Le Tonkinois can match or surpass.

| Feature | TotalBoat (163K IG) | Rubio Monocoat (16K DE / 245K US) | @earthandflax (9.1K) | Le Tonkinois Approach |
|---------|--------------------|------------------------------------|----------------------|----------------------|
| Hook format | Before/After transformation | UGC repost (handwerker result) | Real hands-on application | Macro money shot (The Soak) OR 50/50 split |
| Product placement | Featured in every video, always visible | Tag in description + occasional end screen | Casual mention, brand feels secondary | Dose in dedicated ProductReveal scene (3.3s), not intrusive |
| Brand voice | Fun, creator-community, US-casual | "One coat solution", community-first | Authentic, educational, US indie | Heritage premium: "Seit 1906, weil es funktioniert" |
| Sound design | Background music | Background music | Ambient + real sounds | Cinematic ambient + foley (v1.x), pure ambient (v1) |
| Color grade | Clean, neutral-bright | Natural, studio-ish | Warm, real-life | Warm golden-hour throughout; Vorher desaturated |
| Marine content | Strong — that's their niche | None | None | Strong differentiator — unoccupied niche in German market |
| Text in video | Minimal labels | Minimal or none | None | 1-3 word labels only; explanation in caption |
| Consistency | Consistent color/format identity | Consistent hashtag+UGC strategy | Inconsistent posting | Define and lock style in Channel Identity Document |

**Key insight:** No competitor does the macro money shot (oil-into-grain slow reveal). TotalBoat is close with varnishing process shots but not macro. This is the open lane for Le Tonkinois visual signature.

---

## "Postable" Quality Gate: What Separates Amateur from Professional

Based on research synthesis, these are the observable differences between a reel that gets posted and one that gets shelved.

### Must-Pass Gates (any fail = not postable)

1. **No logo/product name in first 1.5 seconds** — algorithm skip risk
2. **All text stays in safe zones** — obscured text by Instagram UI = broken reel
3. **No text violates the 1-3 word rule** — busy text signals "ad" to trained skip-reflex
4. **Scene duration never below 3.0 seconds** — strobe effect, loses watch time
5. **Warm color grade on Nachher scenes** — cold Nachher destroys the transformation impact
6. **Real Vernis product photo used** — AI-generated can is disqualifying
7. **EndCard has logo + Seit 1906** — brand closure required
8. **Brand Red #B50606 is present** — without it, the reel has no visual identity

### Quality Enhancers (separate "good" from "great")

9. **Money shot present** (The Soak, 50/50, or Grain Awakening macro) — the single highest-impact frame
10. **Warm/cool contrast between Vorher and Nachher** — perceived transformation is amplified
11. **Ken Burns zoom is subtle** (1.0→1.06 or 1.0→1.08 max) — too much zoom = nausea
12. **Transitions match content rhythm** — Wipe for before/after, Slide for steps, Fade for product/endcard
13. **Caption has 20-25 hashtags** (Tier 1 mega + Tier 2 niche + Tier 3 branded)
14. **Caption includes one CTA** ("Speicher dir das!" or "Link in Bio")
15. **Loop potential** — last frame connects to first or deliberately creates re-watch curiosity

---

## Style Iteration Process

How to systematically move from "first attempt" to "channel style" across multiple reels.

### Phase 1: Define Before Building

Create a Channel Style Identity Document (1-2 pages) that answers:
- What is the primary scene context? (garden / marine / interior / workshop — pick one as "hero" for Vernis)
- What time of day? (golden hour = warm = right; noon = harsh = wrong)
- What is the "Vorher" state? (grey/dry/weathered — specific adjectives for Gemini prompts)
- What is the "Nachher" state? (warm/oiled/glowing — specific adjectives)
- What is Vernis' secondary accent color? (Navy? Gold? Define now, not during rendering)
- What is forbidden? (dark backgrounds, amber tones, "modern craft" aesthetic, stock-look imagery)

### Phase 2: Generate Variants Before Committing

For the Vernis reel, generate at minimum:
- 3 different hook images (The Soak, 50/50, Golden Hour Glow) — test which feels strongest
- 2 Vorher images (different weathering levels) — confirm "realistically worn but not ruined"
- 1 Nachher image with warm grade — confirm the transformation feels significant
- 1 product reveal background color (cream vs white) — test against real product photo

### Phase 3: Assembly in Remotion with Team Review

Assemble in Remotion using validated composition template. Submit to team via Supabase dashboard for review. Star-rating + Pros/Cons generates specific feedback for iteration.

### Phase 4: Iterate on Single Variable at a Time

After team feedback, change ONLY ONE element per iteration:
- Hook image changed? Everything else stays identical.
- Text content changed? Timing and images stay identical.
- Color grade changed? Everything else stays identical.

This is how the feedback → prompt improvement loop from v1.0 produces useful signal. Multiple simultaneous changes make it impossible to know what worked.

### Phase 5: Instagram Trial Reels (Post-Launch, When Available)

Once the account has 1,000+ followers: use Trial Reels to A/B test hooks with non-followers before committing to main feed. Instagram allows up to 20 trial reels/day. Detects duplicate content with different text only — hooks need genuinely different imagery to avoid suppression.

---

## Sources

- [Wood Floor Business: 38 Million Instagram Views (Dony Buendia)](https://www.woodfloorbusiness.com/business/social-media/article/15447867/applying-finish-to-the-tune-of-38million-instagram-views) — HIGH confidence, documented case study
- [Wood Floor Business: Oddly Satisfying Videos Relax Millions (CMC Floors)](https://www.woodfloorbusiness.com/business/social-media/article/15135502/wood-floor-companys-oddly-satisfying-videos-relax-millions) — HIGH confidence, documented case study
- [Rubio Monocoat Digital Brandbook](http://www.rubiomonocoatbrandbook.com/profile/) — MEDIUM confidence, competitor brand strategy
- [Instagram Trial Reels — Official Creator Guide](https://creators.instagram.com/blog/instagram-trial-reels) — HIGH confidence, official Instagram documentation
- [Hootsuite: Instagram Reels for Business 2026](https://blog.hootsuite.com/instagram-reels/) — MEDIUM confidence, industry analysis
- [TrueFuture Media: Instagram Reels Reach 2026](https://www.truefuturemedia.com/articles/instagram-reels-reach-2026-business-growth-guide) — MEDIUM confidence, industry guide
- [Versa Creative: Instagram Reels Marketing 2026 Guide](https://versacreative.com/blog/instagram-reels-marketing-2026-guide/) — MEDIUM confidence, industry guide
- Project research files: competitor-content-research-2026.md, car-detailing-aesthetic-transfer.md, satisfying-wood-finishing-trend.md, instagram-reels-strategy-2026.md — HIGH confidence (multi-source synthesis, validated against real account data)
- Memory files: feedback_reel_design_rules.md, feedback_reel_composition_template.md, feedback_branding_identity.md, project_content_strategy.md — HIGH confidence (validated by iteration with Chris on 2026-03-25)
- POC evidence: research/poc-woodporn/ — 5 generated assets confirming Gemini Image can produce the target visual style

---

*Feature research for: Instagram product showcase reels — Le Tonkinois / Vernis (v1.1 Content Quality Foundation)*
*Researched: 2026-03-28*
