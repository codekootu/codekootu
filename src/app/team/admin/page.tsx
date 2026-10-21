'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ShieldAlert, CheckCircle, XCircle, Users, Check, X, 
  Package, RefreshCw, FileText
} from 'lucide-react';

export default function AdminPanel() {
  const supabase = createClient();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'ideas' | 'restock'>('ideas');
  const [ideas, setIdeas] = useState<any[]>([]);
  const [restockRequests, setRestockRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/team/login'); return; }
      
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'super_admin') {
        router.push('/team/dashboard');
        return;
      }

      // Fetch ideas In Review
      const { data: ideaData } = await supabase.from('ideas')
        .select('*, committee_votes(*)')
        .eq('status', 'In Review');
      if (ideaData) setIdeas(ideaData);

      // Fetch Pending Restock Requests
      const { data: restockData } = await supabase.from('restock_requests')
        .select('*, profiles(full_name)')
        .eq('status', 'Pending');
      if (restockData) setRestockRequests(restockData);
      
      setLoading(false);
    }
    fetchData();
  }, [supabase, router]);

  const handleDecision = async (ideaId: string, decision: 'Approved' | 'Rejected', wing: string = 'software') => {
    if (decision === 'Approved' && !wing) {
      alert("Please select a wing to allocate this to.");
      return;
    }

    const { error: ideaError } = await supabase.from('ideas').update({
      status: decision,
      final_status: decision
    }).eq('id', ideaId);

    if (ideaError) { alert("Error: " + ideaError.message); return; }

    if (decision === 'Approved') {
      const idea = ideas.find(i => i.id === ideaId);
      const { error: projError } = await supabase.from('projects').insert({
        idea_id: ideaId,
        name: idea.title,
        assigned_wing: wing,
        status: 'Building',
        sprint_directive: 'Initial sprint allocation by Admin.'
      });

      if (projError) { alert("Error creating project: " + projError.message); return; }
    }

    setIdeas(ideas.filter(i => i.id !== ideaId));
    alert(`Idea ${decision}!`);
  };

  const handleRestockDecision = async (requestId: string, itemName: string, quantity: number, status: 'Approved' | 'Rejected') => {
    const { error } = await supabase.from('restock_requests').update({ status }).eq('id', requestId);
    
    if (error) { alert("Error updating restock: " + error.message); return; }
    
    if (status === 'Approved') {
      // Optionally, auto-add to inventory if approved
      const { data: invItem } = await supabase.from('component_inventory').select('id, quantity_in_stock').eq('name', itemName).single();
      if (invItem) {
        await supabase.from('component_inventory').update({ quantity_in_stock: invItem.quantity_in_stock + quantity }).eq('id', invItem.id);
      }
    }

    setRestockRequests(restockRequests.filter(r => r.id !== requestId));
    alert(`Restock request ${status}!`);
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col">
      <header className="h-20 border-b border-[#dfe7e0]/10 flex items-center px-8 flex-shrink-0 bg-[#0a0e12]">
        <Link href="/team/dashboard" className="text-[#78837c] hover:text-white transition-colors mr-6">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-normal tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#e0231c]" /> Final Determination Panel
          </h1>
          <p className="text-xs text-[#78837c]">Review votes, allocate sprints, and approve inventory</p>
        </div>
      </header>

      <div className="flex gap-4 border-b border-[#dfe7e0]/10 px-8 pt-4 bg-[#0a0e12]">
        <button onClick={() => setActiveTab('ideas')} className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ideas' ? 'border-[#e0231c] text-white' : 'border-transparent text-[#78837c] hover:text-white'}`}>Idea Approvals</button>
        <button onClick={() => setActiveTab('restock')} className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'restock' ? 'border-[#e0231c] text-white' : 'border-transparent text-[#78837c] hover:text-white'}`}>
          Restock Requests
          {restockRequests.length > 0 && <span className="bg-[#e0231c] text-white text-[10px] px-2 py-0.5 rounded-full">{restockRequests.length}</span>}
        </button>
      </div>

      <div className="p-8 max-w-5xl mx-auto w-full">
        {loading ? (
          <p className="text-[#78837c]">Loading reviews...</p>
        ) : activeTab === 'ideas' ? (
          ideas.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#dfe7e0]/20 rounded-lg">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-medium mb-2">All Caught Up</h2>
              <p className="text-[#78837c]">No ideas are waiting for final determination.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {ideas.map(idea => (
                <div key={idea.id} className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-8 rounded-lg">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#e0231c] mb-2 block">Pending Admin Action</span>
                      <h3 className="text-2xl font-medium text-white mb-2">{idea.title}</h3>
                      <p className="text-[#aab4ad] max-w-3xl">{idea.description}</p>
                    </div>
                  </div>

                  <div className="mb-8 p-4 bg-[#05070a] border border-[#dfe7e0]/5 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-[#78837c] mb-3"><Users className="w-4 h-4" /> Committee Votes</div>
                    <div className="flex gap-4">
                      {idea.committee_votes?.length > 0 ? (
                        idea.committee_votes.map((vote: any) => (
                          <div key={vote.id} className="flex items-center gap-2 bg-[#0a0e12] px-3 py-2 rounded border border-[#dfe7e0]/10">
                            {vote.recommendation === 'Approve' ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                            <span className="text-sm text-white">{vote.recommendation}</span>
                          </div>
                        ))
                      ) : (<span className="text-sm text-[#78837c] italic">No votes cast yet.</span>)}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 border-t border-[#dfe7e0]/10 pt-6">
                    <div className="flex-1 flex gap-2">
                      <select id={`wing-${idea.id}`} className="bg-[#05070a] border border-[#dfe7e0]/10 rounded px-4 py-3 text-sm text-white outline-none focus:border-[#e0231c]">
                        <option value="software">Software Wing</option>
                        <option value="hardware">Hardware Wing</option>
                        <option value="operations">Operations Wing</option>
                      </select>
                      <button onClick={() => { const select = document.getElementById(`wing-${idea.id}`) as HTMLSelectElement; handleDecision(idea.id, 'Approved', select.value); }} className="flex-1 py-3 bg-green-500/10 text-green-400 border border-green-500/30 rounded font-medium hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Approve & Allocate
                      </button>
                    </div>
                    <button onClick={() => handleDecision(idea.id, 'Rejected')} className="px-8 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          restockRequests.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#dfe7e0]/20 rounded-lg">
              <Package className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-medium mb-2">Inventory Optimal</h2>
              <p className="text-[#78837c]">No pending restock requests from the Hardware wing.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {restockRequests.map(req => (
                <div key={req.id} className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-6 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">{req.component}</h3>
                    <div className="text-sm text-[#aab4ad]">Requested {req.quantity} units • By {req.profiles?.full_name}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRestockDecision(req.id, req.component, req.quantity, 'Approved')} className="px-6 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded hover:bg-green-500/20 flex items-center gap-2 transition-colors">
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleRestockDecision(req.id, req.component, req.quantity, 'Rejected')} className="px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded hover:bg-red-500/20 flex items-center gap-2 transition-colors">
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
