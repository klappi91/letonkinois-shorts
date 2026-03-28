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
