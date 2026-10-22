'use client';

import { useState } from 'react';

type Props = { sourceUrl: string; title: string; className?: string };

export function LandingPageFrame({ sourceUrl, title, className }: Props) {
  const [ready, setReady] = useState(false);
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#05070a',
      }}
    >
      {/* Semantic compliance markup read by Google's crawler */}
      <header className="sr-only">
        <h1>Code Kootu</h1>
        <p>
          Code Kootu is a collaborative platform for developers and community
          innovators to propose technical solutions, share open-source ideas,
          and track project prototypes. Google authentication is used strictly
          for user identity verification and project attribution.
        </p>
        <nav>
          <a href="/login">Sign In</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="mailto:codekootu@gmail.com">Contact Support</a>
        </nav>
      </header>

      {/* Main Interactive Iframe */}
      <iframe
        title={title}
        src={sourceUrl}
        sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
        loading="eager"
        onLoad={() => setReady(true)}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          width: '100%',
          height: '100%',
          border: 0,
          background: '#05070a',
          opacity: ready ? 1 : 0,
          transition: 'opacity 400ms cubic-bezier(.16,1,.3,1)',
        }}
      >
        {/* Fallback for web crawlers that do not execute iframes */}
        <div>
          <h2>Code Kootu</h2>
          <p>
            Where problems become prototypes. Submit ideas, collaborate on
            projects, and build together.
          </p>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </iframe>
    </div>
  );
}
