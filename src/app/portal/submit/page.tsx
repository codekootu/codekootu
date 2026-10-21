'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SubmitIdea() {
  const supabase = createClient();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [archetype, setArchetype] = useState('Hybrid');
  const [urgency, setUrgency] = useState('Normal');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/login'); return; }

    const { error } = await supabase.from('ideas').insert({
      user_id: session.user.id,
      title, description, category, archetype, urgency, status: 'Received'
    });

    if (!error) {
      setSuccess(true);
      setTimeout(() => router.push('/portal/dashboard'), 2000);
    } else {
      alert("Error submitting idea: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 md:p-12 animate-in slide-in-from-bottom-8 duration-700 fade-in">
      
      <Link href="/portal/dashboard" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#78837c] hover:text-white transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Portal
      </Link>

      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-light mb-4 flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-[#e0231c]" /> Submit a Problem
        </h1>
        <p className="text-[#78837c] text-lg">Tell us what needs to be built. We read every submission.</p>
      </div>

      <form onSubmit={handleSubmit} className="relative bg-[#0a0e12]/80 backdrop-blur-xl border border-[#dfe7e0]/10 p-8 md:p-10 rounded-3xl space-y-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e0231c]/10 rounded-full blur-[80px] pointer-events-none" />

        {success ? (
          <div className="text-center py-20 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6 animate-bounce" />
            <h2 className="text-3xl font-medium text-white mb-2">Submission Received!</h2>
            <p className="text-[#78837c]">Redirecting you to your dashboard...</p>
          </div>
        ) : (
          <>
            <div className="group relative z-10">
              <label className="text-xs uppercase tracking-widest text-[#78837c] mb-2 block group-focus-within:text-[#e0231c] transition-colors">Problem Title</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Smart Water Meter" className="w-full bg-[#05070a]/50 border border-[#dfe7e0]/10 rounded-xl px-5 py-4 text-white outline-none focus:border-[#e0231c] focus:bg-[#05070a] transition-all" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="group">
                <label className="text-xs uppercase tracking-widest text-[#78837c] mb-2 block group-focus-within:text-[#e0231c] transition-colors">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#05070a]/50 border border-[#dfe7e0]/10 rounded-xl px-5 py-4 text-white outline-none focus:border-[#e0231c] focus:bg-[#05070a] transition-all appearance-none">
                  <option>Infrastructure</option><option>Healthcare</option><option>Education</option><option>Environment</option><option>Community</option><option>Other</option>
                </select>
              </div>
              <div className="group">
                <label className="text-xs uppercase tracking-widest text-[#78837c] mb-2 block group-focus-within:text-[#e0231c] transition-colors">Archetype</label>
                <select value={archetype} onChange={e => setArchetype(e.target.value)} className="w-full bg-[#05070a]/50 border border-[#dfe7e0]/10 rounded-xl px-5 py-4 text-white outline-none focus:border-[#e0231c] focus:bg-[#05070a] transition-all appearance-none">
                  <option>Software</option><option>Hardware</option><option>Hybrid</option>
                </select>
              </div>
            </div>

            <div className="group relative z-10">
              <label className="text-xs uppercase tracking-widest text-[#78837c] mb-2 block group-focus-within:text-[#e0231c] transition-colors">Urgency</label>
              <select value={urgency} onChange={e => setUrgency(e.target.value)} className="w-full bg-[#05070a]/50 border border-[#dfe7e0]/10 rounded-xl px-5 py-4 text-white outline-none focus:border-[#e0231c] focus:bg-[#05070a] transition-all appearance-none">
                <option>Low</option><option>Normal</option><option>High</option><option>Critical</option>
              </select>
            </div>

            <div className="group relative z-10">
              <label className="text-xs uppercase tracking-widest text-[#78837c] mb-2 block group-focus-within:text-[#e0231c] transition-colors">Problem Description</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the problem in detail. What is currently broken? Who is affected?" className="w-full h-48 bg-[#05070a]/50 border border-[#dfe7e0]/10 rounded-xl px-5 py-4 text-white outline-none focus:border-[#e0231c] focus:bg-[#05070a] resize-none transition-all" />
            </div>

            <button type="submit" disabled={loading} className="relative z-10 w-full py-5 bg-gradient-to-r from-[#e0231c] to-[#ff5a3c] text-white font-medium rounded-xl hover:shadow-[0_0_30px_rgba(224,35,28,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-lg uppercase tracking-wider">
              {loading ? 'Submitting...' : <><Send className="w-5 h-5" /> Submit to Committee</>}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
