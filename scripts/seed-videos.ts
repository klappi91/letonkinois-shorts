import { createAdminClient } from '../src/lib/supabase/admin'
import videosJson from '../src/data/videos.json'

interface VideoJsonEntry {
  id: string
  title: string
  type: string
  createdAt: string
  videoFile: string
  duration: number
  captionDe: string
  captionFr?: string
  hashtags: string[]
  rating: string
  products?: string[]
  pipeline: string
}

async function seed() {
  const supabase = createAdminClient()

  // Check if videos already exist (idempotency: skip if already seeded)
  const { data: existing } = await supabase.from('videos').select('id').limit(1)
  if (existing && existing.length > 0) {
    console.log('Videos already seeded. Skipping.')
    return
  }

  const rows = (videosJson as VideoJsonEntry[]).map((entry) => ({
    // id omitted — Supabase generates UUID (schema: uuid primary key default gen_random_uuid())
    title: entry.title,
    type: entry.type,
    created_at: entry.createdAt,
    video_url: entry.videoFile,
    duration: entry.duration,
    caption_de: entry.captionDe,
    caption_fr: entry.captionFr ?? null,
    hashtags: entry.hashtags,
    status: entry.rating === 'pending' ? 'draft' : entry.rating,
    products: entry.products ?? [],
    pipeline: entry.pipeline,
    prompt_version: null,
  }))

  const { error } = await supabase.from('videos').upsert(rows)
  if (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
  console.log(`Seeded ${rows.length} videos successfully.`)
}

seed()
