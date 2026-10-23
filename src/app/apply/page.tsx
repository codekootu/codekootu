'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Send, CheckCircle2, User, Mail, Phone, 
  BookOpen, Link as LinkIcon, Code2, Cpu, Rocket, Clock, Zap, ShieldAlert
} from 'lucide-react';

export default function ApplyPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', branch: 'Computer Science (CSE)',
    year_of_study: '1st Year', desired_wing: 'Software Wing', portfolio_url: '',
    commitment_hours: '10-15 hours', other_commitments: '',
    hardest_problem: '', why_kootu: ''
  });

  useEffect(() => {
    // Check if they are logged in (you can redirect to login if not)
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setFormData(prev => ({ ...prev, email: data.user.email || '' }));
      }
    });
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("You must be logged in to apply. Please login first.");
      return;
    }
    
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.from('applications').insert({
      ...formData,
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
    enter: (direction: number) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0, rotateY: direction > 0 ? 45 : -45 }),
    center: { zIndex: 1, x: 0, opacity: 1, rotateY: 0 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0, rotateY: direction < 0 ? 45 : -45 })
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden perspective-[1500px]">
      
      {/* Background Aura */}
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[#e0231c]/20 rounded-full blur-[150px] pointer-events-none" />
      <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[#2dd4bf]/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">
        {success ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0a0e12]/90 backdrop-blur-3xl border border-[#2dd4bf]/30 rounded-3xl p-12 text-center shadow-[0_0_50px_rgba(45,212,191,0.2)]">
            <CheckCircle2 className="w-24 h-24 text-[#2dd4bf] mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-black text-white mb-4">APPLICATION SECURED</h2>
            <p className="text-[#78837c] text-lg mb-8">Your profile is now under review by the Executive Board. You can track your status on your dashboard.</p>
            <Link href="/apply/status" className="px-8 py-4 bg-[#dfe7e0] text-black font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-transform inline-block">
              Track Application
            </Link>
          </motion.div>
        ) : (
          <div className="bg-[#0a0e12]/80 backdrop-blur-3xl border border-[#dfe7e0]/10 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative">
            
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#dfe7e0]/5">
              <motion.div className="h-full bg-gradient-to-r from-[#e0231c] to-[#2dd4bf]" initial={{ width: '0%' }} animate={{ width: `${(step / 3) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>

            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-white tracking-tight">JOIN THE COLLECTIVE</h1>
              <p className="text-[10px] font-mono text-[#78837c] uppercase tracking-[0.3em] mt-2">Step {step} of 3</p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait" custom={step}>
                
                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                  <motion.div key="step1" custom={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="space-y-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-[#dfe7e0]/10 pb-4">
                      <User className="w-6 h-6 text-[#2dd4bf]" />
                      <h2 className="text-xl font-medium text-white">Identity & Background</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block">Full Name</label>
                        <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="John Doe" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block">Email</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@gmail.com" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block">Phone</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block">Branch</label>
                        <select name="branch" value={formData.branch} onChange={handleChange} className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] outline-none transition-colors appearance-none">
                          <option>Computer Science (CSE)</option><option>AI & Data Science</option><option>Electronics (ECE)</option><option>Mechanical (ME)</option><option>Civil (CE)</option><option>Cybersecurity</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block">Year of Study</label>
                        <select name="year_of_study" value={formData.year_of_study} onChange={handleChange} className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] outline-none transition-colors appearance-none">
                          <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block">GitHub / Portfolio</label>
                        <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} placeholder="https://github.com/..." className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] outline-none transition-colors" />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button type="button" onClick={nextStep} className="px-8 py-3 bg-[#dfe7e0] text-black font-bold uppercase tracking-wider rounded-xl hover:bg-white transition-colors flex items-center gap-2">Next Step <ArrowRight className="w-4 h-4" /></button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: COMMITMENT */}
                {step === 2 && (
                  <motion.div key="step2" custom={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="space-y-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-[#dfe7e0]/10 pb-4">
                      <Clock className="w-6 h-6 text-[#e0231c]" />
                      <h2 className="text-xl font-medium text-white">Commitment & Wing</h2>
                    </div>
                    
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block">Desired Wing</label>
                      <div className="grid grid-cols-3 gap-4">
                        {['Software Wing', 'Hardware Wing', 'Operations'].map(wing => (
                          <button key={wing} type="button" onClick={() => setFormData({...formData, desired_wing: wing})} className={`p-4 rounded-xl border text-sm font-medium transition-all ${formData.desired_wing === wing ? 'bg-[#e0231c]/20 border-[#e0231c] text-white shadow-[0_0_20px_rgba(224,35,28,0.3)]' : 'bg-[#05070a] border-[#dfe7e0]/15 text-[#78837c] hover:border-[#dfe7e0]/30'}`}>
                            {wing}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block">Weekly Commitment (Hours)</label>
                        <select name="commitment_hours" value={formData.commitment_hours} onChange={handleChange} className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] outline-none transition-colors appearance-none">
                          <option>5-10 hours</option><option>10-15 hours</option><option>15-20 hours</option><option>20+ hours</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block">Other Major Commitments?</label>
                        <input type="text" name="other_commitments" required value={formData.other_commitments} onChange={handleChange} placeholder="e.g., Placements, other clubs" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] outline-none transition-colors" />
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button type="button" onClick={prevStep} className="px-6 py-3 border border-[#dfe7e0]/20 text-[#dfe7e0] font-bold uppercase tracking-wider rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</button>
                      <button type="button" onClick={nextStep} className="px-8 py-3 bg-[#dfe7e0] text-black font-bold uppercase tracking-wider rounded-xl hover:bg-white transition-colors flex items-center gap-2">Next Step <ArrowRight className="w-4 h-4" /></button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: TALENT */}
                {step === 3 && (
                  <motion.div key="step3" custom={step} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="space-y-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-[#dfe7e0]/10 pb-4">
                      <Zap className="w-6 h-6 text-[#2dd4bf]" />
                      <h2 className="text-xl font-medium text-white">The Edge</h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block">Describe the hardest technical problem you've solved.</label>
                        <textarea name="hardest_problem" required value={formData.hardest_problem} onChange={handleChange} placeholder="Show us how you think. What broke, how did you fix it?" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#2dd4bf] outline-none transition-colors min-h-[100px] resize-none" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider text-[#78837c] mb-2 block">Why do you want to join Code Kootu specifically?</label>
                        <textarea name="why_kootu" required value={formData.why_kootu} onChange={handleChange} placeholder="What does 'We build what we wish existed' mean to you?" className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#e0231c] outline-none transition-colors min-h-[100px] resize-none" />
                      </div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <button type="button" onClick={prevStep} className="px-6 py-3 border border-[#dfe7e0]/20 text-[#dfe7e0] font-bold uppercase tracking-wider rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</button>
                      <button type="submit" disabled={loading} className="px-8 py-3 bg-gradient-to-r from-[#e0231c] to-[#ff5a3c] text-white font-bold uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(224,35,28,0.5)] transition-all flex items-center gap-2 disabled:opacity-50">
                        {loading ? 'Transmitting...' : <><ShieldAlert className="w-4 h-4" /> Submit Application</>}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
