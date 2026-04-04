export type AssetCategory =
  | "products"
  | "before-after"
  | "scenes"
  | "blog"
  | "brand"
  | "ai-art"
  | "references"
  | "video-source";

export interface AssetEntry {
  path: string;
  category: AssetCategory;
  subcategory?: string;
  name: string;
}

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  products: "Produktfotos",
  "before-after": "Vorher/Nachher",
  scenes: "Szenen & Stimmungen",
  blog: "Blog-Bilder",
  brand: "Brand & Logo",
  "ai-art": "KI-Kunst",
  references: "Referenzen",
  "video-source": "Video-Quellbilder",
};

// All assets from letonkinois-content + generated
export const assets: AssetEntry[] = [
  // === PRODUCTS (Cutouts - freigestellt) ===
  { path: "/assets/products/vernis.png", category: "products", name: "Vernis (Cutout)" },
  { path: "/assets/products/parquets.png", category: "products", name: "Parquets (Cutout)" },
  { path: "/assets/products/gelomat.png", category: "products", name: "Gélomat (Cutout)" },
  { path: "/assets/products/marine-no1.png", category: "products", name: "Marine No.1 (Cutout)" },
  { path: "/assets/products/bio-impression.png", category: "products", name: "Bio Impression (Cutout)" },
  { path: "/assets/products/beize-eiche-hell.png", category: "products", name: "Beize Eiche Hell (Cutout)" },
  { path: "/assets/products/beize-eiche-dunkel.png", category: "products", name: "Beize Eiche Dunkel (Cutout)" },
  { path: "/assets/products/beize-teak.png", category: "products", name: "Beize Teak (Cutout)" },
  { path: "/assets/products/beize-mahagoni.png", category: "products", name: "Beize Mahagoni (Cutout)" },
  { path: "/assets/products/beize-schwarz.png", category: "products", name: "Beize Schwarz (Cutout)" },
  { path: "/assets/products/holzentgrauer.png", category: "products", name: "Holzentgrauer (Cutout)" },
  { path: "/assets/products/pinselreiniger.png", category: "products", name: "Pinselreiniger (Cutout)" },
  { path: "/assets/products/verduennung.png", category: "products", name: "Verdünnung (Cutout)" },

  // === PRODUCTS (Katalog-Fotos) ===
  { path: "/assets/products/vernis/18.png", category: "products", subcategory: "Vernis Katalog", name: "Vernis Dose" },
  { path: "/assets/products/vernis/20.png", category: "products", subcategory: "Vernis Katalog", name: "Vernis Anwendung 1" },
  { path: "/assets/products/vernis/21.png", category: "products", subcategory: "Vernis Katalog", name: "Vernis Anwendung 2" },
  { path: "/assets/products/vernis/22.png", category: "products", subcategory: "Vernis Katalog", name: "Vernis Ergebnis" },
  { path: "/assets/products/beize-eiche-hell/3.png", category: "products", subcategory: "Beize Eiche Hell", name: "Holzprobe 1" },
  { path: "/assets/products/beize-eiche-hell/4.png", category: "products", subcategory: "Beize Eiche Hell", name: "Holzprobe 2" },
  { path: "/assets/products/beize-eiche-hell/5.png", category: "products", subcategory: "Beize Eiche Hell", name: "Holzprobe 3" },
  { path: "/assets/products/beize-eiche-dunkel/33.png", category: "products", subcategory: "Beize Eiche Dunkel", name: "Holzprobe 1" },
  { path: "/assets/products/beize-eiche-dunkel/34.png", category: "products", subcategory: "Beize Eiche Dunkel", name: "Holzprobe 2" },
  { path: "/assets/products/beize-teak/15.png", category: "products", subcategory: "Beize Teak", name: "Holzprobe 1" },
  { path: "/assets/products/beize-teak/16.png", category: "products", subcategory: "Beize Teak", name: "Holzprobe 2" },
  { path: "/assets/products/beize-teak/17.png", category: "products", subcategory: "Beize Teak", name: "Holzprobe 3" },
  { path: "/assets/products/beize-mahagoni/7.png", category: "products", subcategory: "Beize Mahagoni", name: "Holzprobe 1" },
  { path: "/assets/products/beize-mahagoni/8.png", category: "products", subcategory: "Beize Mahagoni", name: "Holzprobe 2" },
  { path: "/assets/products/beize-mahagoni/9.png", category: "products", subcategory: "Beize Mahagoni", name: "Holzprobe 3" },
  { path: "/assets/products/beize-schwarz/11.png", category: "products", subcategory: "Beize Schwarz", name: "Holzprobe 1" },
  { path: "/assets/products/beize-schwarz/12.png", category: "products", subcategory: "Beize Schwarz", name: "Holzprobe 2" },
  { path: "/assets/products/beize-schwarz/13.png", category: "products", subcategory: "Beize Schwarz", name: "Holzprobe 3" },

  // === BEFORE/AFTER ===
  // Gelöscht: Alle AI-generierten Before/After waren unrealistisch (zu extrem zerfallen → zu perfekt).
  // Einzig brauchbare Referenz: /assets/blog/vorher-verwitterte-gartenmoebel.jpg (realistisch verwittert, nicht zerfallen)

  // === SCENES: Garten ===
  { path: "/assets/scenes/garden/garden-furniture.png", category: "scenes", subcategory: "Garten", name: "Gartenmöbel" },
  { path: "/assets/scenes/garden/garden-spring.png", category: "scenes", subcategory: "Garten", name: "Frühlingsgarten" },
  { path: "/assets/scenes/garden/terrace-summer.png", category: "scenes", subcategory: "Garten", name: "Sommer-Terrasse" },

  // === SCENES: Nautisch ===
  { path: "/assets/scenes/nautical/yacht-deck.png", category: "scenes", subcategory: "Boot & Meer", name: "Yacht-Deck" },
  { path: "/assets/scenes/nautical/boat-sailing.png", category: "scenes", subcategory: "Boot & Meer", name: "Segelboot" },
  { path: "/assets/scenes/nautical/marina-dock.png", category: "scenes", subcategory: "Boot & Meer", name: "Marina" },
  { path: "/assets/scenes/vernis-boat.png", category: "scenes", subcategory: "Boot & Meer", name: "Vernis Boot" },
  { path: "/assets/scenes/vernis-marina-dock.png", category: "scenes", subcategory: "Boot & Meer", name: "Marina Dock (KI)" },

  // === SCENES: Workshop ===
  { path: "/assets/scenes/workshop/workshop-traditional.png", category: "scenes", subcategory: "Werkstatt", name: "Traditionell" },
  { path: "/assets/scenes/workshop/workshop-modern.png", category: "scenes", subcategory: "Werkstatt", name: "Modern" },
  { path: "/assets/scenes/workshop/workshop-detail.png", category: "scenes", subcategory: "Werkstatt", name: "Detail" },
  { path: "/assets/scenes/vernis-workshop.png", category: "scenes", subcategory: "Werkstatt", name: "Vernis Workshop" },
  { path: "/assets/scenes/vernis-lifestyle-werkbank.png", category: "scenes", subcategory: "Werkstatt", name: "Lifestyle Werkbank" },

  // === SCENES: Interior ===
  { path: "/assets/scenes/interior/living-room.png", category: "scenes", subcategory: "Interior", name: "Wohnzimmer" },
  { path: "/assets/scenes/interior/parquet-floor.png", category: "scenes", subcategory: "Interior", name: "Parkett" },
  { path: "/assets/scenes/interior/restored-cabinet.png", category: "scenes", subcategory: "Interior", name: "Restaurierter Schrank" },

  // === SCENES: Seasonal ===
  { path: "/assets/scenes/seasonal/spring-gate.png", category: "scenes", subcategory: "Saisonal", name: "Frühling — Gartentor" },
  { path: "/assets/scenes/seasonal/summer-dock.png", category: "scenes", subcategory: "Saisonal", name: "Sommer — Steg" },
  { path: "/assets/scenes/seasonal/autumn-bench.png", category: "scenes", subcategory: "Saisonal", name: "Herbst — Bank" },
  { path: "/assets/scenes/seasonal/winter-workshop.png", category: "scenes", subcategory: "Saisonal", name: "Winter — Werkstatt" },

  // === SCENES: Saisonstart (Process) ===
  { path: "/assets/scenes/saisonstart/hook-flatlay.png", category: "scenes", subcategory: "Saisonstart", name: "Flatlay Werkzeug" },
  { path: "/assets/scenes/saisonstart/schritt1-reinigen.png", category: "scenes", subcategory: "Saisonstart", name: "Schritt 1: Reinigen" },
  { path: "/assets/scenes/saisonstart/schritt2-schleifen.png", category: "scenes", subcategory: "Saisonstart", name: "Schritt 2: Schleifen" },
  { path: "/assets/scenes/saisonstart/schritt3-schuetzen.png", category: "scenes", subcategory: "Saisonstart", name: "Schritt 3: Schützen" },
  { path: "/assets/scenes/saisonstart/ergebnis.png", category: "scenes", subcategory: "Saisonstart", name: "Ergebnis" },

  // === SCENES: Prozess ===
  { path: "/assets/scenes/process-01-before.png", category: "scenes", subcategory: "Prozess", name: "01 Vorher" },
  { path: "/assets/scenes/process-02-sanding.png", category: "scenes", subcategory: "Prozess", name: "02 Schleifen" },
  { path: "/assets/scenes/process-03-oiling.png", category: "scenes", subcategory: "Prozess", name: "03 Ölen" },
  { path: "/assets/scenes/process-04-after.png", category: "scenes", subcategory: "Prozess", name: "04 Nachher" },

  // === SCENES: Hero & Macro ===
  { path: "/assets/scenes/vernis-hero.png", category: "scenes", subcategory: "Hero", name: "Vernis Hero" },
  { path: "/assets/scenes/vernis-wood-macro.png", category: "scenes", subcategory: "Hero", name: "Holz Makro" },

  // === SCENES: Generierte Tests ===
  { path: "/assets/scenes/test-gartenmoebel-vorher.png", category: "scenes", subcategory: "KI-Tests", name: "Gartenmöbel Vorher" },
  { path: "/assets/scenes/test-gartenmoebel-nachher.png", category: "scenes", subcategory: "KI-Tests", name: "Gartenmöbel Nachher v1" },
  { path: "/assets/scenes/test-gartenmoebel-nachher-v2.png", category: "scenes", subcategory: "KI-Tests", name: "Gartenmöbel Nachher v2" },
  { path: "/assets/scenes/nachher-gartenmoebel-v3.png", category: "scenes", subcategory: "KI-Tests", name: "Gartenmöbel Nachher v3" },
  { path: "/assets/scenes/vorher-gartenmoebel-v3.png", category: "scenes", subcategory: "KI-Tests", name: "Gartenmöbel Vorher v3" },
  { path: "/assets/scenes/test-terrasse-verwittert.png", category: "scenes", subcategory: "KI-Tests", name: "Terrasse Verwittert" },
  { path: "/assets/scenes/test-halb-behandelt.png", category: "scenes", subcategory: "KI-Tests", name: "Halb Behandelt v1" },
  { path: "/assets/scenes/test-halb-behandelt-v2.png", category: "scenes", subcategory: "KI-Tests", name: "Halb Behandelt v2" },
  { path: "/assets/scenes/garden-furniture-before.png", category: "scenes", subcategory: "KI-Tests", name: "Gartenmöbel Before (groß)" },
  { path: "/assets/scenes/garden-furniture-after.png", category: "scenes", subcategory: "KI-Tests", name: "Gartenmöbel After" },
  { path: "/assets/scenes/style-gartenmoebel-aufbereitung.png", category: "scenes", subcategory: "KI-Tests", name: "Style Aufbereitung" },

  // === BLOG ===
  { path: "/assets/blog/hero-gartenmoebel-renoviert.jpg", category: "blog", name: "Hero: Renovierte Gartenmöbel" },
  { path: "/assets/blog/vorher-verwitterte-gartenmoebel.jpg", category: "blog", name: "Vorher: Verwittert" },
  { path: "/assets/blog/nachher-renovierte-gartenmoebel.jpg", category: "blog", name: "Nachher: Renoviert" },
  { path: "/assets/blog/schritt-schleifen.jpg", category: "blog", name: "Schritt: Schleifen" },
  { path: "/assets/blog/schritt-beizen.jpg", category: "blog", name: "Schritt: Beizen" },

  // === BRAND ===
  { path: "/assets/brand/logo.png", category: "brand", name: "Logo" },
  { path: "/assets/brand/logo-icon.png", category: "brand", name: "Logo Icon" },

  // === VIDEO SOURCE (Quellbilder der generierten Videos) ===
  { path: "/assets/showcase-vernis-001.png", category: "video-source", name: "Showcase Vernis" },
  { path: "/assets/before-after-terrasse-001.png", category: "video-source", name: "Before/After Terrasse" },
  { path: "/assets/howto-erstanstrich-001.png", category: "video-source", name: "How-To Erstanstrich" },
  { path: "/assets/seasonal-fruehling-001.png", category: "video-source", name: "Seasonal Frühling" },
  { path: "/assets/heritage-1906-001.png", category: "video-source", name: "Heritage 1906" },

  // === AI ART (Künstlerische KI-Bilder) ===
  { path: "/assets/ai-art/ai-art-driftwood-table.png", category: "ai-art", name: "Driftwood Esstisch" },
  { path: "/assets/ai-art/ai-art-boat-deck-golden.png", category: "ai-art", name: "Bootsdeck Golden Hour" },
  { path: "/assets/ai-art/ai-art-vintage-door.png", category: "ai-art", name: "Vintage Haustür Restaurierung" },
  { path: "/assets/ai-art/ai-art-treehouse.png", category: "ai-art", name: "Baumhaus geölt" },
  { path: "/assets/ai-art/ai-art-sauna-bench.png", category: "ai-art", name: "Sauna Holzbank" },
];
