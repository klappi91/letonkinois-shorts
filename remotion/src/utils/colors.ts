// Re-export from central brand.ts — single source of truth (D-09).
// All existing imports (`import { colors } from "../utils/colors"`) continue to work.
// To add new colors, edit src/lib/brand.ts — they appear here automatically.
import { COLORS } from "../../../src/lib/brand";

export const colors = COLORS;
