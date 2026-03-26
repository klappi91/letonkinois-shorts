# Technology Stack

**Analysis Date:** 2026-03-26

## Languages

**Primary:**
- TypeScript 6.0.2 - Frontend application code (`src/`) and Remotion compositions
- JavaScript (Node.js) - Build tooling and configuration

**Secondary:**
- HTML/CSS - Generated via React and Tailwind

## Runtime

**Environment:**
- Node.js (version specified via `.nvmrc` or package manager)
- Browser (9:16 portrait viewport, 1080x1920px for Instagram Reels/Shorts)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.2.1 - Full-stack React framework with file-based routing
  - SSG/SSR for gallery dashboard
  - Built-in development server with Turbopack (`next dev --turbopack`)
- React 19.2.4 - UI component library

**Video Composition:**
- Remotion 4.0.261 - Programmatic video rendering engine
  - CLI for preview (`remotion studio`) and rendering (`remotion render`)
  - 9:16 portrait format (Instagram Reels/Shorts spec)
  - Component-based video composition in TypeScript
  - Output format: JPEG frames → MP4 (configurable via `remotion.config.ts`)

**Font Loader:**
- @remotion/google-fonts 4.0.261 - Google Fonts integration for video titles/overlays

**Transitions:**
- @remotion/transitions 4.0.261 - Built-in video transition effects

**Styling:**
- Tailwind CSS 4.2.2 - Utility-first CSS framework
  - Custom theme with Le Tonkinois brand colors (`globals.css`)
  - PostCSS integration via `@tailwindcss/postcss` 4.2.2

**UI Runtime:**
- @remotion/player 4.0.261 - Embedded video player component (for potential admin UI)

## Key Dependencies

**Critical:**
- Next.js 16.2.1 - Ensures modern React patterns, SSR, API routes support
- Remotion 4.0.261 - Video generation pipeline; version locked to ensure render stability
- React 19.2.4 - Latest stable with concurrent rendering
- TypeScript 6.0.2 - Type safety across frontend and Remotion compositions

**Type Definitions:**
- @types/node 25.5.0 - Node.js type stubs
- @types/react 19.2.14 - React type definitions
- @types/react-dom 19.2.3 - React DOM type definitions

**Build & Linting:**
- ESLint 9.39.4 - JavaScript/TypeScript linter
- eslint-config-next 16.2.1 - Next.js-specific linting rules

**PostCSS:**
- postcss 8.5.8 - CSS transformation and Tailwind compilation

## Configuration

**Environment:**
- Vercel project ID: `prj_gxnc6bTP8qRjjpnL9NkAnVdGGZz`
- Vercel org: `team_rynVBCoqd0ZJBzDuSBslGi1H`
- No `.env` file detected in repository (likely configured in Vercel dashboard)

**Build:**
- `next.config.ts` - Empty/default Next.js config (no custom settings)
- `remotion.config.ts` - Remotion-specific settings:
  - Image format: JPEG (faster than PNG for video frames)
  - Overwrite output: enabled (MP4 files in `remotion/out/`)
- `tsconfig.json` - TypeScript compiler options:
  - Target: ES2017
  - JSX: react-jsx (automatic runtime)
  - Path alias: `@/*` maps to `./src/*`
  - Strict mode enabled
- `postcss.config.mjs` - PostCSS configuration with Tailwind plugin

## Platform Requirements

**Development:**
- Node.js runtime
- npm for package management
- Modern terminal/CLI for Remotion studio preview

**Production:**
- Vercel (serverless deployment)
  - Next.js auto-detected and optimized
  - Environment variables stored in Vercel dashboard
  - Preview deployments on pull requests
  - Automatic SSL/HTTPS

## Data Format

**Videos Metadata:**
- `src/data/videos.json` - JSON array of `VideoEntry` objects
  - Contains video metadata: ID, title, type, duration, captions (DE/FR), hashtags, rating status
  - No database (file-based for now; Phase 5 roadmap includes Supabase migration)

**Asset Catalog:**
- `src/data/asset-catalog.ts` - TypeScript constant with `AssetEntry[]`
  - Categorized images for compositions (products, scenes, blog, brand, AI-generated)
  - Used by Remotion compositions to select background/overlay images

---

*Stack analysis: 2026-03-26*
