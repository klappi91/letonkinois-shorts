"use client";

import Link from "next/link";
import { VideoEntry, VIDEO_TYPE_LABELS, VIDEO_TYPE_COLORS } from "@/lib/types";

function RatingBadge({ rating }: { rating: VideoEntry["rating"] }) {
  const styles = {
    draft: "bg-bg-sepia text-text-muted",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  const labels = {
    draft: "Entwurf",
    approved: "Freigegeben",
    rejected: "Abgelehnt",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded ${styles[rating]}`}>
      {labels[rating]}
    </span>
  );
}

export default function VideoCard({ video }: { video: VideoEntry }) {
  return (
    <Link href={`/video/${video.id}`} className="group block">
      <div className="bg-bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-bg-sepia/50">
        {/* Video Preview / Thumbnail */}
        <div className="relative aspect-[9/16] bg-bg-dark overflow-hidden max-h-[400px]">
          <video
            src={video.videoFile}
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
            onMouseOut={(e) => {
              const v = e.target as HTMLVideoElement;
              v.pause();
              v.currentTime = 0;
            }}
          />
          {/* Duration */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {video.duration}s
          </div>
          {/* Type Badge */}
          <div
            className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded ${VIDEO_TYPE_COLORS[video.type]}`}
          >
            {VIDEO_TYPE_LABELS[video.type]}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3
            className="font-[family-name:var(--font-headline)] font-semibold text-sm leading-tight line-clamp-2 text-text-dark group-hover:text-brand-red transition-colors"
          >
            {video.title}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-text-muted">{video.createdAt}</span>
            <RatingBadge rating={video.rating} />
          </div>
        </div>
      </div>
    </Link>
  );
}
