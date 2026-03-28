import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Video, VIDEO_TYPE_LABELS, VIDEO_TYPE_COLORS } from "@/lib/types";
import CopyButton from "@/components/CopyButton";
import LogoutButton from "@/components/LogoutButton";

export default async function VideoDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .single<Video>();

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">Video nicht gefunden.</p>
          <Link href="/" className="text-brand-red hover:underline">
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const fullCaption = `${video.caption_de ?? ""}\n\n${video.hashtags.join(" ")}`;

  return (
    <main className="min-h-screen bg-bg-cream">
      {/* Header */}
      <header className="border-b border-bg-sepia/50 bg-bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-text-muted hover:text-brand-red transition-colors text-sm"
            >
              &larr; Dashboard
            </Link>
            <span className="text-bg-sepia">/</span>
            <span className="text-sm text-text-dark font-medium truncate">
              {video.title}
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
          {/* Video Player */}
          <div>
            <div className="relative aspect-[9/16] bg-bg-dark rounded-xl overflow-hidden shadow-lg max-w-[360px]">
              <video
                src={video.video_url ?? ""}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${VIDEO_TYPE_COLORS[video.type]}`}
              >
                {VIDEO_TYPE_LABELS[video.type]}
              </span>
              <span className="text-xs text-text-muted">
                {video.duration}s
              </span>
              <span className="text-xs text-text-muted">
                {video.created_at}
              </span>
              <span className="text-xs text-text-muted ml-auto">
                {video.pipeline}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-[family-name:var(--font-headline)] font-bold text-2xl text-text-dark">
                {video.title}
              </h1>
              {video.products && video.products.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {video.products.map((p) => (
                    <span
                      key={p}
                      className="text-xs bg-brand-red-light text-brand-red px-2 py-0.5 rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Instagram Caption DE */}
            <div className="bg-bg-card rounded-lg p-4 border border-bg-sepia/50">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-sm text-text-dark">
                  Instagram Caption (DE)
                </h2>
                <CopyButton text={fullCaption} label="Caption + Hashtags kopieren" />
              </div>
              <pre className="text-sm text-text-dark whitespace-pre-wrap font-[family-name:var(--font-body)] leading-relaxed">
                {video.caption_de ?? ""}
              </pre>
            </div>

            {/* Instagram Caption FR */}
            {video.caption_fr && (
              <div className="bg-bg-card rounded-lg p-4 border border-bg-sepia/50">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-sm text-text-dark">
                    Instagram Caption (FR)
                  </h2>
                  <CopyButton text={video.caption_fr} label="Kopieren" />
                </div>
                <pre className="text-sm text-text-dark whitespace-pre-wrap font-[family-name:var(--font-body)] leading-relaxed">
                  {video.caption_fr}
                </pre>
              </div>
            )}

            {/* Hashtags */}
            <div className="bg-bg-card rounded-lg p-4 border border-bg-sepia/50">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-sm text-text-dark">Hashtags</h2>
                <CopyButton
                  text={video.hashtags.join(" ")}
                  label="Kopieren"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {video.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-bg-sepia text-text-muted px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Rating Actions */}
            <div className="bg-bg-card rounded-lg p-4 border border-bg-sepia/50">
              <h2 className="font-bold text-sm text-text-dark mb-3">
                Bewertung
              </h2>
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors">
                  Freigeben
                </button>
                <button className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors">
                  Ablehnen
                </button>
                <button className="flex-1 py-2.5 rounded-lg bg-bg-sepia text-text-muted font-bold text-sm hover:bg-wood-amber/30 transition-colors">
                  Zur Seite legen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
