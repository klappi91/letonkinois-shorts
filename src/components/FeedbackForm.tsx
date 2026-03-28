'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Feedback } from '@/lib/types';

interface FeedbackFormProps {
  videoId: string;
  existingFeedback: Feedback | null;
}

export default function FeedbackForm({ videoId, existingFeedback }: FeedbackFormProps) {
  const [stars, setStars] = useState<number>(existingFeedback?.stars ?? 0);
  const [pros, setPros] = useState(existingFeedback?.pros ?? '');
  const [cons, setCons] = useState(existingFeedback?.cons ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (stars === 0) {
      setError('Bitte waehle eine Sternebewertung');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Nicht angemeldet — bitte neu einloggen');
        setLoading(false);
        return;
      }

      const { error: upsertError } = await supabase
        .from('feedback')
        .upsert(
          {
            video_id: videoId,
            user_id: user.id,
            stars,
            pros: pros || null,
            cons: cons || null,
          },
          { onConflict: 'video_id,user_id' }
        );

      if (upsertError) {
        setError('Fehler beim Speichern');
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch {
      setError('Verbindungsfehler — bitte erneut versuchen');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {existingFeedback && (
        <p className="text-text-muted text-xs mb-3">Deine bisherige Bewertung</p>
      )}

      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-dark mb-2">
          Sternebewertung
        </label>
        <div role="group" aria-label="Sternebewertung" className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              aria-label={`${n} Stern${n > 1 ? 'e' : ''}`}
              className={`text-2xl transition-colors hover:text-brand-red ${
                n <= stars ? 'text-brand-red' : 'text-text-muted'
              }`}
            >
              &#9733;
            </button>
          ))}
        </div>
      </div>

      {/* Pros Textarea */}
      <div className="mb-3">
        <label
          htmlFor="pros"
          className="block text-sm font-medium text-text-dark mb-1"
        >
          Was gefaellt dir?
        </label>
        <textarea
          id="pros"
          rows={3}
          value={pros}
          onChange={(e) => setPros(e.target.value)}
          placeholder="Was hat dir besonders gefallen?"
          className="w-full px-3 py-2 rounded-lg border border-bg-sepia bg-bg-card text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red resize-none"
        />
      </div>

      {/* Cons Textarea */}
      <div className="mb-4">
        <label
          htmlFor="cons"
          className="block text-sm font-medium text-text-dark mb-1"
        >
          Was koennte besser sein?
        </label>
        <textarea
          id="cons"
          rows={3}
          value={cons}
          onChange={(e) => setCons(e.target.value)}
          placeholder="Was wuerde das Video verbessern?"
          className="w-full px-3 py-2 rounded-lg border border-bg-sepia bg-bg-card text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-brand-red mb-4">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || stars === 0}
        className="w-full py-2.5 rounded-lg bg-brand-red text-white font-bold text-sm hover:bg-brand-red-hover transition-colors disabled:opacity-50"
      >
        {loading ? 'Speichern...' : 'Bewertung speichern'}
      </button>
    </form>
  );
}
