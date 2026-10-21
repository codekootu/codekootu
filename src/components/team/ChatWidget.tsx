'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, X, Send } from 'lucide-react';

export function ChatWidget({ userRole }: { userRole: string }) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [channel, setChannel] = useState('general');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('profiles').select('full_name, role').eq('id', session.user.id).single().then(({ data }) => setProfile(data));
      }
    });
  }, [supabase]);

  useEffect(() => {
    if (!isOpen) return;

    supabase.from('messages').select('*, profiles(full_name)').eq('channel', channel).order('created_at').then(({ data }) => {
      if (data) setMessages(data);
    });

    const sub = supabase.channel('chat-room').on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      async (payload) => {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', payload.new.user_id).single();
        if (payload.new.channel === channel) {
          setMessages(prev => [...prev, { ...payload.new, profiles: data }]);
        }
      }
    ).subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [supabase, channel, isOpen]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const msg = newMessage;
    setNewMessage('');
    await supabase.from('messages').insert({ user_id: session.user.id, channel, content: msg });
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0e12] border border-[#dfe7e0]/20 hover:border-[#e0231c] rounded-full transition-all text-xs text-[#78837c] hover:text-white">
        <MessageSquare className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Wing Sync</span>
      </button>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-[#0a0e12] border-l border-[#dfe7e0]/10 shadow-2xl z-[100] flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-[#dfe7e0]/10 flex justify-between items-center bg-[#05070a]">
            <h3 className="text-sm font-medium text-white flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#e0231c]"/> Wing Sync</h3>
            <button onClick={() => setIsOpen(false)} className="text-[#78837c] hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex border-b border-[#dfe7e0]/10 overflow-x-auto no-scrollbar">
            {['general', 'software', 'hardware', 'operations'].map(c => {
              if (c !== 'general' && profile?.role !== 'super_admin' && profile?.role !== c) return null;
              return (
                <button key={c} onClick={() => setChannel(c)} className={`flex-1 py-2 text-xs uppercase tracking-widest transition-colors ${channel === c ? 'text-[#e0231c] border-b-2 border-[#e0231c]' : 'text-[#78837c] hover:text-white'}`}>{c}</button>
              );
            })}
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => {
              const isMe = msg.user_id === profile?.id;
              return (
                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-[#78837c] mb-1">{msg.profiles?.full_name || 'Unknown'}</span>
                  <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${isMe ? 'bg-[#e0231c] text-white' : 'bg-[#05070a] border border-[#dfe7e0]/10 text-[#dfe7e0]'}`}>{msg.content}</div>
                </div>
              );
            })}
          </div>
          <form onSubmit={handleSend} className="p-3 border-t border-[#dfe7e0]/10 bg-[#05070a]">
            <div className="flex bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-full overflow-hidden">
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder={`Message #${channel}...`} className="flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none" />
              <button type="submit" className="p-2 text-[#e0231c] hover:text-white transition-colors"><Send className="w-4 h-4" /></button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
