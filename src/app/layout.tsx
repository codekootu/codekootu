import type { Metadata, Viewport } from 'next';
import './globals.css';
import FloatingTeamButton from '@/components/FloatingTeamButton';

export const metadata: Metadata = {
  title: 'Code Kootu — Where problems become prototypes',
  description:
    'A fifteen-member engineering collective crowdsourcing real community problems and shipping hybrid hardware-software prototypes.',
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