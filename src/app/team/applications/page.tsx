'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShieldAlert, Check, X, MessageSquare, User, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeamReviewPage() {
  const supabase = createClient();
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  // Review state
  const [vote, setVote] = useState<'Endorse' | 'Reject' | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(p);
      }
      
      const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
      if (data) setApplications(data);
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const loadReviews = async (appId: string) => {
    const { data } = await supabase.from('application_reviews').select('*').eq('application_id', appId);
    if (data) setReviews(data);
  };

  const handleSelectApp = (app: any) => {
    setSelectedApp(app);
    loadReviews(app.id);
    setVote(null);
    setComment('');
  };

  const handleReviewSubmit = async () => {
    if (!vote || comment.length < 5) return alert("Please select a vote and leave a comment.");
    setSubmitting(true);

    const { error } = await supabase.from('application_reviews').insert({
      application_id: selectedApp.id,
      reviewer_id: profile.id,
      reviewer_name: profile.full_name,
      vote: vote,
      comment: comment
    });

    if (!error) {
      loadReviews(selectedApp.id);
      setVote(null);
      setComment('');
    } else {
      alert(error.message);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-white p-10">Loading Applications...</div>;

  return (
    <div className="flex h-screen bg-[#05070a] text-[#dfe7e0] overflow-hidden">
      
      {/* Sidebar List of Applicants */}
      <div className="w-1/3 border-r border-[#dfe7e0]/10 flex flex-col">
        <div className="p-6 border-b border-[#dfe7e0]/10 bg-[#0a0e12]">
          <h1 className="text-xl font-bold flex items-center gap-2"><ShieldAlert className="text-[#e0231c]" /> Applicant Pipeline</h1>
          <p className="text-xs text-[#78837c] mt-1">{applications.length} Total Applications</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {applications.map(app => (
            <button 
              key={app.id} 
              onClick={() => handleSelectApp(app)}
              className={`w-full text-left p-4 border-b border-[#dfe7e0]/5 hover:bg-[#0a0e12] transition-colors ${selectedApp?.id === app.id ? 'bg-[#0a0e12] border-l-4 border-l-[#2dd4bf]' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-white">{app.full_name}</h3>
                  <p className="text-xs text-[#78837c]">{app.desired_wing} • {app.branch}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded font-mono ${app.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-[#2dd4bf]/20 text-[#2dd4bf]'}`}>{app.status}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Review Area */}
      <div className="flex-1 overflow-y-auto bg-[#05070a] p-8">
        {!selectedApp ? (
          <div className="h-full flex flex-col items-center justify-center text-[#78837c]">
            <User className="w-16 h-16 mb-4 opacity-20" />
            <p>Select an applicant to review their profile.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
            
            {/* Header Info */}
            <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#e0231c]/10 blur-[100px] pointer-events-none" />
              <h2 className="text-3xl font-light text-white mb-2">{selectedApp.full_name}</h2>
              <div className="flex gap-4 text-sm text-[#78837c] font-mono mb-6">
                <span>{selectedApp.email}</span>
                <span>•</span>
                <span>{selectedApp.phone}</span>
                {selectedApp.portfolio_url && (
                  <>
                    <span>•</span>
                    <a href={selectedApp.portfolio_url} target="_blank" className="text-[#2dd4bf] hover:underline flex items-center gap-1">Portfolio <ExternalLink className="w-3 h-3" /></a>
                  </>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5">
                  <p className="text-[10px] uppercase text-[#78837c] font-mono mb-1">Wing</p>
                  <p className="font-medium">{selectedApp.desired_wing}</p>
                </div>
                <div className="bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5">
                  <p className="text-[10px] uppercase text-[#78837c] font-mono mb-1">Branch</p>
                  <p className="font-medium">{selectedApp.branch} ({selectedApp.year_of_study})</p>
                </div>
                <div className="bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5">
                  <p className="text-[10px] uppercase text-[#78837c] font-mono mb-1">Hours/Week</p>
                  <p className="font-medium text-[#2dd4bf]">{selectedApp.commitment_hours}</p>
                </div>
                <div className="bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5">
                  <p className="text-[10px] uppercase text-[#78837c] font-mono mb-1">Other Commitments</p>
                  <p className="font-medium text-xs">{selectedApp.other_commitments}</p>
                </div>
              </div>
            </div>

            {/* Essay Responses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-[#e0231c] uppercase tracking-widest mb-4">Hardest Technical Problem</h3>
                <p className="text-sm leading-relaxed text-[#aab4ad] whitespace-pre-wrap">{selectedApp.hardest_problem}</p>
              </div>
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-[#2dd4bf] uppercase tracking-widest mb-4">Why Code Kootu?</h3>
                <p className="text-sm leading-relaxed text-[#aab4ad] whitespace-pre-wrap">{selectedApp.why_kootu}</p>
              </div>
            </div>

            {/* Team Reviews Section */}
            <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#78837c]"/> Board Reviews</h3>
              
              <div className="space-y-4 mb-8">
                {reviews.length === 0 ? <p className="text-sm text-[#78837c] italic">No reviews yet. Be the first to vote.</p> : reviews.map(rev => (
                  <div key={rev.id} className="p-4 rounded-xl bg-[#05070a] border border-[#dfe7e0]/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-[#dfe7e0]">{rev.reviewer_name}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${rev.vote === 'Endorse' ? 'bg-[#2dd4bf]/10 text-[#2dd4bf]' : 'bg-red-500/10 text-red-400'}`}>{rev.vote}</span>
                    </div>
                    <p className="text-sm text-[#aab4ad]">{rev.comment}</p>
                  </div>
                ))}
              </div>

              {/* Add Review Form */}
              <div className="border-t border-[#dfe7e0]/10 pt-6">
                <p className="text-sm font-medium mb-4">Cast your vote (Required)</p>
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
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
