# Stack Research

**Domain:** Instagram-quality Product Showcase Reels — new capabilities for Content Quality Foundation (v1.1)
**Researched:** 2026-03-28
**Confidence:** HIGH (Remotion packages verified via npmjs.com; image processing verified via official docs; architecture reasoning MEDIUM for pipeline orchestration)

---

> **Scope note:** This document covers ONLY new capabilities needed for v1.1. The following are already validated and must NOT be re-added:
> Next.js 16, React 19, TypeScript, Tailwind CSS v4, Remotion 4.0.261 (core, cli, google-fonts, player, transitions), Supabase Auth+DB, Vercel, Gemini Image skill, Gemini Video skill, Remotion Best Practices skill.

---

## Recommended Stack

### Core Technologies — New Additions

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @remotion/noise | 4.0.x (match current) | Organic animation movement — floating particles, grain textures, subtle camera-shake feel | Provides `noise2D()`, `noise3D()` for smooth pseudo-random values. Replaces `Math.random()` (which recomputes every frame) with deterministic, temporally coherent movement. Essential for premium organic feel. |
| @remotion/shapes | 4.0.x (match current) | SVG shape primitives — geometric wipes, reveal masks, product frame elements | Triangle, Star, Pie, Circle as React components. Dependency-free, animatable. Use for custom wipe masks and branded graphic elements without external SVG files. |
| @remotion/lottie | 4.0.x (match current) | Import After Effects animations — checkmarks, arrows, product highlight loops | LottieFiles.com has 400K+ free animations (MIT-licensed). Critical for adding professional motion elements (e.g., a "sparkle" appear on product reveal) without building everything from scratch. |
| @remotion/three | 4.0.x (match current) | 3D product scene rendering — can-rotation, depth effects, glb model playback | Wraps React Three Fiber with Remotion's `useCurrentFrame()`. Enables building a 3D rotating Vernis can scene. Requires `renderer: 'angle'` in `renderMedia()` config. Use ThreeCanvas component. |
| sharp | 0.34.5 | Pre-process real product photos — resize to 9:16 safe zone, convert to WebP, composite backgrounds | The fastest Node.js image processor (libvips). Handles compositing a product PNG onto a generated background before feeding into Remotion. Required because Remotion can't resize/convert images before render. |

---

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @remotion/captions | 4.0.x (match current) | Word-level animated captions — for how-to and educational reels | Use when compositions need synchronized burned-in text. Pairs with @remotion/install-whisper-cpp if voiceover is added later. Not needed for pure visual Product Showcase reels. |
| @remotion/media-utils | 4.0.x (match current) | Audio waveform data for audio-reactive animations | Use when adding background music sync. `useAudioData()` returns per-frame frequency data. Enables beat-synced cuts. Defer until audio pipeline is built. |
| fluent-ffmpeg | 2.1.3 | Post-process rendered MP4 — apply LUT-based warm color grade, normalize audio | FFmpeg wrapper for Node.js. After Remotion renders the base MP4, apply a warm golden LUT (`.cube` file) via `colortemperature` and `curves` filters to achieve the "golden hour" look defined in research. Not in the render path — runs as a post-process step. |
| @splinetools/r3f-spline | latest | Import Spline 3D scenes into @remotion/three compositions | Only install if using Spline for 3D design. Spline free tier allows 3 exports/month — sufficient for a single Vernis can model. Labeled experimental in Remotion docs. |

---

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| remotion upgrade | Keep all @remotion/* packages in sync | Run `cd remotion && npx remotion upgrade` — ALL @remotion packages MUST share the same exact version. Never use `^` prefix on Remotion packages. Current project is at 4.0.261 but latest is 4.0.441 — upgrade before adding new packages. |
| LottieFiles.com | Free Lottie animation source | Filter by "Free", license: "LottieFiles Free License" (allows commercial use). Download as `.lottie` or `.json`. Categories: "Product Marketing", "Product Promotion" have relevant animations. |
| Spline (spline.design) | 3D web-first design tool | Design Vernis can model in browser, export as react-three-fiber code. Free tier: 3 scene exports/month. Export: Code (Experimental) → react-three-fiber. Remove `OrthographicCamera` from exported code for Remotion. |
| ffmpeg (system) | Required by fluent-ffmpeg | Must be installed on render machine (`brew install ffmpeg` or `apt install ffmpeg`). Not available in Vercel Functions — post-processing runs locally only. |

---

## Installation

```bash
# In remotion/ directory — add to Remotion project
# IMPORTANT: First upgrade all existing packages to latest, then add new ones at same version
cd remotion

# Step 1: Upgrade existing packages to latest
npx remotion upgrade

# Step 2: Install new Remotion packages AT THE SAME version as after upgrade
# (Check version with: cat node_modules/remotion/package.json | grep '"version"')
npm install @remotion/noise@4.0.441 @remotion/shapes@4.0.441 @remotion/lottie@4.0.441 @remotion/three@4.0.441

# Step 3: Install Three.js peer dependency for @remotion/three
npm install three @types/three

# Optional: Captions (defer until audio pipeline needed)
npm install @remotion/captions@4.0.441

# Optional: Spline integration (only if using Spline for 3D)
npm install @splinetools/r3f-spline


# In the repo root (outside remotion/) — image processing and video post-processing
cd /home/chris/projects/letonkinois-shorts

# Image pre-processing (product photo compositing)
npm install sharp

# Video post-processing (color grading)
npm install fluent-ffmpeg
npm install -D @types/fluent-ffmpeg
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| @remotion/three + ThreeCanvas | Three.js directly without wrapper | Never for Remotion — ThreeCanvas is required to sync with `useCurrentFrame()`. Raw Three.js will not respect Remotion's timeline. |
| @remotion/lottie | Custom SVG animations in React | Use custom if you need brand-specific micro-animations not available on LottieFiles. Custom has more control but takes 10x longer to build. |
| sharp (Node.js) | Canvas API / Jimp | sharp is 4-5x faster than Jimp and supports proper compositing. Jimp has no libvips dependency which is simpler to install, but its quality/performance is worse for product photography compositing. |
| fluent-ffmpeg LUT post-process | CSS filter in Remotion (`filter: sepia(0.3) saturate(1.4)`) | CSS filters are fine for subtle warm tones. Use CSS approach first — it renders inside Remotion without external tools. Only reach for fluent-ffmpeg LUT when you need cinema-grade color grading that CSS filters cannot replicate. |
| remove.bg API | Gemini image inpainting, local rembg Python | remove.bg: $0.18/image, clean results, no setup. Gemini inpainting: slower, less precise for product photography. Local rembg: free but requires Python env setup. remove.bg is best for batch product photo cleanup at low cost. |
| @remotion/noise | Math.random() with seeding | Math.random() is not deterministic across frames — same frame will render differently on re-render. @remotion/noise gives the same value every time for the same frame number (required for Remotion's scrubbing). |
| Spline | Blender + GLTF export | Blender produces better quality GLTF models. Use Blender if you have 3D modeling skills or can hire a modeler. Spline is faster for simple product mockups. Spline export to R3F is experimental. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Framer Motion | Not compatible with Remotion's timeline model — animations run on real time, not frame-by-frame | Remotion's built-in `spring()` and `interpolate()` functions |
| react-spring | Same issue as Framer Motion — real-time not frame-based | Remotion's `spring()` |
| Matter.js physics | Physics engines run in real-time, not deterministically by frame number | Pre-calculate physics trajectories into keyframes and use `interpolate()` |
| GIF output for Instagram | GIF is 256 colors, huge file size, no audio, rejected by Instagram API | Render to MP4 via Remotion CLI |
| @remotion/lambda | Serverless Lambda rendering — adds cost, complexity, and AWS account requirement | Local machine rendering is free and already working. Lambda only if scaling to 10+ videos/day |
| Framer / Webflow exports | HTML-based animation not renderable to video by Remotion | Build animations directly in Remotion React components |
| AI-generated product bottles/cans | Constraint from PROJECT.md: "NIEMALS KI-generierte Dosen/Flaschen" | Always use real product photos from assets/products/ catalog |

---

## Stack Patterns by Variant

**For the Vernis Product Showcase composition (primary v1.1 deliverable):**
- Use @remotion/three for a slowly rotating 3D can scene (if 3D model available)
- OR use sharp to composite the real Vernis product photo onto a Gemini-generated warm background scene
- Apply CSS filter warm grade: `filter: sepia(0.2) saturate(1.3) hue-rotate(-5deg) brightness(1.05)` on ImageScene wrapper
- Use @remotion/noise for subtle camera drift (noise2D on translateX/Y, amplitude: 3-5px)
- Use @remotion/shapes for geometric reveal masks (circle iris reveal from center)
- End with existing EndCard component

**For educational/how-to reels (text-heavy):**
- Pure Remotion — existing components + Tailwind
- No new packages needed
- Use @remotion/transitions: clockWipe() or wipe() between step scenes
- CSS color grade in ImageScene wrapper

**For before/after transformation reels:**
- sharp to pre-crop/composite before+after image pair
- Wipe transition (horizontal) using @remotion/transitions wipe()
- @remotion/noise for subtle horizontal scan line on the wipe reveal (premium feel)

**For audio-reactive reels (future):**
- Add @remotion/media-utils when audio track pipeline exists
- Pair with @remotion/captions for burned-in word captions
- Defer to v1.2+

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @remotion/noise@4.0.x | remotion@4.0.x, React 19 | Must match exact Remotion version. Run `npx remotion versions` to verify alignment. |
| @remotion/shapes@4.0.x | remotion@4.0.x | Same version lock rule. |
| @remotion/lottie@4.0.x | remotion@4.0.x | Same version lock rule. |
| @remotion/three@4.0.x | remotion@4.0.x, three@^0.170.0 | three is a peer dep — install separately. |
| sharp@0.34.5 | Node.js >=18.17.0 (verified) | Uses libvips binary. Vercel does NOT support sharp in Edge Runtime — only in Node.js API routes or local scripts. |
| fluent-ffmpeg@2.1.3 | System ffmpeg (any version >=4.x) | Requires system ffmpeg binary — not available in Vercel. Local/VPS only. |
| @remotion/three + Spline | @splinetools/r3f-spline@latest | Remove OrthographicCamera from Spline export. Use `renderer: 'angle'` in renderMedia config. |

**Critical version rule for Remotion:**

All @remotion/* packages MUST be at the same exact version. The current project uses 4.0.261 but npm latest is 4.0.441. Before adding any new @remotion packages, upgrade all existing ones first:

```bash
cd remotion && npx remotion upgrade
```

Then install new packages at the post-upgrade version number. NEVER mix versions.

---

## Color Grading Strategy (CSS-first, ffmpeg-optional)

Based on the research findings (golden hour, warm honey tones, "before = cool/grey, after = warm/golden"):

**Tier 1 — CSS filters inside Remotion (zero dependencies, renders in composition):**

```tsx
// In ImageScene.tsx wrapper — apply to "after" scenes
// "After" scenes: warm, golden
<AbsoluteFill style={{
  filter: 'sepia(0.2) saturate(1.35) hue-rotate(-8deg) brightness(1.08)'
}}>

// "Before" scenes: cool, desaturated
<AbsoluteFill style={{
  filter: 'saturate(0.6) brightness(0.92) hue-rotate(15deg)'
}}>
```

**Tier 2 — ffmpeg LUT post-processing (only if CSS tier is insufficient):**

Apply a `.cube` LUT file after Remotion renders the base MP4. This allows cinema-grade warm grading without rebuilding the composition. The LUT approach is non-destructive and reversible.

```bash
ffmpeg -i out/vernis-showcase.mp4 \
  -vf "lut3d=warm-golden.cube,colortemperature=temperature=5800" \
  out/vernis-showcase-graded.mp4
```

Recommendation: Start with CSS tier. Only add fluent-ffmpeg post-processing if the CSS approach feels insufficient after testing.

---

## Background Removal for Product Photos

Real Vernis product photos may need background removal before compositing onto Gemini-generated scenes.

**Best option: remove.bg API**
- $0.18 per full-res image (50 free/month for testing)
- Node.js wrapper available (`remove.bg` npm package)
- Clean, ML-based cutouts optimized for product photography
- One-time preprocessing step — results cached in assets/products/

**Setup:**
```bash
npm install remove.bg
# Set REMOVE_BG_API_KEY env var
```

**Alternative (free, local): rembg Python CLI**
- `pip install rembg && rembg i input.png output.png`
- No API cost, runs locally
- Requires Python 3.8+ environment
- Quality is good but slightly below remove.bg for complex backgrounds

For v1.1 (single Vernis showcase), the free tier of remove.bg (50 images/month) is sufficient. No install cost.

---

## Sources

- [npmjs.com/package/remotion](https://www.npmjs.com/package/remotion) — latest version 4.0.441 verified 2026-03-28 — HIGH confidence
- [npmjs.com/package/@remotion/media-utils](https://www.npmjs.com/package/@remotion/media-utils) — version 4.0.381 verified — HIGH confidence
- [remotion.dev/docs/third-party](https://www.remotion.dev/docs/third-party) — official @remotion package list — HIGH confidence
- [remotion.dev/docs/spline](https://www.remotion.dev/docs/spline) — Spline integration docs, experimental export — HIGH confidence
- [remotion.dev/docs/three](https://www.remotion.dev/docs/three) — ThreeCanvas API, renderer config — HIGH confidence
- [remotion.dev/docs/transitions/](https://www.remotion.dev/docs/transitions/) — transition types: fade, slide, wipe, flip, clockWipe, iris — HIGH confidence
- [remotion.dev/docs/noise](https://www.remotion.dev/docs/noise) — noise2D/noise3D deterministic frame API — HIGH confidence
- [remotion.dev/docs/captions/api](https://www.remotion.dev/docs/captions/api) — @remotion/captions word-level API — HIGH confidence
- [remotion.dev/docs/install-whisper-cpp/](https://www.remotion.dev/docs/install-whisper-cpp/) — @remotion/install-whisper-cpp transcription — HIGH confidence
- [sharp.pixelplumbing.com](https://sharp.pixelplumbing.com/) — sharp 0.34.5 image processing — HIGH confidence
- [npmjs.com/package/sharp](https://www.npmjs.com/package/sharp) — version 0.34.5, Node.js >=18.17.0 — HIGH confidence
- [remove.bg/api](https://www.remove.bg/api) — pricing $0.18/image, 50 free/month — HIGH confidence
- [github.com/fluent-ffmpeg/node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) — fluent-ffmpeg 2.1.3 Node.js wrapper — HIGH confidence
- [github.com/Maartenlouis/remotion-ads](https://github.com/Maartenlouis/remotion-ads) — remotion-ads Claude Code skill for Instagram Reels — MEDIUM confidence (community skill)
- Research doc: `research/car-detailing-aesthetic-transfer.md` — color grading strategy, warm golden grade — HIGH confidence (internal)
- Research doc: `research/instagram-reels-strategy-2026.md` — format specs, transition techniques — MEDIUM confidence (WebSearch aggregated)

---

*Stack research for: Le Tonkinois Shorts v1.1 — Instagram-grade Product Showcase new capabilities*
*Researched: 2026-03-28*
