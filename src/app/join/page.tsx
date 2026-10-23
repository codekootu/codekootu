'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ArrowLeft, Send, CheckCircle2, 
  User, Mail, Phone, BookOpen, Link as LinkIcon, Users
} from 'lucide-react';

// --- 1. ADVANCED 3D PARTICLE CANVAS ---
function Advanced3DCanvas() {
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

    const NUM_PARTICLES = 50;
    const particles: { x: number; y: number; z: number; vx: number; vy: number; vz: number }[] = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.6,
      });
    }

    const focalLength = 400;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const ox = (mouse.x - width / 2) * 0.05;
      const oy = (mouse.y - height / 2) * 0.05;

      const projected: { px: number; py: number; scale: number; alpha: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.z <= 50) p.z = 850;
        if (p.z > 850) p.z = 60;

        const scale = focalLength / p.z;
        const px = width / 2 + (p.x + ox) * scale;
        const py = height / 2 + (p.y + oy) * scale;
        const alpha = Math.min(Math.max((1 - p.z / 850) * 0.6, 0.05), 0.8);

        projected.push({ px, py, scale, alpha });

        ctx.beginPath();
        ctx.arc(px, py, 2.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 212, 191, ${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#2dd4bf';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.strokeStyle = `rgba(45, 212, 191, ${(1 - dist / 120) * 0.15})`;
            ctx.lineWidth = 0.8;
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

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-60" />;
}

// --- 2. MAIN COMPONENT ---
export default function JoinCollectivePage() {
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    branch: 'Computer Science (CSE)',
    year_of_study: '1st Year',
    desired_wing: 'Software Wing',
    portfolio_url: '',
    statement_of_purpose: ''
  });

  // 3D Tilt Logic for the Card
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.from('applications').insert([formData]);

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col items-center py-12 px-4 relative overflow-hidden selection:bg-[#e0231c]/30 perspective-[1500px]">
      <Advanced3DCanvas />

      {/* Massive Animated Aura Background */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-[#e0231c]/15 rounded-full blur-[150px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-[#2dd4bf]/10 rounded-full blur-[120px] pointer-events-none" 
      />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-3xl flex justify-between items-center mb-8"
      >
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#78837c] hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Base
        </Link>
        <div className="text-[10px] font-mono tracking-[0.2em] text-[#2dd4bf] uppercase flex items-center gap-2 bg-[#2dd4bf]/10 px-3 py-1.5 rounded-full border border-[#2dd4bf]/20 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
          <div className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-ping" /> Intake Active
        </div>
      </motion.div>

      {/* Main 3D Form Card */}
      <motion.div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 w-full max-w-3xl bg-[#0a0e12]/85 backdrop-blur-3xl border border-[#dfe7e0]/10 rounded-3xl p-8 md:p-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
      >
        {/* 3D Glare Effect */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${x}% ${y}%, rgba(255,255,255,0.06), transparent 40%)`,
          }}
        />

        {success ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-24"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-[#2dd4bf]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#2dd4bf]/30 shadow-[0_0_50px_rgba(45,212,191,0.3)]"
            >
              <CheckCircle2 className="w-12 h-12 text-[#2dd4bf]" />
            </motion.div>
            <h2 className="text-4xl font-light text-white mb-4">Transmission Received</h2>
            <p className="text-[#78837c] max-w-md mx-auto text-lg leading-relaxed">
              Your application has been securely logged in the collective database. The Executive Board will review your profile shortly.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex p-4 rounded-2xl bg-[#e0231c]/10 border border-[#e0231c]/20 text-[#e0231c] shadow-[0_0_30px_rgba(224,35,28,0.2)] mb-6">
                <Users className="w-8 h-8 animate-pulse" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
                JOIN THE <span className="text-[#e0231c]">COLLECTIVE.</span>
              </h1>
              <p className="text-sm font-mono tracking-widest text-[#78837c] uppercase">
                We are looking for builders, innovators, and problem solvers.
              </p>
            </motion.div>

            {errorMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono text-center">
                {errorMsg}
              </motion.div>
            )}

            <motion.form 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="group">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block group-focus-within:text-[#2dd4bf] transition-colors">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#78837c] absolute left-4 top-3.5 pointer-events-none group-focus-within:text-[#2dd4bf] transition-colors" />
                    <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="John Doe" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-[#78837c]/50 outline-none focus:border-[#2dd4bf] focus:shadow-[0_0_15px_rgba(45,212,191,0.1)] transition-all" />
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="group">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block group-focus-within:text-[#2dd4bf] transition-colors">Personal Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#78837c] absolute left-4 top-3.5 pointer-events-none group-focus-within:text-[#2dd4bf] transition-colors" />
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@gmail.com" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-[#78837c]/50 outline-none focus:border-[#2dd4bf] focus:shadow-[0_0_15px_rgba(45,212,191,0.1)] transition-all" />
                  </div>
                </motion.div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="group">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block group-focus-within:text-[#2dd4bf] transition-colors">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#78837c] absolute left-4 top-3.5 pointer-events-none group-focus-within:text-[#2dd4bf] transition-colors" />
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-[#78837c]/50 outline-none focus:border-[#2dd4bf] focus:shadow-[0_0_15px_rgba(45,212,191,0.1)] transition-all" />
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="group">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block group-focus-within:text-[#2dd4bf] transition-colors">Branch of Engineering</label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-[#78837c] absolute left-4 top-3.5 pointer-events-none group-focus-within:text-[#2dd4bf] transition-colors" />
                    <select name="branch" value={formData.branch} onChange={handleChange} className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white outline-none focus:border-[#2dd4bf] transition-all appearance-none cursor-pointer">
                      <option>Computer Science (CSE)</option>
                      <option>AI & Data Science</option>
                      <option>Electronics (ECE)</option>
                      <option>Mechanical (ME)</option>
                      <option>Civil (CE)</option>
                      <option>Cybersecurity</option>
                      <option>Other</option>
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none text-[#78837c]">▼</div>
                  </div>
                </motion.div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="group">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block group-focus-within:text-[#2dd4bf] transition-colors">Year of Study</label>
                  <div className="relative">
                    <select name="year_of_study" value={formData.year_of_study} onChange={handleChange} className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#2dd4bf] transition-all appearance-none cursor-pointer">
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none text-[#78837c]">▼</div>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="group">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block group-focus-within:text-[#2dd4bf] transition-colors">Desired Wing</label>
                  <div className="relative">
                    <select name="desired_wing" value={formData.desired_wing} onChange={handleChange} className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#2dd4bf] transition-all appearance-none cursor-pointer">
                      <option>Software Wing</option>
                      <option>Hardware Wing</option>
                      <option>Operations & Strategy</option>
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none text-[#78837c]">▼</div>
                  </div>
                </motion.div>
              </div>

              {/* Row 4 */}
              <motion.div variants={itemVariants} className="group">
                <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block group-focus-within:text-[#2dd4bf] transition-colors">GitHub / Portfolio Link (Optional)</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-[#78837c] absolute left-4 top-3.5 pointer-events-none group-focus-within:text-[#2dd4bf] transition-colors" />
                  <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} placeholder="https://github.com/yourusername" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-[#78837c]/50 outline-none focus:border-[#2dd4bf] focus:shadow-[0_0_15px_rgba(45,212,191,0.1)] transition-all" />
                </div>
              </motion.div>

              {/* Row 5 */}
              <motion.div variants={itemVariants} className="group">
                <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block group-focus-within:text-[#e0231c] transition-colors">Why do you want to join Code Kootu?</label>
                <textarea name="statement_of_purpose" required value={formData.statement_of_purpose} onChange={handleChange} placeholder="Tell us what you build, what you want to learn, and why you belong in the collective." className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#78837c]/50 outline-none focus:border-[#e0231c] focus:shadow-[0_0_15px_rgba(224,35,28,0.1)] transition-all min-h-[140px] resize-none" />
              </motion.div>

              {/* Animated Submit Button */}
              <motion.div variants={itemVariants} className="pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading} 
                  className="relative w-full py-5 bg-gradient-to-r from-[#e0231c] to-[#ff5a3c] text-white font-bold rounded-xl overflow-hidden group disabled:opacity-50 tracking-wider uppercase text-sm shadow-[0_0_30px_rgba(224,35,28,0.3)]"
                >
                  {/* Sweeping light effect */}
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? 'Transmitting Data...' : <><Send className="w-4 h-4" /> Submit Application</>}
                  </span>
                </motion.button>
              </motion.div>
            </motion.form>
          </>
        )}
      </motion.div>
    </div>
  );
}
