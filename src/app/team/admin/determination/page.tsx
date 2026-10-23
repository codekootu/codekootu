'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  ShieldAlert, CheckCircle2, XCircle, FileText, Package, Users, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FinalDeterminationPanel() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'ideas' | 'restock' | 'members'>('ideas');
  
  // State for Member Approvals
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchApplications = async () => {
    setLoadingApps(true);
    const { data } = await supabase
      .from('applications')
      .select(`
        *,
        application_reviews (*)
      `)
      .order('created_at', { ascending: false });
      
    if (data) setApplications(data);
    setLoadingApps(false);
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
        status: decision 
      })
      .eq('id', app.id);

    if (error) {
      alert(error.message);
    } else {
      fetchApplications();
    }
    setPublishing(null);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-[#dfe7e0] flex flex-col">
      
      {/* Header */}
      <div className="border-b border-[#dfe7e0]/10 p-6 bg-[#0a0e12]">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/team/admin" className="text-[#78837c] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-light flex items-center gap-3">
            <ShieldAlert className="text-[#e0231c] w-6 h-6" /> Final Determination Panel
          </h1>
        </div>
        <p className="text-[#78837c] text-xs font-mono ml-9">Review votes, allocate sprints, and approve inventory</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#dfe7e0]/10 px-6 bg-[#0a0e12]">
        <button 
          onClick={() => setActiveTab('ideas')}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ideas' ? 'border-[#e0231c] text-white' : 'border-transparent text-[#78837c] hover:text-white'}`}
        >
          <FileText className="w-4 h-4" /> Idea Approvals (6)
        </button>
        <button 
          onClick={() => setActiveTab('restock')}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'restock' ? 'border-[#e0231c] text-white' : 'border-transparent text-[#78837c] hover:text-white'}`}
        >
          <Package className="w-4 h-4" /> Restock Requests
        </button>
        <button 
          onClick={() => setActiveTab('members')}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'members' ? 'border-[#2dd4bf] text-[#2dd4bf]' : 'border-transparent text-[#78837c] hover:text-white'}`}
        >
          <Users className="w-4 h-4" /> Member Approvals
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* IDEA APPROVALS TAB (Original logic placeholder) */}
          {activeTab === 'ideas' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#78837c] p-10 text-center border border-dashed border-[#dfe7e0]/10 rounded-xl">
              <p>Your existing Idea Approvals list renders here.</p>
            </motion.div>
          )}

          {/* RESTOCK REQUESTS TAB (Original logic placeholder) */}
          {activeTab === 'restock' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#78837c] p-10 text-center border border-dashed border-[#dfe7e0]/10 rounded-xl">
              <p>Your existing Restock Requests list renders here.</p>
            </motion.div>
          )}

          {/* MEMBER APPROVALS TAB */}
          {activeTab === 'members' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
              
              {loadingApps ? (
                <div className="flex items-center justify-center py-20 text-[#2dd4bf] font-mono text-sm animate-pulse">
                  <div className="w-5 h-5 border-2 border-[#2dd4bf]/20 border-t-[#2dd4bf] rounded-full animate-spin mr-3" /> Loading member data...
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center p-10 border border-dashed border-[#dfe7e0]/10 rounded-xl text-[#78837c]">
                  No applications found in the pipeline.
                </div>
              ) : (
                applications.map((app) => {
                  const reviews = app.application_reviews || [];
                  const totalReviews = reviews.length;
                  const votesNeeded = 14; 
                  const isReady = totalReviews >= votesNeeded;
                  const isPublished = app.is_published;

                  // Calculate Stats
                  const endorsements = reviews.filter((r: any) => r.vote === 'Endorse').length;
                  const endorsePercent = totalReviews > 0 ? Math.round((endorsements / totalReviews) * 100) : 0;
                  const totalRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
                  const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

                  const stats = { endorsePercent, avgRating };

                  return (
                    <div key={app.id} className={`bg-[#0a0e12] border rounded-2xl p-6 transition-all ${isPublished ? 'border-[#2dd4bf]/30 opacity-80' : 'border-[#dfe7e0]/10'}`}>
                      
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-xl font-medium text-white">{app.full_name}</h2>
                          <p className="text-sm text-[#78837c] font-mono mt-1">{app.desired_wing} • {app.branch} ({app.year_of_study})</p>
                        </div>
                        {isPublished ? (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${app.final_decision === 'Accepted' ? 'bg-[#2dd4bf]/20 text-[#2dd4bf]' : 'bg-red-500/20 text-red-400'}`}>
                            {app.final_decision}
                          </span>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isReady ? 'bg-[#e0231c]/20 text-[#e0231c] animate-pulse' : 'bg-white/5 text-[#78837c]'}`}>
                            {isReady ? 'Ready for Final Review' : `${totalReviews} / ${votesNeeded} Votes Cast`}
                          </span>
                        )}
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5 text-center">
                          <p className="text-[10px] text-[#78837c] uppercase font-mono mb-1">Reviews</p>
                          <p className="text-xl font-bold text-white">{totalReviews}</p>
                        </div>
                        <div className="bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5 text-center">
                          <p className="text-[10px] text-[#78837c] uppercase font-mono mb-1">Avg Rating</p>
                          <p className="text-xl font-bold text-[#e0231c]">{avgRating} <span className="text-sm text-[#78837c]">/ 100</span></p>
                        </div>
                        <div className="bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5 text-center">
                          <p className="text-[10px] text-[#78837c] uppercase font-mono mb-1">Endorsement</p>
                          <p className="text-xl font-bold text-[#2dd4bf]">{endorsePercent}%</p>
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
                            {publishing === app.id ? 'Publishing...' : <><CheckCircle2 className="w-4 h-4"/> Accept Member</>}
                          </button>
                          <button 
                            onClick={() => handlePublish(app, 'Rejected', stats)}
                            disabled={!isReady || publishing === app.id}
                            className="flex-1 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
                          >
                            {publishing === app.id ? 'Publishing...' : <><XCircle className="w-4 h-4"/> Reject Member</>}
                          </button>
                        </div>
                      )}
                      
                      {isPublished && (
                         <div className="text-center py-2 text-xs font-mono text-[#78837c] flex items-center justify-center gap-2 border-t border-[#dfe7e0]/5 pt-4">
                           Results published to public board.
                         </div>
                      )}
                    </div>
                  );
                })
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
