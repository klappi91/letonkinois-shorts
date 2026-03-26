// === Video Types ===

export type VideoType =
  | "showcase"
  | "before-after"
  | "how-to"
  | "seasonal"
  | "heritage"
  | "lifestyle";

export type VideoStatus = "draft" | "approved" | "rejected";

// Supabase-compatible Video type (mirrors public.videos table)
export interface Video {
  id: string;
  title: string;
  caption_de: string | null;
  caption_fr: string | null;
  hashtags: string[];
  type: VideoType;
  duration: number | null;
  pipeline: string | null;
  status: VideoStatus;
  prompt_version: string | null;
  video_url: string | null;
  products: string[];
  created_at: string;
}

// Supabase-compatible Feedback type (mirrors public.feedback table)
export interface Feedback {
  id: string;
  video_id: string;
  user_id: string;
  stars: number;
  pros: string | null;
  cons: string | null;
  created_at: string;
  processed_at: string | null;
}

// Supabase-compatible PromptVersion type (mirrors public.prompt_versions table)
// Content structure per D-07: keyed by VideoType
export interface PromptVersionContent {
  image_prompt?: string;
  video_prompt?: string;
  composition_config?: Record<string, unknown>;
}

export interface PromptVersion {
  id: string;
  version_number: number;
  content: Record<VideoType, PromptVersionContent>;
  created_at: string;
  created_by: string | null;
}

// === Legacy Compatibility ===
// Old Rating type maps to new VideoStatus
/** @deprecated Use VideoStatus instead */
export type Rating = VideoStatus;

/** @deprecated Use Video instead — kept temporarily for Phase 2 migration */
export interface VideoEntry {
  id: string;
  title: string;
  type: VideoType;
  /** ISO date string */
  createdAt: string;
  /** Relative path to video file in public/ */
  videoFile: string;
  /** Thumbnail image path (auto-generated or custom) */
  thumbnail?: string;
  /** Duration in seconds */
  duration: number;
  /** Instagram caption (German) */
  captionDe: string;
  /** Instagram caption (French) */
  captionFr?: string;
  /** Hashtags as array */
  hashtags: string[];
  /** Review rating */
  rating: Rating;
  /** Which products are featured */
  products?: string[];
  /** Generation pipeline used */
  pipeline: "remotion" | "gemini-image+remotion" | "gemini-image+gemini-video+remotion";
  /** Notes for review */
  notes?: string;
}

// === Lookup Maps ===

export const VIDEO_TYPE_LABELS: Record<VideoType, string> = {
  showcase: "Produkt Showcase",
  "before-after": "Vorher/Nachher",
  "how-to": "Tipps & Tricks",
  seasonal: "Saisonal",
  heritage: "Seit 1906",
  lifestyle: "Lifestyle",
};

export const VIDEO_TYPE_COLORS: Record<VideoType, string> = {
  showcase: "bg-wood-amber text-text-dark",
  "before-after": "bg-brand-red text-text-light",
  "how-to": "bg-wood-walnut text-text-light",
  seasonal: "bg-green-700 text-text-light",
  heritage: "bg-text-dark text-wood-honey",
  lifestyle: "bg-wood-honey text-text-dark",
};

export const VIDEO_STATUS_LABELS: Record<VideoStatus, string> = {
  draft: "Entwurf",
  approved: "Freigegeben",
  rejected: "Abgelehnt",
};
