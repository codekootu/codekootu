'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Cpu, Lightbulb, User, Box } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GlobalCommandMenu() {
  const supabase = createClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ projects: any[], members: any[], ideas: any[], inventory: any[] }>({ projects: [], members: [], ideas: [], inventory: [] });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setIsOpen((open) => !open); }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults({ projects: [], members: [], ideas: [], inventory: [] }); return; }
    const search = async () => {
      const q = `%${query}%`;
      const [p, m, i, inv] = await Promise.all([
        supabase.from('projects').select('id, name').ilike('name', q).limit(3),
        supabase.from('profiles').select('id, full_name, role').ilike('full_name', q).limit(3),
        supabase.from('ideas').select('id, title').ilike('title', q).limit(3),
        supabase.from('component_inventory').select('id, name, quantity_in_stock').ilike('name', q).limit(3),
      ]);
      setResults({ 
        projects: p.data || [], 
        members: m.data || [], 
        ideas: i.data || [],
        inventory: inv.data || []
      });
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query, supabase]);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0e12] border border-[#dfe7e0]/20 hover:border-[#dfe7e0]/50 rounded-full transition-all text-xs text-[#78837c] hover:text-white">
        <Search className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden md:inline-flex items-center gap-1 bg-[#dfe7e0]/10 px-1.5 py-0.5 rounded text-[9px] font-mono text-[#aab4ad]">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div className="w-full max-w-xl bg-[#0a0e12] border border-[#dfe7e0]/20 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-4 py-3 border-b border-[#dfe7e0]/10">
          <Search className="w-5 h-5 text-[#78837c] mr-3" />
          <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects, members, ideas, inventory..." className="flex-1 bg-transparent text-white outline-none text-sm placeholder-[#78837c]" />
        </div>
        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {results.projects.length > 0 && (
            <div className="mb-2">
              <div className="text-[10px] uppercase tracking-widest text-[#78837c] px-3 py-2">Projects</div>
              {results.projects.map(p => (
                <button key={p.id} onClick={() => { router.push('/team/dashboard'); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-[#dfe7e0] hover:bg-[#e0231c]/10 rounded-md">
                  <Cpu className="w-4 h-4 text-[#e0231c]" /> {p.name}
                </button>
              ))}
            </div>
          )}
          {results.members.length > 0 && (
            <div className="mb-2">
              <div className="text-[10px] uppercase tracking-widest text-[#78837c] px-3 py-2">Team Members</div>
              {results.members.map(m => (
                <button key={m.id} onClick={() => { router.push('/team/messages'); setIsOpen(false); }} className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-[#dfe7e0] hover:bg-[#dfe7e0]/5 rounded-md">
                  <span className="flex items-center gap-3"><User className="w-4 h-4 text-[#78837c]" /> {m.full_name}</span>
                  <span className="text-[10px] uppercase text-[#78837c]">{m.role}</span>
                </button>
              ))}
            </div>
          )}
          {results.ideas.length > 0 && (
            <div className="mb-2">
              <div className="text-[10px] uppercase tracking-widest text-[#78837c] px-3 py-2">Ideas</div>
              {results.ideas.map(i => (
                <button key={i.id} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-[#dfe7e0] hover:bg-[#dfe7e0]/5 rounded-md">
                  <Lightbulb className="w-4 h-4 text-yellow-500" /> {i.title}
                </button>
              ))}
            </div>
          )}
          {results.inventory.length > 0 && (
            <div className="mb-2">
              <div className="text-[10px] uppercase tracking-widest text-[#78837c] px-3 py-2">Inventory</div>
              {results.inventory.map(inv => (
                <button key={inv.id} onClick={() => { router.push('/team/hardware'); setIsOpen(false); }} className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-[#dfe7e0] hover:bg-[#dfe7e0]/5 rounded-md">
                  <span className="flex items-center gap-3"><Box className="w-4 h-4 text-green-500" /> {inv.name}</span>
                  <span className="text-[10px] text-[#78837c]">{inv.quantity_in_stock} in stock</span>
                </button>
              ))}
            </div>
          )}
          {query && results.projects.length === 0 && results.members.length === 0 && results.ideas.length === 0 && results.inventory.length === 0 && (
            <div className="text-center py-8 text-sm text-[#78837c]">No results found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
