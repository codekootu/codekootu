import type { Metadata, Viewport } from 'next';
import './globals.css';
import FloatingTeamButton from '@/components/FloatingTeamButton';

export const metadata: Metadata = {
  title: "Code Kootu",
  description: "15 Minds. Multiple Disciplines. One Collective.",
  // ... keep the rest of your openGraph stuff if you have it
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#05070a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <FloatingTeamButton />
      </body>
    </html>
  );
}
