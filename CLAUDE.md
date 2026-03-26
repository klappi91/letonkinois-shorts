# Le Tonkinois Shorts

Video-Dashboard & Content-Pipeline für Le Tonkinois Instagram Reels & Shorts.

## Konzept

Automatisierte Video-Erstellung mit Content-Rotation für den Le Tonkinois Instagram-Kanal. Videos werden generiert, auf einer Vercel-hosted Gallery reviewed, und perspektivisch per One-Click auf Instagram veröffentlicht.

## Tech Stack

| Komponente | Technologie |
|-----------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Video-Pipeline | Gemini Image + Gemini Video + Remotion |
| Deployment | Vercel |
| Daten | JSON-basiert (videos.json) |

## Video-Pipeline

3 Generierungs-Pfade (je nach Komplexität):

1. **Remotion Only** — Produktfotos + Animation/Text-Overlays → MP4
2. **Gemini Image + Remotion** — KI-generierte Szenen + Compositing → MP4
3. **Gemini Image + Gemini Video + Remotion** — KI-Bild → KI-Video → Compositing → MP4

## Content-Rotation

Video-Typen rotieren für Abwechslung auf dem Instagram-Kanal:

| Typ | Beschreibung | Häufigkeit |
|-----|-------------|-----------|
| `showcase` | Einzelnes Produkt featured | 2x/Monat |
| `before-after` | Vorher/Nachher Transformation | 2x/Monat |
| `how-to` | Tipps & Tricks, häufige Fehler | 2x/Monat |
| `seasonal` | Saisonale Inhalte (Frühling, Sommer...) | 2x/Monat |
| `heritage` | Seit 1906, Tradition, Handwerk | 1x/Monat |
| `lifestyle` | Stimmungsbilder, Atmosphäre | 1x/Monat |

## Branding

Übernommen von letonkinois-content:
- **Fonts:** Lora (Headlines) + Lato (Body)
- **Farben:** Brand Red #B50606, Warm Woods (#D4A76A, #E8B84B, #6B4226), Cream #FFF8F0
- **Ton:** Premium & authentisch, kein Stock-Photo-Look. Deutsche Vorstadtgarten-Atmosphäre.
- **WICHTIG:** Produkt-Dosen/Flaschen NIEMALS von Gemini generieren — immer echte Produktfotos aus dem Katalog verwenden.

## Struktur

```
src/                          # Next.js Gallery Dashboard
├── app/
│   ├── page.tsx              # Gallery Dashboard
│   ├── layout.tsx            # Root Layout mit Branding
│   └── video/[id]/page.tsx   # Video Detail + Player + Caption
├── components/
│   ├── VideoCard.tsx         # Video-Karte für Grid
│   └── VideoGrid.tsx         # Grid mit Filter
├── data/
│   └── videos.json           # Video-Metadaten
└── lib/
    └── types.ts              # TypeScript Types
assets/
├── sequences/                # Generierte Bild-Sequenzen für Reels
├── products/                 # Produktfotos + Katalog
├── brand/                    # Logo, Icon
├── blog/                     # Echte Referenzfotos
└── scenes/                   # AI-generierte Szenen
remotion/                     # Eigenständiges Remotion-Projekt
├── src/
│   ├── index.ts              # registerRoot Entry Point
│   ├── Root.tsx              # Composition Registry
│   ├── utils/
│   │   ├── colors.ts         # Brand-Farben (aus letonkinois.de)
│   │   └── fonts.ts          # Playfair Display + Lora + Lato
│   ├── components/           # Wiederverwendbare Bausteine
│   │   ├── ImageScene.tsx    # Fullscreen-Bild + Ken Burns + Gradient
│   │   ├── StepBadge.tsx     # "1/3" Badge in Brand Red
│   │   ├── SceneLabel.tsx    # 1-3 Wörter Label
│   │   ├── ProductReveal.tsx # Dose auf Cream-BG
│   │   └── EndCard.tsx       # Logo + "Seit 1906" + CTA
│   └── compositions/
│       └── GartenmobelRenovation.tsx
├── public/ → Symlinks zu ../assets/
└── out/                      # Gerenderte MP4s
public/
└── videos/                   # Finale MP4s für Gallery
```

## Befehle

```bash
# Dashboard
npm run dev        # Dev Server (lokal)
npm run build      # Production Build
npm run lint       # ESLint

# Remotion (im remotion/ Verzeichnis)
cd remotion && npm run studio          # Vorschau im Browser
cd remotion && npm run render:gartenmoebel  # MP4 rendern
```

## Roadmap

- [x] Phase 1: Gallery Dashboard + Detail-Seite
- [x] Phase 2: Erste Videos generieren (5 verschiedene Typen)
- [ ] Phase 3: Vercel Deployment
- [ ] Phase 4: Cron Job für tägliche Generierung
- [ ] Phase 5: Rating-System persistent machen (Supabase)
- [ ] Phase 6: Instagram API Integration (One-Click Publish)

## Verwandte Projekte

- **letonkinois-content/** — Content-Toolkit, Remotion-Projekt, Produkt-Katalog, Prompts
- **creative-web-lab/** — Web-Komponenten Lab (Architektur-Referenz)
- **gemini-video/** — Claude Code Skill für Veo 3.1 Video-Generierung

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Le Tonkinois Shorts**

Eine automatisierte Content-Pipeline für Le Tonkinois Instagram Reels & Shorts. Täglich werden neue Shorts per Cron-Job generiert (Claude Code + Gemini + Remotion), ein kleines Team bewertet sie über eine Web-Oberfläche mit Star-Rating und Pros/Cons, und das Feedback fließt automatisch in die Verbesserung der Generierungs-Prompts zurück.

**Core Value:** Der Feedback-Loop muss laufen: Shorts generieren → Team bewertet → Feedback verbessert die nächste Generation.

### Constraints

- **Tech Stack:** Next.js 16 + Supabase (Auth + DB) + Vercel — keine zusätzlichen Services
- **Auth:** Supabase Auth mit Invite-Only (Admin erstellt Accounts per Supabase Dashboard oder API)
- **Video-Storage:** Videos bleiben in `public/videos/` (Vercel-hosted), keine Supabase Storage für Videos
- **Branding:** Strikt nach letonkinois.de — Rot+Weiß+Playfair Display, keine "moderne Craft" Ästhetik
- **Produktfotos:** NIEMALS KI-generierte Dosen/Flaschen — immer echte Fotos aus dem Katalog
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 6.0.2 - Frontend application code (`src/`) and Remotion compositions
- JavaScript (Node.js) - Build tooling and configuration
- HTML/CSS - Generated via React and Tailwind
## Runtime
- Node.js (version specified via `.nvmrc` or package manager)
- Browser (9:16 portrait viewport, 1080x1920px for Instagram Reels/Shorts)
- npm
- Lockfile: `package-lock.json` present
## Frameworks
- Next.js 16.2.1 - Full-stack React framework with file-based routing
- React 19.2.4 - UI component library
- Remotion 4.0.261 - Programmatic video rendering engine
- @remotion/google-fonts 4.0.261 - Google Fonts integration for video titles/overlays
- @remotion/transitions 4.0.261 - Built-in video transition effects
- Tailwind CSS 4.2.2 - Utility-first CSS framework
- @remotion/player 4.0.261 - Embedded video player component (for potential admin UI)
## Key Dependencies
- Next.js 16.2.1 - Ensures modern React patterns, SSR, API routes support
- Remotion 4.0.261 - Video generation pipeline; version locked to ensure render stability
- React 19.2.4 - Latest stable with concurrent rendering
- TypeScript 6.0.2 - Type safety across frontend and Remotion compositions
- @types/node 25.5.0 - Node.js type stubs
- @types/react 19.2.14 - React type definitions
- @types/react-dom 19.2.3 - React DOM type definitions
- ESLint 9.39.4 - JavaScript/TypeScript linter
- eslint-config-next 16.2.1 - Next.js-specific linting rules
- postcss 8.5.8 - CSS transformation and Tailwind compilation
## Configuration
- Vercel project ID: `prj_gxnc6bTP8qRjjpnL9NkAnVdGGZz`
- Vercel org: `team_rynVBCoqd0ZJBzDuSBslGi1H`
- No `.env` file detected in repository (likely configured in Vercel dashboard)
- `next.config.ts` - Empty/default Next.js config (no custom settings)
- `remotion.config.ts` - Remotion-specific settings:
- `tsconfig.json` - TypeScript compiler options:
- `postcss.config.mjs` - PostCSS configuration with Tailwind plugin
## Platform Requirements
- Node.js runtime
- npm for package management
- Modern terminal/CLI for Remotion studio preview
- Vercel (serverless deployment)
## Data Format
- `src/data/videos.json` - JSON array of `VideoEntry` objects
- `src/data/asset-catalog.ts` - TypeScript constant with `AssetEntry[]`
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase with `.tsx` extension (e.g., `VideoCard.tsx`, `EndCard.tsx`)
- Utility/data files: camelCase with `.ts` extension (e.g., `asset-catalog.ts`, `colors.ts`)
- Type files: `types.ts` (e.g., `src/lib/types.ts`)
- Pages: lowercase with directory structure following Next.js conventions (e.g., `src/app/page.tsx`, `src/app/video/[id]/page.tsx`)
- Component functions: PascalCase (e.g., `VideoCard`, `RatingBadge`, `ImageScene`)
- Helper/utility functions: camelCase (e.g., `interpolate`, `registerRoot`)
- Event handlers: camelCase with `on` prefix for inline handlers or direct references (e.g., `onMouseOver`, `onClick`)
- Constants (exported): UPPER_SNAKE_CASE for record/object keys in constants, or as const exports (e.g., `ALL_TYPES`, `GARTENMOEBEL_RENOVATION_DURATION`)
- Component props: camelCase (e.g., `zoomFrom`, `gradientStrength`, `cta`)
- Local variables: camelCase (e.g., `filtered`, `grouped`, `scale`)
- State variables: camelCase (e.g., `filter`, `lightbox`, `copied`)
- Interfaces: PascalCase with `I` prefix not used. Pattern: `VideoEntry`, `AssetEntry`, `AssetCategory`
- Union types: camelCase or PascalCase depending on domain (e.g., `VideoType`, `Rating`, `AssetCategory`)
- Type aliases for unions: use `type` keyword, options separated by pipes with string literals (e.g., `type VideoType = "showcase" | "before-after" | "how-to" | ...`)
## Code Style
- Prettier (implicit via Next.js lint configuration)
- 2-space indentation (observed in all files)
- Single quotes in JSX attributes, double quotes in TS/JS strings where needed
- Semicolons at end of statements
- Tool: ESLint via `next lint`
- Config: Uses Next.js recommended ESLint config (`eslint-config-next`)
- Notable rule: `@next/next/no-img-element` is disabled with `/* eslint-disable-next-line @next/next/no-img-element */` in `src/app/assets/page.tsx` for direct `<img>` usage with `loading="lazy"`
- No custom `.eslintrc` file present; uses Next.js defaults
## Import Organization
- `@/*` maps to `./src/*` (defined in `tsconfig.json`)
- Consistently used across all files for imports from `src/` directory
- Examples: `@/lib/types`, `@/components/VideoCard`, `@/data/videos.json`
## Error Handling
- Conditional rendering for error states (e.g., "Video nicht gefunden" in `src/app/video/[id]/page.tsx` at line 37-46)
- No try-catch blocks observed in current codebase
- Defensive null-checks with optional chaining (e.g., `video?.products?.length`)
- Fallback values in prop destructuring (e.g., `cta = "Speicher dir das!"` in `EndCard.tsx`)
- Return minimal error UI with back navigation link
- Use clear German messages for user-facing errors
## Logging
- No logging statements found in production code
- Console usage would be implicit for debugging (not observed in examined files)
- No structured logging or log level management
## Comments
- JSDoc-style comments for component props and functions
- Inline comments for complex logic or non-obvious behavior
- Used for component documentation with type annotations (e.g., `EndCard.tsx` lines 13-18)
- Pattern: brief description, then prop type definitions in function signature
- Example from `EndCard.tsx`:
## Function Design
- Component functions typically 40-80 lines including JSX
- Composition functions (Remotion) may exceed 100 lines for complex animations
- Prefer extracting sub-components for repeated patterns
- Components receive props object: `{ prop1, prop2 }` destructured in parameter
- Utility functions use typed parameters with full type annotations
- Optional parameters use `?` in type definition and default values in destructuring
- Example: `{ zoomFrom = 1.0, zoomTo = 1.06, gradientStrength = 0.8, children }`
- React components return `JSX.Element` implicitly or explicitly typed as `React.FC<Props>`
- Regular functions return typed values (e.g., `Record<string, AssetEntry[]>`)
- Conditional renders return `null` or early return pattern to avoid wrapper elements
- Example from `VideoGrid.tsx` line 38: `if (count === 0) return null;`
## Module Design
- Named exports for components and utilities: `export default function X` or `export const X`
- Type exports use `export type` keyword for type-only exports
- Constants exported as `export const CONSTANT_NAME`
- Example from `types.ts`: `export type VideoType = "showcase" | "before-after" | ...`
- Not used (no `index.ts` files acting as re-export barrels observed)
- Each component/utility file is imported directly
## Brand Color System
- Uses Tailwind CSS v4 `@theme` block for brand colors
- Colors are defined as `--color-*` CSS custom properties
- Text and background colors follow accessibility contrast requirements
- Specific colors tied to Le Tonkinois brand identity (Red #B50606, Wood tones, Cream backgrounds)
- Semantic color classes: `bg-brand-red`, `text-text-dark`, `bg-wood-amber`, etc.
- Brand red used for primary actions and highlights
- Wood tones (`wood-amber`, `wood-honey`, `wood-walnut`) for secondary/tertiary elements
- Text colors: `text-text-dark`, `text-text-muted`, `text-text-light` for hierarchy
- Headline font: `Lora` (serif, variable from Google Fonts)
- Body font: `Lato` (sans-serif, variable from Google Fonts)
- Accessed via CSS variables: `--font-headline` and `--font-body`
- Used in Tailwind classes: `font-[family-name:var(--font-headline)]`
- Remotion uses imported font objects from `@remotion/google-fonts` or string values
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Dual-application monorepo: Next.js gallery dashboard + separate Remotion studio
- Client-side video review and filtering with JSON data source
- Server-rendered gallery, client-rendered detail pages
- Remotion handles programmatic video composition (MP4 rendering)
- Asset catalog system for managing images across dashboard and Remotion
## Layers
- Purpose: Instagram shorts gallery and video review dashboard for Le Tonkinois
- Location: `src/app/`, `src/components/`
- Contains: Page routes (home gallery, video detail, asset browser), UI components (VideoGrid, VideoCard, filter logic)
- Depends on: TypeScript types (`src/lib/types.ts`), JSON data (`src/data/videos.json`), asset catalog
- Used by: End users accessing Vercel-hosted dashboard
- Purpose: Programmatic video generation with Ken Burns zoom, text overlays, transitions
- Location: `remotion/src/`
- Contains: Composition definitions (GartenmobelRenovation, BootDeckRenovation), reusable animation components (ImageScene, StepBadge, ProductReveal, EndCard)
- Depends on: Remotion core, @remotion/transitions, brand utilities (colors, fonts)
- Used by: Remotion CLI to render MP4 outputs to `remotion/out/`
- Purpose: Metadata repository for all videos and assets
- Location: `src/data/`
- Contains: `videos.json` (video metadata), `asset-catalog.ts` (TypeScript-based asset registry with categories and subcategories)
- Depends on: None
- Used by: Dashboard pages and Remotion compositions via static imports
- Purpose: Centralized color, typography, and design token management
- Location: `src/app/globals.css` (Tailwind tokens), `remotion/src/utils/colors.ts`, `remotion/src/utils/fonts.ts`
- Contains: Color palette (brand red #B50606, wood tones, text colors), font definitions (Lora, Lato, Playfair Display)
- Depends on: None
- Used by: All components and compositions for visual consistency
## Data Flow
- **Dashboard:** React hooks (`useState`) for filter state and lightbox state in client components
- **Video metadata:** JSON static import (immutable during app runtime)
- **Remotion:** Interpolation of `useCurrentFrame()` for animation timing
## Key Abstractions
- Purpose: Type-safe video metadata contract
- Examples: `src/lib/types.ts`
- Pattern: TypeScript interface with required/optional fields, includes rating (pending/approved/rejected), pipeline type, hashtags, captions (DE/FR), products featured
- Purpose: Constrain video categorization to 6 allowed types
- Examples: "showcase", "before-after", "how-to", "seasonal", "heritage", "lifestyle"
- Pattern: Branded string union with associated label and color maps
- Purpose: Metadata for visual assets used in compositions
- Examples: `src/data/asset-catalog.ts`
- Pattern: Path-based registry with category/subcategory hierarchy, allows quick lookups by asset type
- Purpose: Reusable base for Ken Burns animation + gradient overlay
- Examples: `remotion/src/components/ImageScene.tsx`
- Pattern: Higher-order component wrapping `<AbsoluteFill>`, accepts src, zoomFrom/zoomTo, gradientStrength, children (for overlays)
- Usage: Every scene in a composition uses this to provide consistent visual motion
- Purpose: Composition building blocks for standard reel elements
- Examples: `remotion/src/components/*.tsx`
- Pattern: Stateless React components using `useCurrentFrame()` for fade-in/scale animations
- Allows reuse across multiple compositions
## Entry Points
- Location: `src/app/page.tsx`
- Triggers: User visits root URL `/`
- Responsibilities: Render gallery header with stats, pass videos array to filter component, handle responsive layout
- Location: `src/app/video/[id]/page.tsx`
- Triggers: User clicks video card
- Responsibilities: Look up video by ID, render player, display captions/hashtags, rating buttons (buttons not yet functional)
- Location: `src/app/assets/page.tsx`
- Triggers: User clicks "Bild-Bibliothek" link
- Responsibilities: Render filterable grid of all assets, enable lightbox preview
- Location: `remotion/src/index.ts` → `remotion/src/Root.tsx`
- Triggers: Developer runs `npm run studio` or `npm run render:gartenmoebel`
- Responsibilities: Register composition definitions, render to MP4 on CLI invocation
- Location: `src/app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Set metadata (title, description), import fonts (Lora, Lato), wrap children with HTML/body
## Error Handling
- Video detail page checks if video exists by ID — returns 404 message with link back to gallery if not found
- Asset browser filters empty categories — no error, just hides empty categories in grid
- No error boundaries implemented yet — client errors will propagate to Next.js error boundary
- No API error handling (no API calls) — all data is static JSON
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
