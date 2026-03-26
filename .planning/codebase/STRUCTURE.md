# Codebase Structure

**Analysis Date:** 2026-03-26

## Directory Layout

```
letonkinois-shorts/
├── src/                       # Next.js Application (Dashboard)
│   ├── app/
│   │   ├── layout.tsx         # Root layout, metadata, font imports
│   │   ├── page.tsx           # Gallery home
│   │   ├── video/
│   │   │   └── [id]/page.tsx  # Video detail view
│   │   ├── assets/
│   │   │   └── page.tsx       # Asset browser page
│   │   └── globals.css        # Tailwind theme with brand colors
│   ├── components/
│   │   ├── VideoGrid.tsx      # Grid with type filter, client component
│   │   └── VideoCard.tsx      # Single video card preview
│   ├── data/
│   │   ├── videos.json        # Video metadata (immutable source of truth)
│   │   └── asset-catalog.ts   # Asset registry with categories
│   └── lib/
│       └── types.ts           # TypeScript interfaces (VideoEntry, VideoType, etc.)
├── remotion/                  # Remotion Video Composition Studio
│   ├── src/
│   │   ├── index.ts           # registerRoot entry point
│   │   ├── Root.tsx           # Composition definitions
│   │   ├── compositions/
│   │   │   ├── GartenmobelRenovation.tsx  # 24.5s before-after reel
│   │   │   └── BootDeckRenovation.tsx     # 8s boat deck reel
│   │   ├── components/
│   │   │   ├── ImageScene.tsx      # Ken Burns zoom base component
│   │   │   ├── StepBadge.tsx       # "2/3" step counter badge
│   │   │   ├── SceneLabel.tsx      # Text label overlay (1-3 words)
│   │   │   ├── ProductReveal.tsx   # Product image + name reveal
│   │   │   └── EndCard.tsx         # Logo + "Seit 1906" + CTA
│   │   ├── utils/
│   │   │   ├── colors.ts      # Brand color constants
│   │   │   └── fonts.ts       # Playfair, Lora, Lato font loaders
│   │   └── Root.tsx           # Composition registry
│   ├── out/                   # Rendered MP4 outputs (gitignored)
│   ├── public/                # Symlinks to ../assets/
│   ├── remotion.config.ts     # Remotion config
│   └── package.json           # Remotion dependencies
├── public/
│   └── videos/                # Final MP4s for gallery playback
│       ├── showcase-vernis-001.mp4
│       ├── before-after-terrasse-001.mp4
│       └── ...
├── assets/
│   ├── products/              # Product cutouts and catalog photos
│   │   ├── vernis/
│   │   ├── beize-eiche-dunkel/
│   │   └── ...
│   ├── scenes/                # KI-generated and hand-crafted scenes
│   │   ├── garden/
│   │   ├── nautical/
│   │   ├── workshop/
│   │   ├── interior/
│   │   ├── seasonal/
│   │   └── saisonstart/       # Step-by-step process shots
│   ├── before-after/          # Before/after reference pairs
│   ├── blog/                  # High-res blog reference images
│   ├── brand/                 # Logo and brand assets
│   ├── ai-art/                # Artistic KI-generated images
│   ├── references/            # Competitor and style references
│   └── sequences/             # Image sequences for specific reels
│       ├── gartenmoebel-renovation/
│       └── boot-deck-renovation/
├── .planning/
│   └── codebase/              # Architecture analysis documents
├── .next/                     # Build output (gitignored)
├── node_modules/              # Dependencies (gitignored)
├── package.json               # Next.js dependencies
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript config
├── CLAUDE.md                  # Project instructions and tech stack
└── README.md                  # Quick start guide
```

## Directory Purposes

**src/app:**
- Purpose: Next.js App Router routes and layouts
- Contains: Page components (.tsx files), layout wrapper, global styles
- Key files: `page.tsx` (home), `layout.tsx` (root wrapper), `globals.css` (Tailwind theme)

**src/components:**
- Purpose: Reusable React components for dashboard UI
- Contains: VideoGrid (filter + grid logic), VideoCard (individual card)
- Key files: `VideoGrid.tsx`, `VideoCard.tsx`

**src/data:**
- Purpose: Static data sources for dashboard
- Contains: Video metadata and asset registry
- Key files: `videos.json` (video entries), `asset-catalog.ts` (asset definitions)

**src/lib:**
- Purpose: Shared utilities and type definitions
- Contains: TypeScript interfaces and constants
- Key files: `types.ts` (VideoEntry, VideoType, Rating, AssetEntry, AssetCategory)

**remotion/src/compositions:**
- Purpose: Video composition definitions (each .tsx = one renderable video type)
- Contains: Full reel compositions with scene sequences and timing
- Key files: `GartenmobelRenovation.tsx` (before-after tutorial), `BootDeckRenovation.tsx` (boat reel)

**remotion/src/components:**
- Purpose: Reusable animation components for all compositions
- Contains: Base scene wrapper (ImageScene), overlays (badges, labels), reveals, end cards
- Key files: All components here are imported by compositions

**remotion/src/utils:**
- Purpose: Brand constants and font definitions
- Contains: Color values (matching letonkinois.de), font loaders from Google Fonts
- Key files: `colors.ts` (brand palette), `fonts.ts` (Playfair/Lora/Lato)

**assets/products:**
- Purpose: Product photography — used in ProductReveal components
- Contains: Cutouts (freigestellt) and catalog photos with numbered variants
- Subdirs: `vernis/`, `beize-eiche-dunkel/`, `marine-no1/`, etc.
- Note: NEVER generate products in Gemini — always use real photos

**assets/scenes:**
- Purpose: Environmental and process images for video backgrounds
- Contains: Subcategories: garden (Gartenmöbel), nautical (Boot & Meer), workshop, interior, seasonal, saisonstart (step process)
- Subdirs: garden-furniture.png, yacht-deck.png, workshop-traditional.png, etc.
- Note: KI-generated images live in subcategory "KI-Tests"

**assets/sequences:**
- Purpose: Image sequences specific to multi-scene compositions
- Contains: Numbered frames for reel "actors"
- Subdirs: `gartenmoebel-renovation/` (5 images: 01-vorher, 02-reinigen, 03-schleifen, 04-oelen, 05-ergebnis)
- Usage: Referenced in Remotion compositions as `${SEQ}/01-vorher.png`

**assets/blog:**
- Purpose: Reference images used in production documentation
- Contains: Real, realistic before/after photos (not AI-generated)
- Key: vorher-verwitterte-gartenmoebel.jpg (only realistic weathered reference)

**public/videos:**
- Purpose: Rendered MP4 files served by Next.js to dashboard
- Contains: Final videos ready for playback and review
- Lifecycle: Generated by Remotion CLI → copied to public/videos/ → linked in videos.json

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Gallery dashboard home page
- `src/app/video/[id]/page.tsx`: Video detail page with player and metadata
- `src/app/assets/page.tsx`: Asset browser with lightbox
- `remotion/src/index.ts`: Remotion root, calls registerRoot

**Configuration:**
- `src/app/globals.css`: Tailwind theme (colors, fonts)
- `package.json`: Next.js dependencies and scripts
- `remotion/package.json`: Remotion dependencies
- `remotion/remotion.config.ts`: Remotion rendering options

**Core Logic:**
- `src/lib/types.ts`: All TypeScript type definitions
- `src/data/videos.json`: Video metadata (single source of truth)
- `src/data/asset-catalog.ts`: Asset registry with category mappings
- `remotion/src/Root.tsx`: Composition registry (what reels exist and at what resolution)

**Testing:**
- No tests implemented yet

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g., `VideoCard.tsx`, `ImageScene.tsx`)
- Pages: `page.tsx` in route directory
- Configuration: `[name].config.ts` (e.g., `remotion.config.ts`)
- Data: `[name].json` or `[name].ts` (e.g., `videos.json`, `asset-catalog.ts`)
- Utilities: `[name].ts` in utils/ directory (e.g., `colors.ts`, `fonts.ts`)

**Directories:**
- React components: `components/`
- Pages/routes: `app/[route]/`
- Data and types: `data/` and `lib/`
- Utilities: `utils/`
- Compositions: `compositions/`
- Assets: `assets/[category]/[subcategory]/`

**Variables:**
- Constants (colors, timing): `UPPER_CASE` (e.g., `GARTENMOEBEL_RENOVATION_DURATION`, `VIDEO_TYPE_LABELS`)
- React hooks/state: `camelCase` (e.g., `filter`, `lightbox`)
- Interpolation variables: `camelCase` (e.g., `textOpacity`, `checkScale`)

**Types:**
- Interfaces: `PascalCase` (e.g., `VideoEntry`, `AssetEntry`)
- Unions: `camelCase` (e.g., `VideoType`, `Rating`)
- Maps/lookups: `UPPER_CASE` (e.g., `VIDEO_TYPE_LABELS`, `VIDEO_TYPE_COLORS`)

## Where to Add New Code

**New Feature:**
- Primary code: `src/components/` for new dashboard UI, or `remotion/src/components/` for new animation elements
- Tests: Not yet in place — add to `src/__tests__/` when testing is implemented

**New Composition (Reel Type):**
- Implementation: `remotion/src/compositions/[CompositionName].tsx`
- Pattern: Export component and duration constant, import in `Root.tsx` as new `<Composition>`, use existing components (ImageScene, StepBadge, etc.)
- Add to `src/data/videos.json` with entry referencing the new composition's ID

**New Scene Component:**
- Add to: `remotion/src/components/`
- Pattern: Stateless React FC, use `useCurrentFrame()` for timing, accept props for customization
- Export from component file, import in compositions as needed

**Utilities:**
- Shared helpers: `src/lib/` for Next.js side, `remotion/src/utils/` for composition side
- New color/theme variable: Add to `src/app/globals.css` theme block AND `remotion/src/utils/colors.ts` for consistency
- New font: Add to `remotion/src/utils/fonts.ts` via @remotion/google-fonts loader

**Assets:**
- Product photos: `assets/products/[product-name]/`
- Scene backgrounds: `assets/scenes/[category]/`
- Image sequences for reels: `assets/sequences/[reel-name]/[01-name].png`, reference as `${SEQ}/01-name.png` in composition

**Video Metadata:**
- Add entry to `src/data/videos.json` with id, title, type, videoFile path, duration, captions, hashtags, rating, products, pipeline type
- Ensure videoFile matches MP4 in `public/videos/`

## Special Directories

**assets/sequences/[reel-name]:**
- Purpose: Image sequences for specific reels (e.g., gartenmoebel-renovation)
- Generated: Partially by Gemini (AI images) or by hand (real photos)
- Committed: Yes — version control for reel assets
- Naming: `[02-step-name].png` (zero-padded, descriptive)

**remotion/out/:**
- Purpose: Temporary render output from Remotion studio
- Generated: Yes (by `npm run render:gartenmoebel`)
- Committed: No (gitignored — .mp4 files are large)
- Lifecycle: Render → review locally → copy to public/videos/

**public/videos/:**
- Purpose: Final MP4s served to dashboard
- Generated: No (manually copied from remotion/out/)
- Committed: No — too large for git (should be in object storage in production)
- Lifecycle: Placed here for Vercel deployment

**public/assets/:**
- Purpose: Symlinks to ../assets/ for fast CDN serving
- Generated: No (symlinks created at build time or manually)
- Committed: Depends on hosting strategy (can be symlinks in git)

**.next/:**
- Purpose: Next.js build artifacts
- Generated: Yes (by `npm run build`)
- Committed: No (gitignored)

---

*Structure analysis: 2026-03-26*
