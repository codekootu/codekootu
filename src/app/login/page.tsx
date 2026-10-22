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
      
      {/* Background Glow */}
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
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#dfe7e0]/5">
            <Link 
              href="/team/login" 
              className="text-[11px] font-mono text-[#78837c] hover:text-[#e0231c] transition-colors underline"
            >
              Are you a verified team member? Switch to Door 02 &rarr;
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-md mx-auto w-full text-center text-[10px] text-[#78837c] font-mono flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#2dd4bf]" />
        <span>Open Public Innovation Gateway</span>
      </footer>

    </div>
  );
}
