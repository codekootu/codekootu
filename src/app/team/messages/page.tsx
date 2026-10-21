'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, User, MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load User & Team
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/team/login'); return; }
      
      const { data: me } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(me);

      // Get all other members
      const { data: members } = await supabase.from('profiles').select('*').neq('id', session.user.id).order('full_name');
      if (members) setTeam(members);
    }
    init();
  }, [supabase, router]);

  // Load Messages when user is selected
  useEffect(() => {
    if (!profile || !selectedUser) return;

    const fetchMessages = async () => {
      // Fetch ALL messages involving the current user (bypasses complex OR SQL syntax)
      const { data, error } = await supabase.from('messages')
        .select('*')
        .or(`user_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at');
      
      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      if (data) {
        // Filter locally for the specific conversation
        const filtered = data.filter(m => 
          (m.user_id === profile.id && m.receiver_id === selectedUser.id) ||
          (m.user_id === selectedUser.id && m.receiver_id === profile.id)
        );
        setMessages(filtered);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const sub = supabase.channel('dm-room').on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        const msg = payload.new;
        if (
          (msg.user_id === profile.id && msg.receiver_id === selectedUser.id) ||
          (msg.user_id === selectedUser.id && msg.receiver_id === profile.id)
        ) {
          fetchMessages();
        }
      }
    ).subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [supabase, profile, selectedUser]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    
    const msg = newMessage;
    setNewMessage('');

    const { error } = await supabase.from('messages').insert({
      user_id: profile.id,
      receiver_id: selectedUser.id,
      channel: 'dm',
      content: msg
    });

    if (error) {
      console.error("Failed to send:", error);
      alert("Failed to send message: " + error.message);
      setNewMessage(msg); // restore text on failure
    } else {
      // Force a re-fetch immediately to ensure it shows up without waiting for realtime
      const { data } = await supabase.from('messages')
        .select('*')
        .or(`user_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at');
      if (data) {
        const filtered = data.filter(m => 
          (m.user_id === profile.id && m.receiver_id === selectedUser.id) ||
          (m.user_id === selectedUser.id && m.receiver_id === profile.id)
        );
        setMessages(filtered);
      }
    }
  };

  return (
    <div className="h-[100dvh] bg-[#05070a] text-[#dfe7e0] font-sans flex flex-col overflow-hidden">
      <header className="h-20 border-b border-[#dfe7e0]/10 flex items-center px-8 flex-shrink-0 bg-[#0a0e12]">
        <Link href="/team/dashboard" className="text-[#78837c] hover:text-white transition-colors mr-6">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-normal tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#e0231c]" /> Direct Messages
          </h1>
          <p className="text-xs text-[#78837c]">Private member-to-member chat</p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Team List (Sidebar) */}
        <div className="w-72 border-r border-[#dfe7e0]/10 flex flex-col bg-[#0a0e12] h-full">
          <div className="p-4 border-b border-[#dfe7e0]/10 text-xs uppercase tracking-widest text-[#78837c] flex-shrink-0">
            Team Members
          </div>
          <div className="flex-1 overflow-y-auto">
            {team.map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedUser(member)}
                className={`w-full text-left p-4 border-b border-[#dfe7e0]/5 hover:bg-[#dfe7e0]/5 transition-colors flex items-center gap-3 ${selectedUser?.id === member.id ? 'bg-[#dfe7e0]/10 border-l-2 border-l-[#e0231c]' : ''}`}
              >
                <div className="w-8 h-8 rounded-full bg-[#05070a] border border-[#dfe7e0]/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[#78837c]" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">{member.full_name}</div>
                  <div className="text-[10px] text-[#78837c] uppercase truncate">{member.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#05070a] h-full relative">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#dfe7e0]/10 bg-[#0a0e12] flex items-center gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#05070a] border border-[#dfe7e0]/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#78837c]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{selectedUser.full_name}</div>
                  <div className="text-[10px] text-[#78837c] uppercase">{selectedUser.role}</div>
                </div>
              </div>

              {/* Scrollable Messages Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-[#78837c]">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No messages yet. Say hello to {selectedUser.full_name}!</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.user_id === profile.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2 rounded-lg text-sm max-w-[70%] ${isMe ? 'bg-[#e0231c] text-white' : 'bg-[#0a0e12] border border-[#dfe7e0]/10 text-[#dfe7e0]'}`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-[#78837c] mt-1">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  );
                })}
              </div>

              {/* Pinned Input Area */}
              <div className="p-4 border-t border-[#dfe7e0]/10 bg-[#0a0e12] flex-shrink-0">
                <form onSubmit={handleSend} className="flex bg-[#05070a] border border-[#dfe7e0]/10 rounded-lg overflow-hidden">
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder={`Message ${selectedUser.full_name}...`} className="flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none" />
                  <button type="submit" className="px-6 text-[#e0231c] hover:text-white transition-colors"><Send className="w-4 h-4" /></button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#78837c]">
              <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-sm">Select a team member to start a conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
