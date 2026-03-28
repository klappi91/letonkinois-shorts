'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Ungueltige Anmeldedaten');
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-brand-red flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-lg font-bold">LT</span>
          </div>
          <h1 className="font-[family-name:var(--font-headline)] font-bold text-xl text-text-dark">
            Le Tonkinois Shorts
          </h1>
          <p className="text-sm text-text-muted">Content Review</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-bg-card rounded-xl border border-bg-sepia/50 p-6 shadow-sm"
        >
          <div className="space-y-4 mb-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-dark mb-1"
              >
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-bg-sepia bg-bg-card text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-dark mb-1"
              >
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-bg-sepia bg-bg-card text-text-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-brand-red mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-red text-white font-bold text-sm hover:bg-brand-red-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </main>
  );
}
