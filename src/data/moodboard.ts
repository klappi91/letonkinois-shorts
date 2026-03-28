// src/data/moodboard.ts — Static moodboard data for reference screenshots.
// Screenshots are stored in public/assets/moodboard/ and committed to git.
// To add a new reference: save screenshot to public/assets/moodboard/, add entry here.
// To regenerate images: bash scripts/fetch-moodboard.sh

export interface MoodboardEntry {
  id: string;
  account: string;         // "@totalboat", "@earthandflax"
  platform: "instagram" | "tiktok";
  imagePath: string;       // "/assets/moodboard/totalboat-01.jpg"
  caption: string;         // Why this reference was chosen (German)
  tags: string[];          // ["golden-hour", "before-after", "marine"]
  sourceUrl?: string;      // Original post URL if available
}

export const moodboard: MoodboardEntry[] = [
  {
    id: "totalboat-01",
    account: "@totalboat",
    platform: "instagram",
    imagePath: "/assets/moodboard/totalboat-01.jpg",
    caption:
      "Marine-Marke mit 163K Followern. Best-in-Class fuer Holz + Wasser Content. Warme Lichtstimmung, professionelle Produktplatzierung.",
    tags: ["marine", "golden-hour", "product-shot"],
    sourceUrl: "https://www.instagram.com/totalboat/",
  },
  {
    id: "rubio-01",
    account: "@rubiomornocoat",
    platform: "instagram",
    imagePath: "/assets/moodboard/rubio-01.jpg",
    caption:
      "Beste UGC/Community-Strategie im Wood-Finishing-Bereich. Authentische Anwendungsbilder, nicht gestellt.",
    tags: ["wood-finishing", "community", "before-after"],
    sourceUrl: "https://www.instagram.com/rubiomornocoat/",
  },
  {
    id: "earthandflax-01",
    account: "@earthandflax",
    platform: "instagram",
    imagePath: "/assets/moodboard/earthandflax-01.jpg",
    caption:
      "Einziger Content Creator der Le Tonkinois aktiv zeigt. Philadelphia, 9.1K Follower. Natuerliche Holzpflege-Aesthetic.",
    tags: ["le-tonkinois", "authentic", "natural"],
    sourceUrl: "https://www.instagram.com/earthandflax/",
  },
  {
    id: "hermannsachse-01",
    account: "@hermannsachse",
    platform: "instagram",
    imagePath: "/assets/moodboard/hermannsachse-01.jpg",
    caption:
      "Le Tonkinois Muttermarke. 3.5K Follower. Referenz fuer aktuelle Markenkommunikation und Produktfotos.",
    tags: ["brand", "heritage", "product-shot"],
    sourceUrl: "https://www.instagram.com/hermannsachse/",
  },
  {
    id: "chemicalguys-01",
    account: "@chemicalguys",
    platform: "instagram",
    imagePath: "/assets/moodboard/chemicalguys-01.jpg",
    caption:
      "Car-Detailing Cross-Referenz. 'The Soak' Shot-Aesthetic — Fluessigkeit auf Oberflaeche als viraler Moment. Uebertragbar auf Holzoel.",
    tags: ["the-soak", "macro", "viral-moment"],
    sourceUrl: "https://www.instagram.com/chemicalguys/",
  },
];
