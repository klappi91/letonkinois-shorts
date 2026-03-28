# Pitfalls Research

**Domain:** AI-generated product showcase content pipeline for premium heritage brand (Instagram Reels/Shorts) — v1.1 Content Quality Foundation
**Researched:** 2026-03-28
**Confidence:** HIGH (brand pitfalls from direct v1.0 post-mortem + official Instagram safe zone docs), MEDIUM (Gemini generation pitfalls from official Google docs + community research), MEDIUM (Remotion composition pitfalls from official docs + hands-on prior work)

---

## Critical Pitfalls

### Pitfall 1: Style Definition That Doesn't Transfer — "Looks Great as Reference, Generates Wrong Every Time"

**What goes wrong:**
A style guide is written in natural language ("warm, premium, vintage maritime feeling") and works perfectly as a human creative brief. But when used as Gemini generation prompts, the model interprets "warm" as sepia-toned, "vintage" as desaturated and textured, and "maritime" as blue ocean backgrounds. The generated images look nothing like letonkinois.de — they look like a generic heritage craft Etsy shop. This is the core failure mode of v1.0: the first Remotion design used dark brown (#3E2723) backgrounds and amber (#D4A76A) accents because those *feel* warm and wooden, but the actual Le Tonkinois brand is **red (#B50606) + white (#FFFFFF)**, not brown.

**Why it happens:**
Style guides written for humans use subjective adjectives. AI models assign their own probability-weighted interpretation to every adjective. "Heritage" = sepia tones to most models. "Premium" = dark dramatic lighting. "Authentic" = rough textures. None of these match the Le Tonkinois website, which is clean, white, with a single bold red accent. The model's training distribution for "heritage wood finish brand" skews toward a rustic aesthetic that is the opposite of the actual brand.

**How to avoid:**
1. Define the style guide in **machine-readable terms only**: hex codes, font names, pixel dimensions, explicit shot descriptions
2. Anchor every prompt to a reference image from letonkinois.de or the product catalog — never rely on adjectives alone
3. Create a prompt validation checklist: does the prompt contain `#B50606`, `Playfair Display`, the specific cream `#FFF8F0`? If not, it is incomplete
4. Include explicit **negative descriptors** in every Gemini prompt: `NOT rustic, NOT dark background, NOT brown wood tones, NOT amber accents, NOT sepia-filtered`
5. Test the style guide by generating 5 images and comparing against the website — before building any Remotion composition

**Warning signs:**
- Generated images have warm brown/amber backgrounds instead of white or cream
- Composition uses Lora as the headline font (it is a body/scene-label font, not headline — Playfair Display is the headline font)
- Design feels "craft brewery" or "artisan soap" rather than "French marine heritage"
- Someone says "it looks great, just not like Le Tonkinois"

**Phase to address:** Channel Identity Definition (Phase 1 of v1.1). The style guide must be validated against generated test images before any Composition work begins.

---

### Pitfall 2: AI-Generated Content Looks Like Stock Photography — The "Uncanny Clean" Problem

**What goes wrong:**
Gemini generates photorealistic images that are too perfect to be credible: furniture with no weathering, gardens with no dirt, "before" images that don't look bad enough and "after" images that look like a 3D render. The "before" wood is beautifully gray-weathered in a photogenic way, as if it was styled for a magazine shoot about weathered wood. Real wood that needs treatment looks dull, dusty, slightly dirty — not artistically distressed.

The result: the content reads as AI-generated stock photography, and audiences disengage. As of 2025/2026, users are increasingly able to identify the "AI polish" — everything too smooth, expressions too neutral, scenes too composed. For a brand that lives on authenticity ("Seit 1906, French naval heritage"), this is brand damage, not brand promotion.

**Why it happens:**
Gemini's training skews toward aesthetically pleasing images — it actively suppresses the ugly, mundane reality that makes DIY content believable. Without explicit counter-prompting, it generates aspirational rather than authentic. This is confirmed by the v1.0 Gartenmöbel sequence: the "before" images showed beautifully weathered furniture when they needed to show dull, dusty, slightly neglected furniture.

**How to avoid:**
1. Use the established Gemini Realismus rules in every prompt (documented in `feedback_gemini_image_realismus.md`):
   - "NOT perfectly golden or smooth"
   - "pale, slightly dusty, remaining grey in deeper grain lines"
   - "transition is GRADUAL — zone of fine sawdust, not a sharp line"
2. For "before" images: reference the actual `assets/blog/vorher-verwitterte-gartenmoebel.jpg` — use it as a Gemini reference image
3. Explicitly prohibit "art-directed looking" results: add `photojournalistic realism, NOT styled, NOT magazine shoot`
4. For process shots: describe exactly how a real person holds the tool and moves their body — not "person sanding wood" but "person leaning over the end of the table, both hands flat on orbital sander, working methodically from left to right along the grain"
5. Check finished ergebnis images for stray leaves/debris: Gemini adds "garden atmosphere" with dead leaves even on freshly treated surfaces. Counter with: `table surface is CLEAN, no leaves, no dust, no debris`

**Warning signs:**
- "Before" wood looks artistically weathered / photogenic rather than neglected
- "After" wood looks like a render or glossy magazine photo
- Process images show a person in an unnatural working position
- Garden scenes have leaves on freshly treated furniture

**Phase to address:** Image Generation Pipeline (Phase 2 of v1.1). Establish reference-anchored prompts with explicit realism constraints before generating any sequence intended for posting.

---

### Pitfall 3: Inconsistent Objects Across Scenes — The "Wrong Table in Step 3" Problem

**What goes wrong:**
A How-To Reel shows: Step 1 — sanding a round teak garden table. Step 2 — applying Le Tonkinois to a rectangular pine table. Step 3 — the finished result on what appears to be a different table in a different garden. This destroys the DIY credibility entirely. The audience needs to trust that they are watching the same object being transformed.

The same problem occurs with Before/After: if the camera angle is exactly identical in both images, it looks fake (staged reveal). But if the garden layout is completely different (wrong hedge shape, wrong fence position, wrong chair placement), it also looks fake. The sweet spot — same environment, slightly different angle, slightly different time of day — requires explicit instruction.

**Why it happens:**
Multi-image Gemini generation produces independent samples from the probability distribution. Without scene anchoring, each generation picks the most likely composition for that prompt, not the one that matches the previous image. A "garden table" prompt will generate whatever table the model considers most probable — which changes with temperature and seed.

**How to avoid:**
1. Use JSON-mode prompting for all multi-image sequences (this is a validated approach from `feedback_before_after_realismus.md`): define a single JSON scene description (location, furniture type, surroundings, time of day), then generate each step as a variation of that scene with only the controlled delta (the wood condition or treatment stage) changing
2. Use Gemini's reference image input: generate Step 1, then feed that image as a reference for Step 2 generation with `--strength strong`
3. For Before/After explicitly: same environment, different camera angle (shift 15-30 degrees), different time of day (morning vs. late afternoon light), objects slightly repositioned (chairs not in identical positions)
4. Always start with a scene-locking prompt, not a product-outcome prompt

**Warning signs:**
- Table shape or wood species changes between process steps
- Background vegetation or fence style changes between Before/After
- Camera angle is pixel-perfect identical in Before/After (looks like a Photoshop overlay, not a real transformation)

**Phase to address:** Image Generation Pipeline (Phase 2 of v1.1). Define scene JSON templates before generating any sequence.

---

### Pitfall 4: Remotion Composition Timing Violations — Content Too Fast, Text Unreadable

**What goes wrong:**
A newly built composition plays through correctly in Remotion Studio and renders cleanly, but when watched on an actual phone as an Instagram Reel, text overlays are unreadable because scenes are 2 seconds long instead of 3.5 seconds. The "Vorher" label appears and disappears before the eye finishes reading. The video feels stressful rather than satisfying. This is exactly what happened in v1.0: the first version was described by Chris as "zu schnell, zu viel Text, Text passte nicht zum Bild."

The compounding problem: Remotion Studio preview runs at full resolution on a desktop monitor. Reading speed on a 15-inch monitor is faster than on a 6-inch phone held at arm's length in a noisy environment. What feels readable on the desktop is borderline on mobile.

**How to avoid:**
1. Use the validated timing from `feedback_reel_composition_template.md` as a hard floor, not a guideline:
   - Minimum 3.3s (100 frames at 30fps) for any scene with text
   - Minimum 3.5s (105 frames) for the hook scene
   - Minimum 0.4s (12 frames) for transitions — never shorter
2. Test every new composition on a real phone in portrait orientation before marking as "done" — not only in Remotion Studio
3. The rule for text: maximum 1-3 words per scene in the video. All explanation goes in the Instagram caption. This is a rule from v1.0 post-mortem.
4. Text must always match the image currently shown — never display "after" text while showing a "before" image

**Warning signs:**
- Any scene with text is under 100 frames (3.3 seconds)
- Transitions are under 12 frames
- Video has full sentences instead of 1-3 word labels in overlays
- Hook text describes the process while showing the result, or vice versa

**Phase to address:** Every composition phase. This is a continuous enforcement rule — verify in every phase that builds a Remotion composition.

---

### Pitfall 5: Instagram Safe Zone Violations — UI Elements Covering Critical Content

**What goes wrong:**
A Remotion composition renders beautifully as a 1080x1920 MP4, but when uploaded to Instagram as a Reel, the username handle covers the first line of text, the product name is hidden behind the caption area, and the "Seit 1906" EndCard logo is overlapped by the Like/Comment/Share button column. The video appears broken on the platform it was built for.

Instagram's UI overlay zones for Reels (2026 verified dimensions):
- **Top zone:** ~220px covered by username and action buttons
- **Bottom zone:** ~320px covered by caption, audio track, handle
- **Right column:** ~120px covered by Like, Comment, Share, Meatball menu
- **Central safe zone:** content placement between Y=220px and Y=1600px, avoiding right 120px

**Why it happens:**
Remotion renders to raw video dimensions (1080x1920). The developer positions elements at "looks good in Studio" coordinates without accounting for platform UI overlays. The existing component library has safe zone values from v1.0, but new compositions may place elements outside these zones when extending the library.

**How to avoid:**
1. Enforce the validated safe zone values from `feedback_reel_composition_template.md` in every composition:
   - StepBadge: `top: 140px, right: 60px` (places it just below the top danger zone)
   - SceneLabel: `bottom: 380px, left: 80px` (places it above the caption zone with margin)
2. Do not place any critical text or logo above Y=220px or below Y=1600px
3. Do not place any element right of X=900px (right 120px excluded, plus 60px safety margin)
4. Add a safe-zone overlay component to Remotion Studio preview mode that shows the danger zones as semi-transparent red overlays — visual enforcement during development

**Warning signs:**
- Text positioned using top/bottom percentages rather than fixed pixel values (percentages shift with viewport, fixed pixels are safe zone-aware)
- EndCard logo placed in the bottom 25% of the frame
- StepBadge positioned at the very edge of the frame

**Phase to address:** First composition phase for v1.1 (Kodok Product Showcase). Establish safe zone constants as TypeScript exports in the first composition and import them in all subsequent ones.

---

### Pitfall 6: Branding Entropy — Each New Asset Drifts Slightly Until the Feed Looks Incoherent

**What goes wrong:**
The first composition uses `#B50606` brand red from `colors.ts`. The second composition adds a slightly different red "to match a background image." The third composition uses `font-family: 'Lora'` for a headline because the developer confused Lora (body font) with Playfair Display (headline font). After five compositions, the feed looks like five different brands.

This is not a hypothetical: v1.0 built two compositions (Gartenmöbel + Bootsdeck) that both had to be revised because color and font decisions drifted from the letonkinois.de brand. The explicit correction documented in `feedback_branding_identity.md` is: Dark Brown (#3E2723) → deleted; Amber (#D4A76A) → deleted; Lora as headline → replaced with Playfair Display.

**Why it happens:**
When building compositions in Remotion, it is easy to inline hex values and font strings directly in JSX rather than importing from `colors.ts` and `fonts.ts`. The further a composition is from the original Gartenmöbel template, the more likely the developer is to make local decisions that diverge from the brand system.

**How to avoid:**
1. All color usage must import from `/remotion/src/utils/colors.ts` — zero inline hex values in compositions
2. All font usage must import from `/remotion/src/utils/fonts.ts` — zero inline font-family strings
3. Add a CI check or at minimum a lint rule: grep for hex color codes in `.tsx` files under `remotion/src/compositions/` and fail if any are found
4. Before building any new composition: open `colors.ts`, `fonts.ts`, AND the letonkinois.de website in a browser side-by-side. Verify that the design tokens match the live site
5. Product-specific accent colors (documented in `feedback_branding_identity.md`) are allowed for secondary elements but must not replace the core red+white+Playfair Display framework

**Warning signs:**
- A composition file contains `#` followed by hex digits that are not in `colors.ts`
- Headline text in a composition uses `fontFamily: 'Lora'` (Lora is for scene labels, Playfair Display for headlines)
- Background color in any scene is not Cream (`#FFF8F0`), White (`#FFFFFF`), or a content image
- EndCard background is anything other than white

**Phase to address:** Channel Identity Definition Phase (define and lock design tokens) + every composition phase (enforce via code review and/or lint).

---

### Pitfall 7: Ken Burns Effect — Wrong Easing Makes Motion Look Cheap

**What goes wrong:**
The Ken Burns zoom applied to every ImageScene uses `interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo])` — a linear interpolation. The result is a constant-speed zoom that starts abruptly and stops abruptly. On screen it looks mechanical and budget, like a cheap slideshow. More subtly: if the zoom scale uses `ease-in-out` easing but the pan position uses linear easing (or they are mismatched in any way), the motion creates a slightly nauseous disconnection. This was flagged in professional video circles: "If you have eased position keyframes and linear scale keyframes, your pan & zoom will not look good, especially if it's fast."

**Why it happens:**
Remotion's `interpolate()` uses linear interpolation by default. The `extrapolateConfig` and easing options exist but are not the default. When building a new composition by copying the existing ImageScene template, a developer may not add easing because "the existing compositions don't do it and they look fine" — but the existing compositions use very slow, very subtle zooms (1.0 to 1.06) which are less sensitive to the lack of easing than a more dramatic zoom.

**How to avoid:**
1. Add easing to all `interpolate()` calls in ImageScene: use `Easing.inOut(Easing.cubic)` as the minimum acceptable easing for any zoom or pan
2. If zoom and pan are both animated, they must use **identical easing curves** — mixing ease types on the same motion looks wrong
3. Keep zoom ranges subtle: `zoomFrom: 1.0, zoomTo: 1.06` is the validated range. Going above `1.10` makes the composition feel anxious rather than cinematic
4. Test motion quality specifically by exporting a 10-second test render and watching it on a real phone — the eye catches bad easing much better on the actual delivery medium

**Warning signs:**
- `interpolate(frame, ...)` calls without an `easing:` parameter
- `zoomTo` values above 1.10
- Pan and zoom using different easing curves in the same scene

**Phase to address:** First composition phase. Fix the ImageScene component to use easing by default so all downstream compositions inherit the improvement.

---

### Pitfall 8: Product Can Rule Violation — AI Generates a Can Anyway

**What goes wrong:**
A generation prompt for a "product showcase" scene accidentally describes the product in enough detail that Gemini generates a Le Tonkinois-style can or bottle. The generated can looks convincingly real but has wrong label text, wrong color proportions, or incorrect brand mark. The resulting image is used in a Remotion composition that goes through the pipeline undetected. When posted to Instagram, it presents false brand information and can mislead customers about product appearance or label content.

This constraint is non-negotiable and was explicitly validated from day one: **NIEMALS KI-generierte Produktdosen — immer echte Fotos aus dem Katalog.**

**Why it happens:**
When writing prompts for product showcase content (the Kodok video), it is natural to want to show the product can in context — on a garden table next to the treated wood, for example. The prompt says "Le Tonkinois can on a wooden surface" and Gemini generates a plausible-looking but incorrect can. The developer may not notice the label text is wrong or the proportions are slightly off.

**How to avoid:**
1. Every prompt for scenes that might include a product must explicitly include: `NO product cans, NO bottles, NO product packaging in this image`
2. Product can inclusion is handled exclusively at the Remotion composition layer: the real product photo (from `assets/products/`) is composited as a static image layer on top of the AI-generated background
3. Use the existing `ProductReveal` component pattern: cream background, real product photo imported from the catalog, positioned with explicit pixel coordinates — never as a Gemini-generated element
4. Code review rule: any Remotion composition that shows a product must trace the product image source to `assets/products/` — never to a generated or placeholder image

**Warning signs:**
- A Gemini prompt contains product names (Kodok, Marine N°1, Vernis) without the explicit `NO packaging` exclusion
- A composition imports a product image from anywhere other than `assets/products/`
- Generated images contain any cylinder, tin can, or bottle-shaped object

**Phase to address:** Kodok Product Showcase phase. This rule must be enforced in the composition architecture, not just in prompt writing.

---

### Pitfall 9: Gemini Video Temporal Inconsistency — Object Morphs Mid-Clip

**What goes wrong:**
Gemini Video (Veo-powered) generates a 5-8 second clip where the object being depicted changes gradually mid-clip: a garden chair morphs slightly in shape, a wood grain pattern shifts, a hand gains or loses a finger. For "satisfying" content that lives on visual precision (the "The Soak" shot, the brush stroke), temporal inconsistency destroys the believability and makes the premium brand look technically incompetent.

More practically: when a Gemini Video clip is composited into a Remotion composition, a temporal artifact at frame 45 will be replayed in a loop during review sessions. The artifact becomes a distraction in the dashboard review that no rating system can filter out automatically.

**Why it happens:**
Temporal consistency remains a known limitation of current video generation models, including Veo. Complex interactions, quick motions, and detailed hand work are the highest-risk scenarios. A prompt asking for "hand applying oil with a brush on wood grain" contains three temporal consistency challenges simultaneously: hand anatomy, brush position, and changing wood texture.

**How to avoid:**
1. Use Gemini Video only for **camera motion on static subjects** (slider shot over finished wood, Ken Burns on a scene) — not for active process shots
2. For process shots (applying oil, sanding, brushing), use static AI images with Ken Burns motion in Remotion rather than true Gemini Video
3. When using Gemini Video, request **minimal motion**: slow camera moves, static subject, no hand interaction with objects
4. Always render and review the full clip before compositing — never trust the thumbnail
5. For this project: Gemini Video is best used for the "Golden Hour Glow" type shots (camera slowly slides over finished wood in soft light) — not for the "first brush stroke" money shot (use a real photograph or static AI image for that)

**Warning signs:**
- A Gemini Video prompt describes hand interaction with an object (brush stroke, applying oil, sanding)
- The clip is longer than 5 seconds (consistency degrades with duration)
- Motion in the clip is fast rather than slow and deliberate

**Phase to address:** Technical Pipeline Testing phase (Phase 3 of v1.1). Establish the "Gemini Video = camera motion only" rule before any video clips are composited into final outputs.

---

### Pitfall 10: Style Variants Tested Without a Comparative Framework — "We Tried 5 Things and Can't Remember What We Liked"

**What goes wrong:**
The v1.1 milestone requires testing multiple style variants of the Kodok Product Showcase. Without a defined comparison framework, testing devolves into: generate something, show it to Chris, adjust based on verbal feedback, generate something new, compare vaguely to the previous. After 5 iterations, there is no record of what the first version looked like, what specifically was wrong with version 3, or why version 4 was closer. The team converges on "looks good enough" instead of "satisfies the defined quality bar."

**Why it happens:**
Testing creative variants is inherently subjective. Without a structured approach, each iteration is evaluated against memory of previous iterations (which fades) rather than against defined criteria.

**How to avoid:**
1. Before the first test generation, write down 5-8 specific quality criteria: correct font usage, correct color palette, correct timing, no AI-generated cans, scene consistency, etc.
2. Keep all test variants in the Supabase dashboard with explicit version labels (v1, v2, etc.) — use the existing prompt versioning system for this
3. Each variant evaluation should record which criteria it passes and which it fails — not just a star rating
4. Stop testing when a variant passes all defined criteria — do not iterate further "to see if it can be even better"

**Warning signs:**
- Test variants are stored in the filesystem only, not in the dashboard
- Iteration feedback is "feels warmer" without specifying what changed
- Team can no longer remember what was different between v2 and v3

**Phase to address:** Kodok Product Showcase phase. Write the evaluation criteria before generating the first test image.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline hex colors in compositions instead of importing from `colors.ts` | Faster development | Brand drift — compositions diverge from the brand system over time; every new composition needs a review pass | Never — the import is 1 line |
| Write prompts as free-form natural language instead of structured JSON objects | Feels more natural, faster to write | Inconsistency between scenes in the same sequence; Gemini interpolates ambiguous adjectives differently across generations | Only for single-image exploration; never for multi-image sequences |
| Composite product cans from generated images instead of real product catalog photos | Avoids the complexity of layering real photos on AI backgrounds | Incorrect product representation, legal risk, brand damage | Never — this is an explicit hard constraint |
| Skip easing on Ken Burns zoom interpolations | Fewer lines of code | Mechanical-looking motion that reads as amateur production | Never for final-quality outputs; acceptable for internal drafts only |
| Build Remotion compositions without checking Instagram safe zones | Works in Remotion Studio | Critical content (text, logo, CTA) hidden by Instagram UI when posted | Never — takes 5 minutes to check |
| Use the same Gemini prompt seed for multiple image generations | Faster iteration | All images look too similar; sequence lacks variety in framing and environment | Only for style-matching tests, never for final sequences |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Gemini Image + Remotion | Generating images at 1:1 or 16:9 aspect ratio and cropping in Remotion | Generate all images at **9:16 portrait (1080x1920)** from the start — Gemini generates better compositions when the target aspect ratio is specified in the prompt |
| Gemini Image reference mode | Using a reference image with `--strength strong` for the entire sequence | Use strong reference for environment/scene consistency, but allow medium strength for the subject being treated (wood surface) to permit the transformation to be visible |
| Remotion + real product photos | Importing product images with transparent backgrounds from the catalog that were originally shot on white | Verify that product photos have genuine transparent backgrounds (not white backgrounds that look transparent until composited on a cream background) — use `assets/products/` files and confirm PNG transparency |
| Gemini Video + Remotion compositing | Using a Gemini Video clip as the background for a composition that also has text overlays | Gemini Video motion may conflict with text readability — test every overlay combination at actual Instagram playback speed on a phone before finalizing |
| Multiple style variants in the dashboard | Loading all variants simultaneously in the video grid without visual differentiation | Tag variants with a `variant_label` field so reviewers can immediately identify which version they are watching |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Generating full-resolution 1080x1920 images for all test iterations | Gemini quota consumed rapidly in early style exploration | Use 540x960 (half resolution) for early style tests; only generate at full 1080x1920 for final candidates | From the first test iteration — quota is limited |
| Running Remotion render for every composition iteration instead of using Studio preview | 3-5 minute render cycles slow iteration; long feedback loop | Use Remotion Studio for composition layout and timing; only render to MP4 for final quality checks or when Studio preview is insufficient | Always — render only when Studio preview cannot answer the question |
| Committing all generated AI images to the git repository | Repository size blooms; git operations slow down for everyone | Generated images live in `assets/sequences/` (not committed) or are served from an external store; only curated final images are committed | From the second generation session onward |

---

## Security Mistakes

*These are content pipeline-specific security issues, not general web security. The backend/auth security pitfalls are documented in the v1.0 PITFALLS.md.*

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing raw Gemini API prompts in dashboard metadata accessible without auth | Competitors can reverse-engineer the exact prompt strategy — the complete differentiation for this project | Prompts stored in the `prompt_versions` table must be behind Supabase RLS; reading prompts requires authenticated reviewer role |
| Using Gemini-generated product images without human review in an automated pipeline | An incorrect can label or hallucinated product detail goes live on Instagram | Every generated image that appears in a video must pass human review in the dashboard before `status = 'approved'` — the approval gate is the quality control |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing all style variants in the dashboard without labeling which is the "current baseline" | Reviewers don't know which version is the reference point; feedback is applied to the wrong variant | Mark one variant as the current baseline with a visual badge; new variants are compared against it |
| Displaying generated Reels at 16:9 in the dashboard gallery | The 9:16 portrait video appears letterboxed and unreadable; safe zone issues invisible in this format | Display all Reel thumbnails and players at 9:16 aspect ratio; use a phone-frame mockup for the player |
| Not showing Instagram caption alongside the video in the review view | Reviewers evaluate the video in isolation; caption is a critical part of the content package | The video detail page must show the full caption text, hashtags, and call-to-action alongside the player |
| Star ratings without a quality rubric | Five reviewers rate the same video 1-5 stars based on completely different criteria | Provide a visible quality checklist (brand compliance, timing, text readability, scene consistency) so all reviewers use the same frame of reference |

---

## "Looks Done But Isn't" Checklist

- [ ] **Brand compliance:** All hex colors in the composition trace back to `colors.ts` — zero inline hex values in any `.tsx` composition file
- [ ] **Font usage:** Headlines use Playfair Display, scene labels use Lora, body/badge text uses Lato — verify by searching for font strings in composition files
- [ ] **Safe zones:** All text, logos, and CTAs positioned within verified Instagram safe zone bounds (top > 220px, bottom < 1600px, left > 60px, right < 960px)
- [ ] **Product can rule:** Every product appearance in every composition traces to a file in `assets/products/` — no AI-generated product images anywhere in the pipeline
- [ ] **Scene consistency:** All images in a multi-image sequence were generated with the same scene JSON object as base — verified by checking the prompt version linked to each image
- [ ] **Timing floor:** Every scene with text is >= 100 frames (3.3 seconds at 30fps) — verify by checking `durationInFrames` of each scene segment
- [ ] **Easing applied:** All `interpolate()` calls for zoom/pan include an `easing:` parameter — search composition files for bare `interpolate(frame` calls
- [ ] **Mobile test done:** Composition exported as MP4 and watched on a real phone in portrait orientation — desktop-only review is not sufficient
- [ ] **Gemini Video scope:** Any Gemini Video clips used in the composition show camera motion on static subjects only — no hand interaction or active process shots
- [ ] **Before/After realism:** "Before" image shows 2-3 summer outdoor wear without being artistically distressed; "After" image has no leaves or debris on treated surfaces

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Entire style definition needs to be rebuilt after first composition reveals it doesn't match the brand | HIGH | Stop all composition work; fix the style guide (hex codes, fonts, layout rules); regenerate all test images; do not try to fix individual compositions — rebuild from corrected style guide |
| Generated sequence has scene inconsistency (wrong table in step 3) | MEDIUM | Regenerate only the inconsistent image using the correct scene JSON; do not regenerate the whole sequence; verify the replacement matches camera angle and time of day of adjacent images |
| Compositions deployed to dashboard have safe zone violations | LOW | Fix the pixel positions in the affected compositions; re-render and re-upload; add the safe zone constants to a shared TypeScript file to prevent recurrence |
| An AI-generated product can made it into a posted video | HIGH | Delete the post immediately; identify which prompt lacked the `NO product packaging` exclusion; add the exclusion to all existing prompts; human-review all queued generated content before re-publishing |
| Gemini API quota exhausted mid-generation-sequence | MEDIUM | Resume generation from the last successful image using the same scene JSON to ensure consistency; do not start the sequence over |
| Ken Burns motion looks amateur on a completed composition | LOW | Add easing to the `interpolate()` calls in `ImageScene.tsx`; re-render affected compositions; this is a 15-minute fix once easing is understood |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Style definition doesn't transfer to AI generation | Phase: Channel Identity Definition | Generate 5 test images using style guide rules; compare against letonkinois.de — if more than 1 color or font is wrong, the style guide is incomplete |
| AI content looks like stock photography | Phase: Image Generation Pipeline | Show "before" images to someone unfamiliar with the project; if they say "that looks professionally staged", the realism is wrong |
| Scene inconsistency across multi-image sequences | Phase: Image Generation Pipeline | Number all images in a sequence; describe the object in each — if table shape or environment changes, reject and regenerate |
| Composition timing violations | Every composition phase | Check `durationInFrames` of every text-bearing scene programmatically — no scene under 100 frames |
| Instagram safe zone violations | Every composition phase | Export a 1-frame PNG from each scene; overlay the known Instagram danger zones; confirm nothing critical is covered |
| Branding entropy / color drift | Every composition phase | Search composition `.tsx` files for `#` characters not in a comment; any hit is a violation |
| Ken Burns easing missing | Every composition phase | Search composition files for `interpolate(` without adjacent `easing:`; any hit needs easing added |
| Product can rule violated | Every composition phase | Audit every image source in the composition; anything not from `assets/products/` is a violation |
| Gemini Video temporal inconsistency | Technical Pipeline Testing phase | Watch every Gemini Video clip at 0.5x speed before compositing; flag any frame where the subject changes shape or texture |
| Style variant testing without framework | Kodok Product Showcase phase | Confirm evaluation criteria are written down before the first test generation is requested |

---

## Sources

- [feedback_branding_identity.md] — Direct v1.0 post-mortem: design rejected because of dark brown backgrounds and wrong fonts. HIGH confidence (observed failure)
- [feedback_reel_design_rules.md] — Direct v1.0 post-mortem: timing and text violations in first composition. HIGH confidence (observed failure)
- [feedback_reel_composition_template.md] — Validated composition template from v1.0 iterations. HIGH confidence (tested and accepted)
- [feedback_gemini_image_realismus.md] — Direct experience from Gartenmöbel sequence generation. HIGH confidence (observed behavior)
- [feedback_before_after_realismus.md] — Validated rules for before/after realism and JSON-mode prompting. HIGH confidence (observed failure + correction)
- [Google Developers Blog: How to prompt Gemini 2.5 Flash Image Generation](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/) — Reference images, consistency techniques, negative prompts. MEDIUM confidence (official Google docs)
- [Google Developers Blog: Gemini 2.5 Flash Image Generation introduction](https://developers.googleblog.com/introducing-gemini-2-5-flash-image/) — Object/character consistency across multiple images. MEDIUM confidence (official Google docs)
- [Instagram Reels Safe Zone Guide 2026 — kreatli.com](https://kreatli.com/guides/instagram-reels-safe-zone) — Specific pixel dimensions for danger zones. MEDIUM confidence (multiple consistent sources)
- [Social Media Safe Zones 2026 — postplanify.com](https://postplanify.com/blog/social-media-safe-zones-2026-complete-guide) — Safe zone dimensions verified against multiple 2026 sources. MEDIUM confidence
- [Cloudinary Ken Burns Effect Guide](https://cloudinary.com/guides/image-effects/ken-burns-effect-complete-guide-and-how-to-apply-it) — Easing requirements for professional-looking pan/zoom. MEDIUM confidence (multiple video production sources agree)
- [ProVideo Coalition: Next Level Ken Burns Effects](https://www.provideocoalition.com/next-level-ken-burns-effects-in-final-cut-pro/) — Mismatched easing causes poor motion quality. MEDIUM confidence
- [Gemini + Veo temporal consistency analysis — DEV Community](https://dev.to/jubinsoni/gemini-veo-a-deep-dive-into-googles-high-fidelity-video-generation-pipeline-78m) — Known temporal consistency limitations for hand interaction and complex motion. MEDIUM confidence
- [AI-generated content "stock photo" aesthetic problem — PetaPixel 2025](https://petapixel.com/2025/01/23/designers-complain-ai-is-making-stock-photo-websites-unusable/) — Audience recognition of AI-polish aesthetic. MEDIUM confidence
- [car-detailing-aesthetic-transfer.md] — Money shot definitions, ASMR sound strategy, "Wood Porn" shot catalog. HIGH confidence (internal research validated against viral content analysis)

---
*Pitfalls research for: AI-generated product showcase content pipeline — Le Tonkinois Instagram Reels & Shorts (v1.1 Content Quality Foundation)*
*Researched: 2026-03-28*
