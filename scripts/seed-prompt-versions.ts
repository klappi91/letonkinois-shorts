import { createAdminClient } from '../src/lib/supabase/admin'

async function seed() {
  const supabase = createAdminClient()

  // Idempotency check: skip if any prompt version already exists
  const { data: existing } = await supabase
    .from('prompt_versions')
    .select('id')
    .limit(1)

  if (existing && existing.length > 0) {
    console.log('Prompt versions already seeded. Skipping.')
    return
  }

  // v1.0 content: real prompts from existing Remotion compositions
  // Unproduced types (how-to, seasonal, heritage, lifestyle) are null per D-01
  const v1Content = {
    "before-after": {
      image_prompt: "Photorealistic 9:16 portrait photo sequence. 5 scenes: (1) Vorher — weathered/neglected wood, grey, faded, 2-3 seasons without care, no shine, overcast flat light. (2) Reinigen — person scrubs with stiff brush, soapy water, wood still grey. (3) Schleifen — orbital sander along grain, transition from grey to pale fresh wood, sawdust visible, sanded wood pale and slightly dusty NOT golden. (4) Auftragen/Oelen — flat brush applies oil, treated part shows warm saturated color with sheen, untreated is pale, clean surface. (5) Ergebnis — golden hour, entire surface gleams warm honey-brown, no tools/cans/people, immaculate.",
      video_prompt: null,
      composition_config: {
        scenes: ["hook", "vorher", "step1-reinigen", "step2-schleifen", "step3-auftragen", "nachher", "product-reveal", "end-card"],
        timing: {
          hook: 105,
          vorher: 100,
          step1: 105,
          step2: 105,
          step3: 105,
          nachher: 110,
          product: 100,
          endcard: 90,
          transition: 12,
          totalFrames: 736
        },
        fps: 30,
        resolution: { width: 1080, height: 1920 },
        transitions: [
          "wipe-from-left",
          "slide-from-right",
          "slide-from-right",
          "slide-from-right",
          "wipe-from-right",
          "fade",
          "fade"
        ],
        hookText: "short-punchy-2-words",
        labels: ["Vorher", "Reinigen/Step1", "Schleifen/Step2", "Schuetzen-or-Auftragen/Step3", "Fertig."],
        product: "product-cutout-on-cream-bg"
      }
    },
    "showcase": {
      image_prompt: "Photorealistic 9:16 portrait photo. Product in natural setting — warm ambient light, wood surface, lifestyle context. Focus on product can/bottle with authentic look. NO AI-generated product packaging — use real product cutout photos from catalog.",
      video_prompt: null,
      composition_config: {
        scenes: ["hook", "product-hero", "detail-shots", "application", "end-card"],
        fps: 30,
        resolution: { width: 1080, height: 1920 }
      }
    },
    "how-to": null,
    "seasonal": null,
    "heritage": null,
    "lifestyle": null
  }

  // Insert v1.0 row into prompt_versions
  const { data: inserted, error: insertError } = await supabase
    .from('prompt_versions')
    .insert({
      version_number: 1,
      content: v1Content,
      created_by: null  // seeded by script, not a user
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    console.error('Failed to insert prompt version:', insertError)
    process.exit(1)
  }

  console.log(`Inserted prompt version v1.0 with UUID: ${inserted.id}`)

  // Update all existing videos to link to v1.0 (only videos without a version)
  const { error: updateError, count } = await supabase
    .from('videos')
    .update({ prompt_version: inserted.id })
    .is('prompt_version', null)

  if (updateError) {
    console.error('Failed to link videos to prompt version:', updateError)
    process.exit(1)
  }

  console.log(`Linked ${count ?? 'all'} videos to prompt version v1.0 (${inserted.id})`)
}

seed()
