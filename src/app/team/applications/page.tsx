'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShieldAlert, Check, X, MessageSquare, User, ExternalLink, SlidersHorizontal, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeamReviewPage() {
  const supabase = createClient();
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  // Review state
  const [vote, setVote] = useState<'Endorse' | 'Reject' | null>(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(50);
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  
  // UI State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(p);
      }
      
      const { data } = await supabase
        .from('applications')
        .select(`
          *,
          application_reviews (*)
        `)
        .order('created_at', { ascending: false });
        
      if (data) setApplications(data);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const selectedApp = applications.find(a => a.id === selectedAppId);
  const reviews = selectedApp?.application_reviews || [];

  useEffect(() => {
    if (selectedApp && profile) {
      const myReview = reviews.find((r: any) => r.reviewer_id === profile.id);
      if (myReview) {
        setVote(myReview.vote);
        setComment(myReview.comment || '');
        setRating(myReview.rating || 50);
        setHasReviewed(true);
      } else {
        setVote(null);
        setComment('');
        setRating(50);
        setHasReviewed(false);
      }
      setIsFormOpen(false);
      setExpandedReviewId(null);
    }
  }, [selectedAppId, profile, selectedApp?.application_reviews]);

  const handleReviewSubmit = async () => {
    if (!vote || comment.length < 5) {
      return alert("Please select a vote and leave a comment (min 5 chars).");
    }
    if (rating < 1 || rating > 100) {
      return alert("Rating must be between 1 and 100.");
    }
    
    setSubmitting(true);

    const { error } = await supabase.from('application_reviews').upsert({
      application_id: selectedApp.id,
      reviewer_id: profile.id,
      reviewer_name: profile.full_name,
      vote: vote,
      comment: comment,
      rating: rating
    }, { 
      onConflict: 'application_id,reviewer_id' 
    });

    if (!error) {
      const { data } = await supabase
        .from('applications')
        .select(`*, application_reviews (*)`)
        .order('created_at', { ascending: false });
      if (data) setApplications(data);
      
      setHasReviewed(true);
      setIsFormOpen(false);
    } else {
      alert(error.message);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-white p-10 font-mono flex items-center justify-center h-screen"><div className="w-6 h-6 border-2 border-[#2dd4bf]/20 border-t-[#2dd4bf] rounded-full animate-spin mr-3" /> Loading Pipeline...</div>;

  return (
    <div className="flex h-screen bg-[#05070a] text-[#dfe7e0] overflow-hidden">
      
      {/* Sidebar List of Applicants */}
      <div className="w-80 border-r border-[#dfe7e0]/10 flex flex-col bg-[#0a0e12]">
        <div className="p-6 border-b border-[#dfe7e0]/10">
          <h1 className="text-lg font-bold flex items-center gap-2"><ShieldAlert className="text-[#e0231c] w-5 h-5" /> Pipeline</h1>
          <p className="text-[10px] text-[#78837c] mt-1 font-mono uppercase tracking-widest">{applications.length} Applicants</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {applications.map(app => {
            const myReview = app.application_reviews?.find((r: any) => r.reviewer_id === profile?.id);
            const isSelected = selectedAppId === app.id;

            return (
              <button 
                key={app.id} 
                onClick={() => setSelectedAppId(app.id)}
                className={`w-full text-left p-4 border-b border-[#dfe7e0]/5 transition-colors flex justify-between items-center group ${isSelected ? 'bg-[#dfe7e0]/10 border-l-2 border-l-[#2dd4bf]' : 'border-l-2 border-l-transparent hover:bg-[#dfe7e0]/5'}`}
              >
                {/* Fallback to Email if Name is missing */}
                <span className={`font-medium truncate pr-2 ${isSelected ? 'text-white' : 'text-[#aab4ad] group-hover:text-white'}`}>
                  {app.full_name || app.email || 'Unnamed Candidate'}
                </span>
                
                {myReview ? (
                  <span className="text-[9px] px-2 py-1 shrink-0 rounded bg-[#2dd4bf]/10 text-[#2dd4bf] font-mono border border-[#2dd4bf]/20">VOTED</span>
                ) : (
                  <span className="text-[9px] px-2 py-1 shrink-0 rounded bg-[#e0231c]/10 text-[#e0231c] font-mono border border-[#e0231c]/20 animate-pulse">VOTE NOW</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Review Area */}
      <div className="flex-1 overflow-y-auto bg-[#05070a] p-8 md:p-12 relative">
        {!selectedApp ? (
          <div className="h-full flex flex-col items-center justify-center text-[#78837c] opacity-50">
            <User className="w-20 h-20 mb-6" />
            <p className="font-mono text-sm uppercase tracking-widest">Select an applicant to view details</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 pb-20">
            
            {/* Header Info */}
            <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#e0231c]/10 blur-[100px] pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  {/* Fallback for Name */}
                  <h2 className="text-3xl font-light text-white mb-2">{selectedApp.full_name || 'Unnamed Candidate'}</h2>
                  <div className="flex gap-4 text-xs text-[#78837c] font-mono">
                    <span>{selectedApp.email}</span>
                    <span>•</span>
                    {/* Fallback for Phone */}
                    <span>{selectedApp.phone || 'No phone provided'}</span>
                    {selectedApp.portfolio_url && (
                      <>
                        <span>•</span>
                        <a href={selectedApp.portfolio_url} target="_blank" className="text-[#2dd4bf] hover:underline flex items-center gap-1">Portfolio <ExternalLink className="w-3 h-3" /></a>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5">
                  <p className="text-[10px] uppercase text-[#78837c] font-mono mb-1">Wing</p>
                  <p className="font-medium text-sm">{selectedApp.desired_wing || 'Not Provided'}</p>
                </div>
                <div className="bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5">
                  <p className="text-[10px] uppercase text-[#78837c] font-mono mb-1">Branch</p>
                  <p className="font-medium text-sm">{selectedApp.branch || 'Not Provided'}</p>
                </div>
                <div className="bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5">
                  <p className="text-[10px] uppercase text-[#78837c] font-mono mb-1">Hours/Week</p>
                  <p className="font-medium text-sm text-[#2dd4bf]">{selectedApp.commitment_hours || 'Not Provided'}</p>
                </div>
                <div className="bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5">
                  <p className="text-[10px] uppercase text-[#78837c] font-mono mb-1">Other Commitments</p>
                  {/* Fallback for Commitments */}
                  <p className="font-medium text-xs">{selectedApp.other_commitments || 'None'}</p>
                </div>
              </div>
            </div>

            {/* Essay Responses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-2xl p-6">
                <h3 className="text-[11px] font-bold text-[#e0231c] uppercase tracking-widest mb-4">Hardest Technical Problem</h3>
                <p className="text-sm leading-relaxed text-[#aab4ad] whitespace-pre-wrap">{selectedApp.hardest_problem || 'Not Provided'}</p>
              </div>
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-2xl p-6">
                <h3 className="text-[11px] font-bold text-[#2dd4bf] uppercase tracking-widest mb-4">Why Code Kootu?</h3>
                <p className="text-sm leading-relaxed text-[#aab4ad] whitespace-pre-wrap">{selectedApp.why_kootu || 'Not Provided'}</p>
              </div>
            </div>

            {/* Board Reviews & Voting */}
            <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-2xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-white flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#78837c]"/> Board Reviews ({reviews.length}/14)</h3>
                
                {!isFormOpen && (
                  <button 
                    onClick={() => setIsFormOpen(true)}
                    className={`px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg ${hasReviewed ? 'bg-[#dfe7e0]/10 text-[#dfe7e0] hover:bg-[#dfe7e0]/20' : 'bg-[#e0231c] text-white hover:bg-[#c01d17] shadow-[0_0_20px_rgba(224,35,28,0.4)] animate-pulse'}`}
                  >
                    {hasReviewed ? <><Edit3 className="w-4 h-4"/> Update Vote</> : <><Check className="w-4 h-4"/> Vote Now</>}
                  </button>
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                {reviews.length === 0 ? (
                  <p className="text-sm text-[#78837c] italic py-4 text-center border border-dashed border-[#dfe7e0]/10 rounded-xl">No votes cast yet. Be the first.</p>
                ) : (
                  reviews.map((rev: any) => {
                    const isExpanded = expandedReviewId === rev.id;
                    const isMe = rev.reviewer_id === profile?.id;

                    return (
                      <div key={rev.id} className={`border rounded-xl overflow-hidden transition-colors ${isMe ? 'border-[#2dd4bf]/30 bg-[#2dd4bf]/5' : 'border-[#dfe7e0]/10 bg-[#05070a]'}`}>
                        <button 
                          onClick={() => setExpandedReviewId(isExpanded ? null : rev.id)}
                          className="w-full px-5 py-4 flex justify-between items-center hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`font-medium text-sm ${isMe ? 'text-[#2dd4bf]' : 'text-[#dfe7e0]'}`}>
                              {rev.reviewer_name || 'Team Member'} {isMe && '(You)'}
                            </span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${rev.vote === 'Endorse' ? 'bg-[#2dd4bf]/10 text-[#2dd4bf]' : 'bg-red-500/10 text-red-400'}`}>
                              {rev.vote}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-mono text-[#78837c]">Score: <strong className="text-white">{rev.rating || 0}</strong>/100</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-[#78837c]" /> : <ChevronDown className="w-4 h-4 text-[#78837c]" />}
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }} 
                              animate={{ height: 'auto', opacity: 1 }} 
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-4 pt-2 border-t border-[#dfe7e0]/5">
                                <p className="text-sm text-[#aab4ad] leading-relaxed italic">"{rev.comment || 'No comment provided.'}"</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Voting Form */}
              <AnimatePresence>
                {isFormOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#dfe7e0]/10 pt-6 mt-6">
                      
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-bold text-white uppercase tracking-wider">{hasReviewed ? 'Update Your Review' : 'Cast Your Vote'}</p>
                        <button onClick={() => setIsFormOpen(false)} className="text-[#78837c] hover:text-white"><X className="w-5 h-5"/></button>
                      </div>

                      <div className="mb-6 bg-[#05070a] p-5 rounded-xl border border-[#dfe7e0]/5">
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-sm font-medium flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-[#2dd4bf]"/> Candidate Score (1-100)</p>
                          <input 
                            type="number" 
                            min="1" 
                            max="100" 
                            value={rating} 
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="w-20 bg-[#0a0e12] border border-[#2dd4bf]/50 text-[#2dd4bf] text-center font-bold rounded-lg px-2 py-1 outline-none focus:border-[#2dd4bf]"
                          />
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="100" 
                          value={rating} 
                          onChange={(e) => setRating(Number(e.target.value))}
                          className="w-full accent-[#2dd4bf] h-2 bg-[#0a0e12] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="flex gap-4 mb-4">
                        <button onClick={() => setVote('Endorse')} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-all ${vote === 'Endorse' ? 'bg-[#2dd4bf] text-black border-[#2dd4bf]' : 'bg-transparent text-[#2dd4bf] border-[#2dd4bf]/30 hover:bg-[#2dd4bf]/10'}`}><Check className="w-4 h-4"/> Endorse</button>
                        <button onClick={() => setVote('Reject')} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-all ${vote === 'Reject' ? 'bg-[#e0231c] text-white border-[#e0231c]' : 'bg-transparent text-[#e0231c] border-[#e0231c]/30 hover:bg-[#e0231c]/10'}`}><X className="w-4 h-4"/> Reject</button>
                      </div>
                      <textarea 
                        value={comment} 
                        onChange={e => setComment(e.target.value)} 
                        placeholder="You must leave a comment justifying your decision..." 
                        className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded-xl px-4 py-3 text-sm text-white focus:border-[#dfe7e0] outline-none transition-colors min-h-[100px] resize-none mb-4" 
                      />
                      <button onClick={handleReviewSubmit} disabled={submitting || !vote || comment.length < 5} className="w-full py-4 bg-[#dfe7e0] text-black font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-colors disabled:opacity-50">
                        {submitting ? 'Submitting...' : hasReviewed ? 'Update Review' : 'Submit Review'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
