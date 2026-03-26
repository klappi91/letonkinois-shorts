import Link from "next/link";
import VideoGrid from "@/components/VideoGrid";
import { VideoEntry } from "@/lib/types";
import videosData from "@/data/videos.json";

const videos = videosData as VideoEntry[];

export default function Home() {
  const stats = {
    total: videos.length,
    pending: videos.filter((v) => v.rating === "draft").length,
    approved: videos.filter((v) => v.rating === "approved").length,
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-bg-sepia/50 bg-bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center">
              <span className="text-white text-xs font-bold">LT</span>
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-headline)] font-bold text-lg text-text-dark leading-tight">
                Le Tonkinois Shorts
              </h1>
              <p className="text-xs text-text-muted">Video Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/assets"
              className="px-3 py-1.5 rounded-lg bg-bg-sepia text-text-muted hover:bg-wood-amber/30 transition-colors font-medium"
            >
              Bild-Bibliothek
            </Link>
            <div className="text-center">
              <div className="font-bold text-text-dark">{stats.total}</div>
              <div className="text-xs text-text-muted">Videos</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-wood-amber">{stats.pending}</div>
              <div className="text-xs text-text-muted">Ausstehend</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-700">{stats.approved}</div>
              <div className="text-xs text-text-muted">Freigegeben</div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <VideoGrid videos={videos} />
      </div>
    </main>
  );
}
