'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldAlert, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function CommitteePage() {
  const supabase = createClient();
  const router = useRouter();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [isCommittee, setIsCommittee] = useState(false);

  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/team/login'); return; }
      
      const { data: profile } = await supabase.from('profiles').select('role, is_review_committee').eq('id', session.user.id).single();
      
      const role = profile?.role || 'public';
      const committee = profile?.is_review_committee || false;

      // STRICT ROUTE GUARD
      if (!committee && role !== 'super_admin') {
        router.push('/team/dashboard');
        return;
      }
      setUserRole(role);
      setIsCommittee(committee);

      const { data } = await supabase.from('ideas').select('*').eq('status', 'In Review');
      if (data) setIdeas(data);
      setLoading(false);
    }
    checkAuthAndFetch();
  }, [supabase, router]);

  const handleVote = async (ideaId: string, recommendation: 'Approve' | 'Reject') => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('committee_votes').insert({
      idea_id: ideaId,
      voter_id: session.user.id,
      recommendation,
      feasibility: 8,
      rationale: 'Looks feasible based on initial review.'
    });

    if (!error) {
      alert("Vote cast successfully!");
      // Remove from list if you want to, or leave it to show it's been voted on.
    } else {
      alert("Error voting: " + error.message);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col">
      <header className="h-20 border-b border-[#dfe7e0]/10 flex items-center px-8 flex-shrink-0 bg-[#0a0e12]">
        <Link href="/team/dashboard" className="text-[#78837c] hover:text-white transition-colors mr-6">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-normal tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#e0231c]" /> Committee Review
          </h1>
          <p className="text-xs text-[#78837c]">Evaluate ideas and submit your scorecard</p>
        </div>
      </header>

      <div className="p-8 max-w-5xl mx-auto w-full">
        {loading ? (
          <p className="text-[#78837c]">Loading reviews...</p>
        ) : ideas.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#dfe7e0]/20 rounded-lg">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-medium mb-2">All Caught Up</h2>
            <p className="text-[#78837c]">No ideas are currently pending review.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {ideas.map(idea => (
              <div key={idea.id} className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-8 rounded-lg">
                <div className="mb-6">
                  <span className="text-[10px] uppercase tracking-widest text-[#e0231c] mb-2 block">Review Required</span>
                  <h3 className="text-2xl font-medium text-white mb-2">{idea.title}</h3>
                  <p className="text-[#aab4ad]">{idea.description}</p>
                </div>
                <div className="flex gap-4 border-t border-[#dfe7e0]/10 pt-6">
                  <button 
                    onClick={() => handleVote(idea.id, 'Approve')}
                    className="flex-1 py-3 bg-green-500/10 text-green-400 border border-green-500/30 rounded font-medium hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Recommend Approval
                  </button>
                  <button 
                    onClick={() => handleVote(idea.id, 'Reject')}
                    className="flex-1 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Recommend Rejection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
