'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, Sparkles, ShieldCheck, Mail, 
  ArrowRight, CheckCircle2, RefreshCw, KeyRound, Radio
} from 'lucide-react';

function Public3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const NUM_PARTICLES = 36;
    const particles: { x: number; y: number; z: number; vx: number; vy: number; vz: number }[] = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.3,
        y: (Math.random() - 0.5) * height * 1.3,
        z: Math.random() * 650 + 80,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.45,
      });
    }

    const focalLength = 360;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      const ox = (mouse.x - width / 2) * 0.05;
      const oy = (mouse.y - height / 2) * 0.05;

      const projected: { px: number; py: number; scale: number; alpha: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.z <= 40) p.z = 700;
        if (p.z > 700) p.z = 50;

        const scale = focalLength / p.z;
        const px = width / 2 + (p.x + ox) * scale;
        const py = height / 2 + (p.y + oy) * scale;
        const alpha = Math.min(Math.max((1 - p.z / 700) * 0.45, 0.05), 0.55);

        projected.push({ px, py, scale, alpha });

        ctx.beginPath();
        ctx.arc(px, py, 2.2 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 212, 191, ${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#2dd4bf';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 105) {
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.strokeStyle = `rgba(45, 212, 191, ${(1 - dist / 105) * 0.12})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-70" />;
}

export default function PublicPortalLoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingMagic, setLoadingMagic] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState<string>('');
  const [glare, setGlare] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTransform(`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.008, 1.008, 1.008)`);
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.14 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setErrorMsg(null);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.codekootu.codes';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=/portal/dashboard`,
        skipBrowserRedirect: true, // Keep this to prevent automatic redirects
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoadingGoogle(false);
      return;
    }

    if (data?.url) {
      // Check if we are inside an iframe (like a Vercel preview)
      if (window.self !== window.top) {
        // Open Google login in a new top-level tab to prevent Google's 403 error
        window.open(data.url, '_blank');
        setLoadingGoogle(false); // Stop the loading spinner on the original tab
      } else {
        // Normal redirect if already in a top-level window
        window.location.href = data.url;
      }
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingMagic(true);
    setErrorMsg(null);

    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/portal/dashboard`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoadingMagic(false);
    } else {
      setLoadingMagic(false);
      setMagicSent(true);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden selection:bg-[#2dd4bf]/30">
      <Public3DCanvas />

      <header className="relative z-10 flex items-center justify-between max-w-md mx-auto w-full">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#78837c] hover:text-white transition-colors font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Perimeter</span>
        </Link>
        <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#2dd4bf] flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-[#2dd4bf] animate-pulse" /> Door 01 // Public Portal
        </span>
      </header>

      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-8">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform,
            transition: 'transform 0.15s ease-out',
            transformStyle: 'preserve-3d',
          }}
          className="relative rounded-3xl bg-[#0a0e12]/90 backdrop-blur-2xl border border-[#dfe7e0]/10 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          <div
            className="pointer-events-none absolute -inset-px transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${glare.x}% ${glare.y}%, rgba(45, 212, 191, 0.2), transparent 70%)`,
              opacity: glare.opacity,
            }}
          />

          <div className="relative z-10 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 text-[#2dd4bf] shadow-[0_0_25px_rgba(45,212,191,0.25)]">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h1 className="text-2xl font-light tracking-tight text-white">
                Public Contributor Portal
              </h1>
              <p className="text-xs text-[#78837c] leading-relaxed max-w-xs mx-auto">
                Submit community briefs, track intake triage, and endorse prototypes.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            {magicSent ? (
              <div className="p-6 rounded-2xl bg-[#05070a]/90 border border-emerald-500/20 text-center space-y-4 animate-in fade-in duration-300">
                <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-white">Magic Dispatch Transmitted</h3>
                  <p className="text-xs text-[#78837c] leading-relaxed">
                    A secure authentication token has been beamed to <span className="text-[#dfe7e0] font-mono">{email}</span>. Click the link in your email to authenticate.
                  </p>
                </div>
                <button
                  onClick={() => setMagicSent(false)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#2dd4bf] hover:underline pt-2 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Resend or change address
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loadingGoogle}
                  className="w-full py-3.5 px-4 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {loadingGoogle ? (
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

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-[#dfe7e0]/10 w-full" />
                  <span className="bg-[#0a0e12] px-3 text-[10px] uppercase font-mono text-[#78837c] tracking-widest absolute">
                    or passwordless link
                  </span>
                </div>

                <form onSubmit={handleMagicLink} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#78837c] absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contributor@domain.com"
                        className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#78837c]/60 outline-none focus:border-[#2dd4bf] transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingMagic}
                    className="w-full py-3 bg-[#2dd4bf]/10 hover:bg-[#2dd4bf]/20 border border-[#2dd4bf]/30 text-[#2dd4bf] rounded-xl text-xs font-medium tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(45,212,191,0.15)] disabled:opacity-50"
                  >
                    {loadingMagic ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Send Magic Link</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            <div className="pt-2 border-t border-[#dfe7e0]/5 text-center">
              <Link 
                href="/team/login" 
                className="text-[11px] font-mono text-[#78837c] hover:text-[#e0231c] transition-colors underline"
              >
                Are you a verified team member? Switch to Door 02 &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 max-w-md mx-auto w-full text-center text-[10px] text-[#78837c] font-mono flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#2dd4bf]" />
        <span>Open Public Innovation Gateway</span>
      </footer>
    </div>
  );
}
