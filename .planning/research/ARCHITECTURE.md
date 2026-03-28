# Architecture Research

**Domain:** Video content pipeline — style testing, variant composition, 3D model integration for Instagram Shorts (Le Tonkinois v1.1 Content Quality Foundation)
**Researched:** 2026-03-28
**Confidence:** HIGH (Remotion composition patterns, existing codebase analysis), MEDIUM (3D model integration specifics, image processing pipeline)

---

## Context: What Existing and New Architectures Must Solve

The v1.0 foundation is complete: Next.js dashboard + Supabase (auth, feedback, prompt_versions) + dual Remotion monorepo. Two existing compositions (`GartenmobelRenovation`, `BootDeckRenovation`) prove the pipeline works.

v1.1 adds a fundamentally different concern: **content quality exploration**. Instead of generating one video per type, the team needs to test multiple approaches against each other — different visual styles, different scene compositions, different asset types (real photos vs. Gemini AI vs. 3D renders) — and compare results before committing to a style.

The architectural question is: **how does a "test multiple variants and pick the best" workflow fit inside the existing Remotion + Next.js + Supabase system without creating chaos?**

---

## System Overview

### Existing Architecture (v1.0 — Do Not Change)

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js Dashboard (src/)                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Gallery /   │  │  Video       │  │  Asset Browser   │   │
│  │  page.tsx    │  │  [id]/       │  │  /assets         │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘   │
│         │ (reads)          │ (reads + writes feedback)        │
├─────────▼──────────────────▼─────────────────────────────────┤
│  Supabase                                                     │
│  videos | feedback | prompt_versions                         │
├──────────────────────────────────────────────────────────────┤
│  Remotion (remotion/) — separate npm project                 │
│  compositions/                                               │
│  ├── GartenmobelRenovation.tsx  (Hook→Vorher→Steps→EndCard)  │
│  └── BootDeckRenovation.tsx     (same structure, diff assets) │
│  components/                                                  │
│  ├── ImageScene.tsx   (Ken Burns zoom + gradient overlay)    │
│  ├── StepBadge.tsx    (1/3 counter, brand red)               │
│  ├── SceneLabel.tsx   (1-3 word overlay, fade-in)            │
│  ├── ProductReveal.tsx (dose on cream, slide-up)             │
│  └── EndCard.tsx      (logo + "Seit 1906" + CTA)             │
│  utils/                                                       │
│  ├── colors.ts        (brand tokens as JS object)            │
│  └── fonts.ts         (Playfair, Lora, Lato via @remotion/google-fonts) │
└──────────────────────────────────────────────────────────────┘
```

### New Architecture (v1.1 additions)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Next.js Dashboard (src/) — Unchanged except variant display        │
│  Existing pages unchanged. Variants visible in gallery via          │
│  video_group_id filter or new /variants/[group] page (optional).    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Remotion (remotion/) — Extended, not replaced                       │
│                                                                      │
│  Root.tsx  — Now uses <Folder> to group variants                    │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  <Folder name="showcase-vernis">                            │     │
│  │    StyleA-FilmNoir      (dark moodboard, dramatic shadows) │     │
│  │    StyleB-GoldenHour    (warm light, outdoor Vorstadt)     │     │
│  │    StyleC-CleanStudio   (white BG, product-first)          │     │
│  │  </Folder>                                                 │     │
│  │  <Folder name="pipeline-tests">                            │     │
│  │    Test-RealPhoto       (assets from /assets/blog/)        │     │
│  │    Test-GeminiImage     (AI generated scenes)              │     │
│  │    Test-3DModel         (Three.js product model)           │     │
│  │    Test-VideoSequence   (Gemini Video clips composited)    │     │
│  │  </Folder>                                                 │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  compositions/                                                       │
│  ├── (existing: Gartenmoebel, BootDeck — unchanged)                 │
│  ├── ProductShowcase.tsx      NEW — parametrized showcase composition  │
│  ├── ProductStyle[A/B/C].tsx  NEW — style variant wrappers            │
│  └── ThreeDModelTest.tsx    NEW — @remotion/three integration test  │
│                                                                      │
│  components/                                                         │
│  ├── (existing: ImageScene, StepBadge, SceneLabel, ProductReveal,   │
│  │    EndCard — unchanged or minimally extended)                    │
│  ├── HookText.tsx           NEW — parametrized hook typography      │
│  ├── SoakScene.tsx          NEW — "The Soak" money shot component   │
│  ├── FiftyFiftySplit.tsx    NEW — 50/50 treated/untreated reveal    │
│  ├── WoodMacroOverlay.tsx   NEW — macro-zoom effect overlay         │
│  └── ThreeProductModel.tsx  NEW — @remotion/three 3D product render │
│                                                                      │
│  styles/                                                             │
│  ├── film-noir.ts           NEW — dark palette, high contrast       │
│  ├── golden-hour.ts         NEW — warm palette, outdoor light       │
│  └── clean-studio.ts        NEW — white BG, clean product focus     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Image Processing Pipeline (scripts/) — NEW                         │
│  Node.js scripts that run BEFORE Remotion render                    │
│  ├── generate-gemini-scene.ts    Gemini Image API → assets/scenes/  │
│  ├── generate-gemini-video.ts    Gemini Video API → assets/sequences/│
│  └── render-variant.sh           Orchestrates multi-variant render  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Supabase — No schema changes for v1.1                              │
│  Variant videos stored as individual rows in videos table.          │
│  Variants linked via: title prefix ("Vernis StyleA") or            │
│  a new video_group text column (optional, low-cost addition).       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Recommended Project Structure

### Remotion additions

```
remotion/src/
├── index.ts                          # registerRoot — add Folder groupings
├── Root.tsx                          # <Folder> groups for variants + tests
├── utils/
│   ├── colors.ts                     # UNCHANGED
│   ├── fonts.ts                      # UNCHANGED
│   └── styles/                       # NEW — style preset system
│       ├── types.ts                  # StylePreset interface
│       ├── film-noir.ts              # Dark dramatic palette
│       ├── golden-hour.ts            # Warm outdoor palette
│       └── clean-studio.ts          # White background palette
├── components/
│   ├── ImageScene.tsx                # UNCHANGED (accept style prop optionally)
│   ├── StepBadge.tsx                 # UNCHANGED
│   ├── SceneLabel.tsx                # UNCHANGED
│   ├── ProductReveal.tsx             # UNCHANGED
│   ├── EndCard.tsx                   # UNCHANGED
│   ├── HookText.tsx                  # NEW — large headline text component
│   ├── SoakScene.tsx                 # NEW — oil-soak close-up money shot
│   ├── FiftyFiftySplit.tsx           # NEW — split-screen reveal
│   └── ThreeProductModel.tsx         # NEW — 3D can model via @remotion/three
└── compositions/
    ├── GartenmobelRenovation.tsx     # UNCHANGED
    ├── BootDeckRenovation.tsx        # UNCHANGED
    ├── ProductShowcase.tsx             # NEW — base parametrized showcase
    ├── ProductStyleA.tsx               # NEW — Film Noir wrapper
    ├── ProductStyleB.tsx               # NEW — Golden Hour wrapper
    ├── ProductStyleC.tsx               # NEW — Clean Studio wrapper
    └── PipelineTest/
        ├── TestRealPhoto.tsx         # NEW — test with real catalog photos
        ├── TestGeminiImage.tsx       # NEW — test with AI scenes
        ├── TestGeminiVideo.tsx       # NEW — test with AI video clips
        └── TestThreeDModel.tsx       # NEW — test with 3D model render
```

### Next.js additions (minimal — dashboard serves as review tool)

```
src/
├── app/
│   ├── page.tsx                      # Gallery (unchanged, shows variants in feed)
│   └── video/[id]/page.tsx           # Detail (unchanged, feedback works on variants)
└── (no structural changes needed for v1.1)
```

### Scripts (root level — new)

```
scripts/
├── generate-gemini-scene.ts          # Call Gemini Image API, save PNG to assets/
├── generate-gemini-video.ts          # Call Gemini Video API, save to assets/sequences/
├── render-variants.sh                # Loop over variant IDs, call remotion render each
└── seed-variant-videos.ts            # Insert rendered variant rows to Supabase
```

### Structure Rationale

- **`remotion/src/utils/styles/`:** The style preset system is a thin abstraction — a TypeScript object with palette values, gradient strings, and typography scale. No framework. Each style file exports a `StylePreset` that compositions spread into their components. This keeps components generic and style swapping to a single import change.
- **`ProductShowcase.tsx` + style wrappers:** The base composition is parametrized with a `StylePreset` prop. Each style wrapper (`ProductStyleA`, `ProductStyleB`, `ProductStyleC`) is a thin wrapper that imports the base and provides a specific style preset as `defaultProps`. This means one composition to maintain, three to render and compare.
- **`compositions/PipelineTest/`:** Pipeline tests are not permanent — they are exploration compositions that can be deleted after the best pipeline is identified. Grouping them under a subfolder keeps the Root.tsx clean.
- **`scripts/`:** Image generation scripts live at the monorepo root, not inside either app. They are orchestration scripts run locally or via GitHub Actions, not part of the Next.js or Remotion build.

---

## Architectural Patterns

### Pattern 1: Style Preset System

**What:** A `StylePreset` TypeScript interface captures all visual variation points between style variants. Compositions accept a `style` prop of this type. Individual style files (`film-noir.ts`, `golden-hour.ts`, `clean-studio.ts`) export constants that satisfy this interface.

**When to use:** When the same composition structure should render in 3+ distinct visual styles that differ only in colors, gradients, typography scale, and overlay strengths.

**Trade-offs:** Pro: single composition to maintain, style differences are explicit and auditable. Con: requires identifying all variation points upfront; some style differences may require different JSX structure, not just different values.

**Example:**
```typescript
// remotion/src/utils/styles/types.ts
export interface StylePreset {
  id: string;
  background: string;           // CSS color or gradient
  hookTextColor: string;
  hookFontSize: number;
  labelColor: string;
  gradientStrength: number;     // 0-1, passed to ImageScene
  overlayOpacity: number;
  accentColor: string;          // For badges, dividers
}

// remotion/src/utils/styles/golden-hour.ts
import type { StylePreset } from "./types";
export const goldenHour: StylePreset = {
  id: "golden-hour",
  background: "#1A1200",
  hookTextColor: "#F5DEB3",
  hookFontSize: 64,
  labelColor: "#FFF8F0",
  gradientStrength: 0.75,
  overlayOpacity: 0.45,
  accentColor: "#FBBC34",
};

// remotion/src/compositions/ProductStyleB.tsx
import { ProductShowcase } from "./ProductShowcase";
import { goldenHour } from "../utils/styles/golden-hour";
// Wrap with style preset as defaultProps
export const ProductStyleB: React.FC = () => <ProductShowcase style={goldenHour} />;
```

### Pattern 2: Parametrized Base Composition with Style Wrappers

**What:** The base composition (`ProductShowcase`) is fully parametrized. It accepts all variable inputs as props (scene images, product name, hook text, style preset). Style variant compositions are thin wrappers that provide these props via `defaultProps` in the `<Composition>` registry.

**When to use:** Whenever multiple renders of the same composition structure are needed for comparison. The Remotion Studio shows each wrapper as a separate composition entry, each with its own preview and render command.

**Trade-offs:** Pro: DRY, one maintenance target, variants are independently renderable. Con: prop drilling through the base composition requires careful interface design upfront.

**Example:**
```typescript
// remotion/src/compositions/ProductShowcase.tsx
interface ProductShowcaseProps {
  style: StylePreset;
  hookText: string;
  scenes: { src: string; label?: string }[];
  productImage: string;
  productName: string;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({ style, hookText, scenes, productImage, productName }) => { ... };

// remotion/src/Root.tsx — register variants with Folder grouping
<Folder name="showcase-vernis">
  <Composition
    id="ProductStyleA-FilmNoir"
    component={ProductStyleA}
    defaultProps={{ style: filmNoir, hookText: "Teak wie neu.", ... }}
    durationInFrames={736} fps={30} width={1080} height={1920}
  />
  <Composition
    id="ProductStyleB-GoldenHour"
    component={ProductStyleB}
    defaultProps={{ style: goldenHour, hookText: "Teak wie neu.", ... }}
    durationInFrames={736} fps={30} width={1080} height={1920}
  />
</Folder>
```

### Pattern 3: 3D Model via @remotion/three (ThreeCanvas + useCurrentFrame)

**What:** `@remotion/three` provides `<ThreeCanvas>` which allows Remotion's `useCurrentFrame()` to control Three.js animations instead of the incompatible `useFrame()` hook. A product can model (GLB or manually constructed geometry) rotates or is lit based on the current frame number.

**When to use:** For a single dedicated test composition (`TestThreeDModel.tsx`). The Vernis can shape is cylindrical — constructable with Three.js geometry without a real 3D file. Use it to test whether 3D product reveals look more premium than the current 2D `ProductReveal` component.

**Trade-offs:** Pro: full 3D control, can simulate dramatic studio lighting that's impossible with flat images. Con: adds `three`, `@react-three/fiber`, `@remotion/three` dependencies; OpenGL rendering requires special Chromium config for server-side renders (`chromiumOptions: { gl: "angle" }`); adds ~200ms render overhead per frame. Use only where the visual quality justifies it.

**Install:**
```bash
# in remotion/ directory
npm install three @react-three/fiber @remotion/three @types/three
```

**Example (minimal cylinder product can):**
```typescript
// remotion/src/components/ThreeProductModel.tsx
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, interpolate } from "remotion";
import { Canvas } from "@react-three/fiber";

export const ThreeProductModel: React.FC<{ productColor: string }> = ({ productColor }) => {
  const frame = useCurrentFrame();
  const rotationY = interpolate(frame, [0, 90], [0, Math.PI * 2]);

  return (
    <ThreeCanvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <mesh rotation={[0, rotationY, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.5, 32]} />
        <meshStandardMaterial color={productColor} />
      </mesh>
    </ThreeCanvas>
  );
};
```

### Pattern 4: Render Script for Multi-Variant Batch

**What:** A shell script or Node.js orchestrator that calls `npx remotion render` for each variant composition ID in sequence, writing to a predictable output path, then copies the MP4 to `public/videos/` and optionally inserts a Supabase row.

**When to use:** Every time a batch of variant renders is needed for review. This is a local development workflow, not a Vercel cron (too slow for serverless, rendering is done locally or in GitHub Actions).

**Trade-offs:** Pro: simple, no new dependencies, uses existing Remotion CLI. Con: variants render serially unless the script is parallelized (which can saturate the machine). Start serial; parallelize if render times become annoying.

**Example:**
```bash
# scripts/render-variants.sh
VARIANTS=("ProductStyleA-FilmNoir" "ProductStyleB-GoldenHour" "ProductStyleC-CleanStudio")
for VARIANT in "${VARIANTS[@]}"; do
  echo "Rendering $VARIANT..."
  cd remotion && npx remotion render src/index.ts "$VARIANT" "out/${VARIANT}.mp4" && cd ..
  cp "remotion/out/${VARIANT}.mp4" "public/videos/${VARIANT}.mp4"
done
```

---

## Data Flow

### Style Variant Build → Review Flow

```
Developer defines StylePreset (style/golden-hour.ts)
    ↓
ProductStyleB.tsx wraps ProductShowcase with goldenHour preset
    ↓
Root.tsx registers ProductStyleB inside <Folder name="showcase-vernis">
    ↓
scripts/render-variants.sh calls:
  npx remotion render src/index.ts ProductStyleB-GoldenHour out/ProductStyleB-GoldenHour.mp4
    ↓
MP4 copied to public/videos/vernis-style-b-golden-hour.mp4
    ↓
scripts/seed-variant-videos.ts inserts row to Supabase videos table:
  { id: "vernis-style-b-golden-hour", type: "showcase", pipeline: "remotion-only",
    status: "draft", video_url: "/videos/vernis-style-b-golden-hour.mp4" }
    ↓
Reviewer opens Next.js Dashboard (/), sees all three Vernis variants in gallery
    ↓
Reviewer opens each variant, rates 1-5 stars + pros/cons → Supabase feedback table
    ↓
Team picks winner style → promotes to template for all future showcase compositions
```

### 3D Model Test Flow

```
ThreeProductModel.tsx component created with basic can geometry
    ↓
TestThreeDModel.tsx composition uses ThreeProductModel inside AbsoluteFill
    ↓
Root.tsx registers TestThreeDModel inside <Folder name="pipeline-tests">
    ↓
Local render: npx remotion render src/index.ts TestThreeDModel out/test-3d-model.mp4
  (requires: npm install three @react-three/fiber @remotion/three @types/three)
    ↓
Result compared visually against existing ProductReveal (2D photo) approach
    ↓
Decision: adopt 3D for product reveals, or keep 2D cutout photos
```

### Gemini Image Scene Generation Flow

```
scripts/generate-gemini-scene.ts is run locally by developer:
  - Takes: style preset name, scene description prompt, output path
  - Calls: Gemini Image API (gemini-2.0-flash or imagen-3)
  - Writes: PNG to assets/scenes/vernis/[style-a]/[scene-name].png
    ↓
Remotion symlink (remotion/public/ → ../assets/) makes assets available to compositions
    ↓
TestGeminiImage.tsx composition references the newly generated scene path
    ↓
Render → compare against real photo and 3D alternatives
```

---

## New Component Inventory

### Components that are NEW (do not touch existing)

| Component | File | Purpose | Depends On |
|-----------|------|---------|------------|
| `HookText` | `components/HookText.tsx` | Parametrized large hook headline. Accepts text, style preset, position. Replaces inline style strings in compositions. | `StylePreset`, `fonts.ts` |
| `SoakScene` | `components/SoakScene.tsx` | "The Soak" money shot: close-up image of oil soaking into wood grain with animated fade-in. The strongest visual hook per research. | `ImageScene`, `StylePreset` |
| `FiftyFiftySplit` | `components/FiftyFiftySplit.tsx` | Animated 50/50 split revealing treated vs. untreated wood. Clip-path animation from center outward. | `useCurrentFrame`, `interpolate` |
| `WoodMacroOverlay` | `components/WoodMacroOverlay.tsx` | Depth-of-field simulation overlay for macro shots. Vignette + subtle blur mask at frame edges. | CSS filter, `StylePreset` |
| `ThreeProductModel` | `components/ThreeProductModel.tsx` | 3D cylindrical can model, frame-controlled rotation, studio lighting. | `@remotion/three`, `ThreeCanvas` |

### Existing Components Modified

| Component | Change | Reason |
|-----------|--------|--------|
| `ImageScene.tsx` | Add optional `style?: StylePreset` prop, use `style.gradientStrength` and `style.overlayOpacity` instead of hardcoded values | Enables style system to control visual look without forking the component |
| `EndCard.tsx` | No change required — brand red + Playfair is fixed by brand, not variant | Style variants should converge on the same EndCard (brand anchor point) |
| `ProductReveal.tsx` | No change — existing 2D reveal is the baseline for 3D comparison | Keep as-is so A/B comparison against 3D is clean |

### New Compositions

| Composition | File | Type | Description |
|-------------|------|------|-------------|
| `ProductShowcase` | `compositions/ProductShowcase.tsx` | Base (parametrized) | Hook → Soak Shot → Application → Product Reveal → EndCard. Accepts `StylePreset`, scene paths, product metadata. |
| `ProductStyleA` | `compositions/ProductStyleA.tsx` | Style variant wrapper | Film Noir style: dark background, high contrast, dramatic shadows |
| `ProductStyleB` | `compositions/ProductStyleB.tsx` | Style variant wrapper | Golden Hour style: warm tones, outdoor Vorstadt atmosphere |
| `ProductStyleC` | `compositions/ProductStyleC.tsx` | Style variant wrapper | Clean Studio style: white/cream background, product-first clarity |
| `TestRealPhoto` | `compositions/PipelineTest/TestRealPhoto.tsx` | Pipeline test | Uses images from `assets/products/` and `assets/blog/` only — no AI |
| `TestGeminiImage` | `compositions/PipelineTest/TestGeminiImage.tsx` | Pipeline test | Uses AI-generated scenes from Gemini Image API |
| `TestGeminiVideo` | `compositions/PipelineTest/TestGeminiVideo.tsx` | Pipeline test | Uses Gemini Video clips composited via `<Video>` component |
| `TestThreeDModel` | `compositions/PipelineTest/TestThreeDModel.tsx` | Pipeline test | 3D can model product reveal via `@remotion/three` |

---

## Component Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `ProductShowcase` ↔ `StylePreset` | Direct prop passing | Style preset is a plain JS object — no context, no module-level state |
| `ProductStyleA/B/C` ↔ `ProductShowcase` | Wrapper passes style as defaultProps | Style wrappers are registration shims, not real components |
| New components ↔ existing components | New components compose on top of `ImageScene`. Never modify `ImageScene`'s internal Ken Burns logic. | Keeps existing renders stable |
| `ThreeProductModel` ↔ React Three Fiber | `ThreeCanvas` wrapper required — do NOT use R3F's `useFrame()` | `useCurrentFrame()` is the only animation driver in Remotion |
| Remotion compositions ↔ asset files | `staticFile(path)` for image/video files; path relative to `remotion/public/` | Symlinks in `remotion/public/` point to `../assets/` — already in place |
| Scripts ↔ Supabase | `@supabase/supabase-js` with service_role key (admin client pattern, same as existing `src/lib/supabase/admin.ts`) | Scripts run locally, never on Vercel |
| Next.js Dashboard ↔ variant videos | No change — dashboard reads `videos` table; variants are just more rows | Variants displayed in gallery with same VideoCard component |

---

## Integration Points

### @remotion/three Integration

| Item | Detail |
|------|--------|
| Install target | `remotion/` directory (separate package.json) |
| Packages | `npm install three @react-three/fiber @remotion/three @types/three` |
| Chromium config | Add `chromiumOptions: { gl: "angle" }` to `remotion.config.ts` for server-side OpenGL |
| Conflict risk | R3F uses `useFrame()` — this conflicts with Remotion's deterministic rendering. Always use `useCurrentFrame()` via Remotion instead. Never import `useFrame` from `@react-three/fiber` inside Remotion compositions. |
| Current Remotion version | 4.0.261 — `@remotion/three` must match: install `@remotion/three@4.0.261` |

### Gemini Image/Video API

| Item | Detail |
|------|--------|
| SDK | `@google/generative-ai` or `@google-cloud/vertexai` |
| Where scripts run | Locally (developer machine) or GitHub Actions — never inside Vercel |
| Output | PNG files to `assets/scenes/[style]/[composition-name]/` |
| Constraint from memory | Never generate Le Tonkinois product cans with Gemini — always use real catalog photos from `assets/products/` |

### Supabase — Variant Tracking

No schema migration required for variant comparison. Variants are regular `videos` rows. Optional enhancement: add `video_group text` column to `videos` table to group variants by experiment. This is a 1-line migration and enables filtering in the gallery.

```sql
-- Optional (not required for MVP style testing):
ALTER TABLE videos ADD COLUMN video_group TEXT;
CREATE INDEX idx_videos_group ON videos(video_group);
```

---

## Build Order

Dependencies between new components determine this sequence:

**Step 1 — Style Preset System (no dependencies, unblocks everything)**
- Create `remotion/src/utils/styles/types.ts` (`StylePreset` interface)
- Create three style presets: `film-noir.ts`, `golden-hour.ts`, `clean-studio.ts`
- Extend `ImageScene.tsx` to optionally accept `style` prop (backward-compatible)
- Nothing renders yet — this is the vocabulary that compositions will speak

**Step 2 — New Scene Components (depends on Step 1)**
- Create `HookText.tsx` — parametrized headline replacing inline styles in composition files
- Create `SoakScene.tsx` — the key new visual component ("The Soak" money shot)
- Create `FiftyFiftySplit.tsx` — split reveal for before/after
- Test each in isolation: create a temporary single-scene composition per component, verify in Remotion Studio

**Step 3 — ProductShowcase Base Composition (depends on Steps 1-2)**
- Define `ProductShowcaseProps` interface (StylePreset + scene paths + product + hookText)
- Build `ProductShowcase.tsx` using existing `ImageScene`, `ProductReveal`, `EndCard` plus new `SoakScene` and `HookText`
- Register one instance in `Root.tsx` with default props — must preview in Remotion Studio

**Step 4 — Style Variant Wrappers (depends on Step 3)**
- Create `ProductStyleA.tsx`, `ProductStyleB.tsx`, `ProductStyleC.tsx` as thin wrappers
- Add `<Folder name="showcase-vernis">` to `Root.tsx`
- Render all three to MP4, copy to `public/videos/`, seed to Supabase

**Step 5 — Generate Asset Inputs (depends on Steps 1-2, parallel with 3-4)**
- Run `generate-gemini-scene.ts` to create AI scene images for each style variant
- Run real photo selection from `assets/blog/` and `assets/products/` for TestRealPhoto
- Assets must exist before compositions that use them can preview correctly

**Step 6 — Pipeline Test Compositions (depends on Steps 3, 5)**
- `TestRealPhoto.tsx` — uses existing real photo assets, no new dependencies
- `TestGeminiImage.tsx` — requires Step 5 AI assets to be generated first
- `TestGeminiVideo.tsx` — requires Gemini Video generation (most complex — do last in this group)
- `TestThreeDModel.tsx` — install `@remotion/three`, configure Chromium, build ThreeProductModel component

**Step 7 — Review and Decision (depends on Steps 4, 6)**
- All variants and pipeline tests rendered and in the dashboard
- Team reviews and rates via existing feedback UI
- Winning style + pipeline documented in project memory/CLAUDE.md

---

## Anti-Patterns

### Anti-Pattern 1: Forking ImageScene Instead of Extending It

**What people do:** Copy `ImageScene.tsx` to `ImageSceneDark.tsx` and hardcode the film-noir values.

**Why it's wrong:** Ken Burns animation logic is now duplicated. Any timing or zoom change must be made in multiple files. Existing renders (`GartenmobelRenovation`, `BootDeckRenovation`) still use the original — divergence becomes a maintenance burden.

**Do this instead:** Add an optional `style?: StylePreset` prop to `ImageScene`. Keep all existing behavior as defaults. Compositions that don't pass a style get existing behavior unchanged. New compositions pass a style.

### Anti-Pattern 2: Putting Style Logic Inside Composition Files

**What people do:** Define `const filmNoirPalette = { background: "#0D0D0D", ... }` directly inside `ProductStyleA.tsx`.

**Why it's wrong:** The style data cannot be reused by other compositions. If a second composition needs Film Noir style, you copy-paste the object. When the style evolves based on feedback, you update it in two places.

**Do this instead:** All style definitions live in `utils/styles/`. Compositions import them. One source of truth per style.

### Anti-Pattern 3: Using R3F's useFrame() Instead of useCurrentFrame()

**What people do:** Write `useFrame((state) => { mesh.current.rotation.y += 0.01 })` inside a `ThreeCanvas` component in Remotion.

**Why it's wrong:** `useFrame()` is time-based (wall clock). Remotion renders frame-by-frame deterministically. The 3D animation will not match the frame timeline, and scrubbing back in Remotion Studio will show wrong state.

**Do this instead:** Read `const frame = useCurrentFrame()` and compute rotation as `interpolate(frame, [0, 90], [0, Math.PI * 2])`. The 3D object's state is fully determined by the frame number.

### Anti-Pattern 4: One Giant Composition for All Style Variants

**What people do:** Add conditional branches inside a single composition file — `if (styleId === "film-noir") { return <FilmNoirVersion />; }`.

**Why it's wrong:** The Remotion Studio only shows one composition ID. You cannot independently preview or render the variants. Debugging requires changing a prop value rather than selecting a different composition.

**Do this instead:** Separate composition IDs per variant, organized under a `<Folder>`. Each is independently previewable, renderable, and linkable to a Supabase video row.

### Anti-Pattern 5: Generating Le Tonkinois Product Cans with Gemini

**What people do:** Pass a prompt like "Le Tonkinois Vernis can, yellow and red label, tung oil" to Gemini Image.

**Why it's wrong:** Gemini invents the branding. The real Vernis can has specific label design that Gemini cannot reproduce accurately. The resulting video looks amateurish and misrepresents the brand.

**Do this instead:** Always use real product cutout photos from `assets/products/` for any frame showing the can. Gemini Image is only for environmental scenes — hands applying oil, wood grain close-ups, outdoor settings.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 3 style variants (current v1.1) | All renders local, manual script — fine |
| 10+ variants across multiple products | Add a variant registry JSON file, render script iterates it. Renders parallelized across CPU cores via `xargs -P`. |
| Automated variant generation per content rotation | Cron-based: variants generated and rendered as part of the generation cron, multiple composition IDs per content type. This is v1.2+ territory. |

---

## Sources

- [@remotion/three official docs](https://www.remotion.dev/docs/three) — HIGH confidence, official Remotion documentation
- [Remotion React Three Fiber template](https://www.remotion.dev/templates/three) — HIGH confidence, official starter template
- [Remotion ThreeCanvas API](https://www.remotion.dev/docs/three-canvas) — HIGH confidence, official docs
- [Remotion parameterized rendering](https://www.remotion.dev/docs/parameterized-rendering) — HIGH confidence, official docs
- [Remotion Folder component](https://www.remotion.dev/docs/folder) — HIGH confidence, official docs
- [Remotion Composition props schema](https://www.remotion.dev/docs/schemas) — HIGH confidence, official docs
- [Remotion calculateMetadata dynamic duration](https://www.remotion.dev/docs/calculate-metadata) — HIGH confidence, official docs
- Existing codebase analysis: `remotion/src/` full read — HIGH confidence, direct source
- Memory: `feedback_reel_composition_template.md`, `feedback_branding_identity.md`, car detailing aesthetic transfer — HIGH confidence, project-specific validated research

---

*Architecture research for: Le Tonkinois Shorts v1.1 — Content Quality Foundation, style testing and 3D pipeline integration*
*Researched: 2026-03-28*
