'use client';

import { useState } from 'react';

export default function CopyButton({
  text,
  label,
}: {
  text: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="text-xs px-3 py-1 rounded bg-bg-sepia text-text-muted hover:bg-wood-amber/30 transition-colors"
    >
      {copied ? 'Kopiert!' : label}
    </button>
  );
}
