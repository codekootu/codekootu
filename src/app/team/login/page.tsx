'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  ArrowLeft, Loader2, ShieldAlert, KeyRound, 
  ArrowRight, User, Terminal, Lock
} from 'lucide-react';

function TeamCanvas() {
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
        ctx.fillStyle = `rgba(224, 35, 28, ${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#e0231c';
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
            ctx.strokeStyle = `rgba(224, 35, 28, ${(1 - dist / 105) * 0.12})`;
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

export default function TeamWorkbenchLoginPage() {
  const supabase = createClient();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleTeamPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const trimmedInput = username.trim();
    const emailToUse = trimmedInput.includes('@')
      ? trimmedInput
      : `${trimmedInput}@codekootu.codes`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    if (data?.session) {
      // Hard redirect ensures cookies are attached to the SSR request
      window.location.href = '/team/dashboard';
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden selection:bg-[#e0231c]/30">
      <TeamCanvas />

      <header className="relative z-10 flex items-center justify-between max-w-md mx-auto w-full">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#78837c] hover:text-white transition-colors font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Perimeter</span>
        </Link>
        <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#e0231c] flex items-center gap-1.5">
          <Terminal className="w-3 h-3 text-[#e0231c] animate-pulse" /> Door 02 // Team Workbench
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
          className="relative rounded-3xl bg-[#0a0e12]/90 backdrop-blur-2xl border border-[#e0231c]/25 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          <div
            className="pointer-events-none absolute -inset-px transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${glare.x}% ${glare.y}%, rgba(224, 35, 28, 0.2), transparent 70%)`,
              opacity: glare.opacity,
            }}
          />

          <div className="relative z-10 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-[#e0231c]/10 border border-[#e0231c]/20 text-[#e0231c] shadow-[0_0_25px_rgba(224,35,28,0.25)]">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <h1 className="text-2xl font-light tracking-tight text-white">
                Team Workbench
              </h1>
              <p className="text-xs text-[#78837c] leading-relaxed max-w-xs mx-auto">
                Verified Code Kootu members only. Secure credential authorization.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleTeamPasswordLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] block">
                  Identifier / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#78837c] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="member@codekootu.codes"
                    className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#78837c]/60 outline-none focus:border-[#e0231c] transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] block">
                  Security Passkey
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#78837c] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#78837c]/60 outline-none focus:border-[#e0231c] transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#e0231c]/15 hover:bg-[#e0231c]/25 border border-[#e0231c]/40 text-white rounded-xl text-xs font-medium tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(224,35,28,0.25)] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5 text-[#e0231c]" />
                    <span>Authorize & Access Workbench</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-[#dfe7e0]/5 text-center">
              <Link 
                href="/login" 
                className="text-[11px] font-mono text-[#78837c] hover:text-[#2dd4bf] transition-colors underline"
              >
                Not a core member? Switch to Door 01 (Public Portal) &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 max-w-md mx-auto w-full text-center text-[10px] text-[#78837c] font-mono">
        <span>Protected Core Infrastructure</span>
      </footer>
    </div>
  );
}
