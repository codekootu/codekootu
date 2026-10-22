'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Rocket, Cpu, Sparkles, Clock, 
  CheckCircle2, AlertTriangle, Lightbulb, 
  ShieldCheck, Filter, ArrowUpRight, XCircle
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  assigned_wing?: string;
  status: string;
  sprint_directive?: string;
  created_at: string;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  target_wing?: string;
  status: string;
  final_status?: string | null;
  votes?: any[];
  created_at: string;
}

// 1. Embedded 3D Interactive Telemetry Radar Canvas
function Embedded3DRadar() {
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

    const NUM_POINTS = 30;
    const points: { x: number; y: number; z: number; vx: number; vy: number; vz: number }[] = [];
    for (let i = 0; i < NUM_POINTS; i++) {
      points.push({
        x: (Math.random() - 0.5) * width * 1.3,
        y: (Math.random() - 0.5) * height * 1.3,
        z: Math.random() * 700 + 100,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.5,
      });
    }

    let radarAngle = 0;
    const focalLength = 380;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const ox = (mouse.x - width / 2) * 0.05;
      const oy = (mouse.y - height / 2) * 0.05;

      const projected: { px: number; py: number; scale: number; alpha: number }[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.z <= 60) p.z = 800;
        if (p.z > 850) p.z = 80;

        const scale = focalLength / p.z;
        const px = width / 2 + (p.x + ox) * scale;
        const py = height / 2 + (p.y + oy) * scale;
        const alpha = Math.min(Math.max((1 - p.z / 850) * 0.5, 0.05), 0.7);

        projected.push({ px, py, scale, alpha });

        ctx.beginPath();
        ctx.arc(px, py, 2.5 * scale, 0, Math.PI * 2);
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
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.strokeStyle = `rgba(223, 231, 224, ${(1 - dist / 100) * 0.05})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Compass Gyroscope Ring
      radarAngle += 0.012;
      const compassX = width > 768 ? width - 150 : width / 2;
      const compassY = width > 768 ? 150 : 120;

      ctx.save();
      ctx.translate(compassX, compassY);

      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(224, 35, 28, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, 0, 65, 22, radarAngle * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
}

// 2. Embedded 3D Perspective Card Wrapper
function EmbeddedCard3D({ children, glowColor = 'rgba(224, 35, 28, 0.2)' }: { children: React.ReactNode; glowColor?: string }) {
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

    const rotateX = -((y - centerY) / centerY) * 7;
    const rotateY = ((x - centerX) / centerX) * 7;

    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`);
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.15 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className="relative rounded-2xl bg-[#0a0e12]/90 backdrop-blur-xl border border-[#dfe7e0]/10 shadow-2xl overflow-hidden"
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          background: `radial-gradient(350px circle at ${glare.x}% ${glare.y}%, ${glowColor}, transparent 70%)`,
          opacity: glare.opacity,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// 3. Main Enclave Page
export default function IdeasEnclavePage() {
  const supabase = createClient();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'deployed' | 'active' | 'pipeline' | 'rejected'>('all');
  const [wingFilter, setWingFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    const { data: projData } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projData) setProjects(projData as Project[]);

    const { data: ideaData } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (ideaData) setIdeas(ideaData as Idea[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function verifyAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/team/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      setProfile(data || { full_name: 'Member', role: 'contributor' });
      fetchData();
    }
    verifyAuth();

    const channel = supabase
      .channel('realtime_ideas_enclave')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router, fetchData]);

  // Status Categorizations
  const deployedProjects = projects.filter((p) => 
    p.status?.toLowerCase() === 'deployed' || p.status?.toLowerCase() === 'completed'
  );

  const activeSprints = projects.filter((p) => 
    p.status?.toLowerCase() !== 'deployed' && p.status?.toLowerCase() !== 'completed'
  );

  const upcomingVectors = ideas.filter((i) => {
    const s = (i.status || '').toLowerCase();
    const fs = (i.final_status || '').toLowerCase();
    return s !== 'approved' && s !== 'allocated' && s !== 'rejected' && fs !== 'approved' && fs !== 'rejected';
  });

  const rejectedIdeas = ideas.filter((i) => {
    const s = (i.status || '').toLowerCase();
    const fs = (i.final_status || '').toLowerCase();
    return s === 'rejected' || fs === 'rejected';
  });

  // Filter by Wing
  const filterByWing = (items: any[]) => {
    if (wingFilter === 'all') return items;
    return items.filter((item) => {
      const w = (item.assigned_wing || item.target_wing || '').toLowerCase();
      return w === wingFilter.toLowerCase();
    });
  };

  const filteredDeployed = filterByWing(deployedProjects);
  const filteredActive = filterByWing(activeSprints);
  const filteredVectors = filterByWing(upcomingVectors);
  const filteredRejected = filterByWing(rejectedIdeas);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center text-[#dfe7e0]">
        Loading Collective Enclave...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col relative overflow-x-hidden selection:bg-[#e0231c]/30">
      <Embedded3DRadar />

      {/* Top Header */}
      <header className="relative z-10 border-b border-[#dfe7e0]/10 bg-[#05070a]/75 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <Link 
          href="/team/dashboard" 
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#78837c] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Workbench
        </Link>
        <span className="text-xs uppercase tracking-widest text-[#78837c] font-mono flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#2dd4bf]" />
          {profile?.full_name} ({profile?.role?.replace('_', ' ')})
        </span>
      </header>

      <div className="relative z-10 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-7 rounded-2xl bg-gradient-to-r from-[#0a0e12]/95 via-[#0e131b]/90 to-[#0a0e12]/95 border border-[#dfe7e0]/10 backdrop-blur-2xl shadow-2xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/20 shadow-[0_0_20px_rgba(45,212,191,0.25)]">
                <Lightbulb className="w-6 h-6 animate-pulse" />
              </div>
              <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight">
                Ideas & Innovations Enclave
              </h1>
            </div>
            <p className="text-xs text-[#78837c] max-w-xl">
              Centralized engineering pipeline. Monitor deployed builds, current sprint directives, upcoming triage proposals, and rejected concepts.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="p-3 rounded-xl bg-[#05070a]/70 border border-[#dfe7e0]/10 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 block">Deployed</span>
              <span className="text-2xl font-mono text-white">{deployedProjects.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#05070a]/70 border border-[#dfe7e0]/10 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 block">Current</span>
              <span className="text-2xl font-mono text-white">{activeSprints.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#05070a]/70 border border-[#dfe7e0]/10 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-mono tracking-widest text-sky-400 block">Upcoming</span>
              <span className="text-2xl font-mono text-white">{upcomingVectors.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#05070a]/70 border border-[#dfe7e0]/10 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#e0231c] block">Rejected</span>
              <span className="text-2xl font-mono text-white">{rejectedIdeas.length}</span>
            </div>
          </div>
        </div>

        {/* Tab & Wing Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dfe7e0]/10 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'all' 
                  ? 'bg-white text-black shadow-lg font-semibold' 
                  : 'text-[#78837c] hover:text-white bg-[#dfe7e0]/5'
              }`}
            >
              All Collective Feed
            </button>
            <button
              onClick={() => setActiveTab('deployed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'deployed' 
                  ? 'bg-emerald-500 text-black shadow-lg font-semibold' 
                  : 'text-[#78837c] hover:text-white bg-[#dfe7e0]/5'
              }`}
            >
              🚀 Deployed ({filteredDeployed.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'active' 
                  ? 'bg-amber-500 text-black shadow-lg font-semibold' 
                  : 'text-[#78837c] hover:text-white bg-[#dfe7e0]/5'
              }`}
            >
              ⚡ Current ({filteredActive.length})
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'pipeline' 
                  ? 'bg-sky-500 text-black shadow-lg font-semibold' 
                  : 'text-[#78837c] hover:text-white bg-[#dfe7e0]/5'
              }`}
            >
              📡 Upcoming ({filteredVectors.length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'rejected' 
                  ? 'bg-[#e0231c] text-white shadow-lg font-semibold' 
                  : 'text-[#78837c] hover:text-white bg-[#dfe7e0]/5'
              }`}
            >
              ✕ Rejected ({filteredRejected.length})
            </button>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#78837c] flex items-center gap-1">
              <Filter className="w-3 h-3" /> Wing:
            </span>
            <select
              value={wingFilter}
              onChange={(e) => setWingFilter(e.target.value)}
              className="bg-[#0a0e12] border border-[#dfe7e0]/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#2dd4bf]"
            >
              <option value="all">All Wings</option>
              <option value="software">Software Wing</option>
              <option value="hardware">Hardware Wing</option>
              <option value="operations">Operations Wing</option>
            </select>
          </div>
        </div>

        {/* 1. SECTION: DEPLOYED PROJECTS */}
        {(activeTab === 'all' || activeTab === 'deployed') && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-medium tracking-wide uppercase text-white font-mono">
                Deployed Builds & Validated Systems
              </h2>
            </div>

            {filteredDeployed.length === 0 ? (
              <div className="p-8 text-center bg-[#0a0e12]/60 border border-dashed border-[#dfe7e0]/10 rounded-2xl text-xs text-[#78837c]">
                No completed builds in this wing yet. Approved projects transition here once finalized.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDeployed.map((proj) => (
                  <EmbeddedCard3D key={proj.id} glowColor="rgba(45,212,191,0.25)">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Deployed
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#dfe7e0]/5 border border-[#dfe7e0]/10 uppercase text-[#aab4ad]">
                          {proj.assigned_wing || 'Software'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-medium text-white tracking-tight">{proj.name}</h3>
                        <p className="text-xs text-[#78837c] mt-1 line-clamp-2">
                          {proj.sprint_directive || 'Validated production system operating under nominal telemetry.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#dfe7e0]/5 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#78837c]">Status: Nominal</span>
                        <span className="text-[#2dd4bf] flex items-center gap-1 cursor-pointer">
                          Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </EmbeddedCard3D>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 2. SECTION: CURRENT / ACTIVE SPRINTS */}
        {(activeTab === 'all' || activeTab === 'active') && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
              <h2 className="text-sm font-medium tracking-wide uppercase text-white font-mono">
                Current Status & Active Sprints
              </h2>
            </div>

            {filteredActive.length === 0 ? (
              <div className="p-8 text-center bg-[#0a0e12]/60 border border-dashed border-[#dfe7e0]/10 rounded-2xl text-xs text-[#78837c]">
                No active sprints logged. Promote ideas from the determination panel to initiate work.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredActive.map((proj) => (
                  <EmbeddedCard3D key={proj.id} glowColor="rgba(245,158,11,0.25)">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 animate-pulse" /> {proj.status || 'Building'}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#dfe7e0]/5 border border-[#dfe7e0]/10 uppercase text-[#aab4ad]">
                          {proj.assigned_wing || 'Software'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-medium text-white tracking-tight">{proj.name}</h3>
                        <p className="text-xs text-[#aab4ad] mt-1 bg-[#05070a] p-2.5 rounded-lg border border-[#dfe7e0]/5 font-mono text-[11px]">
                          "{proj.sprint_directive || 'Initial sprint allocation by Super Admin.'}"
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[10px] font-mono text-[#78837c]">
                          <span>Sprint Velocity</span>
                          <span className="text-amber-400">Building</span>
                        </div>
                        <div className="w-full bg-[#05070a] h-1.5 rounded-full overflow-hidden border border-[#dfe7e0]/5">
                          <div className="bg-gradient-to-r from-amber-500 to-[#e0231c] h-full rounded-full w-2/3 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </EmbeddedCard3D>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. SECTION: UPCOMING / PROBLEM VECTORS */}
        {(activeTab === 'all' || activeTab === 'pipeline') && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-medium tracking-wide uppercase text-white font-mono">
                Upcoming Problem Vectors & Intake
              </h2>
            </div>

            {filteredVectors.length === 0 ? (
              <div className="p-8 text-center bg-[#0a0e12]/60 border border-dashed border-[#dfe7e0]/10 rounded-2xl text-xs text-[#78837c]">
                No pending problem vectors in the queue.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVectors.map((idea) => {
                  const votes = Array.isArray(idea.votes) ? idea.votes : [];
                  const acceptVotes = votes.filter((v: any) => v.vote === 'accept' || v.recommendation === 'Approve');

                  return (
                    <EmbeddedCard3D key={idea.id} glowColor="rgba(56,189,248,0.25)">
                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
                            Target: {idea.target_wing || 'Software'}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {idea.status?.replace('_', ' ') || 'In Review'}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-medium text-white tracking-tight">{idea.title}</h3>
                          <p className="text-xs text-[#78837c] mt-1.5 line-clamp-3 leading-relaxed">
                            {idea.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#dfe7e0]/5 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-[#78837c] flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#2dd4bf]" />
                            {acceptVotes.length > 0 ? `${acceptVotes.length} Endorsed` : 'Awaiting Review'}
                          </span>
                          <Link 
                            href="/team/committee" 
                            className="text-[#dfe7e0] hover:text-white underline text-[10px] uppercase tracking-wider"
                          >
                            Review &rarr;
                          </Link>
                        </div>
                      </div>
                    </EmbeddedCard3D>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* 4. SECTION: REJECTED IDEAS */}
        {(activeTab === 'all' || activeTab === 'rejected') && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-[#e0231c]" />
              <h2 className="text-sm font-medium tracking-wide uppercase text-white font-mono">
                Rejected Concepts & Inactive Archive
              </h2>
            </div>

            {filteredRejected.length === 0 ? (
              <div className="p-8 text-center bg-[#0a0e12]/60 border border-dashed border-[#dfe7e0]/10 rounded-2xl text-xs text-[#78837c]">
                No ideas have been rejected.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRejected.map((idea) => (
                  <EmbeddedCard3D key={idea.id} glowColor="rgba(224,35,28,0.2)">
                    <div className="p-6 space-y-4 opacity-70 hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#e0231c]">
                          Target: {idea.target_wing || 'Software'}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          Rejected
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-medium text-[#aab4ad] line-through tracking-tight">{idea.title}</h3>
                        <p className="text-xs text-[#78837c] mt-1.5 line-clamp-3 leading-relaxed">
                          {idea.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#dfe7e0]/5 flex items-center justify-between text-[11px] font-mono text-[#78837c]">
                        <span>Archived by Board</span>
                        <span className="text-[10px] text-neutral-500">Non-viable</span>
                      </div>
                    </div>
                  </EmbeddedCard3D>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}page.tsx
