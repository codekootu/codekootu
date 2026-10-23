'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, CheckCircle2, XCircle, BarChart3, Database, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeterminationPanel() {
  const supabase = createClient();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data } = await supabase
      .from('applications')
      .select(`
        *,
        application_reviews (*)
      `)
      .order('created_at', { ascending: false });
      
    if (data) setApplications(data);
    setLoading(false);
  };

  const handlePublish = async (app: any, decision: 'Accepted' | 'Rejected', stats: any) => {
    setPublishing(app.id);
    
    const { error } = await supabase
      .from('applications')
      .update({
        is_published: true,
        final_decision: decision,
        avg_rating: stats.avgRating,
        endorse_percent: stats.endorsePercent,
        status: decision // Updates the main status tracker too
      })
      .eq('id', app.id);

    if (error) {
      alert(error.message);
    } else {
      fetchApplications();
    }
    setPublishing(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center text-[#2dd4bf] font-mono tracking-widest uppercase">
        <div className="w-8 h-8 border-2 border-[#2dd4bf]/20 border-t-[#2dd4bf] rounded-full animate-spin mr-3" />
        Loading determinations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-[#dfe7e0] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="border-b border-[#dfe7e0]/10 pb-6">
          <h1 className="text-3xl font-light flex items-center gap-3">
            <ShieldCheck className="text-[#e0231c] w-8 h-8" /> Final Determination Panel
          </h1>
          <p className="text-[#78837c] mt-2 font-mono text-sm">PUBLISH FINAL VERDICTS TO PUBLIC RESULTS BOARD</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {applications.map((app) => {
            const reviews = app.application_reviews || [];
            const totalReviews = reviews.length;
            const votesNeeded = 14; // Require 14 members to vote before Admin can publish
            const isReady = totalReviews >= votesNeeded;
            const isPublished = app.is_published;

            // Calculate Stats
            const endorsements = reviews.filter((r: any) => r.vote === 'Endorse').length;
            const endorsePercent = totalReviews > 0 ? Math.round((endorsements / totalReviews) * 100) : 0;
            const totalRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
            const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

            const stats = { endorsePercent, avgRating };

            return (
              <div key={app.id} className={`bg-[#0a0e12] border rounded-2xl p-6 transition-all ${isPublished ? 'border-[#2dd4bf]/40 opacity-70' : 'border-[#dfe7e0]/10'}`}>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-medium text-white">{app.full_name}</h2>
                    <p className="text-sm text-[#78837c]">{app.desired_wing} • {app.branch}</p>
                  </div>
                  {isPublished ? (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${app.final_decision === 'Accepted' ? 'bg-[#2dd4bf]/20 text-[#2dd4bf]' : 'bg-red-500/20 text-red-400'}`}>
                      {app.final_decision}
                    </span>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isReady ? 'bg-[#e0231c]/20 text-[#e0231c] animate-pulse' : 'bg-white/5 text-[#78837c]'}`}>
                      {isReady ? 'Ready for Final Review' : `${totalReviews} / ${votesNeeded} Votes`}
                    </span>
                  )}
                </div>

                {/* Stats Block */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#05070a] p-3 rounded-lg border border-[#dfe7e0]/5 text-center">
                    <p className="text-[10px] text-[#78837c] uppercase font-mono mb-1">Reviews</p>
                    <p className="text-lg font-bold text-white">{totalReviews}</p>
                  </div>
                  <div className="bg-[#05070a] p-3 rounded-lg border border-[#dfe7e0]/5 text-center">
                    <p className="text-[10px] text-[#78837c] uppercase font-mono mb-1">Avg Rating</p>
                    <p className="text-lg font-bold text-[#e0231c]">{avgRating} <span className="text-sm text-[#78837c]">/ 5</span></p>
                  </div>
                  <div className="bg-[#05070a] p-3 rounded-lg border border-[#dfe7e0]/5 text-center">
                    <p className="text-[10px] text-[#78837c] uppercase font-mono mb-1">Received %</p>
                    <p className="text-lg font-bold text-[#2dd4bf]">{endorsePercent}%</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isPublished && (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handlePublish(app, 'Accepted', stats)}
                      disabled={!isReady || publishing === app.id}
                      className="flex-1 py-3 bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 text-[#2dd4bf] font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-[#2dd4bf]/20 transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
                    >
                      {publishing === app.id ? 'Publishing...' : <><CheckCircle2 className="w-4 h-4"/> Accept</>}
                    </button>
                    <button 
                      onClick={() => handlePublish(app, 'Rejected', stats)}
                      disabled={!isReady || publishing === app.id}
                      className="flex-1 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
                    >
                      {publishing === app.id ? 'Publishing...' : <><XCircle className="w-4 h-4"/> Reject</>}
                    </button>
                  </div>
                )}

                {isPublished && (
                   <div className="text-center py-2 text-xs font-mono text-[#78837c] flex items-center justify-center gap-2">
                     <Rocket className="w-4 h-4 text-[#2dd4bf]" /> Published to Public Results Board
                   </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
