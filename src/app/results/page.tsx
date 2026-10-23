'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Trophy, Star, BarChart3, ShieldCheck } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function ResultsBoard() {
  const supabase = createClient();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      const { data } = await supabase
        .from('applications')
        .select('*')
        .eq('is_published', true)
        .order('avg_rating', { ascending: false }); // Highest rated first
        
      if (data) setResults(data);
      setLoading(false);
    }
    fetchResults();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#05070a] text-[#dfe7e0] relative overflow-hidden py-20 px-4">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-5xl mx-auto space-y-12">
        
        <div className="text-center space-y-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-[#e0231c]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#e0231c]/30 shadow-[0_0_40px_rgba(224,35,28,0.3)]">
            <Trophy className="w-10 h-10 text-[#e0231c]" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">Intake Results</h1>
          <p className="text-[#78837c] font-mono tracking-widest uppercase text-sm">Official Verdicts from the Executive Board</p>
        </div>

        {loading ? (
          <div className="text-center animate-pulse font-mono text-[#2dd4bf]">Fetching encrypted results...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#dfe7e0]/10 rounded-2xl">
            <p className="text-[#78837c]">No results have been published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((candidate, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                key={candidate.id} 
                className={`relative bg-[#0a0e12]/90 backdrop-blur-xl border rounded-3xl p-8 overflow-hidden ${candidate.final_decision === 'Accepted' ? 'border-[#2dd4bf]/40 shadow-[0_0_30px_rgba(45,212,191,0.1)]' : 'border-red-500/20'}`}
              >
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] ${candidate.final_decision === 'Accepted' ? 'bg-[#2dd4bf]/20' : 'bg-red-500/10'}`} />

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{candidate.full_name}</h2>
                    <p className="text-xs text-[#78837c] font-mono mt-1">{candidate.desired_wing} Wing</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${candidate.final_decision === 'Accepted' ? 'bg-[#2dd4bf] text-black shadow-[0_0_20px_rgba(45,212,191,0.4)]' : 'bg-red-500 text-white'}`}>
                    {candidate.final_decision}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10 mt-8">
                  <div className="bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5">
                    <p className="text-[10px] font-mono text-[#78837c] uppercase mb-1 flex items-center gap-1"><Star className="w-3 h-3 text-[#e0231c]"/> Avg Rating</p>
                    <p className="text-2xl font-black text-white">{candidate.avg_rating} <span className="text-sm text-[#78837c]">/ 5</span></p>
                  </div>
                  <div className="bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5">
                    <p className="text-[10px] font-mono text-[#78837c] uppercase mb-1 flex items-center gap-1"><BarChart3 className="w-3 h-3 text-[#2dd4bf]"/> Received</p>
                    <p className="text-2xl font-black text-white">{candidate.endorse_percent}%</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
