#!/usr/bin/env bash
# Code Kootu — one-shot project bootstrap.
# Creates every folder and file we need, then prints a summary.
# Safe to re-run: files are overwritten with the same content.

set -e
cd "$(dirname "$0")"

echo "→ Creating folders…"
mkdir -p \
  public/landing-pages/secret-pathways-assets \
  scripts \
  src/app/login \
  src/app/team/login \
  src/components/landing \
  src/lib/supabase

# ──────────────────────────────────────────────────────────────────────
# Root config
# ──────────────────────────────────────────────────────────────────────

cat > package.json <<'__CK__'
{
  "name": "code-kootu",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "prebuild": "node scripts/build-landing-page.mjs",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "landing:build": "node scripts/build-landing-page.mjs"
  },
  "dependencies": {
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.45.4",
    "clsx": "^2.1.1",
    "lucide-react": "^0.454.0",
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "@types/node": "^22.7.5",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.3"
  }
}
__CK__

cat > tsconfig.json <<'__CK__'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
__CK__

cat > next.config.mjs <<'__CK__'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ublctyddhtbgaersvxxb.supabase.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/landing-pages/code-kootu.html',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
};
export default nextConfig;
__CK__

cat > postcss.config.mjs <<'__CK__'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
__CK__

cat > tailwind.config.ts <<'__CK__'
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05070a',
        'ink-2': '#0a0e12',
        bone: '#dfe7e0',
        'bone-dim': '#aab4ad',
        muted: '#78837c',
        vermilion: '#e0231c',
        ember: '#ff5a3c',
        gold: '#c9a24a',
      },
      fontFamily: {
        sans: ['Onest', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
__CK__

cat > .env.local.example <<'__CK__'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_xxxxxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
__CK__

cat > .gitignore <<'__CK__'
node_modules/
.next/
out/
build/
.DS_Store
*.pem
npm-debug.log*
.env*.local
.env
.vercel
*.tsbuildinfo
next-env.d.ts
__CK__

# ──────────────────────────────────────────────────────────────────────
# README
# ──────────────────────────────────────────────────────────────────────

cat > README.md <<'__CK__'
# Code Kootu

A fifteen-member engineering collective crowdsourcing real community problems and shipping hybrid hardware-software prototypes.

This turn: the landing page. Public portal and team workbench land next.

## Prerequisites

- Node.js 18+ (install via `brew install node`)
- A Supabase project (for portals; not needed for the landing page alone)

## Setup

1. Install deps:  `npm install`
2. Copy the two source files from your friend's ThreeUI package:

```bash
cp /path/to/threeui/public/landing-pages/kage.html             public/landing-pages/kage.html
cp /path/to/threeui/public/landing-pages/secret-pathways-assets/three.min.js \
                                                                public/landing-pages/secret-pathways-assets/three.min.js