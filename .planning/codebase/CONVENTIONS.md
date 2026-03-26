# Coding Conventions

**Analysis Date:** 2026-03-26

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension (e.g., `VideoCard.tsx`, `EndCard.tsx`)
- Utility/data files: camelCase with `.ts` extension (e.g., `asset-catalog.ts`, `colors.ts`)
- Type files: `types.ts` (e.g., `src/lib/types.ts`)
- Pages: lowercase with directory structure following Next.js conventions (e.g., `src/app/page.tsx`, `src/app/video/[id]/page.tsx`)

**Functions:**
- Component functions: PascalCase (e.g., `VideoCard`, `RatingBadge`, `ImageScene`)
- Helper/utility functions: camelCase (e.g., `interpolate`, `registerRoot`)
- Event handlers: camelCase with `on` prefix for inline handlers or direct references (e.g., `onMouseOver`, `onClick`)

**Variables:**
- Constants (exported): UPPER_SNAKE_CASE for record/object keys in constants, or as const exports (e.g., `ALL_TYPES`, `GARTENMOEBEL_RENOVATION_DURATION`)
- Component props: camelCase (e.g., `zoomFrom`, `gradientStrength`, `cta`)
- Local variables: camelCase (e.g., `filtered`, `grouped`, `scale`)
- State variables: camelCase (e.g., `filter`, `lightbox`, `copied`)

**Types:**
- Interfaces: PascalCase with `I` prefix not used. Pattern: `VideoEntry`, `AssetEntry`, `AssetCategory`
- Union types: camelCase or PascalCase depending on domain (e.g., `VideoType`, `Rating`, `AssetCategory`)
- Type aliases for unions: use `type` keyword, options separated by pipes with string literals (e.g., `type VideoType = "showcase" | "before-after" | "how-to" | ...`)

## Code Style

**Formatting:**
- Prettier (implicit via Next.js lint configuration)
- 2-space indentation (observed in all files)
- Single quotes in JSX attributes, double quotes in TS/JS strings where needed
- Semicolons at end of statements

**Linting:**
- Tool: ESLint via `next lint`
- Config: Uses Next.js recommended ESLint config (`eslint-config-next`)
- Notable rule: `@next/next/no-img-element` is disabled with `/* eslint-disable-next-line @next/next/no-img-element */` in `src/app/assets/page.tsx` for direct `<img>` usage with `loading="lazy"`
- No custom `.eslintrc` file present; uses Next.js defaults

## Import Organization

**Order:**
1. React/Next.js framework imports
2. Type imports from `@types/*` or local type definitions
3. Component imports from relative or alias paths
4. Utility/data imports
5. Static file imports (e.g., `staticFile` from Remotion)

**Example from `VideoCard.tsx`:**
```typescript
"use client";

import Link from "next/link";
import { VideoEntry, VIDEO_TYPE_LABELS, VIDEO_TYPE_COLORS } from "@/lib/types";
```

**Path Aliases:**
- `@/*` maps to `./src/*` (defined in `tsconfig.json`)
- Consistently used across all files for imports from `src/` directory
- Examples: `@/lib/types`, `@/components/VideoCard`, `@/data/videos.json`

## Error Handling

**Patterns:**
- Conditional rendering for error states (e.g., "Video nicht gefunden" in `src/app/video/[id]/page.tsx` at line 37-46)
- No try-catch blocks observed in current codebase
- Defensive null-checks with optional chaining (e.g., `video?.products?.length`)
- Fallback values in prop destructuring (e.g., `cta = "Speicher dir das!"` in `EndCard.tsx`)

**Error States:**
- Return minimal error UI with back navigation link
- Use clear German messages for user-facing errors

## Logging

**Framework:** `console` (no logging framework detected)

**Patterns:**
- No logging statements found in production code
- Console usage would be implicit for debugging (not observed in examined files)
- No structured logging or log level management

## Comments

**When to Comment:**
- JSDoc-style comments for component props and functions
- Inline comments for complex logic or non-obvious behavior

**JSDoc/TSDoc:**
- Used for component documentation with type annotations (e.g., `EndCard.tsx` lines 13-18)
- Pattern: brief description, then prop type definitions in function signature
- Example from `EndCard.tsx`:
```typescript
/**
 * End Card: Weiß/Cream mit Logo, "Seit 1906", CTA.
 * Clean wie die Website, rot als Akzent.
 */
export const EndCard: React.FC<{
  cta?: string;
}> = ({ cta = "Speicher dir das!" }) => {
```

## Function Design

**Size:**
- Component functions typically 40-80 lines including JSX
- Composition functions (Remotion) may exceed 100 lines for complex animations
- Prefer extracting sub-components for repeated patterns

**Parameters:**
- Components receive props object: `{ prop1, prop2 }` destructured in parameter
- Utility functions use typed parameters with full type annotations
- Optional parameters use `?` in type definition and default values in destructuring
- Example: `{ zoomFrom = 1.0, zoomTo = 1.06, gradientStrength = 0.8, children }`

**Return Values:**
- React components return `JSX.Element` implicitly or explicitly typed as `React.FC<Props>`
- Regular functions return typed values (e.g., `Record<string, AssetEntry[]>`)
- Conditional renders return `null` or early return pattern to avoid wrapper elements
- Example from `VideoGrid.tsx` line 38: `if (count === 0) return null;`

## Module Design

**Exports:**
- Named exports for components and utilities: `export default function X` or `export const X`
- Type exports use `export type` keyword for type-only exports
- Constants exported as `export const CONSTANT_NAME`
- Example from `types.ts`: `export type VideoType = "showcase" | "before-after" | ...`

**Barrel Files:**
- Not used (no `index.ts` files acting as re-export barrels observed)
- Each component/utility file is imported directly

## Brand Color System

**CSS Variables (globals.css):**
- Uses Tailwind CSS v4 `@theme` block for brand colors
- Colors are defined as `--color-*` CSS custom properties
- Text and background colors follow accessibility contrast requirements
- Specific colors tied to Le Tonkinois brand identity (Red #B50606, Wood tones, Cream backgrounds)

**Tailwind Class Usage:**
- Semantic color classes: `bg-brand-red`, `text-text-dark`, `bg-wood-amber`, etc.
- Brand red used for primary actions and highlights
- Wood tones (`wood-amber`, `wood-honey`, `wood-walnut`) for secondary/tertiary elements
- Text colors: `text-text-dark`, `text-text-muted`, `text-text-light` for hierarchy

**Typography System:**
- Headline font: `Lora` (serif, variable from Google Fonts)
- Body font: `Lato` (sans-serif, variable from Google Fonts)
- Accessed via CSS variables: `--font-headline` and `--font-body`
- Used in Tailwind classes: `font-[family-name:var(--font-headline)]`
- Remotion uses imported font objects from `@remotion/google-fonts` or string values

---

*Convention analysis: 2026-03-26*
