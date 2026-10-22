'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ShieldAlert, CheckCircle, XCircle, Users, Check, X, 
  Package, Sparkles 
} from 'lucide-react';

export default function AdminPanel() {
  const supabase = createClient();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'ideas' | 'restock'>('ideas');
  const [ideas, setIdeas] = useState<any[]>([]);
  const [restockRequests, setRestockRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWing, setSelectedWing] = useState<{ [key: string]: string }>({});

  const fetchAdminData = useCallback(async () => {
    // 1. Fetch ideas waiting for determination (not already finalized as allocated or rejected)
    const { data: ideaData, error: ideaErr } = await supabase
      .from('ideas')
      .select('*')
      .not('status', 'in', '("Approved","allocated","Rejected","rejected")')
      .order('created_at', { ascending: false });

    if (!ideaErr && ideaData) {
      setIdeas(ideaData);
    }

    // 2. Fetch Pending Restock Requests
    const { data: restockData } = await supabase
      .from('restock_requests')
      .select('*, profiles(full_name)')
      .eq('status', 'Pending');
      
    if (restockData) {
      setRestockRequests(restockData);
    }
    
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function verifyAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { 
        router.push('/team/login'); 
        return; 
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.role !== 'super_admin') {
        router.push('/team/dashboard');
        return;
      }

      fetchAdminData();
    }
    verifyAuth();

    // Subscribe to realtime changes on ideas and restock_requests
    const channel = supabase
      .channel('admin_panel_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, () => {
        fetchAdminData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restock_requests' }, () => {
        fetchAdminData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router, fetchAdminData]);

  const handleDecision = async (ideaId: string, decision: 'Approved' | 'Rejected', wing: string = 'software') => {
    if (decision === 'Approved' && !wing) {
      alert('Please select a wing to allocate this to.');
      return;
    }

    const { error: ideaError } = await supabase
      .from('ideas')
      .update({
        status: decision === 'Approved' ? 'allocated' : 'rejected',
        final_status: decision,
        allocated_wing: decision === 'Approved' ? wing : null,
      })
      .eq('id', ideaId);

    if (ideaError) { 
      alert('Error updating idea: ' + ideaError.message); 
      return; 
    }

    if (decision === 'Approved') {
      const idea = ideas.find((i) => i.id === ideaId);
      const { error: projError } = await supabase.from('projects').insert({
        idea_id: ideaId,
        name: idea?.title || 'New Collective Project',
        assigned_wing: wing,
        status: 'Building',
        sprint_directive: 'Initial sprint allocation authorized by Super Admin.',
      });

      if (projError) { 
        alert('Idea status updated, but failed to insert project row: ' + projError.message); 
        return; 
      }
    }

    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    alert(`Idea successfully ${decision}!`);
  };

  const handleRestockDecision = async (requestId: string, itemName: string, quantity: number, status: 'Approved' | 'Rejected') => {
    const { error } = await supabase.from('restock_requests').update({ status }).eq('id', requestId);
    
    if (error) { 
      alert('Error updating restock: ' + error.message); 
      return; 
    }
    
    if (status === 'Approved') {
      const { data: invItem } = await supabase
        .from('component_inventory')
        .select('id, quantity_in_stock')
        .eq('name', itemName)
        .maybeSingle();

      if (invItem) {
        await supabase
          .from('component_inventory')
          .update({ quantity_in_stock: invItem.quantity_in_stock + quantity })
          .eq('id', invItem.id);
      }
    }

    setRestockRequests((prev) => prev.filter((r) => r.id !== requestId));
    alert(`Restock request ${status}!`);
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col selection:bg-[#e0231c]/30">
      {/* Header */}
      <header className="h-20 border-b border-[#dfe7e0]/10 flex items-center px-8 flex-shrink-0 bg-[#0a0e12]">
        <Link href="/team/dashboard" className="text-[#78837c] hover:text-white transition-colors mr-6">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-normal tracking-tight flex items-center gap-2 text-white">
            <ShieldAlert className="w-5 h-5 text-[#e0231c]" /> Final Determination Panel
          </h1>
          <p className="text-xs text-[#78837c]">Review votes, allocate sprints, and approve inventory</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#dfe7e0]/10 px-8 pt-4 bg-[#0a0e12]">
        <button 
          onClick={() => setActiveTab('ideas')} 
          className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'ideas' ? 'border-[#e0231c] text-white' : 'border-transparent text-[#78837c] hover:text-white'
          }`}
        >
          Idea Approvals
        </button>
        <button 
          onClick={() => setActiveTab('restock')} 
          className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'restock' ? 'border-[#e0231c] text-white' : 'border-transparent text-[#78837c] hover:text-white'
          }`}
        >
          Restock Requests
          {restockRequests.length > 0 && (
            <span className="bg-[#e0231c] text-white text-[10px] px-2 py-0.5 rounded-full">
              {restockRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Body Area */}
      <div className="p-8 max-w-5xl mx-auto w-full flex-1">
        {loading ? (
          <p className="text-[#78837c] text-sm">Loading determinations...</p>
        ) : activeTab === 'ideas' ? (
          ideas.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#dfe7e0]/20 rounded-lg">
              <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
              <h2 className="text-2xl font-medium mb-2 text-white">All Caught Up</h2>
              <p className="text-[#78837c] text-xs">No ideas are waiting for final determination.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {ideas.map((idea) => {
                // Support both JSONB votes array and related table votes
                const jsonVotes: any[] = Array.isArray(idea.votes) ? idea.votes : [];
                const tableVotes: any[] = Array.isArray(idea.committee_votes) ? idea.committee_votes : [];
                const allVotes = [...jsonVotes, ...tableVotes];

                const currentWing = selectedWing[idea.id] || idea.target_wing || 'software';

                return (
                  <div key={idea.id} className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-8 rounded-xl shadow-xl space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-[#e0231c] mb-2 block">
                          Pending Admin Action • Target: {idea.target_wing || 'Software'} Wing
                        </span>
                        <h3 className="text-2xl font-medium text-white mb-2">{idea.title}</h3>
                        <p className="text-[#aab4ad] text-sm max-w-3xl leading-relaxed">{idea.description}</p>
                      </div>
                    </div>

                    {/* Committee Votes Display with Member Names */}
                    <div className="p-4 bg-[#05070a] border border-[#dfe7e0]/5 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#78837c]">
                        <Users className="w-3.5 h-3.5" /> Committee Votes & Endorsements
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {allVotes.length > 0 ? (
                          allVotes.map((v: any, idx: number) => {
                            const isAccepted = v.vote === 'accept' || v.recommendation === 'Approve' || v.vote === 'Approved';
                            const voterName = v.user_name || v.profiles?.full_name || 'Committee Member';

                            return (
                              <div
                                key={idx}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border ${
                                  isAccepted
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}
                              >
                                {isAccepted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                <span>{isAccepted ? 'Accepted by' : 'Rejected by'} {voterName}</span>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-xs text-[#78837c] italic">No committee votes cast yet.</span>
                        )}
                      </div>
                    </div>

                    {/* Final Action Controls */}
                    <div className="flex flex-col md:flex-row gap-4 border-t border-[#dfe7e0]/10 pt-6">
                      <div className="flex-1 flex gap-2">
                        <select 
                          value={currentWing}
                          onChange={(e) => setSelectedWing({ ...selectedWing, [idea.id]: e.target.value })}
                          className="bg-[#05070a] border border-[#dfe7e0]/15 rounded px-4 py-3 text-xs text-white outline-none focus:border-[#e0231c]"
                        >
                          <option value="software">Software Wing</option>
                          <option value="hardware">Hardware Wing</option>
                          <option value="operations">Operations Wing</option>
                        </select>

                        <button 
                          onClick={() => handleDecision(idea.id, 'Approved', currentWing)}
                          className="flex-1 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-medium hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2 text-xs"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve & Allocate
                        </button>
                      </div>

                      <button 
                        onClick={() => handleDecision(idea.id, 'Rejected')} 
                        className="px-8 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 text-xs"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          restockRequests.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#dfe7e0]/20 rounded-lg">
              <Package className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
              <h2 className="text-2xl font-medium mb-2 text-white">Inventory Optimal</h2>
              <p className="text-[#78837c] text-xs">No pending restock requests from the Hardware wing.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {restockRequests.map((req) => (
                <div key={req.id} className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-6 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">{req.component}</h3>
                    <div className="text-sm text-[#aab4ad]">
                      Requested {req.quantity} units • By {req.profiles?.full_name || 'Hardware Lead'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRestockDecision(req.id, req.component, req.quantity, 'Approved')} 
                      className="px-6 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/20 flex items-center gap-2 text-xs transition-colors"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button 
                      onClick={() => handleRestockDecision(req.id, req.component, req.quantity, 'Rejected')} 
                      className="px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded hover:bg-red-500/20 flex items-center gap-2 text-xs transition-colors"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
