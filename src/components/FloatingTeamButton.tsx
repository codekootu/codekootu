'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users } from 'lucide-react';

export default function FloatingTeamButton() {
  const pathname = usePathname();
  if (pathname === '/members') return null;

  return (
    <Link
      href="/members"
      className="fixed bottom-8 right-8 z-[99999] flex items-center gap-3 bg-[#0a0e12]/90 border border-[#dfe7e0]/20 px-5 py-3 rounded-full text-[#dfe7e0] text-[11px] font-medium tracking-[0.15em] uppercase backdrop-blur-md shadow-2xl shadow-black/50 transition-all duration-500 hover:border-[#e0231c] hover:bg-[#e0231c]/10 hover:text-[#e0231c] hover:-translate-y-1"
    >
      <Users className="w-4 h-4" />
      Meet the Team
    </Link>
  );
}
