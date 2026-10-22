'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Lock, Mail, ShieldAlert, CheckCircle2, 
  Loader2, Terminal, ArrowRight, ShieldCheck 
} from 'lucide-react';

// 1. Embedded 3D Ambient Mesh Canvas
function Auth3DCanvas() {
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

    // 3D Particles
    const NUM_PARTICLES = 40;
    const particles: { x: number; y: number; z: number; vx: number; vy: number; vz: number }[] = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.4,
        y: (Math.random() - 0.5) * height * 1.4,
        z: Math.random() * 600 + 100,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.4,
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
        const alpha = Math.min(Math.max((1 - p.z / 700) * 0.4, 0.04), 0.5);

        projected.push({ px, py, scale, alpha });

        ctx.beginPath();
        ctx.arc(px, py, 1.8 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 35, 28, ${alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#e0231c';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.strokeStyle = `rgba(224, 35, 28, ${(1 - dist / 90) * 0.08})`;
            ctx.lineWidth = 0.6;
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

export default function TeamLoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [assignedRole, setAssignedRole] = useState<string>('');

  // 3D Card Hover Glare
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

    const rotateX = -((y - centerY) / centerY) * 5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setTransform(`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.008, 1.008, 1.008)`);
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.12 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authErr) {
      setErrorMsg(authErr.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Query role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', authData.user.id)
        .maybeSingle();

      const userRole = profile?.role || 'authorized_member';
      setAssignedRole(userRole.replace('_', ' ').toUpperCase());
      
      // Trigger green checkmark verification stage
      setAuthSuccess(true);

      // Brief transition delay to show green check telemetry
      setTimeout(() => {
        router.push('/team/dashboard');
      }, 1600);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden selection:bg-[#e0231c]/30">
      <Auth3DCanvas />

      {/* Top Bar */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#78837c] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Perimeter</span>
        </Link>
        <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#e0231c] flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" /> Sector 02 // Team Workbench
        </span>
      </header>

      {/* Main Login Viewport */}
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
          className="relative rounded-2xl bg-[#0a0e12]/90 backdrop-blur-2xl border border-[#dfe7e0]/10 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Dynamic 3D Glare */}
          <div
            className="pointer-events-none absolute -inset-px transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${glare.x}% ${glare.y}%, rgba(224, 35, 28, 0.25), transparent 70%)`,
              opacity: glare.opacity,
            }}
          />

          <div className="relative z-10">
            {authSuccess ? (
              /* Green Verification State */
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                  <div className="relative p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-12 h-12 stroke-[1.75]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-emerald-400 uppercase block">
                    Access Granted // Role Verified
                  </span>
                  <h3 className="text-xl font-light text-white tracking-tight">
                    {assignedRole}
                  </h3>
                  <p className="text-xs text-[#78837c] font-mono">
                    Routing to internal collective workbench...
                  </p>
                </div>
              </div>
            ) : (
              /* Credential Form State */
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#e0231c] block mb-2">
                    02 — Team Workbench
                  </span>
                  <h1 className="text-3xl font-light tracking-tight text-white">
                    Verified Access.
                  </h1>
                  <p className="text-xs text-[#78837c] mt-1.5 leading-relaxed">
                    Wing tools, sprints, triage console, admin decisions.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 font-mono">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] block">
                      Team Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#78837c] absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="email
