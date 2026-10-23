'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  ShieldAlert, CheckCircle2, XCircle, FileText, Package, 
  Users, ArrowLeft, Check, User, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FinalDeterminationPanel() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'ideas' | 'restock' | 'members'>('ideas');
  
  // Data States
  const [ideas, setIdeas] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  
  // Loading & Action States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Wing options for the dropdown
  const wings = ['Software Wing', 'Hardware Wing', 'Operations Wing'];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'ideas') {
      const { data } = await supabase
        .from('ideas')
        .select('*')
        .eq('status', 'Received') 
        .order('created_at', { ascending: false });
      
      if (data) setIdeas(data);
      setLoading(false);
    } 
    else if (activeTab === 'members') {
      const { data } = await supabase
        .from('applications')
        .select(`
          *,
          application_reviews (*)
        `)
        .eq('is_published', false) // Only fetch those not yet published
        .order('created_at', { ascending: false });
        
      if (data) setApplications(data);
      setLoading(false);
    } 
    else {
      setLoading(false);
    }
  };

  // --- IDEA APPROVAL ACTIONS ---
  const handleIdeaAction = async (ideaId: string, action: 'Approved' | 'Rejected', assignedWing: string) => {
    setActionLoading(ideaId);
    
    const { error } = await supabase
      .from('ideas')
      .update({
        status: action,
        assigned_wing: action === 'Approved' ? assignedWing : null
      })
      .eq('id', ideaId);

    if (error) {
      alert(error.message);
    } else {
      fetchData(); 
    }
    setActionLoading(null);
  };

  // --- FINAL MEMBER VERDICT ACTIONS ---
  const handleFinalVerdict = async (app: any, decision: 'Accepted' | 'Rejected', stats: any) => {
    setActionLoading(app.id);
    
    const { error } = await supabase
      .from('applications')
      .update({
        is_published: true,
        final_decision: decision,
        avg_rating: stats.avgRating,
        endorse_percent: stats.endorsePercent,
        status: decision // Instantly updates user portal
      })
      .eq('id', app.id);

    if (error) {
      alert(error.message);
    } else {
      fetchData(); // Refresh list (the app will disappear from this pending list)
    }
    setActionLoading(null);
  };


  return (
    <div className="min-h-screen bg-[#05070a] text-[#dfe7e0] flex flex-col font-sans">
      
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
      <div className="flex border-b border-[#dfe7e0]/10 px-6 bg-[#0a0e12] overflow-x-auto">
        <button 
          onClick={() => setActiveTab('ideas')}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'ideas' ? 'border-[#e0231c] text-white' : 'border-transparent text-[#78837c] hover:text-white'}`}
        >
          <FileText className="w-4 h-4" /> Idea Approvals ({ideas.length})
        </button>
        
        {/* NEW TAB: FINAL MEMBER VERDICTS */}
        <button 
          onClick={() => setActiveTab('members')}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'members' ? 'border-[#2dd4bf] text-[#2dd4bf]' : 'border-transparent text-[#78837c] hover:text-white'}`}
        >
          <Trophy className="w-4 h-4" /> Final Member Verdicts
        </button>

        <button 
          onClick={() => setActiveTab('restock')}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'restock' ? 'border-[#e0231c] text-white' : 'border-transparent text-[#78837c] hover:text-white'}`}
        >
          <Package className="w-4 h-4" /> Restock Requests
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#05070a]">
        <AnimatePresence mode="wait">
          
          {/* ================= IDEA APPROVALS TAB ================= */}
          {activeTab === 'ideas' && (
            <motion.div key="ideas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-6">
              {loading ? (
                <div className="text-center py-20 text-[#2dd4bf] font-mono animate-pulse">Loading Ideas...</div>
              ) : ideas.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-[#dfe7e0]/10 rounded-2xl text-[#78837c]">No pending ideas to review.</div>
              ) : (
                ideas.map(idea => (
                  <div key={idea.id} className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-2xl p-6">
                    <div className="mb-4">
                      <p className="text-[10px] text-[#e0231c] font-mono uppercase tracking-widest mb-2">Pending Admin Action • Target: {idea.target_wing || 'Unassigned'}</p>
                      <h2 className="text-2xl font-medium text-white mb-2">{idea.title}</h2>
                      <p className="text-sm text-[#78837c] leading-relaxed">{idea.description}</p>
                    </div>

                    <div className="bg-[#05070a] border border-[#dfe7e0]/5 rounded-xl p-4 mb-6">
                      <h3 className="text-[10px] text-[#78837c] uppercase font-mono tracking-widest mb-3 flex items-center gap-2">
                        <Users className="w-3 h-3" /> Committee Votes & Endorsements
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-[#2dd4bf] bg-[#2dd4bf]/10 px-3 py-2 rounded-lg w-fit border border-[#2dd4bf]/20">
                          <CheckCircle2 className="w-3 h-3" /> Accepted by Austin M J
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <select 
                        id={`wing-${idea.id}`}
                        defaultValue={idea.target_wing || 'Software Wing'}
                        className="w-full md:w-48 bg-[#05070a] border border-[#dfe7e0]/15 text-sm rounded-xl px-4 py-3 text-white outline-none focus:border-[#2dd4bf] appearance-none"
                      >
                        {wings.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                      
                      <button 
                        onClick={() => {
                          const select = document.getElementById(`wing-${idea.id}`) as HTMLSelectElement;
                          handleIdeaAction(idea.id, 'Approved', select.value);
                        }}
                        disabled={actionLoading === idea.id}
                        className="flex-1 w-full py-3 bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 text-[#2dd4bf] font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-[#2dd4bf]/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve & Allocate
                      </button>
                      
                      <button 
                        onClick={() => handleIdeaAction(idea.id, 'Rejected', '')}
                        disabled={actionLoading === idea.id}
                        className="w-full md:w-32 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* ================= FINAL MEMBER VERDICTS TAB ================= */}
          {activeTab === 'members' && (
            <motion.div key="members" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-6">
              {loading ? (
                <div className="text-center py-20 text-[#2dd4bf] font-mono animate-pulse">Loading Applications...</div>
              ) : applications.filter(app => (app.application_reviews?.length || 0) >= 14).length === 0 ? (
                <div className="text-center py-20 border border-dashed border-[#dfe7e0]/10 rounded-2xl text-[#78837c] flex flex-col items-center">
                  <Users className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-lg">No candidates are ready for final review.</p>
                  <p className="text-sm mt-2">Waiting for all 14 team members to cast their votes.</p>
                </div>
              ) : (
                applications
                  .filter(app => (app.application_reviews?.length || 0) >= 14) // ONLY SHOW IF 14+ VOTES
                  .map(app => {
                    const reviews = app.application_reviews || [];
                    const totalReviews = reviews.length;
                    
                    const endorsements = reviews.filter((r: any) => r.vote === 'Endorse').length;
                    const endorsePercent = totalReviews > 0 ? Math.round((endorsements / totalReviews) * 100) : 0;
                    const totalRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
                    const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

                    const stats = { endorsePercent, avgRating };

                    return (
                      <div key={app.id} className="bg-[#0a0e12] border border-[#2dd4bf]/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(45,212,191,0.05)]">
                        
                        <div className="flex justify-between items-start mb-6 border-b border-[#dfe7e0]/10 pb-4">
                          <div>
                            <h2 className="text-2xl font-medium text-white">{app.full_name}</h2>
                            <p className="text-sm text-[#78837c] font-mono mt-1">{app.desired_wing} • {app.branch} ({app.year_of_study})</p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2dd4bf]/20 text-[#2dd4bf] animate-pulse">
                            14+ Votes Reached
                          </span>
                        </div>

                        {/* Final Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="bg-[#05070a] p-5 rounded-xl border border-[#dfe7e0]/5 text-center">
                            <p className="text-[10px] text-[#78837c] uppercase font-mono mb-2">Average Rating</p>
                            <p className="text-4xl font-black text-[#e0231c]">{avgRating}<span className="text-lg text-[#78837c]">/100</span></p>
                          </div>
                          <div className="bg-[#05070a] p-5 rounded-xl border border-[#dfe7e0]/5 text-center">
                            <p className="text-[10px] text-[#78837c] uppercase font-mono mb-2">Endorsement Rate</p>
                            <p className="text-4xl font-black text-[#2dd4bf]">{endorsePercent}%</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                          <button 
                            onClick={() => handleFinalVerdict(app, 'Accepted', stats)}
                            disabled={actionLoading === app.id}
                            className="flex-1 py-4 bg-[#2dd4bf] text-black border border-[#2dd4bf] font-bold uppercase tracking-wider text-sm rounded-xl hover:bg-[#20b8a6] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                          >
                            {actionLoading === app.id ? 'Publishing...' : <><CheckCircle2 className="w-5 h-5"/> Accept & Publish</>}
                          </button>
                          <button 
                            onClick={() => handleFinalVerdict(app, 'Rejected', stats)}
                            disabled={actionLoading === app.id}
                            className="flex-1 py-4 bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase tracking-wider text-sm rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {actionLoading === app.id ? 'Publishing...' : <><XCircle className="w-5 h-5"/> Reject & Publish</>}
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </motion.div>
          )}

          {/* ================= RESTOCK REQUESTS TAB ================= */}
          {activeTab === 'restock' && (
            <motion.div key="restock" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto">
               <div className="text-center py-20 border border-dashed border-[#dfe7e0]/10 rounded-2xl text-[#78837c]">
                 Restock Requests module is under construction.
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
