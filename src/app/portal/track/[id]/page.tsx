'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, Circle } from 'lucide-react';

const STEPS = ['Received', 'In Review', 'Approved', 'Building', 'Deployed'];

export default function TrackIdea() {
  const supabase = createClient();
  const params = useParams();
  const id = params?.id as string;
  
  const [idea, setIdea] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const { data: ideaData } = await supabase.from('ideas').select('*').eq('id', id).single();
      if (ideaData) setIdea(ideaData);

      const { data: updatesData } = await supabase.from('idea_updates').select('*').eq('idea_id', id).order('created_at', { ascending: false });
      if (updatesData) setUpdates(updatesData);
      
      setLoading(false);
    }
    fetchData();
  }, [supabase, id]);

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e0231c]"></div></div>;
  if (!idea) return <div className="min-h-[50vh] flex items-center justify-center text-[#78837c]">Idea not found.</div>;

  const currentStepIndex = STEPS.indexOf(idea.status);

  return (
    <div className="max-w-4xl mx-auto p-8 md:p-12 animate-in fade-in duration-700">
      
      <Link href="/portal/dashboard" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#78837c] hover:text-white transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Portal
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-light mb-2 text-white">{idea.title}</h1>
        <p className="text-[#78837c]">Submitted on {new Date(idea.created_at).toLocaleDateString()}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Timeline */}
        <div className="bg-[#0a0e12]/80 backdrop-blur-xl border border-[#dfe7e0]/10 p-8 rounded-3xl shadow-xl h-fit">
          <h2 className="text-xl font-medium mb-8 flex items-center gap-2">Current Status: <span className="text-[#e0231c]">{idea.status}</span></h2>
          
          <div className="relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-[#dfe7e0]/10" />
            {STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step} className="relative flex items-center gap-6 mb-8 last:mb-0 group">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-[#e0231c] border-[#e0231c] shadow-[0_0_15px_rgba(224,35,28,0.5)]' : 'bg-[#05070a] border-[#dfe7e0]/20 group-hover:border-[#e0231c]/50'}`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4 text-white" /> : <Circle className="w-4 h-4 text-[#78837c]" />}
                  </div>
                  <div>
                    <div className={`text-sm font-medium transition-colors ${isCurrent ? 'text-white' : isCompleted ? 'text-[#dfe7e0]' : 'text-[#78837c]'}`}>{step}</div>
                    {isCurrent && <div className="text-xs text-[#e0231c] mt-1 font-medium animate-pulse">We are here</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Updates & Details */}
        <div className="space-y-8">
          
          <div className="bg-[#0a0e12]/80 backdrop-blur-xl border border-[#dfe7e0]/10 p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-[#e0231c]" /> Updates from the Team</h2>
            {updates.length === 0 ? (
              <p className="text-sm text-[#78837c] italic bg-[#05070a]/50 p-6 rounded-xl border border-[#dfe7e0]/5">No updates posted yet. We will keep you posted.</p>
            ) : (
              <div className="space-y-4">
                {updates.map(update => (
                  <div key={update.id} className="relative bg-[#05070a]/50 border border-[#dfe7e0]/10 p-5 rounded-xl hover:border-[#e0231c]/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white text-sm">{update.title}</h3>
                      <span className="text-[10px] text-[#78837c] uppercase">{new Date(update.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-[#aab4ad] leading-relaxed">{update.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-[#0a0e12]/80 backdrop-blur-xl border border-[#dfe7e0]/10 p-8 rounded-3xl shadow-xl">
             <h3 className="text-xs uppercase tracking-widest text-[#78837c] mb-4">Original Submission</h3>
             <p className="text-sm text-[#dfe7e0] leading-relaxed">{idea.description}</p>
          </div>

        </div>
      </div>

    </div>
  );
}
