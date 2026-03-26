# External Integrations

**Analysis Date:** 2026-03-26

## APIs & External Services

**Google Fonts:**
- Service: Google Fonts CDN
- Purpose: Load Lora (headlines) and Lato (body text) fonts
- Implementation:
  - HTML `<link>` tag in `src/app/layout.tsx` (client-side loading)
  - Remotion compositions use @remotion/google-fonts for server-side font embedding
  - Fonts: `Lora:wght@400;600;700` and `Lato:wght@400;700`

**Gemini API (Planned):**
- Service: Google Gemini Image & Video APIs
- Purpose: Generate AI-rendered scenes and video content
- Current Status: Documented in CLAUDE.md as part of video generation pipeline (Phases 2-3)
- Pipeline routes:
  - `gemini-image+remotion` - KI-generated image → Remotion animation → MP4
  - `gemini-image+gemini-video+remotion` - KI image → KI video interpolation → Remotion compositing → MP4
- Auth: API key expected in environment variables (not currently in use)

## Data Storage

**Databases:**
- Local filesystem (current)
  - Videos metadata: `src/data/videos.json` (JSON array)
  - Asset catalog: `src/data/asset-catalog.ts` (TypeScript constant)
- Planned: Supabase (Phase 5 roadmap)
  - For persistent rating system
  - For user session/auth if Instagram publishing (Phase 6) is implemented

**File Storage:**
- Local filesystem (current)
  - Generated videos: `public/videos/*.mp4`
  - Source assets: `assets/` directory (sequences, products, blog, brand, scenes, references)
  - Remotion-rendered output: `remotion/out/*.mp4`
- Planned: Cloud storage integration for production
  - Vercel deployments serve `public/` directory
  - Videos can be moved to Cloudinary or similar CDN for bandwidth optimization

**Caching:**
- Browser caching: Video metadata loaded from `src/data/videos.json` at build time
- Next.js static generation: HTML/JSON generated at build time (no runtime DB queries)
- No runtime caching layer (can be added with Redis if needed)

## Authentication & Identity

**Auth Provider:**
- Custom or None (current state)
- Video review/rating system uses localStorage (client-side only)
- Planned: Supabase Auth (Phase 5-6)
  - For persistent user sessions
  - For Instagram API authentication (Phase 6: One-Click Publish)

## Monitoring & Observability

**Error Tracking:**
- None detected (can integrate Sentry if needed)

**Logs:**
- Console logs only (development)
- Next.js server logs on Vercel (production)

## CI/CD & Deployment

**Hosting:**
- Vercel (serverless platform)
  - Project ID: `prj_gxnc6bTP8qRjjpnL9NkAnVdGGZz`
  - Organization: `team_rynVBCoqd0ZJBzDuSBslGi1H`
  - Automatic deployments on git push to main
  - Preview deployments on pull requests

**CI Pipeline:**
- None configured (relies on Vercel's built-in checks)
- Manual: `npm run lint` (ESLint via Next.js)
- Manual: `npm run build` (Next.js build)

## Environment Configuration

**Required env vars:**
- None currently required for dashboard operation
- When Gemini API integration is enabled: `GOOGLE_API_KEY` or similar
- When Supabase is integrated: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
- When Instagram API is integrated: `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID`

**Secrets location:**
- Vercel project dashboard (not in version control)
- No `.env` file in repository

## Webhooks & Callbacks

**Incoming:**
- None (dashboard is read-only for video review)

**Outgoing (Planned):**
- Instagram Reels upload (Phase 6: One-Click Publish)
  - Endpoint: Instagram Graph API
  - Payload: Video file + caption (DE/FR) + hashtags
- Possible webhook for scheduled publishing (cron job in Phase 4)

## Third-Party Assets

**Google Fonts:**
- Served via `fonts.googleapis.com` (HTTPS, cached by browser)
- No vendor lock-in; fonts can be self-hosted if needed

**Remotion Cloud (Optional):**
- Not currently integrated
- Could be used for distributed video rendering (Phase 3-4 if performance needed)

---

*Integration audit: 2026-03-26*
