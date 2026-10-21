'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Code2, GitBranch, Activity, Play, Save, 
  Terminal, Shield, Database, Server, FileText, 
  Layout, Settings, Link as LinkIcon, AlertTriangle, 
  CheckCircle, Clock, ExternalLink, Search, 
  CheckSquare, MessageSquare, Cloud, Box, Cpu, Layers
} from 'lucide-react';

export default function SoftwareCommandCenter() {
  const supabase = createClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'editor' | 'monitoring' | 'resources'>('overview');
  
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [snippets, setSnippets] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/team/login'); return; }
      
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      const role = profile?.role || 'public';

      // STRICT ROUTE GUARD
      if (role !== 'software' && role !== 'super_admin') {
        router.push('/team/dashboard');
        return;
      }

      const { data: projData } = await supabase.from('projects').select('*').eq('assigned_wing', 'software').limit(1).maybeSingle();
      if (projData) setProject(projData);

      const { data: snipData } = await supabase.from('code_snippets').select('*').order('created_at', { ascending: false }).limit(5);
      if (snipData) setSnippets(snipData);
    }
    checkAuthAndFetch();
  }, [supabase, router]);

  const handleSave = async () => {
    if (!title || !code) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from('code_snippets').insert({
      user_id: session?.user.id,
      project_id: project?.id,
      title, language, code
    });
    if (!error) {
      alert('Snippet saved!');
      setTitle(''); setCode('');
      const { data } = await supabase.from('code_snippets').select('*').order('created_at', { ascending: false }).limit(5);
      if (data) setSnippets(data);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col">
      <header className="h-20 border-b border-[#dfe7e0]/10 flex items-center justify-between px-8 flex-shrink-0 bg-[#0a0e12]">
        <div className="flex items-center gap-6">
          <Link href="/team/dashboard" className="text-[#78837c] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-normal tracking-tight flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#e0231c]" /> Software Command Center
            </h1>
            <p className="text-xs text-[#78837c]">Active Build: {project?.name || 'Loading...'}</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 bg-[#05070a] p-1 rounded-lg border border-[#dfe7e0]/10">
          {['overview', 'editor', 'monitoring', 'resources'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-[#e0231c] text-white' : 'text-[#78837c] hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'overview' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-6 rounded-lg"><div className="text-xs text-[#78837c] uppercase mb-1">Open Tasks</div><div className="text-3xl font-light text-white">12</div></div>
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-6 rounded-lg"><div className="text-xs text-[#78837c] uppercase mb-1">Open PRs</div><div className="text-3xl font-light text-white">4</div></div>
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-6 rounded-lg"><div className="text-xs text-[#78837c] uppercase mb-1">CI/CD Status</div><div className="text-3xl font-light text-green-500">Passing</div></div>
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-6 rounded-lg"><div className="text-xs text-[#78837c] uppercase mb-1">Uptime (30d)</div><div className="text-3xl font-light text-white">99.9%</div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg p-6 h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-4"><h3 className="font-medium flex items-center gap-2"><Layout className="w-4 h-4 text-[#e0231c]"/> Sprint Board (Trello)</h3><a href="https://trello.com" target="_blank" rel="noopener noreferrer" className="text-xs text-[#78837c] hover:text-white flex items-center gap-1">Open <ExternalLink className="w-3 h-3"/></a></div>
                <div className="flex-1 border border-dashed border-[#dfe7e0]/20 rounded flex items-center justify-center text-[#78837c] text-sm bg-[#05070a]">[ Embed Trello Board via iframe here ]</div>
              </div>
              <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg p-6">
                <h3 className="font-medium flex items-center gap-2 mb-4"><Code2 className="w-4 h-4 text-[#e0231c]"/> Recent Snippets</h3>
                <div className="space-y-3">
                  {snippets.map(s => (<div key={s.id} className="bg-[#05070a] p-3 rounded border border-[#dfe7e0]/5"><div className="text-sm text-white font-medium mb-1">{s.title}</div><div className="text-xs text-[#78837c] uppercase">{s.language}</div></div>))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="h-[calc(100vh-10rem)] flex gap-6">
            <div className="flex-1 bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg overflow-hidden relative">
              <iframe title="LiveCodes" src={`https://livecodes.io/?embed=true&layout=responsive&theme=dark&lang=${language}`} className="w-full h-full border-0" />
            </div>
            <div className="w-96 bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg p-6 flex flex-col">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2"><Save className="w-4 h-4 text-[#e0231c]"/> Save to Library</h2>
              <div className="space-y-4 flex-1 flex flex-col">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Snippet Title" className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3 py-2 text-sm outline-none" />
                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3 py-2 text-sm outline-none">
                  <option value="javascript">JavaScript</option><option value="python">Python</option><option value="cpp">C++</option><option value="sql">SQL</option>
                </select>
                <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Paste code here..." className="w-full flex-1 bg-[#05070a] border border-[#dfe7e0]/10 rounded p-3 text-sm font-mono outline-none resize-none" />
                <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-[#e0231c] hover:bg-[#c01d17] text-white rounded font-medium transition-colors mt-2 disabled:opacity-50">{saving ? 'Saving...' : 'Save Snippet'}</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="max-w-7xl mx-auto space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg p-6">
                 <h3 className="font-medium flex items-center gap-2 mb-6"><Activity className="w-4 h-4 text-[#e0231c]"/> Infrastructure Status</h3>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between border-b border-[#dfe7e0]/5 pb-2"><span className="text-sm text-[#aab4ad]">Supabase DB (PostgreSQL)</span><span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Operational</span></div>
                   <div className="flex items-center justify-between border-b border-[#dfe7e0]/5 pb-2"><span className="text-sm text-[#aab4ad]">Auth Service (Supabase)</span><span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Operational</span></div>
                   <div className="flex items-center justify-between border-b border-[#dfe7e0]/5 pb-2"><span className="text-sm text-[#aab4ad]">Vercel Edge Network</span><span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Operational</span></div>
                 </div>
               </div>
               <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg p-6">
                 <h3 className="font-medium flex items-center gap-2 mb-6"><AlertTriangle className="w-4 h-4 text-[#e0231c]"/> Error Tracking (Sentry)</h3>
                 <div className="bg-[#05070a] border border-red-500/20 p-4 rounded text-sm"><div className="text-red-400 font-mono text-xs mb-1">TypeError: Cannot read properties of undefined</div><div className="text-[#78837c] text-xs">at SensorDashboard.tsx:42</div></div>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-medium mb-6">Developer Ecosystem</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><GitBranch className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">GitHub Repos</h3><p className="text-[10px] text-[#78837c] mt-1">Source Control</p></a>
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Server className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Vercel</h3><p className="text-[10px] text-[#78837c] mt-1">Hosting & CI/CD</p></a>
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Database className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Supabase</h3><p className="text-[10px] text-[#78837c] mt-1">Database & Auth</p></a>
              <a href="https://notion.so" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><FileText className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Notion Docs</h3><p className="text-[10px] text-[#78837c] mt-1">Knowledge Base</p></a>
              <a href="https://trello.com" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Layout className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Trello / Miro</h3><p className="text-[10px] text-[#78837c] mt-1">Kanban Board</p></a>
              <a href="https://hub.docker.com" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Box className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Docker Hub</h3><p className="text-[10px] text-[#78837c] mt-1">Containers</p></a>
              <a href="https://web.postman.co" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><LinkIcon className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Postman</h3><p className="text-[10px] text-[#78837c] mt-1">API Testing</p></a>
              <a href="https://app.snyk.io" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Shield className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Snyk Security</h3><p className="text-[10px] text-[#78837c] mt-1">Vuln Scanning</p></a>
              <a href="https://excalidraw.com" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Settings className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Excalidraw</h3><p className="text-[10px] text-[#78837c] mt-1">Architecture</p></a>
              <a href="https://dashboard.algolia.com" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Search className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Algolia</h3><p className="text-[10px] text-[#78837c] mt-1">Search Infra</p></a>
              <a href="https://discord.com/app" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><MessageSquare className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Discord</h3><p className="text-[10px] text-[#78837c] mt-1">Comms</p></a>
              <a href="https://grafana.com" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Activity className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Grafana</h3><p className="text-[10px] text-[#78837c] mt-1">Metrics</p></a>
              <a href="https://dashboard.ngrok.com" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Cpu className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Ngrok</h3><p className="text-[10px] text-[#78837c] mt-1">Local Webhooks</p></a>
              <a href="https://codesandbox.io/dashboard" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Code2 className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">CodeSandbox</h3><p className="text-[10px] text-[#78837c] mt-1">Prototyping</p></a>
              <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Cloud className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Cloudflare</h3><p className="text-[10px] text-[#78837c] mt-1">CDN / WAF</p></a>
              <a href="https://figma.com" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Layout className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Figma</h3><p className="text-[10px] text-[#78837c] mt-1">UI Handoff</p></a>
              <a href="https://linear.app" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><CheckSquare className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Linear</h3><p className="text-[10px] text-[#78837c] mt-1">Issue Tracking</p></a>
              <a href="https://app.posthog.com" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Play className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">PostHog</h3><p className="text-[10px] text-[#78837c] mt-1">Product Analytics</p></a>
              <a href="https://dashboard.render.com" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Server className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Render</h3><p className="text-[10px] text-[#78837c] mt-1">Backend Services</p></a>
              <a href="https://replit.com" target="_blank" rel="noopener noreferrer" className="bg-[#0a0e12] border border-[#dfe7e0]/10 p-5 rounded-lg hover:border-[#e0231c]/50 transition-colors group flex flex-col items-center text-center"><Terminal className="w-8 h-8 text-[#e0231c] mb-3 group-hover:scale-110 transition-transform" /><h3 className="text-white text-sm font-medium">Replit</h3><p className="text-[10px] text-[#78837c] mt-1">Quick Scripts</p></a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
