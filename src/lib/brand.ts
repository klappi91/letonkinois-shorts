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

// === Color Grading — OPTIONAL, nicht automatisch anwenden ===
// Nur verwenden wenn explizit gewünscht. Kein Default-Look aufzwingen.
export const COLOR_GRADE = {
  sepia: 0.15,
  saturate: 1.2,
  brightness: 1.05,
  contrast: 1.08,
  hueRotate: 5,
} as const;

// === Typography — font names only (per research: loadFont stays in remotion/src/utils/fonts.ts) ===
export const FONTS = {
  headline: "Playfair Display",  // Hook text, large titles (Remotion only)
  scene: "Lora",                 // Scene labels, product titles
  body: "Lato",                  // Badges, subtitles, UI
} as const;

// === Brand Rules — nur harte Marken-Regeln, KEINE kreativen Einschränkungen ===
export const BRAND_RULES = [
  "KI-generierte Produktdosen/Flaschen — immer echte Fotos aus dem Asset-Katalog",
  "Playfair Display fuer Headlines, Lora fuer Scene Labels, Lato fuer Body",
] as const;
