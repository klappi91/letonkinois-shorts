# Testing Patterns

**Analysis Date:** 2026-03-26

## Test Framework

**Runner:**
- No test runner configured (Jest, Vitest, or other testing frameworks are not present in package.json)
- Only `next lint` is configured for linting

**Assertion Library:**
- Not detected (no testing framework installed)

**Run Commands:**
```bash
npm run lint        # ESLint via Next.js
npm run build       # Production build validation
npm run dev         # Dev server (for manual testing)
```

## Test File Organization

**Status:**
- **No automated tests present in the project**
- No `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files found in the main codebase
- Test files found only in `node_modules/` (from dependencies)

**Current Testing Approach:**
- Manual testing via dev server
- Visual validation of components in browser
- Build-time type checking via TypeScript (`strict: true` in `tsconfig.json`)

## Test Structure

**Code Quality Without Tests:**
- TypeScript strict mode enforces type safety
- Component props are fully typed (e.g., `VideoEntry` interface in `src/lib/types.ts`)
- Union types constrain valid values (e.g., `VideoType` with specific string literals)

**Example Type Safety from `src/lib/types.ts`:**
```typescript
export type VideoType =
  | "showcase"
  | "before-after"
  | "how-to"
  | "seasonal"
  | "heritage"
  | "lifestyle";

export interface VideoEntry {
  id: string;
  title: string;
  type: VideoType;
  createdAt: string;  // ISO date string
  videoFile: string;  // Relative path validation by convention
  duration: number;
  captionDe: string;
  hashtags: string[];
  rating: Rating;
  pipeline: "remotion" | "gemini-image+remotion" | "gemini-image+gemini-video+remotion";
}
```

## Mocking

**Status:**
- Not applicable (no test framework present)

**For Future Testing:**
- JSON data in `src/data/videos.json` and `src/data/asset-catalog.ts` would be mockable directly
- Components that depend on file paths would need mock static files or mock `staticFile()` from Remotion
- Browser APIs like `navigator.clipboard` (used in `CopyButton`) would need mocking

## Fixtures and Factories

**Test Data:**
- Live data: `src/data/videos.json` contains 5 sample videos
- Asset catalog: `src/data/asset-catalog.ts` exports static array of 154 assets

**Data Structure Example from `videos.json`:**
```json
{
  "id": "showcase-vernis-001",
  "title": "Le Tonkinois Vernis — Natürlicher Glanz seit 1906",
  "type": "showcase",
  "createdAt": "2026-03-24",
  "videoFile": "/videos/showcase-vernis-001.mp4",
  "duration": 15,
  "captionDe": "...",
  "hashtags": ["#letonkinois", "#holzschutz", ...],
  "rating": "pending",
  "products": ["Vernis"],
  "pipeline": "gemini-image+remotion"
}
```

**Location:**
- `src/data/videos.json` — Video metadata (imported as `VideoEntry[]`)
- `src/data/asset-catalog.ts` — Asset catalog with TypeScript types

## Coverage

**Requirements:**
- Not enforced
- No coverage reporting configured

## Test Types

**Unit Tests:**
- Not present
- Would be needed for: utility functions (if any existed), type guards, data transformation

**Integration Tests:**
- Not present
- Would be needed for: page rendering with data, component composition, client-side interactivity

**E2E Tests:**
- Not present
- No E2E framework configured (Playwright, Cypress, etc.)

## Common Patterns for Future Tests

**Async Testing:**
- Components using `use(params)` from React (e.g., `src/app/video/[id]/page.tsx` line 34) would require proper async handling
- Pattern: `use()` hook manages Promise unwrapping internally
```typescript
const { id } = use(params);  // params is Promise<{ id: string }>
```

**Error Testing:**
- Would validate conditional rendering of error states
- Example from `src/app/video/[id]/page.tsx` lines 37-46:
```typescript
if (!video) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-text-muted mb-4">Video nicht gefunden.</p>
        <Link href="/" className="text-brand-red hover:underline">
          Zurück zum Dashboard
        </Link>
      </div>
    </div>
  );
}
```

**Client-Side State Testing:**
- Components using `useState` (e.g., `VideoGrid`, `AssetsPage`) would need testing for:
  - Filter state updates
  - Lightbox visibility toggling
  - Copy button feedback (`copied` state)

Example from `src/app/assets/page.tsx` lines 23-24:
```typescript
const [filter, setFilter] = useState<AssetCategory | "all">("all");
const [lightbox, setLightbox] = useState<string | null>(null);
```

## Build-Time Validation

**TypeScript Compilation:**
```bash
npm run build  # Validates all TS/TSX files
```

**ESLint:**
```bash
npm run lint   # Checks style and potential issues
```

**What's Currently Validated:**
- Type correctness (strict mode: `true`)
- Unused variables/imports
- Next.js best practices (no unoptimized images in Image component where applicable)
- ESLint rules from `eslint-config-next`

## Remotion-Specific Testing

**Manual Validation:**
```bash
cd remotion && npm run studio   # Preview compositions in browser
cd remotion && npm run render:gartenmoebel  # Test render specific composition
```

**Frame Accuracy:**
- Animation frame calculations use `useCurrentFrame()` with `interpolate()` from Remotion
- Frame timing must be manually verified in studio preview
- Examples from `src/components/EndCard.tsx`:
```typescript
const logoOpacity = interpolate(frame, [5, 22], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

---

*Testing analysis: 2026-03-26*

## Recommendations for Testing Implementation

If testing is added in future phases:

1. **Start with Jest or Vitest** for unit tests
2. **Add React Testing Library** for component testing
3. **Test data-driven components first:** `VideoGrid`, `VideoCard`, `AssetsPage`
4. **Test type-critical logic:** filtering, rating state, asset grouping
5. **Add E2E tests with Playwright** for critical user flows: navigation, copy-to-clipboard, filter interactions
6. **Mock external data:** Create factories for `VideoEntry` and `AssetEntry` objects
