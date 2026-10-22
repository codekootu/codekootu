'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export default function PublicPortalLoginPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=/portal/dashboard`,
      },
    });
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden selection:bg-[#e0231c]/30">
      
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(45,212,191,0.06),transparent_60%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-md mx-auto w-full">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#78837c] hover:text-white transition-colors font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Perimeter</span>
        </Link>
        <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#2dd4bf]">
          Door 01 // Public Portal
        </span>
      </header>

      {/* Login Card */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-8">
        <div className="relative rounded-2xl bg-[#0a0e12]/90 backdrop-blur-2xl border border-[#dfe7e0]/10 p-8 sm:p-10 shadow-2xl space-y-6 text-center">
          
          <div className="space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] mb-2 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-2xl font-light tracking-tight text-white">
              Public Contributor Portal
            </h1>
            <p className="text-xs text-[#78837c] leading-relaxed max-w-sm mx-auto">
              Submit community problem briefs, track live intake determination, and vote on prototypes.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8
