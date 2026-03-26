# Architecture

**Analysis Date:** 2026-03-26

## Pattern Overview

**Overall:** Next.js 16 full-stack dashboard with Remotion video composition engine.

**Key Characteristics:**
- Dual-application monorepo: Next.js gallery dashboard + separate Remotion studio
- Client-side video review and filtering with JSON data source
- Server-rendered gallery, client-rendered detail pages
- Remotion handles programmatic video composition (MP4 rendering)
- Asset catalog system for managing images across dashboard and Remotion

## Layers

**Presentation Layer (Next.js Frontend):**
- Purpose: Instagram shorts gallery and video review dashboard for Le Tonkinois
- Location: `src/app/`, `src/components/`
- Contains: Page routes (home gallery, video detail, asset browser), UI components (VideoGrid, VideoCard, filter logic)
- Depends on: TypeScript types (`src/lib/types.ts`), JSON data (`src/data/videos.json`), asset catalog
- Used by: End users accessing Vercel-hosted dashboard

**Composition Layer (Remotion Studio):**
- Purpose: Programmatic video generation with Ken Burns zoom, text overlays, transitions
- Location: `remotion/src/`
- Contains: Composition definitions (GartenmobelRenovation, BootDeckRenovation), reusable animation components (ImageScene, StepBadge, ProductReveal, EndCard)
- Depends on: Remotion core, @remotion/transitions, brand utilities (colors, fonts)
- Used by: Remotion CLI to render MP4 outputs to `remotion/out/`

**Data Layer:**
- Purpose: Metadata repository for all videos and assets
- Location: `src/data/`
- Contains: `videos.json` (video metadata), `asset-catalog.ts` (TypeScript-based asset registry with categories and subcategories)
- Depends on: None
- Used by: Dashboard pages and Remotion compositions via static imports

**Brand/Styling Layer:**
- Purpose: Centralized color, typography, and design token management
- Location: `src/app/globals.css` (Tailwind tokens), `remotion/src/utils/colors.ts`, `remotion/src/utils/fonts.ts`
- Contains: Color palette (brand red #B50606, wood tones, text colors), font definitions (Lora, Lato, Playfair Display)
- Depends on: None
- Used by: All components and compositions for visual consistency

## Data Flow

**Video Gallery View:**

1. User navigates to `/` → Next.js renders `src/app/page.tsx`
2. Page imports `videos.json` statically as `VideoEntry[]`
3. Page calculates stats (total, pending, approved) server-side
4. Renders `<VideoGrid>` with videos array
5. VideoGrid is client component — manages filter state, renders `<VideoCard>` map
6. Each VideoCard is Link to `/video/[id]` with video preview (hover plays video)

**Video Detail View:**

1. User clicks card → navigates to `/video/[id]`
2. `src/app/video/[id]/page.tsx` is async Server Component
3. Uses `use(params)` to unwrap dynamic route parameter (Next.js 16 pattern)
4. Searches `videos.json` for matching ID
5. If found: renders 9:16 video player, metadata cards (caption DE/FR, hashtags, type, duration, pipeline), review buttons
6. If not found: renders 404 fallback

**Asset Browser:**

1. User navigates to `/assets`
2. `src/app/assets/page.tsx` renders client component
3. Imports `assets` from `asset-catalog.ts`
4. User can filter by category (products, scenes, before-after, etc.)
5. Grid groups assets by subcategory (e.g., "Beize Eiche Hell", "KI-Tests")
6. Click asset → opens lightbox modal showing full-size image

**Video Composition & Rendering:**

1. Remotion studio runs via `cd remotion && npm run studio`
2. `remotion/src/index.ts` registers `RemotionRoot` which defines two compositions (GartenmobelRenovation, BootDeckRenovation)
3. `remotion/src/Root.tsx` renders Composition components at 1080x1920px (9:16 Instagram Shorts), 30 FPS
4. Each composition (e.g., `GartenmobelRenovation`) is a sequence of scenes with transitions:
   - Hook scene (3.5s) → Vorher (3.3s) → Schritt 1-3 (3.5s each) → Nachher (3.7s) → Product Reveal (3.3s) → End Card (3s)
   - Each scene uses `<ImageScene>` wrapper with Ken Burns zoom interpolation
   - Transitions between scenes (wipe, slide, fade)
5. Scene components (Reinigen, Schleifen, Ölen) are rendered with `<StepBadge>` (e.g., "2/3"), `<SceneLabel>` text overlay
6. Product reveal and end card handled by dedicated components
7. CLI: `npm run render:gartenmoebel` → outputs MP4 to `remotion/out/`
8. Output copied to `public/videos/` for dashboard playback

**State Management:**

- **Dashboard:** React hooks (`useState`) for filter state and lightbox state in client components
- **Video metadata:** JSON static import (immutable during app runtime)
- **Remotion:** Interpolation of `useCurrentFrame()` for animation timing

## Key Abstractions

**VideoEntry:**
- Purpose: Type-safe video metadata contract
- Examples: `src/lib/types.ts`
- Pattern: TypeScript interface with required/optional fields, includes rating (pending/approved/rejected), pipeline type, hashtags, captions (DE/FR), products featured

**VideoType (Union Type):**
- Purpose: Constrain video categorization to 6 allowed types
- Examples: "showcase", "before-after", "how-to", "seasonal", "heritage", "lifestyle"
- Pattern: Branded string union with associated label and color maps

**AssetEntry:**
- Purpose: Metadata for visual assets used in compositions
- Examples: `src/data/asset-catalog.ts`
- Pattern: Path-based registry with category/subcategory hierarchy, allows quick lookups by asset type

**ImageScene (Remotion Component):**
- Purpose: Reusable base for Ken Burns animation + gradient overlay
- Examples: `remotion/src/components/ImageScene.tsx`
- Pattern: Higher-order component wrapping `<AbsoluteFill>`, accepts src, zoomFrom/zoomTo, gradientStrength, children (for overlays)
- Usage: Every scene in a composition uses this to provide consistent visual motion

**StepBadge, SceneLabel, ProductReveal, EndCard:**
- Purpose: Composition building blocks for standard reel elements
- Examples: `remotion/src/components/*.tsx`
- Pattern: Stateless React components using `useCurrentFrame()` for fade-in/scale animations
- Allows reuse across multiple compositions

## Entry Points

**Web Dashboard:**
- Location: `src/app/page.tsx`
- Triggers: User visits root URL `/`
- Responsibilities: Render gallery header with stats, pass videos array to filter component, handle responsive layout

**Video Detail:**
- Location: `src/app/video/[id]/page.tsx`
- Triggers: User clicks video card
- Responsibilities: Look up video by ID, render player, display captions/hashtags, rating buttons (buttons not yet functional)

**Asset Browser:**
- Location: `src/app/assets/page.tsx`
- Triggers: User clicks "Bild-Bibliothek" link
- Responsibilities: Render filterable grid of all assets, enable lightbox preview

**Remotion Studio:**
- Location: `remotion/src/index.ts` → `remotion/src/Root.tsx`
- Triggers: Developer runs `npm run studio` or `npm run render:gartenmoebel`
- Responsibilities: Register composition definitions, render to MP4 on CLI invocation

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Set metadata (title, description), import fonts (Lora, Lato), wrap children with HTML/body

## Error Handling

**Strategy:** Defensive lookups with fallback UI.

**Patterns:**
- Video detail page checks if video exists by ID — returns 404 message with link back to gallery if not found
- Asset browser filters empty categories — no error, just hides empty categories in grid
- No error boundaries implemented yet — client errors will propagate to Next.js error boundary
- No API error handling (no API calls) — all data is static JSON

## Cross-Cutting Concerns

**Logging:** None implemented. Console statements only in development (e.g., hover video play).

**Validation:** TypeScript provides compile-time safety for VideoEntry and AssetEntry shapes. No runtime schema validation.

**Authentication:** None. Dashboard is public. No admin panel for rating persistence yet (buttons exist but don't persist to backend).

**Branding:** Centralized in globals.css Tailwind theme and Remotion utils. All text, colors, fonts follow letonkinois.de visual identity (red #B50606, cream #FFF8F0, Lora headlines, Lato body).

---

*Architecture analysis: 2026-03-26*
