# Phase 6: Channel Identity - Research

**Researched:** 2026-03-28
**Domain:** TypeScript brand tokens, CSS filter grading, Remotion component patterns, Next.js route + Supabase auth
**Confidence:** HIGH

## Summary

Phase 6 creates the machine-readable visual foundation for all future AI generation and Remotion compositions. The work splits into four concrete deliverables: (1) a single TypeScript source-of-truth file `src/lib/brand.ts` that unifies all brand tokens, (2) exported Instagram safe-zone constants, (3) a `<ColorGrade>` React wrapper component that applies CSS filters for the Golden-Hour look, and (4) a `/moodboard` dashboard page with a screenshot grid behind Supabase Auth.

All four deliverables are pure code changes — no new databases, no new external services, no new npm packages required. The existing Supabase auth middleware (`src/proxy.ts`) already handles route protection; adding `/moodboard` requires only registering it as a protected path. The existing `remotion/src/utils/colors.ts` and `fonts.ts` become thin re-exports from `brand.ts`, with zero breaking changes in the four components that import them.

The main architectural decision is that `brand.ts` must be importable by BOTH the Next.js dashboard (`src/`) AND the Remotion project (`remotion/src/`). Since both share the same `node_modules` and TypeScript paths resolve correctly from the monorepo root, a direct relative import `../../src/lib/brand` from within `remotion/src/` is the cleanest path. Re-exporting via `remotion/src/utils/colors.ts` and `fonts.ts` preserves the existing import surface exactly.

**Primary recommendation:** Write `brand.ts` first (Task 1), validate imports compile in both contexts before touching any component files, then migrate components as re-exports, then build `ColorGrade` wrapper, then build `/moodboard` route.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Erster Product Showcase wird **Vernis** (klassischer Bootslack, Flaggschiff).
- **D-02:** Vernis Akzentfarbe = Brand Red #B50606 (Vernis IST die Marke)
- **D-03:** Marine No.1 Akzentfarbe = Navy #1A2744 (maritimes Produkt)
- **D-04:** Weitere Produktfarben werden später bei Bedarf ergänzt, kein vollständiges Farbschema für alle Produkte nötig
- **D-05:** Golden-Hour-Look wird als CSS-Filter-Wrapper React-Component umgesetzt (`<ColorGrade>`)
- **D-06:** Filter-Werte: sepia, saturate, brightness, contrast, hue-rotate — exakte Werte im Style Guide definiert
- **D-07:** Global angewendet auf alle Compositions standardmäßig, opt-out per `enabled={false}` prop für Ausnahmen
- **D-08:** Single Source of Truth in `src/lib/brand.ts` — eine zentrale TypeScript-Datei definiert ALLE visuellen Werte
- **D-09:** Bestehende `remotion/src/utils/colors.ts` und `fonts.ts` werden zu Re-Exports aus brand.ts (keine Breaking Changes)
- **D-10:** `src/app/globals.css` Tailwind @theme wird manuell synchronisiert (CSS kann kein TS importieren)
- **D-11:** brand.ts enthält: Farben, Fonts, Produktfarben, Instagram Safe Zones, Color Grading Werte, Gemini Prompt Fragments
- **D-12:** Neue Dashboard-Seite unter `/moodboard` mit Screenshot-Grid und Notizen pro Referenz
- **D-13:** Screenshots werden auto-scraped von Referenz-Accounts (TotalBoat, Rubio Monocoat, @earthandflax etc. aus Competitor Research)
- **D-14:** Login-geschützt, konsistent mit dem restlichen Dashboard (Supabase Auth)

### Claude's Discretion

- Verbotene Ästhetiken als Kommentare/Konstanten in brand.ts einfügen (bereits in Memory dokumentiert: kein Dark Brown, kein Amber, keine "moderne Craft" Ästhetik)
- Exakte CSS-Filter-Werte für den Golden-Hour-Look (iterativ im Remotion Studio testen)
- Moodboard-Datenstruktur (JSON-Array mit Screenshot-Pfad, Account-Name, Begründung)
- Auswahl der konkreten Instagram-Posts für das Moodboard

### Deferred Ideas (OUT OF SCOPE)

- Vollständiges Produktfarben-System für alle 13+ Produkte — erst wenn weitere Product Showcases gebaut werden
- Sound Design / ASMR-Layer — REQUIREMENTS.md Out of Scope
- ~~"Kodok" Roadmap-Korrektur~~ — ERLEDIGT: Alle Referenzen auf "Kodok" wurden durch "Vernis" bzw. "ProductShowcase" ersetzt
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| IDENT-01 | Maschinenlesbarer Style Guide als TypeScript/JSON — Hex-Codes, Fonts, Vernis-Akzentfarbe, verbotene Ästhetik | brand.ts architecture pattern; exact values extracted from existing colors.ts + globals.css + Memory |
| IDENT-02 | Instagram Safe Zone Constants als TypeScript-Konstanten für alle Compositions | Safe zone values already validated in Memory (StepBadge top:140, SceneLabel bottom:380); export as typed constants from brand.ts |
| IDENT-03 | Color Grading Preset — CSS-Filter-Formel für warmen Golden-Hour-Look als wiederverwendbarer Wrapper | `<ColorGrade>` as AbsoluteFill wrapper using CSS filter property; filter values derived from car-detailing research (sepia+warm) |
| IDENT-04 | Referenz-Moodboard mit 5+ Screenshots von Instagram-Accounts die den Ziel-Stil zeigen | `/moodboard` route using existing Supabase Auth proxy pattern; JSON data for screenshots; competitor accounts identified in research |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 6.0.2 (project) | brand.ts type definitions | Already in project; `as const` pattern for exhaustive token objects |
| Next.js | 16.2.1 | `/moodboard` route | Already installed; file-based routing, no setup cost |
| @supabase/ssr | 0.9.0 | Auth guard for /moodboard | v1.0 decision — never deprecated auth-helpers |
| Tailwind CSS v4 | 4.2.2 | Dashboard styling | Already in project; @theme block in globals.css |
| Remotion | 4.0.261 | ColorGrade component rendering | Already installed; `AbsoluteFill` + inline style filter |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @remotion/google-fonts | 4.0.261 | Font loading in Remotion | Re-exported via fonts.ts (no change to API) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS filter on `<AbsoluteFill>` | SVG `<feColorMatrix>` | SVG more precise but incompatible with Remotion render pipeline; CSS filter works in both browser and headless Chrome render |
| Inline `brand.ts` import in remotion | Separate `remotion/src/brand.ts` copy | Two copies drift; re-export pattern maintains single truth |
| JSON file for moodboard data | Supabase table | JSON simpler, no schema migration needed; moodboard is static reference content not user-generated data |

**No new packages required for this phase.** All deliverables use existing dependencies.

---

## Architecture Patterns

### Recommended Project Structure Changes

```
src/
├── lib/
│   ├── brand.ts          # NEW — single source of truth for all brand tokens
│   ├── supabase/         # Unchanged
│   └── types.ts          # Unchanged
├── app/
│   ├── moodboard/
│   │   └── page.tsx      # NEW — protected moodboard gallery page
│   └── ...               # Unchanged
└── data/
    └── moodboard.ts      # NEW — static screenshot registry (like asset-catalog.ts)
remotion/
└── src/
    ├── components/
    │   └── ColorGrade.tsx # NEW — CSS filter wrapper for Golden-Hour look
    └── utils/
        ├── colors.ts     # MODIFIED — re-export from brand.ts
        └── fonts.ts      # UNCHANGED — Remotion-specific, cannot be re-exported (loadFont is side-effectful)
```

### Pattern 1: brand.ts Single Source of Truth

**What:** One TypeScript file with `as const` objects covering colors, product accents, safe zones, color grading values, and forbidden aesthetics as string comments.

**When to use:** Any new Remotion composition or dashboard component must import from `brand.ts`, never hardcode hex values.

**Example:**
```typescript
// src/lib/brand.ts

// === Core Brand Colors ===
export const COLORS = {
  brandRed: "#B50606",
  brandRedDark: "#8A0404",
  gold: "#FBBC34",
  navy: "#1A2744",
  title: "#242424",
  entity: "#333333",
  body: "#777777",
  lightText: "#FFFFFF",
  white: "#FFFFFF",
  cream: "#FFF8F0",
  grayLight: "#F7F7F7",
  taupe: "#6B7A6F",
  burgundy: "#6B1A1A",
  darkOverlay: "rgba(0, 0, 0, 0.6)",
  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
  brandGradient: "linear-gradient(180deg, #B50606 0%, #8A0404 100%)",
} as const;

// === Product Accent Colors ===
export const PRODUCT_ACCENTS = {
  vernis: COLORS.brandRed,   // Vernis IS the brand — Brand Red is its accent
  marineNo1: COLORS.navy,
  parquets: COLORS.gold,
  beizeSeries: COLORS.taupe,
} as const;

// === Instagram Safe Zones (1080x1920 portrait) ===
export const SAFE_ZONES = {
  topSafe: 140,   // px — below username + buttons
  bottomSafe: 380, // px — above caption + like buttons
  sideSafe: 60,    // px — horizontal margin from edges
  contentSide: 80, // px — inner content margin (SceneLabel)
} as const;

// === Color Grading — Golden Hour Look ===
export const COLOR_GRADE = {
  sepia: 0.15,        // 0-1 — slight sepia warmth
  saturate: 1.2,      // 1.0 = unchanged; >1 warmer/richer
  brightness: 1.05,   // 1.0 = unchanged; slight lift
  contrast: 1.08,     // 1.0 = unchanged; micro contrast boost
  hueRotate: 5,       // degrees; slight warm shift
} as const;

// === Typography (names only — Remotion loads via @remotion/google-fonts) ===
export const FONTS = {
  headline: "Playfair Display",  // Hook text, large titles
  scene: "Lora",                 // Scene labels, product titles
  body: "Lato",                  // Badges, subtitles, UI
} as const;

// === Forbidden Aesthetics (documented for AI prompts and code review) ===
export const FORBIDDEN_AESTHETICS = [
  "Dark Brown background (#3E2723) — website is white, not dark",
  "Amber (#D4A76A) as accent — Brand Red is the accent, not amber",
  "Lora as headline — Playfair Display for headlines",
  "Modern craft aesthetic — Le Tonkinois is vintage maritime heritage",
  "AI-generated product cans — always use real photos from asset catalog",
  "Dark/moody backgrounds for product scenes — use cream (#FFF8F0) or white",
] as const;

// === Gemini Prompt Fragments (reusable for consistency) ===
export const PROMPT_FRAGMENTS = {
  lighting: "side lighting from the left, golden hour warmth, honey tones",
  woodStyle: "German suburban backyard atmosphere, realistic wood texture, no new garden elements added",
  colorGrade: "warm color temperature, golden afternoon light, no oversaturation",
  forbidden: "no product cans or bottles, no logo, no text",
} as const;
```

### Pattern 2: colors.ts Re-Export (Zero Breaking Changes)

**What:** Replace the body of `remotion/src/utils/colors.ts` with a re-export that exposes the same `colors` shape as before.

**When to use:** Whenever brand.ts adds new color tokens — they are automatically available in Remotion without touching component files.

**Example:**
```typescript
// remotion/src/utils/colors.ts — AFTER migration
// Re-exports from central brand.ts. Preserves existing import surface.
import { COLORS } from "../../../src/lib/brand";

export const colors = COLORS;
```

**Important:** `fonts.ts` cannot be migrated — `loadFont()` from `@remotion/google-fonts` must be called at module load time within the Remotion bundle. It is Remotion-specific and must stay in `remotion/src/utils/fonts.ts`. The `FONTS` constant in `brand.ts` stores font names as strings only (for Gemini prompts, CSS variables, reference), not as Remotion font families.

### Pattern 3: ColorGrade Wrapper Component

**What:** A Remotion `AbsoluteFill`-based wrapper that applies CSS `filter` to all children, providing the Golden-Hour look. Opt-out via `enabled={false}`.

**When to use:** Wrap the outermost composition element in new Remotion compositions. Existing compositions can be wrapped with no internal changes.

**CSS filter property** works correctly in Remotion's headless Chrome renderer. This is HIGH confidence — Remotion renders via Puppeteer/Chrome which fully supports CSS filters.

**Example:**
```typescript
// remotion/src/components/ColorGrade.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { COLOR_GRADE } from "../../../src/lib/brand";

interface ColorGradeProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const ColorGrade: React.FC<ColorGradeProps> = ({
  children,
  enabled = true,
}) => {
  if (!enabled) return <AbsoluteFill>{children}</AbsoluteFill>;

  const filterString = [
    `sepia(${COLOR_GRADE.sepia})`,
    `saturate(${COLOR_GRADE.saturate})`,
    `brightness(${COLOR_GRADE.brightness})`,
    `contrast(${COLOR_GRADE.contrast})`,
    `hue-rotate(${COLOR_GRADE.hueRotate}deg)`,
  ].join(" ");

  return (
    <AbsoluteFill style={{ filter: filterString }}>
      {children}
    </AbsoluteFill>
  );
};
```

**Note on filter values:** The exact numeric values in `COLOR_GRADE` above are a starting point derived from research (warm-up without oversaturation). They MUST be validated visually in Remotion Studio on actual composition frames before being frozen. The planner should include a "tune in Studio" task before the test images task.

### Pattern 4: /moodboard Route with Supabase Auth

**What:** A Next.js Server Component page at `src/app/moodboard/page.tsx` that is automatically protected by the existing `src/proxy.ts` middleware (which redirects unauthenticated requests to `/login` for all non-public paths).

**When to use:** No changes to proxy.ts are needed — `/moodboard` is not in `PUBLIC_PATHS`, so it is protected automatically. Pattern follows existing `page.tsx` and `assets/page.tsx`.

**Moodboard data structure:**
```typescript
// src/data/moodboard.ts
export interface MoodboardEntry {
  id: string;
  account: string;         // "@totalboat", "@earthandflax" etc.
  platform: "instagram" | "tiktok";
  imagePath: string;       // /assets/moodboard/totalboat-01.jpg
  caption: string;         // why this reference was chosen
  tags: string[];          // ["golden-hour", "before-after", "color-grade"]
  sourceUrl?: string;      // original post URL if available
}

export const moodboard: MoodboardEntry[] = [...];
```

**Reference accounts identified in research:**
- `@totalboat` (163K IG) — marine brand, best-in-class wood + water content
- `@rubiomornocoat` (16K IG) — best UGC/community strategy, wood finishing
- `@earthandflax` (9.1K IG) — only creator actively showing Le Tonkinois
- `@hermannsachse` (3.5K IG) — Le Tonkinois parent brand account
- `@chemicalguys` — car detailing cross-reference for "The Soak" shot aesthetics

**Minimum 5 screenshots required** (IDENT-04). Screenshots are static files stored in `public/assets/moodboard/` (served as Next.js public assets). The "auto-scraped" approach in D-13 means a script runs once to download them; they are committed to git as static files, not fetched at runtime.

### Pattern 5: globals.css Manual Sync

**What:** After `brand.ts` is written, the `@theme` block in `src/app/globals.css` must be manually updated to match. CSS cannot import TypeScript, so this is a deliberate manual sync step.

**Critical sync items:**
- `--color-brand-red` must match `COLORS.brandRed`
- `--font-headline` must match `FONTS.headline`
- `--font-body` must match `FONTS.body`
- Navy (`#1A2744`) should be added as `--color-navy` for Marine product pages

**What to NOT change in globals.css:**
- `--color-wood-amber`, `--color-wood-honey`, `--color-wood-walnut` — these are dashboard-only styling tokens, not in `brand.ts` (they represent the "Modern Craft" aesthetic that `brand.ts` explicitly forbids for Remotion use; they remain valid for the dashboard's warm-tone UI)
- `--color-text-dark: #3E2723` — this is a dashboard text color, NOT the same as `colors.title` (#242424 in Remotion). Keep both; they serve different contexts.

### Anti-Patterns to Avoid

- **Hardcoded hex in .tsx files:** After migration, any `#B50606` or `#FFF8F0` in component files is a bug. All colors come from `brand.ts` via `colors`.
- **colors.ts as source of truth:** After migration, `colors.ts` is a re-export. Never add new colors there directly.
- **fonts.ts re-export:** Do NOT try to move `loadFont` calls into `brand.ts`. The `loadFont` side effect must happen in the Remotion bundle context, not in a shared module.
- **CSS filter on individual scenes:** Apply `ColorGrade` at the composition root, not per-scene. Applying per-scene causes grading to stack on transitions.
- **Moodboard data in Supabase:** The moodboard is editorial/static content, not user-generated. JSON file is correct.
- **Inline filter string in compositions:** Never hardcode `filter: "sepia(0.15) saturate(1.2)..."` in composition files. Always use `ColorGrade` wrapper.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth guard for /moodboard | Custom session check in page.tsx | Existing `src/proxy.ts` middleware | Already handles all non-PUBLIC_PATHS; zero code change needed |
| Color token distribution | Separate brand files per layer | Single `brand.ts` with re-exports | D-08 decision; prevents drift |
| CSS-filter color grading | Per-frame color manipulation | CSS filter on AbsoluteFill wrapper | CSS filter applies in < 1ms; per-frame manipulation would require pixel processing |
| Screenshot scraping at runtime | Fetching IG screenshots on page load | Static files committed to git | Instagram doesn't allow programmatic scraping; screenshots committed once |
| Font loading in brand.ts | Moving loadFont into brand.ts | Keep loadFont in fonts.ts | loadFont is a Remotion-specific side effect; calling it outside Remotion bundle context breaks font loading |

**Key insight:** Everything in this phase is structural setup, not feature engineering. The hardest problem (auth) is already solved. The main risk is the `brand.ts` import path working correctly from `remotion/src/` — this must be verified with a build check before migrating components.

---

## Runtime State Inventory

Step 2.5: SKIPPED — this is a greenfield structural phase adding new files and refactoring imports. No renaming of existing strings. No runtime state (databases, services, OS registrations) is affected.

---

## Environment Availability Audit

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build, lint | Verified (project active) | Current LTS | — |
| npm | Package management | Verified | Current | — |
| TypeScript | brand.ts compilation | Verified (6.0.2 in project) | 6.0.2 | — |
| Next.js | /moodboard route | Verified (16.2.1) | 16.2.1 | — |
| Remotion Studio | ColorGrade visual validation | Verified (remotion/ subproject) | 4.0.261 | — |
| Supabase (project) | /moodboard auth | Verified (used in v1.0) | @supabase/ssr 0.9.0 | — |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None.

All external dependencies are already installed and used in the project.

---

## Common Pitfalls

### Pitfall 1: brand.ts Import Path Fails in Remotion Bundle

**What goes wrong:** `remotion/src/utils/colors.ts` imports `../../../src/lib/brand` — but Remotion's bundler (esbuild via Vite) may not resolve paths that cross out of `remotion/` directory into `src/`.

**Why it happens:** Remotion bundles `remotion/src/` as its root. Cross-directory imports depend on the `tsconfig.json` paths and whether `remotion/tsconfig.json` extends the root `tsconfig.json`.

**How to avoid:**
1. Check if `remotion/tsconfig.json` exists and what it extends.
2. If not resolving, add `"paths": { "@brand": ["../src/lib/brand"] }` to `remotion/tsconfig.json`.
3. Validate with `cd remotion && npm run build` (not `studio`) before touching components.

**Warning signs:** Remotion Studio throws "Cannot find module" or compositions render with undefined colors.

### Pitfall 2: ColorGrade Applied Inside AbsoluteFill Stacks on Transitions

**What goes wrong:** Transition overlays between scenes both have ColorGrade applied. During the 12-frame transition, the grading from both scenes compounds — the blended frame is doubly warm/saturated.

**Why it happens:** `<Sequence>` inside a `<Series>` or transition each renders to their own layer; if ColorGrade wraps each scene independently, the blend frame sees two filters.

**How to avoid:** Apply `<ColorGrade>` once at the outermost composition wrapper (the `<AbsoluteFill>` returned by the composition function), not inside individual `<Sequence>` children.

**Warning signs:** Transition frames visibly more saturated than before/after frames.

### Pitfall 3: globals.css Tailwind Token Drift

**What goes wrong:** `brand.ts` is updated (e.g., navy color tweaked) but `globals.css` is not synced. Dashboard components using `text-navy` render with stale color.

**Why it happens:** The manual sync is easy to forget. CSS cannot import TypeScript.

**How to avoid:** Add a comment block in `globals.css` that says "MANUAL SYNC FROM src/lib/brand.ts — last synced [date]". When `brand.ts` changes, the comment makes the sync obligation explicit.

**Warning signs:** Tailwind class `bg-navy` renders with wrong hex in browser DevTools.

### Pitfall 4: loadFont Re-export Breaks Remotion Font Loading

**What goes wrong:** Developer tries to consolidate fonts by importing the Remotion `loadFont` return values from `brand.ts`. Remotion fails to load fonts because `loadFont` was called outside the Remotion bundle context.

**Why it happens:** `@remotion/google-fonts`'s `loadFont` registers fonts via a Remotion-internal mechanism. It must be called during bundle initialization within the Remotion project.

**How to avoid:** `FONTS` in `brand.ts` stores only string font names (for prompts, CSS vars). The actual `loadFont` calls stay in `remotion/src/utils/fonts.ts` exactly as they are now.

**Warning signs:** Compositions render with fallback serif/sans-serif fonts instead of Playfair Display / Lora / Lato.

### Pitfall 5: Moodboard Screenshots Not Committed / Wrong Path

**What goes wrong:** `moodboard.ts` references `/assets/moodboard/totalboat-01.jpg` but files not present in `public/assets/moodboard/`.

**Why it happens:** The "scrape once" step is easy to skip or the files land in the wrong directory.

**How to avoid:** Create `public/assets/moodboard/` directory before writing `moodboard.ts`. Use a simple `curl` or browser-save workflow; no automation needed for 5-10 images. Add a note in `moodboard.ts` about where files must live.

---

## Code Examples

### brand.ts Structure (verified pattern)

```typescript
// src/lib/brand.ts — Single Source of Truth
// Source: derived from remotion/src/utils/colors.ts + src/app/globals.css + Memory

export const COLORS = {
  // Primary brand (verified from letonkinois.de CSS + Remotion colors.ts)
  brandRed: "#B50606",
  brandRedDark: "#8A0404",
  gold: "#FBBC34",
  navy: "#1A2744",
  // Text hierarchy
  title: "#242424",
  entity: "#333333",
  body: "#777777",
  lightText: "#FFFFFF",
  white: "#FFFFFF",
  cream: "#FFF8F0",
  grayLight: "#F7F7F7",
  taupe: "#6B7A6F",
  burgundy: "#6B1A1A",
  // Composite values
  darkOverlay: "rgba(0, 0, 0, 0.6)",
  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
  brandGradient: "linear-gradient(180deg, #B50606 0%, #8A0404 100%)",
} as const;

export const PRODUCT_ACCENTS = {
  vernis: "#B50606",
  marineNo1: "#1A2744",
} as const;

export const SAFE_ZONES = {
  topSafe: 140,
  bottomSafe: 380,
  sideSafe: 60,
  contentSide: 80,
} as const;

export const COLOR_GRADE = {
  sepia: 0.15,
  saturate: 1.2,
  brightness: 1.05,
  contrast: 1.08,
  hueRotate: 5,
} as const;

export const FONTS = {
  headline: "Playfair Display",
  scene: "Lora",
  body: "Lato",
} as const;

export const PROMPT_FRAGMENTS = {
  lighting: "side lighting from the left, golden hour warmth, honey tones",
  woodStyle: "German suburban backyard atmosphere, realistic wood texture",
  colorGrade: "warm color temperature, golden afternoon light, no oversaturation",
  forbidden: "no product cans or bottles, no logo, no text",
} as const;
```

### colors.ts After Migration (verified re-export pattern)

```typescript
// remotion/src/utils/colors.ts — after Phase 6
// Re-export from central brand.ts. All existing imports continue to work.
import { COLORS } from "../../../src/lib/brand";
export const colors = COLORS;
```

### ColorGrade Component (Remotion AbsoluteFill pattern)

```typescript
// remotion/src/components/ColorGrade.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { COLOR_GRADE } from "../../../src/lib/brand";

export const ColorGrade: React.FC<{
  children: React.ReactNode;
  enabled?: boolean;
}> = ({ children, enabled = true }) => {
  const filter = enabled
    ? `sepia(${COLOR_GRADE.sepia}) saturate(${COLOR_GRADE.saturate}) brightness(${COLOR_GRADE.brightness}) contrast(${COLOR_GRADE.contrast}) hue-rotate(${COLOR_GRADE.hueRotate}deg)`
    : undefined;
  return <AbsoluteFill style={filter ? { filter } : {}}>{children}</AbsoluteFill>;
};
```

### Moodboard Page (Server Component, auth via proxy.ts)

```typescript
// src/app/moodboard/page.tsx
// Protected automatically by src/proxy.ts — no additional auth code needed.
import Link from "next/link";
import { moodboard } from "@/data/moodboard";

export default function MoodboardPage() {
  return (
    <main className="min-h-screen bg-bg-cream">
      <header>...</header>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {moodboard.map((entry) => (
            <div key={entry.id} className="...">
              <img src={entry.imagePath} alt={entry.caption} />
              <p>{entry.account}</p>
              <p>{entry.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Magic numbers in component files (e.g., `bottom: 380`) | Named constants from `SAFE_ZONES` | Phase 6 | Future compositions cannot accidentally use wrong values |
| Color values duplicated in colors.ts and globals.css | brand.ts as single source, globals.css manually synced | Phase 6 | Color drift impossible |
| Remotion compositions rely on direct colors.ts | colors.ts re-exports brand.ts | Phase 6 | All brand token changes flow everywhere |

**Current state of colors.ts:** 14 color values as a plain `as const` object. No TypeScript narrowing issues. Re-export migration is a single-line replacement with zero type surface change.

**Current state of safe zones:** Only used implicitly in `StepBadge.tsx` (top: 140, right: 60) and `SceneLabel.tsx` (bottom: 380, left: 80). These are the values that must be extracted into `SAFE_ZONES`.

---

## Open Questions

1. **Remotion tsconfig cross-directory imports**
   - What we know: `remotion/` is a sub-project; it may have its own tsconfig
   - What's unclear: Whether `../../../src/lib/brand` resolves without tsconfig changes
   - Recommendation: Wave 0 task must verify this with `cd remotion && tsc --noEmit` before any component migration

2. **Exact COLOR_GRADE values**
   - What we know: Research indicates warm/sepia/saturate direction; values above are starting hypothesis
   - What's unclear: Exact numbers that look correct on actual composition frames
   - Recommendation: "Tune in Remotion Studio" task in the plan before the 5-image validation task

3. **Moodboard screenshots — legal/practical scraping**
   - What we know: Instagram blocks automated scraping; browser-save is the practical approach
   - What's unclear: Whether the planner should include a "manual screenshot collection" sub-task or treat it as implicit
   - Recommendation: Plan should include explicit task "collect 5+ screenshots and commit to public/assets/moodboard/"

---

## Validation Architecture

### Test Framework

No test framework is installed in this project. `nyquist_validation` is enabled in config.json but there are zero existing test files.

| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | None |
| Quick run command | `npm run lint && npm run build` |
| Full suite command | `npm run lint && npm run build` |

Given no test framework, validation for this phase is build + lint + visual Remotion Studio inspection.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| IDENT-01 | brand.ts compiles, exports all token shapes | build | `npm run build` | Wave 0: create brand.ts |
| IDENT-01 | colors.ts re-export maintains same type surface | build | `npm run build && cd remotion && npm run build` | Wave 0: migrate colors.ts |
| IDENT-02 | SAFE_ZONES constants importable from brand.ts | build | `npm run build` | Wave 0: part of brand.ts |
| IDENT-03 | ColorGrade renders without errors in Studio | visual | `cd remotion && npm run studio` (manual check) | Wave 0: create ColorGrade.tsx |
| IDENT-03 | ColorGrade opt-out works (`enabled={false}`) | build | `npm run build` | Wave 0: create ColorGrade.tsx |
| IDENT-04 | /moodboard renders with auth protection | build | `npm run build` | Wave 0: create moodboard/page.tsx |
| IDENT-04 | 5+ screenshots present in public/assets/moodboard/ | file check | `ls public/assets/moodboard/ \| wc -l` | Manual: collect screenshots |

### Sampling Rate

- **Per task commit:** `npm run lint`
- **Per wave merge:** `npm run build` (root) + `cd remotion && npm run build`
- **Phase gate:** Both builds green + ColorGrade visual validation in Remotion Studio

### Wave 0 Gaps

- [ ] `src/lib/brand.ts` — covers IDENT-01, IDENT-02 (new file, Wave 0)
- [ ] `remotion/src/components/ColorGrade.tsx` — covers IDENT-03 (new file, Wave 0)
- [ ] `src/app/moodboard/page.tsx` — covers IDENT-04 (new route, Wave 0)
- [ ] `src/data/moodboard.ts` — covers IDENT-04 data layer (new file, Wave 0)
- [ ] `public/assets/moodboard/` directory + 5 screenshots — manual collection task

No existing test infrastructure to extend. All validation is build-time TypeScript + manual Remotion Studio visual check.

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on This Phase |
|-----------|---------------------|
| `NIEMALS next dev im Background` | Validation uses `npm run build` + `npm run lint`, never `npm run dev` |
| `Zero inline hex values in composition .tsx files` | Core goal of IDENT-01; brand.ts migration enforces this |
| `Supabase Auth mit getUser()` | /moodboard route uses existing proxy.ts which already calls `getUser()` |
| `Videos bleiben in public/videos/` | Not affected by this phase |
| `@supabase/ssr@0.9.0` | Already installed; /moodboard needs no new Supabase package |
| `GSD Workflow Enforcement` | All file changes via GSD phase execution |
| Produktfotos NIEMALS KI-generiert | Not affected; this phase uses real screenshots for moodboard |
| Brand: Rot+Weiß+Playfair Display | Codified in brand.ts; FORBIDDEN_AESTHETICS constant documents the violations |
| Tailwind CSS v4 `@theme` block | globals.css manual sync task must use @theme syntax |

---

## Sources

### Primary (HIGH confidence)
- Direct file read: `remotion/src/utils/colors.ts` — exact 14 color values extracted
- Direct file read: `remotion/src/utils/fonts.ts` — font loading pattern (must stay Remotion-specific)
- Direct file read: `src/app/globals.css` — Tailwind @theme tokens, sync targets
- Direct file read: `src/proxy.ts` — auth pattern; /moodboard auto-protected
- Direct file read: `src/lib/supabase/server.ts` — `getUser()` pattern confirmed
- Direct file read: Memory `feedback_reel_composition_template.md` — safe zone values (140, 380, 60, 80)
- Direct file read: Memory `feedback_branding_identity.md` — forbidden aesthetics, exact hex values
- Direct file read: `research/car-detailing-aesthetic-transfer.md` — Golden Hour color grading direction

### Secondary (MEDIUM confidence)
- Remotion CSS filter behavior: CSS filters work in headless Chrome (Remotion's renderer). Confirmed by Remotion documentation pattern (inline `style={{ filter: "..." }}` is standard Remotion usage).

### Tertiary (LOW confidence)
- COLOR_GRADE exact numeric values (sepia: 0.15, saturate: 1.2 etc.) — derived from research direction, not empirically validated. Must be tuned in Remotion Studio.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already in project, versions confirmed
- Architecture: HIGH — patterns derived from existing code in the same repo
- Pitfalls: HIGH — Pitfalls 1, 4, 5 derived from direct code inspection; Pitfalls 2, 3 from CSS/Remotion behavior
- Color grade values: LOW — starting hypothesis requiring visual validation

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable stack, no fast-moving dependencies)
