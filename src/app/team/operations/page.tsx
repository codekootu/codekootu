'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Megaphone, Send, CheckCircle, Clock, 
  FileText, Image as ImageIcon, Layout, ExternalLink,
  ShieldAlert, Play, Users, MessageSquare, PenTool, Globe, BarChart, Mail, Video, X, Plus
} from 'lucide-react';

const OPS_TOOLS = [
  { name: 'Pitch', desc: 'Deck Creation', icon: Play, url: 'https://pitch.com/' },
  { name: 'Canva', desc: 'Brand Assets', icon: PenTool, url: 'https://www.canva.com/' },
  { name: 'Google Analytics', desc: 'Site Traffic', icon: BarChart, url: 'https://analytics.google.com/' },
  { name: 'Notion', desc: 'Docs & Wiki', icon: FileText, url: 'https://notion.so/' },
  { name: 'Slack', desc: 'Comms', icon: MessageSquare, url: 'https://slack.com/' },
  { name: 'Mailchimp', desc: 'Email Campaigns', icon: Mail, url: 'https://mailchimp.com/' },
  { name: 'Buffer', desc: 'Social Media', icon: Globe, url: 'https://buffer.com/' },
  { name: 'Airtable', desc: 'CRM / Database', icon: Layout, url: 'https://airtable.com/' },
  { name: 'Typeform', desc: 'Surveys', icon: FileText, url: 'https://www.typeform.com/' },
  { name: 'Zapier', desc: 'Automations', icon: Play, url: 'https://zapier.com/' },
  { name: 'Figma', desc: 'UI Handoff', icon: PenTool, url: 'https://figma.com/' },
  { name: 'Loom', desc: 'Video Updates', icon: Video, url: 'https://www.loom.com/' },
  { name: 'Calendly', desc: 'Meeting Scheduler', icon: Clock, url: 'https://calendly.com/' },
  { name: 'Google Drive', desc: 'Cloud Storage', icon: FileText, url: 'https://drive.google.com/' },
  { name: 'HubSpot', desc: 'Client Outreach', icon: Users, url: 'https://www.hubspot.com/' },
  { name: 'Trello', desc: 'Kanban Board', icon: Layout, url: 'https://trello.com/' },
  { name: 'Discord', desc: 'Community Chat', icon: MessageSquare, url: 'https://discord.com/' },
  { name: 'Hootsuite', desc: 'Social Scheduling', icon: Globe, url: 'https://www.hootsuite.com/' },
  { name: 'Dropbox', desc: 'Asset Backup', icon: FileText, url: 'https://www.dropbox.com/' },
  { name: 'Bitly', desc: 'Link Shortening', icon: ExternalLink, url: 'https://bitly.com/' },
];

export default function OperationsCommandCenter() {
  const supabase = createClient();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'triage' | 'assets' | 'resources'>('triage');
  const [ideas, setIdeas] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [glowingCard, setGlowingCard] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: '', visible: false });

  // Update Modal State
  const [updatingIdea, setUpdatingIdea] = useState<any>(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDesc, setUpdateDesc] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);

  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/team/login'); return; }
      
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      const role = profile?.role || 'public';

      if (role !== 'operations' && role !== 'super_admin') {
        router.push('/team/dashboard');
        return;
      }
      setUserRole(role);

      const { data: ideaData } = await supabase.from('ideas').select('*').eq('status', 'Received').order('created_at', { ascending: false });
      if (ideaData) setIdeas(ideaData);
    }
    checkAuthAndFetch();
  }, [supabase, router]);

  const sendToCommittee = async (id: string) => {
    const { error } = await supabase.from('ideas').update({ status: 'In Review' }).eq('id', id);
    if (!error) {
      setIdeas(ideas.filter(i => i.id !== id));
    } else {
      alert("Error updating idea: " + error.message);
    }
  };

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingIdea || !updateTitle || !updateDesc) return;
    setSavingUpdate(true);

    const { data: { session } } = await supabase.auth.getSession();
    
    const { error } = await supabase.from('idea_updates').insert({
      idea_id: updatingIdea.id,
      title: updateTitle,
      description: updateDesc,
      created_by: session?.user.id
    });

    if (!error) {
      setUpdatingIdea(null);
      setUpdateTitle('');
      setUpdateDesc('');
      alert("Update posted to public tracker!");
    } else {
      alert("Error posting update: " + error.message);
    }
    setSavingUpdate(false);
  };

  const handleToolClick = (e: React.MouseEvent, toolName: string) => {
    if (userRole === 'operations' || userRole === 'super_admin') return;
    e.preventDefault();
    setGlowingCard(toolName);
    setToast({ msg: `Access Denied: You must be in the Operations wing to use ${toolName}.`, visible: true });
    setTimeout(() => { setGlowingCard(null); setToast(prev => ({ ...prev, visible: false })); }, 2500);
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col relative">
      <header className="h-20 border-b border-[#dfe7e0]/10 flex items-center justify-between px-8 flex-shrink-0 bg-[#0a0e12]">
        <div className="flex items-center gap-6">
          <Link href="/team/dashboard" className="text-[#78837c] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-normal tracking-tight flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#e0231c]" /> Operations Command Center
            </h1>
            <p className="text-xs text-[#78837c]">Triage, Assets, and Outreach</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 bg-[#05070a] p-1 rounded-lg border border-[#dfe7e0]/10">
          {['triage', 'assets', 'resources'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-[#e0231c] text-white' : 'text-[#78837c] hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        
        {activeTab === 'triage' && (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Incoming Problems (Triage)</h2>
              <span className="text-xs text-[#78837c] uppercase tracking-widest">{ideas.length} Pending</span>
            </div>
            
            {ideas.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[#dfe7e0]/20 rounded-lg">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-2xl font-medium mb-2">Queue Clear</h3>
                <p className="text-[#78837c]">All ideas have been triaged and sent to the committee.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {ideas.map(idea => (
                  <div key={idea.id} className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-6 rounded-lg flex flex-col md:flex-row items-start justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-[#e0231c] bg-[#e0231c]/10 px-2 py-1 rounded">{idea.category}</span>
                        <span className="text-[10px] uppercase tracking-widest text-[#78837c] border border-[#78837c]/30 px-2 py-1 rounded">{idea.archetype || 'Hybrid'}</span>
                        <span className="text-xs text-[#78837c] flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(idea.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-xl font-medium text-white mb-2">{idea.title}</h3>
                      <p className="text-sm text-[#aab4ad] max-w-3xl">{idea.description}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-shrink-0">
                      <button 
                        onClick={() => setUpdatingIdea(idea)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#dfe7e0]/10 text-[#dfe7e0] text-sm font-medium rounded hover:bg-[#dfe7e0]/20 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Post Update
                      </button>
                      <button 
                        onClick={() => sendToCommittee(idea.id)}
                        className="flex items-center justify-center gap-2 px-6 py-2 bg-[#dfe7e0] text-[#05070a] text-sm font-medium rounded hover:bg-white transition-colors"
                      >
                        <Send className="w-4 h-4" /> Send to Committee
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-medium mb-4">Pitch Deck Vault</h2>
                <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg p-6 h-[400px] flex flex-col">
                  <div className="flex-1 border border-dashed border-[#dfe7e0]/20 rounded flex flex-col items-center justify-center text-[#78837c] bg-[#05070a]">
                    <Layout className="w-12 h-12 mb-4 opacity-50 text-[#e0231c]" />
                    <p className="text-sm mb-4">Embed your Pitch.com deck here.</p>
                    <a href="https://pitch.com" target="_blank" className="text-[#e0231c] hover:underline text-sm">Open Pitch.com ↗</a>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-medium mb-4">Digital Asset Library</h2>
                <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg p-6 h-[400px] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-[#78837c]">Logos, Videos, Templates</span>
                    <button className="px-4 py-2 bg-[#e0231c]/10 text-[#e0231c] rounded text-sm hover:bg-[#e0231c]/20 transition-colors">Upload Asset</button>
                  </div>
                  <div className="flex-1 border border-dashed border-[#dfe7e0]/20 rounded flex flex-col items-center justify-center text-[#78837c] bg-[#05070a]">
                    <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm">No assets uploaded yet.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Operations Ecosystem & Tools</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {OPS_TOOLS.map((tool) => {
                const Icon = tool.icon;
                const isGlowing = glowingCard === tool.name;
                return (
                  <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer" onClick={(e) => handleToolClick(e, tool.name)}
                    className={`bg-[#0a0e12] border p-5 rounded-lg transition-all group flex flex-col items-center text-center relative overflow-hidden ${isGlowing ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-[#dfe7e0]/10 hover:border-[#e0231c]/50'}`}>
                    <Icon className={`w-8 h-8 mb-3 transition-transform ${isGlowing ? 'text-red-500 animate-bounce' : 'text-[#e0231c] group-hover:scale-110'}`} />
                    <h3 className={`text-sm font-medium ${isGlowing ? 'text-red-500' : 'text-white'}`}>{tool.name}</h3>
                    <p className="text-[10px] text-[#78837c] mt-1">{tool.desc}</p>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {updatingIdea && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0a0e12] border border-[#dfe7e0]/20 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-[#dfe7e0]/10 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Post Update for "{updatingIdea.title}"</h3>
              <button onClick={() => setUpdatingIdea(null)} className="text-[#78837c] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitUpdate} className="p-6 space-y-4">
              <div>
                <label className="text-xs uppercase text-[#78837c] mb-2 block">Update Title</label>
                <input type="text" required value={updateTitle} onChange={e => setUpdateTitle(e.target.value)} placeholder="e.g. Committee Review Started" className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-[#e0231c]" />
              </div>
              <div>
                <label className="text-xs uppercase text-[#78837c] mb-2 block">Message to User</label>
                <textarea required value={updateDesc} onChange={e => setUpdateDesc(e.target.value)} placeholder="What do you want the user to know?" className="w-full h-32 bg-[#05070a] border border-[#dfe7e0]/10 rounded-lg p-4 text-sm text-white outline-none focus:border-[#e0231c] resize-none" />
              </div>
              <div className="pt-4 border-t border-[#dfe7e0]/10 flex justify-end gap-2">
                <button type="button" onClick={() => setUpdatingIdea(null)} className="px-4 py-2 text-sm text-[#78837c] hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={savingUpdate} className="px-6 py-2 bg-[#e0231c] hover:bg-[#c01d17] text-white text-sm font-medium rounded transition-colors disabled:opacity-50">
                  {savingUpdate ? 'Posting...' : 'Post Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-300 z-50 ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#e0231c] text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 font-medium"><ShieldAlert className="w-5 h-5" />{toast.msg}</div>
      </div>
    </div>
  );
}
