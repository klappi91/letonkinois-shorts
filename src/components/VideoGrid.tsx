"use client";

import { useState } from "react";
import { VideoEntry, VideoType, VIDEO_TYPE_LABELS } from "@/lib/types";
import VideoCard from "./VideoCard";

const ALL_TYPES: VideoType[] = [
  "showcase",
  "before-after",
  "how-to",
  "seasonal",
  "heritage",
  "lifestyle",
];

export default function VideoGrid({ videos }: { videos: VideoEntry[] }) {
  const [filter, setFilter] = useState<VideoType | "all">("all");

  const filtered =
    filter === "all" ? videos : videos.filter((v) => v.type === filter);

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-brand-red text-white"
              : "bg-bg-sepia text-text-muted hover:bg-wood-amber/30"
          }`}
        >
          Alle ({videos.length})
        </button>
        {ALL_TYPES.map((type) => {
          const count = videos.filter((v) => v.type === type).length;
          if (count === 0) return null;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === type
                  ? "bg-brand-red text-white"
                  : "bg-bg-sepia text-text-muted hover:bg-wood-amber/30"
              }`}
            >
              {VIDEO_TYPE_LABELS[type]} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-muted py-16">
          Keine Videos in dieser Kategorie.
        </p>
      )}
    </div>
  );
}
