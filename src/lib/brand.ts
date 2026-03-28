// src/lib/brand.ts — Single Source of Truth
// All visual tokens for Le Tonkinois brand.
// Remotion compositions, Gemini prompts, and dashboard components reference this file.
// Dashboard globals.css must be manually synced (CSS cannot import TS).

// === Core Brand Colors (from letonkinois.de CSS + existing colors.ts) ===
export const COLORS = {
  // Primary brand
  brandRed: "#B50606",
  brandRedDark: "#8A0404",
  gold: "#FBBC34",
  navy: "#1A2744",
  // Text hierarchy
  title: "#242424",
  entity: "#333333",
  body: "#777777",
  lightText: "#FFFFFF",
  // Backgrounds
  white: "#FFFFFF",
  cream: "#FFF8F0",
  grayLight: "#F7F7F7",
  // Product accents
  taupe: "#6B7A6F",
  burgundy: "#6B1A1A",
  // Composite values
  darkOverlay: "rgba(0, 0, 0, 0.6)",
  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
  brandGradient: "linear-gradient(180deg, #B50606 0%, #8A0404 100%)",
} as const;

// === Product Accent Colors (per D-02, D-03, D-04) ===
export const PRODUCT_ACCENTS = {
  vernis: "#B50606",    // Vernis IS the brand — Brand Red is its accent (D-02)
  marineNo1: "#1A2744", // Maritime product — Navy (D-03)
} as const;

// === Instagram Safe Zones — 1080x1920 portrait (per Memory feedback_reel_composition_template.md) ===
export const SAFE_ZONES = {
  topSafe: 140,     // px — below Instagram username + action buttons
  bottomSafe: 380,  // px — above caption + like/comment buttons
  sideSafe: 60,     // px — horizontal margin from screen edges
  contentSide: 80,  // px — inner content margin (for SceneLabel text)
} as const;

// === Color Grading — Golden Hour Look (per D-05, D-06, D-07) ===
// Starting values — must be visually validated in Remotion Studio before freezing.
export const COLOR_GRADE = {
  sepia: 0.15,       // 0-1 range — slight sepia warmth
  saturate: 1.2,     // 1.0 = unchanged; >1 = warmer/richer
  brightness: 1.05,  // 1.0 = unchanged; slight lift
  contrast: 1.08,    // 1.0 = unchanged; micro contrast boost
  hueRotate: 5,      // degrees; slight warm shift
} as const;

// === Typography — font names only (per research: loadFont stays in remotion/src/utils/fonts.ts) ===
export const FONTS = {
  headline: "Playfair Display",  // Hook text, large titles (Remotion only)
  scene: "Lora",                 // Scene labels, product titles
  body: "Lato",                  // Badges, subtitles, UI
} as const;

// === Forbidden Aesthetics — documented for AI prompts and code review ===
export const FORBIDDEN_AESTHETICS = [
  "Dark Brown background (#3E2723) — Website ist weiß, nicht dunkel",
  "Amber (#D4A76A) als Akzent — Brand Red ist der Akzent, nicht Amber",
  "Lora als Headline — Playfair Display fuer Headlines",
  "Moderne Craft-Aesthetik — Le Tonkinois ist Vintage-Maritime Heritage",
  "KI-generierte Produktdosen — immer echte Fotos aus dem Asset-Katalog",
  "Dunkle/moody Hintergruende fuer Produktszenen — Cream (#FFF8F0) oder Weiß verwenden",
] as const;

// === Gemini Prompt Fragments — reusable for consistent AI generation ===
export const PROMPT_FRAGMENTS = {
  lighting: "side lighting from the left, golden hour warmth, honey tones",
  woodStyle: "German suburban backyard atmosphere, realistic wood texture, no new garden elements added",
  colorGrade: "warm color temperature, golden afternoon light, no oversaturation",
  forbidden: "no product cans or bottles, no logo, no text",
} as const;
