'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, CheckCircle2, User, Clock, Zap, ShieldAlert, LogIn, Sparkles, AlertTriangle, Lock
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function ApplyPage() {
  const supabase = createClient();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true); 

  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', branch: 'Computer Science (CSE)',
    custom_branch: '', 
    year_of_study: '1st Year', desired_wing: 'Software Wing', portfolio_url: '',
    commitment_hours: '10-15 hours', other_commitments: '',
    hardest_problem: '', why_kootu: ''
  });

  // --- 3D PARALLAX TILT LOGIC ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 25 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

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
  // ------------------------------

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setFormData(prev => ({ ...prev, email: data.user.email || '' }));
      }
      setCheckingAuth(false);
    });
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setErrorMsg(null);

    const { custom_branch, ...dataToSubmit } = formData;
    const finalBranch = formData.branch === 'Other' ? `Other: ${formData.custom_branch}` : formData.branch;

    const { error } = await supabase.from('applications').insert({
      ...dataToSubmit,
      branch: finalBranch, 
      user_id: user.id,
      status: 'Pending'
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({ 
      x: direction > 0 ? 200 : -200, 
      opacity: 0, 
      rotateY: direction > 0 ? 90 : -90, 
      scale: 0.9,
      filter: "blur(10px)"
    }),
    center: { 
      zIndex: 1, 
      x: 0, 
      opacity: 1, 
      rotateY: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: (direction: number) => ({ 
      zIndex: 0, 
      x: direction < 0 ? 200 : -200, 
      opacity: 0, 
      rotateY: direction < 0 ? 90 : -90, 
      scale: 0.9,
      filter: "blur(10px)",
      transition: { duration: 0.3 }
    })
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[100dvh] bg-[#05070a] flex flex-col items-center justify-center text-[#dfe7e0] relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#2dd4bf]/20 border-t-[#2dd4bf] rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(45,212,191,0.3)]" />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#2dd4bf] animate-pulse">Initializing Secure Uplink...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-4 relative overflow-hidden perspective-[1500px]">
        <AnimatedBackground />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotateX: 20 }} 
          animate={{ opacity: 1, scale: 1, rotateX: 0 }} 
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative z-10 max-w-md w-full bg-[#0a0e12]/90 backdrop-blur-3xl border border-[#e0231c]/30 rounded-3xl p-10 text-center shadow-[0_0_80px_rgba(224,35,28,0.2)]"
        >
          <div className="w-24 h-24 bg-[#e0231c]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#e0231c]/20 shadow-[0_0_30px_rgba(224,35,28,0.3)] animate-pulse">
            <ShieldAlert className="w-12 h-12 text-[#e0231c]" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">ACCESS RESTRICTED</h2>
          <p className="text-sm text-[#78837c] mb-10 leading-relaxed font-mono">
            Authentication is required to submit a collective application. Please log in to establish a secure session.
          </p>
          <Link 
            href="/login?next=/apply" 
            className="w-full py-4 bg-[#dfe7e0] text-black font-bold uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(223,231,224,0.2)] hover:shadow-[0_0_50px_rgba(223,231,224,0.4)]"
          >
            <LogIn className="w-5 h-5" /> Authenticate
          </Link>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 text-xs font-mono text-[#78837c] hover:text-[#2dd4bf] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to Surface
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-[100dvh] text-[#dfe7e0] font-sans flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden perspective-[1500px] bg-[#05070a]"
    >
      <AnimatedBackground />

      <motion.div animate={{ rotate: 360, y: [0, -50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] left-[10%] w-64 h-64 border border-[#2dd4bf]/20 rounded-full pointer-events-none" style={{ transformStyle: 'preserve-3d' }} />
      <motion.div animate={{ rotate: -360, y: [0, 50, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute bottom-[10%] right-[10%] w-96 h-96 border border-[#e0231c]/20 rounded-full pointer-events-none" style={{ transformStyle: 'preserve-3d' }} />
      
      <div className="relative z-10 w-full max-w-3xl perspective-[1500px]">
        {success ? (
          <motion.div initial={{ scale: 0.5, opacity: 0, rotateX: 45 }} animate={{ scale: 1, opacity: 1, rotateX: 0 }} transition={{ type: "spring", bounce: 0.5 }} className="bg-[#0a0e12]/90 backdrop-blur-3xl border border-[#2dd4bf]/30 rounded-3xl p-16 text-center shadow-[0_0_100px_rgba(45,212,191,0.2)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2dd4bf]/10 to-transparent pointer-events-none" />
            <CheckCircle2 className="w-32 h-32 text-[#2dd4bf] mx-auto mb-8 animate-bounce drop-shadow-[0_0_20px_rgba(45,212,191,0.8)]" />
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">UPLINK SECURED</h2>
            <p className="text-[#78837c] text-lg mb-10 font-mono max-w-md mx-auto">Your application has been transmitted to the Executive Board for deep-space review.</p>
            <Link href="/portal/dashboard" className="px-10 py-5 bg-[#dfe7e0] text-black font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-transform inline-block shadow-[0_0_30px_rgba(223,231,224,0.3)]">
              Return to Portal
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="bg-[#0a0e12]/80 backdrop-blur-3xl border border-[#dfe7e0]/10 rounded-3xl p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden relative"
          >
            <div className="absolute inset-0 rounded-3xl padding-1 bg-gradient-to-br from-[#2dd4bf]/50 via-transparent to-[#e0231c]/50 -z-10" style={{ maskImage: 'linear-gradient(#fff, #fff)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
            
            <div className="absolute top-0 left-0 w-full h-1 bg-[#dfe7e0]/5">
              <motion.div className="h-full bg-gradient-to-r from-[#e0231c] to-[#2dd4bf] shadow-[0_0_10px_#2dd4bf]" initial={{ width: '0%' }} animate={{ width: `${(step / 3) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>

            <div className="text-center mb-8 relative z-10" style={{ transform: "translateZ(30px)" }}>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-xl">
                JOIN THE <span className="text-[#e0231c]">COLLECTIVE.</span>
              </h1>
              <p className="text-[10px] font-mono text-[#2dd4bf] uppercase tracking-[0.4em] mt-3 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-ping" /> Phase {step} of 3
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="mb-8 p-4 rounded-xl bg-[#e0231c]/10 border border-[#e0231c]/30 flex items-start gap-4 shadow-[0_0_20px_rgba(224,35,28,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#e0231c] animate-pulse" />
              <AlertTriangle className="w-6 h-6 text-[#e0231c] shrink-0 animate-bounce" />
              <div>
                <p className="text-sm font-bold text-[#e0231c] uppercase tracking-wider mb-1">Strict Scrutiny Protocol Active</p>
                <p className="text-xs text-[#aab4ad] leading-relaxed font-mono">
                  All submissions are deeply vetted by the Executive Board. Falsified information, spam, or low-effort applications will be immediately discarded and permanently blacklisted.
                </p>
              </div>
            </motion.div>

            {errorMsg && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono text-center shadow-[0_0_20px_rgba(255,0,0,0.1)]">
                {errorMsg}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait" custom={step}>
                
                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                  <motion.div key="step1" custom={step} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6" style={{ transform: "translateZ(20px)" }}>
                    <div className="flex items-center gap-3 mb-6 border-b border-[#dfe7e0]/10 pb-4">
                      <User className="w-6 h-6 text-[#2dd4bf]" />
                      <h2 className="text-xl font-medium text-white tracking-wide">Identity & Background</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <motion.div whileHover={{ scale: 1.02, z: 10 }} whileFocus={{ scale: 1.02 }}>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-[#78837c] mb-2 block">Full Name <span className="text-[#e0231c]">*</span></label>
                        <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="John Doe" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] focus:shadow-[0_0_20px_rgba(45,212,191,0.2)] outline-none transition-all" />
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.01 }}>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-[#78837c] mb-2 block flex items-center gap-2">
                          Email <Lock className="w-3 h-3 text-[#78837c]" />
                        </label>
                        <input 
                          type="email" 
                          name="email" 
                          required 
                          readOnly 
                          value={formData.email} 
                          className="w-full bg-[#05070a]/50 border border-[#dfe7e0]/10 rounded-xl px-4 py-3 text-sm text-[#78837c] cursor-not-allowed outline-none" 
                        />
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02, z: 10 }}>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-[#78837c] mb-2 block">Phone <span className="text-[#e0231c]">*</span></label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] focus:shadow-[0_0_20px_rgba(45,212,191,0.2)] outline-none transition-all" />
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02, z: 10 }}>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-[#78837c] mb-2 block">Branch <span className="text-[#e0231c]">*</span></label>
                        <select name="branch" required value={formData.branch} onChange={handleChange} className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] focus:shadow-[0_0_20px_rgba(45,212,191,0.2)] outline-none transition-all appearance-none cursor-pointer">
                          <option>Computer Science (CSE)</option>
                          <option>AI & Data Science</option>
                          <option>Electronics (ECE)</option>
                          <option>Mechanical (ME)</option>
                          <option>Civil (CE)</option>
                          <option>Cybersecurity</option>
                          <option>VLSI</option>
                          <option>Other</option>
                        </select>
                        
                        <AnimatePresence>
                          {formData.branch === 'Other' && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0, marginTop: 0, rotateX: -90 }} 
                              animate={{ opacity: 1, height: 'auto', marginTop: 12, rotateX: 0 }} 
                              exit={{ opacity: 0, height: 0, marginTop: 0, rotateX: -90 }}
                              className="overflow-hidden origin-top"
                            >
                              <input 
                                type="text" 
                                name="custom_branch" 
                                required 
                                value={formData.custom_branch} 
                                onChange={handleChange} 
                                placeholder="Specify your branch..." 
                                className="w-full bg-[#05070a] border border-[#e0231c]/40 rounded-xl px-4 py-3 text-sm text-white focus:border-[#e0231c] focus:shadow-[0_0_20px_rgba(224,35,28,0.2)] outline-none transition-all" 
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02, z: 10 }}>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-[#78837c] mb-2 block">Year of Study <span className="text-[#e0231c]">*</span></label>
                        <select name="year_of_study" required value={formData.year_of_study} onChange={handleChange} className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] focus:shadow-[0_0_20px_rgba(45,212,191,0.2)] outline-none transition-all appearance-none cursor-pointer">
                          <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                        </select>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02, z: 10 }}>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-[#78837c] mb-2 block">GitHub / Portfolio</label>
                        <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} placeholder="https://github.com/..." className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] focus:shadow-[0_0_20px_rgba(45,212,191,0.2)] outline-none transition-all" />
                      </motion.div>
                    </div>
                    <div className="flex justify-end pt-6">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={nextStep} className="px-10 py-4 bg-[#dfe7e0] text-black font-bold uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(223,231,224,0.4)] transition-all flex items-center gap-2">Next Phase <ArrowRight className="w-5 h-5" /></motion.button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: COMMITMENT */}
                {step === 2 && (
                  <motion.div key="step2" custom={step} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6" style={{ transform: "translateZ(20px)" }}>
                    <div className="flex items-center gap-3 mb-6 border-b border-[#dfe7e0]/10 pb-4">
                      <Clock className="w-6 h-6 text-[#e0231c]" />
                      <h2 className="text-xl font-medium text-white tracking-wide">Commitment Protocol</h2>
                    </div>
                    
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-widest text-[#78837c] mb-3 block">Desired Deployment Wing <span className="text-[#e0231c]">*</span></label>
                      <div className="grid grid-cols-3 gap-4">
                        {['Software Wing', 'Hardware Wing', 'Operations'].map(wing => (
                          <motion.button 
                            whileHover={{ scale: 1.05, z: 20 }}
                            whileTap={{ scale: 0.95 }}
                            key={wing} 
                            type="button" 
                            onClick={() => setFormData({...formData, desired_wing: wing})} 
                            className={`p-5 rounded-2xl border text-sm font-bold tracking-wider uppercase transition-all ${formData.desired_wing === wing ? 'bg-[#e0231c]/20 border-[#e0231c] text-white shadow-[0_0_30px_rgba(224,35,28,0.4)]' : 'bg-[#05070a] border-[#dfe7e0]/15 text-[#78837c] hover:border-[#dfe7e0]/30'}`}
                          >
                            {wing}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <motion.div whileHover={{ scale: 1.02, z: 10 }}>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-[#78837c] mb-2 block">Weekly Time Commitment <span className="text-[#e0231c]">*</span></label>
                        <select name="commitment_hours" required value={formData.commitment_hours} onChange={handleChange} className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] focus:shadow-[0_0_20px_rgba(45,212,191,0.2)] outline-none transition-all appearance-none cursor-pointer">
                          <option>5-10 hours</option><option>10-15 hours</option><option>15-20 hours</option><option>20+ hours</option>
                        </select>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02, z: 10 }}>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-[#78837c] mb-2 block">Other Competing Priorities <span className="text-[#e0231c]">*</span></label>
                        <input type="text" name="other_commitments" required value={formData.other_commitments} onChange={handleChange} placeholder="e.g., Placements, other clubs" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] focus:shadow-[0_0_20px_rgba(45,212,191,0.2)] outline-none transition-all" />
                      </motion.div>
                    </div>

                    <div className="flex justify-between pt-8">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={prevStep} className="px-6 py-4 border border-[#dfe7e0]/20 text-[#dfe7e0] font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> Back</motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={nextStep} className="px-10 py-4 bg-[#dfe7e0] text-black font-bold uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(223,231,224,0.4)] transition-all flex items-center gap-2">Next Phase <ArrowRight className="w-5 h-5" /></motion.button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: TALENT */}
                {step === 3 && (
                  <motion.div key="step3" custom={step} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6" style={{ transform: "translateZ(20px)" }}>
                    <div className="flex items-center gap-3 mb-6 border-b border-[#dfe7e0]/10 pb-4">
                      <Zap className="w-6 h-6 text-[#2dd4bf]" />
                      <h2 className="text-xl font-medium text-white tracking-wide">The Edge</h2>
                    </div>

                    <div className="space-y-6">
                      <motion.div whileHover={{ scale: 1.01, z: 10 }}>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-[#78837c] mb-2 block">Describe the hardest technical problem you've solved. <span className="text-[#e0231c]">*</span></label>
                        <textarea name="hardest_problem" required value={formData.hardest_problem} onChange={handleChange} placeholder="Show us how you think. What broke, how did you fix it?" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-4 text-sm text-white focus:border-[#2dd4bf] focus:shadow-[0_0_20px_rgba(45,212,191,0.2)] outline-none transition-all min-h-[120px] resize-none" />
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.01, z: 10 }}>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-[#78837c] mb-2 block">Why do you want to join Code Kootu specifically? <span className="text-[#e0231c]">*</span></label>
                        <textarea name="why_kootu" required value={formData.why_kootu} onChange={handleChange} placeholder="What does 'We build what we wish existed' mean to you?" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-4 text-sm text-white focus:border-[#e0231c] focus:shadow-[0_0_20px_rgba(224,35,28,0.2)] outline-none transition-all min-h-[120px] resize-none" />
                      </motion.div>
                    </div>

                    <div className="flex justify-between pt-8">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={prevStep} className="px-6 py-4 border border-[#dfe7e0]/20 text-[#dfe7e0] font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> Back</motion.button>
                      <motion.button whileHover={{ scale: 1.05, boxShadow: "0_0_50px_rgba(224,35,28,0.6)" }} whileTap={{ scale: 0.95 }} type="submit" disabled={loading} className="px-10 py-4 bg-gradient-to-r from-[#e0231c] to-[#ff5a3c] text-white font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-[0_0_30px_rgba(224,35,28,0.3)]">
                        {loading ? 'Transmitting...' : <><Sparkles className="w-5 h-5" /> Submit Application</>}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
