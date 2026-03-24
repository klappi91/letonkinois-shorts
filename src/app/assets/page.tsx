"use client";

import { useState } from "react";
import Link from "next/link";
import {
  assets,
  AssetCategory,
  CATEGORY_LABELS,
} from "@/data/asset-catalog";

const ALL_CATEGORIES: AssetCategory[] = [
  "products",
  "before-after",
  "scenes",
  "blog",
  "brand",
  "ai-art",
  "references",
  "video-source",
];

export default function AssetsPage() {
  const [filter, setFilter] = useState<AssetCategory | "all">("all");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const filtered =
    filter === "all" ? assets : assets.filter((a) => a.category === filter);

  // Group by subcategory
  const grouped = filtered.reduce(
    (acc, asset) => {
      const key = asset.subcategory || "Allgemein";
      if (!acc[key]) acc[key] = [];
      acc[key].push(asset);
      return acc;
    },
    {} as Record<string, typeof assets>,
  );

  return (
    <main className="min-h-screen bg-bg-cream">
      {/* Header */}
      <header className="border-b border-bg-sepia/50 bg-bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-text-muted hover:text-brand-red transition-colors text-sm"
            >
              &larr; Videos
            </Link>
            <div>
              <h1 className="font-[family-name:var(--font-headline)] font-bold text-lg text-text-dark leading-tight">
                Bild-Bibliothek
              </h1>
              <p className="text-xs text-text-muted">
                {assets.length} Bilder verfügbar
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-brand-red text-white"
                : "bg-bg-sepia text-text-muted hover:bg-wood-amber/30"
            }`}
          >
            Alle ({assets.length})
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const count = assets.filter((a) => a.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === cat
                    ? "bg-brand-red text-white"
                    : "bg-bg-sepia text-text-muted hover:bg-wood-amber/30"
                }`}
              >
                {CATEGORY_LABELS[cat]} ({count})
              </button>
            );
          })}
        </div>

        {/* Grouped Grid */}
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="mb-10">
            {Object.keys(grouped).length > 1 && (
              <h2 className="font-[family-name:var(--font-headline)] font-semibold text-lg text-text-dark mb-4 border-b border-bg-sepia/50 pb-2">
                {group}
                <span className="text-sm font-normal text-text-muted ml-2">
                  ({items.length})
                </span>
              </h2>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {items.map((asset) => (
                <button
                  key={asset.path}
                  onClick={() => setLightbox(asset.path)}
                  className="group block text-left"
                >
                  <div className="aspect-square bg-bg-dark rounded-lg overflow-hidden border border-bg-sepia/30 hover:border-brand-red/50 transition-all hover:shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.path}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1 truncate">
                    {asset.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl"
            onClick={() => setLightbox(null)}
          >
            &times;
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Lightbox"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
            {assets.find((a) => a.path === lightbox)?.name} —{" "}
            {assets.find((a) => a.path === lightbox)?.category}
          </div>
        </div>
      )}
    </main>
  );
}
