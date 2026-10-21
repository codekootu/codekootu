'use client';

import { useState } from 'react';

type Props = { sourceUrl: string; title: string; className?: string; };

export function LandingPageFrame({ sourceUrl, title, className }: Props) {
  const [ready, setReady] = useState(false);
  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100dvh', minHeight: '100vh', overflow: 'hidden', background: '#05070a' }}>
      <iframe
        title={title}
        src={sourceUrl}
        sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
        loading="eager"
        onLoad={() => setReady(true)}
        style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', border: 0, background: '#05070a', opacity: ready ? 1 : 0, transition: 'opacity 400ms cubic-bezier(.16,1,.3,1)' }}
      />
    </div>
  );
}
