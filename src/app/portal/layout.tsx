'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-white/10 bg-[#0a0e12]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/portal/dashboard"
              className="font-mono text-sm tracking-widest text-white/90 hover:text-white transition-colors"
            >
              CODE KOOTU
            </Link>
            <span className="text-white/20">|</span>
            <span className="font-mono text-xs tracking-wider text-[#2dd4bf] uppercase">
              Public Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Submit Button */}
            <Link
              href="/portal/submit"
              className="text-xs font-mono px-3.5 py-1.5 rounded-full border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1"
            >
              <span className="text-sm leading-none">+</span> SUBMIT
            </Link>

            {/* Profile Avatar Icon */}
            <Link
              href="/portal/profile"
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-[#2dd4bf] transition-colors"
              title="Your Profile"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-500/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Portal Pages */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
