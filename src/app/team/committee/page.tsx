'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, ArrowLeft, CheckCircle2, XCircle, Clock, ShieldCheck, 
  Lightbulb, AlertCircle, Sparkles 
} from 'lucide-react';

interface IdeaVote {
  user_id: string;
  user_name: string;
  vote: 'accept' | 'reject';
  timestamp: string;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  target_wing: string;
  status: string;
  votes: IdeaVote[];
  created_at: string;
}

export default function CommitteePage() {
  const supabase = createClient();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [actingOn, setActingOn] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/team/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!data?.is_review_committee && data?.role !== 'super_admin') {
        alert('Access restricted to Idea Review Committee members.');
        router.push('/team/dashboard');
        return;
      }

      setProfile(data);
      setLoading(false);
    }
    init();
  }, [supabase, router]);

  const fetchIdeas = useCallback(async () => {
    const { data } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setIdeas(data as Idea[]);
  }, [supabase]);

  useEffect(() => {
    fetchIdeas();

    const channel = supabase
      .channel('realtime_committee_ideas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, () => {
        fetchIdeas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchIdeas]);

  const castVote = async (idea: Idea, voteType: 'accept' | 'reject') => {
    setActingOn(idea.id);

    // Remove any previous vote by this user and append new vote
    const filteredVotes = (idea.votes || []).filter((v) => v.user_id !== profile.id);
    const updatedVotes: IdeaVote[] = [
      ...filteredVotes,
      {
        user_id: profile.id,
        user_name: profile.full_name,
        vote: voteType,
        timestamp: new Date().toISOString(),
      },
    ];

    const { error } = await supabase
      .from('ideas')
      .update({ votes: updatedVotes })
      .eq('id', idea.id);

    if (error) {
      alert(`Error casting vote: ${error.message}`);
    } else {
      fetchIdeas();
    }
    setActingOn(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center text-[#dfe7e0]">
        Loading Committee Console...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col">
      {/* Top Header */}
      <div className="border-b border-[#dfe7e0]/10 px-8 py-4 flex items-center justify-between bg-[#0a0e12]">
        <Link 
          href="/team/dashboard" 
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#78837c] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Workbench
        </Link>
        <span className="text-xs uppercase tracking-widest text-[#2dd4bf] flex items-center gap-1.5 font-mono">
          <ShieldCheck className="w-4 h-4" /> Committee Active: {profile?.full_name}
        </span>
      </div>

      <div className="max-w-5xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/20">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight">
              Idea Review Committee
            </h1>
          </div>
          <p className="text-xs text-[#78837c]">
            Austin M J & Bestin George: Review incoming proposals, evaluate technical viability, and cast your endorsement vote. Final allocation determination is authorized by Super Admin Noel Mathews.
          </p>
        </div>

        {/* Ideas Grid */}
        <div className="space-y-4">
          {ideas.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-[#dfe7e0]/10 rounded-2xl text-xs text-[#78837c]">
              No proposals in the triage queue.
            </div>
          ) : (
            ideas.map((item) => {
              const myVote = item.votes?.find((v) => v.user_id === profile.id);
              const acceptCount = item.votes?.filter((v) => v.vote === 'accept').length || 0;
              const rejectCount = item.votes?.filter((v) => v.vote === 'reject').length || 0;

              return (
                <div 
                  key={item.id}
                  className="p-6 bg-[#0a0e12] border border-[#dfe7e0]/10 hover:border-[#dfe7e0]/20 rounded-2xl space-y-4 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#e0231c]">
                        Proposed Target: {item.target_wing} wing
                      </span>
                      <h3 className="text-lg font-medium text-white tracking-wide mt-0.5">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono border bg-[#dfe7e0]/5 border-[#dfe7e0]/10 text-[#aab4ad]">
                        Status: {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#aab4ad] leading-relaxed bg-[#05070a] p-4 rounded-xl border border-[#dfe7e0]/5">
                    {item.description}
                  </p>

                  {/* Voting Roster Breakdown */}
                  <div className="pt-2 border-t border-[#dfe7e0]/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#78837c] block">
                        Committee Endorsements:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.votes?.length === 0 ? (
                          <span className="text-[11px] text-[#78837c] italic">No committee votes cast yet.</span>
                        ) : (
                          item.votes?.map((v, i) => (
                            <span 
                              key={i} 
                              className={`text-[10px] px-2 py-0.5 rounded font-mono flex items-center gap-1 ${
                                v.vote === 'accept' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {v.vote === 'accept' ? '✓' : '✕'} {v.user_name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Committee Member Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => castVote(item, 'reject')}
                        disabled={actingOn === item.id || item.status === 'allocated'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          myVote?.vote === 'reject'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-[#dfe7e0]/5 text-[#78837c] hover:text-red-400 hover:bg-red-500/10'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {myVote?.vote === 'reject' ? 'Rejected' : 'Reject'}
                      </button>

                      <button
                        onClick={() => castVote(item, 'accept')}
                        disabled={actingOn === item.id || item.status === 'allocated'}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                          myVote?.vote === 'accept'
                            ? 'bg-emerald-500 text-black font-semibold'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {myVote?.vote === 'accept' ? 'Endorsed (Accepted)' : 'Accept (Endorse)'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
