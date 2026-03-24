export type VideoType =
  | "showcase"
  | "before-after"
  | "how-to"
  | "seasonal"
  | "heritage"
  | "lifestyle";

export type Rating = "pending" | "approved" | "rejected";

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
