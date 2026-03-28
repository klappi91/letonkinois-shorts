'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1.5 rounded-lg bg-bg-sepia text-text-muted hover:bg-wood-amber/30 transition-colors font-medium text-sm"
    >
      Abmelden
    </button>
  );
}
