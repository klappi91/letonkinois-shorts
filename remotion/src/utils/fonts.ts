import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadLora } from "@remotion/google-fonts/Lora";
import { loadFont as loadLato } from "@remotion/google-fonts/Lato";

// Playfair Display — große Headlines, Hook-Text (wie Website h1)
export const { fontFamily: playfair } = loadPlayfair("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

// Lora — Szenen-Labels, Produkttitel (wie Website Entity-Titles)
export const { fontFamily: lora } = loadLora("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

// Lato — Body, Subtitles, Navigation (wie Website Body)
export const { fontFamily: lato } = loadLato("normal", {
  weights: ["300", "400", "700"],
  subsets: ["latin"],
});
