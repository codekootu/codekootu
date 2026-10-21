'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, Plus } from 'lucide-react';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }
      supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => setProfile(data));
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div ref={containerRef} className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans relative overflow-hidden flex flex-col perspective-1000">
      
      {/* 3D Interactive Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep space gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a0808] via-[#05070a] to-[#020305]" />
        
        {/* Floating 3D Wireframe Rings (Parallax) */}
        <div 
          className="absolute top-[20%] left-[10%] w-[30vw] h-[30vw] border border-[#e0231c]/10 rounded-full animate-[spin_60s_linear_infinite] transition-transform duration-300 ease-out"
          style={{ transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px) rotateX(45deg) rotateY(45deg)` }}
        />
        <div 
          className="absolute bottom-[10%] right-[5%] w-[40vw] h-[40vw] border border-[#4a7c8a]/10 rounded-full animate-[spin_90s_linear_infinite_reverse] transition-transform duration-500 ease-out"
          style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px) rotateX(70deg) rotateY(-30deg)` }}
        />
        <div 
          className="absolute top-[40%] right-[30%] w-[15vw] h-[15vw] border border-[#dfe7e0]/5 animate-[spin_40s_linear_infinite] transition-transform duration-200 ease-out"
          style={{ transform: `translate(${mousePos.x * 60}px, ${mousePos.y * 60}px) rotateX(20deg) rotateZ(30deg)` }}
        />

        {/* Ambient glows */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#e0231c]/10 rounded-full blur-[120px] transition-transform duration-700 ease-out"
          style={{ transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)` }}
        />
        <div 
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[#4a7c8a]/10 rounded-full blur-[150px] transition-transform duration-1000 ease-out"
          style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
        />
        
        {/* Starfield overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-screen" />
      </div>

      {/* Glassmorphic Header */}
      <header className="relative z-50 h-20 border-b border-[#dfe7e0]/10 flex items-center justify-between px-8 bg-[#05070a]/40 backdrop-blur-2xl">
        <Link href="/" className="flex items-center gap-4 group">
          <span className="text-sm font-medium tracking-[0.2em] uppercase group-hover:text-white transition-colors">Code Kootu</span>
          <span className="text-xs text-[#78837c] border-l border-[#dfe7e0]/20 pl-4 hidden sm:inline uppercase tracking-widest">Public Portal</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/portal/submit" className="text-xs uppercase tracking-widest font-medium text-[#e0231c] hover:text-white transition-all flex items-center gap-2 hover:-translate-y-0.5 bg-[#e0231c]/10 px-4 py-2 rounded-full border border-[#e0231c]/20 hover:bg-[#e0231c] hover:shadow-[0_0_20px_rgba(224,35,28,0.4)]">
            <Plus className="w-3 h-3" /> Submit
          </Link>
          
          <Link href="/portal/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#dfe7e0]/20 hover:border-[#e0231c] transition-all flex items-center justify-center bg-[#0a0e12] hover:scale-105 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-[#78837c]" />
            )}
          </Link>
          
          <button onClick={handleLogout} className="text-[#78837c] hover:text-[#e0231c] transition-colors ml-2 hover:scale-110 active:scale-95"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Page Content */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
