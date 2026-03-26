# Codebase Concerns

**Analysis Date:** 2026-03-26

## Rating System Not Persisted

**Issue:** Video ratings ("Freigeben", "Ablehnen", "Zur Seite legen") are UI buttons with no backend functionality

**Files:**
- `src/app/video/[id]/page.tsx` (lines 169-185)
- `src/data/videos.json`

**Current state:** Rating buttons exist on detail page but do nothing when clicked. All ratings are hardcoded to "pending" in JSON.

**Impact:**
- Videos cannot be approved for publication
- No way to filter reviewed content
- Manual JSON editing required to mark videos as approved/rejected
- Blocks Phase 5 (rating persistence) and Phase 6 (Instagram API integration)

**Fix approach:**
- Add API route `/api/videos/[id]/rate` (POST)
- Store ratings in Supabase `videos` table (add `rating` column, `rated_at` timestamp)
- Client-side mutation in VideoDetail component to call API
- Fetch initial ratings from API instead of static JSON
- Required for Vercel deployment Phase 3

---

## Remotion Image Assets Not Included in Build

**Issue:** Remotion compositions reference sequence images in `assets/sequences/` but these are not copied to `public/` or configured as static assets

**Files:**
- `remotion/src/compositions/GartenmobelRenovation.tsx` (line 15: `const SEQ = "sequences/gartenmoebel-renovation"`)
- `remotion/src/compositions/BootDeckRenovation.tsx`
- `remotion/src/components/ImageScene.tsx` (uses `staticFile()`)

**Current assets:**
- `assets/sequences/gartenmoebel-renovation/*.png` (01-vorher, 02-reinigen, 03-schleifen, 04-oelen, 05-ergebnis)
- `assets/sequences/boot-deck-renovation/*.png` (5 sequence images)

**Impact:**
- Remotion render will fail or show broken image placeholders when building for production
- Videos render locally in studio but will break on Vercel (different asset path)
- `npm run render:gartenmoebel` works locally but Vercel deployment will fail
- Blocks Phase 3 deployment

**Fix approach:**
- Add symlink in `remotion/public/sequences` → `../../assets/sequences`
- OR copy sequences to `remotion/public/sequences/` in build step
- Update `remotion.config.ts` to specify public folder location
- Test render locally with production asset paths before deploying

---

## Video Files May Not Exist

**Issue:** videos.json references `/videos/*.mp4` but files may not be generated or committed

**Files:**
- `src/data/videos.json` (videoFile paths: "showcase-vernis-001.mp4", "before-after-terrasse-001.mp4", etc.)
- `public/videos/` directory (assumed to exist)

**Current state:** Five videos are listed in JSON but generation status unknown. No validation that videoFile exists.

**Impact:**
- Video player will show black video element with no error feedback
- Users won't know if video generation succeeded
- Silent failures during Gemini API generation
- Gallery looks broken if videos fail to render

**Fix approach:**
- Add `fileSize?: number` and `generated?: boolean` to VideoEntry type
- Validate file existence before adding to videos.json
- Add error boundary in VideoCard to handle missing videos gracefully
- Implement retry mechanism for failed Gemini generation jobs

---

## Ratings Not Synced with Instagram Publishing

**Issue:** No integration between rating workflow and publishing pipeline

**Files:**
- `src/app/video/[id]/page.tsx` (rating buttons)
- `src/data/videos.json` (no publish status field)

**Current state:** UI allows marking videos "approved" but doesn't queue for publishing. No `published_at` or `instagram_post_id` tracking.

**Impact:**
- Phase 6 (Instagram API integration) cannot determine which videos to publish
- No audit trail of what was published and when
- Cannot handle Instagram API errors or retries

**Fix approach:**
- Add fields to VideoEntry: `published?: boolean`, `publishedAt?: string`, `instagramPostId?: string`
- Create `/api/videos/[id]/publish` endpoint to call Instagram Graph API
- Track API response in database for troubleshooting

---

## TypeScript Not Enforced (Linting Config Missing)

**Issue:** ESLint config is missing or misconfigured

**Files:**
- `package.json` (has eslint, eslint-config-next but no .eslintrc)
- No linting in CI/CD

**Current state:** `npm run lint` fails with "Invalid project directory". ESLint configuration is broken.

**Impact:**
- Code style inconsistencies will accumulate
- No type safety enforcement at build time
- Future contributors won't know coding standards

**Fix approach:**
- Create `.eslintrc.json` or eslint config in `package.json`
- Add TypeScript strict mode validation
- Run lint in pre-commit hooks (husky)
- Fix lint errors and commit

---

## Asset Catalog Hardcoded (Not Indexed)

**Issue:** Asset catalog in `src/data/asset-catalog.ts` is manually maintained with 150+ entries

**Files:** `src/data/asset-catalog.ts` (all 154 entries hardcoded)

**Current state:** Every time a new asset is added, TypeScript file must be manually updated. No indexing or discovery.

**Impact:**
- Asset page will get out of sync with actual filesystem
- Manual maintenance burden grows with each video
- No way to detect orphaned assets or broken paths
- Scales poorly if moving to image CDN

**Fix approach:**
- Create script to index `public/assets/` directory recursively
- Generate asset-catalog.ts from filesystem at build time
- Or move catalog to JSON and load dynamically
- Validate all paths exist during build

---

## Gemini API Credentials Not Managed

**Issue:** Gemini Image + Gemini Video generation pipeline needs API keys but no env var handling visible

**Files:**
- `remotion/src/compositions/GartenmobelRenovation.tsx` (comment mentions "gemini-image+gemini-video+remotion" pipeline)
- No API key references in visible code

**Current state:** Videos claim to use Gemini but credentials location unclear. Likely handled in separate script not in repo.

**Impact:**
- Deployment to Vercel cannot regenerate videos without credentials
- No clear documentation of where generation happens
- Security risk if keys committed to repo

**Fix approach:**
- Document video generation process separately (gen-videos.md)
- Add to `.env.example` all required API keys (GEMINI_API_KEY, etc.)
- Add `.env` to `.gitignore` (verify it is)
- Create script for one-off generation vs gallery service

---

## Before/After Videos Using AI Generations

**Issue:** Before/After video ("before-after-terrasse-001") uses pipeline "gemini-image+gemini-video+remotion"

**Files:**
- `src/data/videos.json` (line 28: before-after-terrasse-001 uses "gemini-image+gemini-video+remotion")
- Memory note: "Before/After Realismus" — Before never extremely deteriorated, After never perfect

**Current state:** Video uses KI-generated images instead of real before/after photos. Conflicts with branding rules.

**Impact:**
- Before/After transformations will look unrealistic to Le Tonkinois audience
- Risk of losing trust (Instagram viewers can spot AI)
- Violates CLAUDE.md: "Produkt-Dosen NIEMALS von Gemini generieren — immer echte Produktfotos"
- Applies to Before/After scenarios too

**Fix approach:**
- Regenerate before-after-terrasse-001 using real photos from `assets/blog/`
- Use assets/blog/vorher-verwitterte-gartenmoebel.jpg (already noted as realistic)
- Change pipeline from "gemini-image+gemini-video" to "remotion" only
- Add validation: before-after videos MUST use real photos, not AI

---

## Asset Storage Mixed Locations

**Issue:** Assets are split between `assets/` (source) and `public/assets/` (served), with images recently deleted

**Files:**
- Git status shows DELETE: `assets/before-after/*.png`, `public/assets/before-after/*.png` (12 deletions)
- Current structure: `assets/sequences/`, `public/videos/`, `src/data/`

**Current state:** Before/After reference images were deleted (not yet committed). Unclear which version is source of truth.

**Impact:**
- Broken asset references if public/ not synced
- Confusion about which directory to use for new assets
- Asset management workflow unclear

**Fix approach:**
- Define single source of truth: `assets/` for all source files
- `public/assets/` should be symlink or build output only
- Document: "Add images to `assets/` → commit → build copies to `public/`"
- Add build step to validate all asset references

---

## No Error Boundaries in Video Player

**Issue:** VideoCard uses HTML5 `<video>` with no error handling if video fails to load

**Files:**
- `src/components/VideoCard.tsx` (line 30-41: video element)
- `src/app/video/[id]/page.tsx` (line 75-80: video element)

**Current state:** Video elements have no `onError` handler or fallback UI.

**Impact:**
- If video fails to load, users see blank black box with no feedback
- Network errors aren't reported
- No retry mechanism
- Bad UX for debugging why videos don't play

**Fix approach:**
- Add `onError` handler to `<video>` tags
- Show error toast or inline message: "Video konnte nicht geladen werden"
- Add retry button for failed loads

---

## Video Detail Page Dynamic Route Not Prerendered

**Issue:** `/video/[id]` is marked as dynamic (server-rendered) in build output

**Build output:**
```
└ ƒ /video/[id]    (Dynamic server-rendered)
```

**Files:** `src/app/video/[id]/page.tsx` (uses `params: Promise<{ id: string }>`)

**Current state:** Every video detail page requires server render. No static generation despite having fixed video list.

**Impact:**
- Vercel will spend compute time rendering each page on first access
- Slower Time to First Byte (TTFB) for detail pages
- Not leveraging Next.js static generation capability
- Higher hosting costs on Vercel

**Fix approach:**
- Add `generateStaticParams()` function to fetch all video IDs
- Prerender all `/video/[id]` pages at build time
- Reduces Vercel serverless function invocations

---

## No Loading States or Skeletons

**Issue:** Gallery and assets page have no loading UI while content renders

**Files:**
- `src/app/page.tsx` (imports videos.json synchronously)
- `src/app/assets/page.tsx` (imports assets synchronously)

**Current state:** All data is static, but no skeleton loaders during initial page load.

**Impact:**
- Lightbox image loading causes layout shift
- Asset grid takes time to render on slow networks
- Poor perceived performance on mobile

**Fix approach:**
- Add Suspense boundaries with skeleton loaders
- Use Next.js Image component for assets (lazy loading + blur placeholder)
- Show skeleton while videos load

---

## Styling Relies on CSS Variables Not Defined

**Issue:** Components use CSS custom properties like `--font-headline` and `--font-body` but definition location unclear

**Files:**
- `src/components/VideoCard.tsx` (line 58: `font-[family-name:var(--font-headline)]`)
- `src/app/layout.tsx` (font imports but no CSS var setup)

**Current state:** Fonts are imported from Google but CSS variables are not set.

**Impact:**
- CSS variables may not resolve correctly in builds
- Fonts may not apply if CSS not parsed properly
- Difficult to track where branding is defined

**Fix approach:**
- Define CSS variables in `globals.css` (in `:root`)
- Verify Tailwind can access them
- Document font variable names in CONVENTIONS

---

## Remotion Config References Non-existent Package

**Issue:** Remotion config may require additional setup

**Files:** `remotion/remotion.config.ts`

**Current state:** Config exists but unclear if all dependencies are installed.

**Impact:**
- Render failures if Remotion plugins not installed
- Studio may not start without proper config

**Fix approach:**
- Verify `remotion render` command works end-to-end
- Document required steps in README

---

## Test Coverage Zero

**Issue:** No test files found in codebase

**Files:** No `*.test.ts`, `*.spec.ts`, or `__tests__/` directories found

**Current state:** Gallery, components, and video logic untested.

**Impact:**
- Refactoring breaks unknown things
- Rating UI changes break silently
- Gemini integration failures caught only in production

**Fix approach:**
- Add Jest configuration (already in dependencies as @tailwindcss/postcss suggests test setup)
- Write tests for: VideoEntry filtering, rating logic, asset catalog loading
- Aim for >70% coverage on critical paths

---

## Markdown in JSON Captions

**Issue:** Video captions in videos.json contain newlines and emoji but JSON escaping unclear

**Files:** `src/data/videos.json` (captions with `\n` sequences)

**Current state:** Captions are multi-line strings with emoji, split across JSON lines.

**Impact:**
- If captions edited in text editor, newline escaping can break
- Instagram caption formatting may not copy correctly (lost newlines)
- No validation that captions meet Instagram length limits

**Fix approach:**
- Validate caption length (<2200 chars for Instagram)
- Add caption preview in video detail page
- Test copy-paste workflow before releasing to production

---

## No Mobile Responsiveness Testing

**Issue:** Video grid uses `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` but viewport testing unclear

**Files:** `src/components/VideoGrid.tsx` (line 56)

**Current state:** Responsive classes defined but no device-specific testing documented.

**Impact:**
- Grid may break on specific phone sizes
- Video detail page `lg:grid-cols-[360px_1fr]` may not work on tablets

**Fix approach:**
- Test on: iPhone 12 (390px), iPad (768px), Desktop (1920px)
- Add lighthouse CI to check mobile performance

---

## Hashtag Duplication Possible

**Issue:** Hashtags are manually maintained arrays with no uniqueness validation

**Files:** `src/data/videos.json` (hashtags arrays)

**Current state:** If same hashtag appears twice in array, both are rendered.

**Impact:**
- Instagram caption may have duplicate hashtags (looks unprofessional)
- Wasted character count

**Fix approach:**
- Add validation to reject duplicate hashtags in videos.json
- Use `Set` to deduplicate before rendering/copying

---

## Package Versions Pinned but Outdated

**Issue:** Locked versions may have security issues

**Files:** `package.json` (React 19.2.4, Next.js 16.2.1)

**Current state:** Using latest major versions but lockfile may be stale.

**Impact:**
- Security vulnerabilities not patched
- Missing bug fixes from minor updates

**Fix approach:**
- Run `npm audit` regularly
- Update dependencies monthly
- Add Dependabot to GitHub repo

