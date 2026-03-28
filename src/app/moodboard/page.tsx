// src/app/moodboard/page.tsx
// Protected automatically by src/proxy.ts — /moodboard is not in PUBLIC_PATHS.
// Auth redirect to /login happens transparently for unauthenticated users.
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { moodboard, type MoodboardEntry } from "@/data/moodboard";

export default function MoodboardPage() {
  // Get unique accounts for filter display
  const accounts = [...new Set(moodboard.map((e) => e.account))];

  return (
    <main className="min-h-screen bg-bg-cream">
      {/* Header — consistent with dashboard */}
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
              <p className="text-xs text-text-muted">Moodboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-bg-sepia text-text-muted hover:bg-wood-amber/30 transition-colors font-medium"
            >
              Dashboard
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="font-[family-name:var(--font-headline)] font-bold text-[28px] text-text-dark">
          Referenz-Moodboard
        </h2>
        <p className="text-base text-text-muted mt-1 mb-6">
          Ziel-Stil fuer den Le Tonkinois Instagram-Kanal
        </p>

        {/* Account tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {accounts.map((account) => (
            <span
              key={account}
              className="px-3 py-1 rounded-full bg-bg-sepia text-text-muted text-xs font-bold"
            >
              {account}
            </span>
          ))}
        </div>

        {/* Screenshot grid: 2 cols mobile / 3 cols tablet / 4 cols desktop */}
        {moodboard.length === 0 ? (
          <p className="text-text-muted py-12 text-center">
            Noch keine Referenzen gesammelt. Screenshots in
            public/assets/moodboard/ ablegen.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {moodboard.map((entry) => (
              <MoodboardCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function MoodboardCard({ entry }: { entry: MoodboardEntry }) {
  return (
    <div className="bg-bg-card rounded-lg overflow-hidden border border-bg-sepia/50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={entry.imagePath}
        alt={entry.caption}
        className="w-full aspect-[9/16] object-cover"
        loading="lazy"
      />
      <div className="p-3">
        <span className="inline-block px-2 py-0.5 rounded bg-bg-sepia text-text-muted text-xs font-bold mb-1">
          {entry.account}
        </span>
        <p className="text-sm text-text-dark line-clamp-2 mt-1">
          {entry.caption}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.tags.map((tag) => (
            <span key={tag} className="text-xs text-text-muted">
              #{tag}
            </span>
          ))}
        </div>
        {entry.sourceUrl && (
          <a
            href={entry.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-red hover:underline mt-2 inline-block"
          >
            Quelle
          </a>
        )}
      </div>
    </div>
  );
}
