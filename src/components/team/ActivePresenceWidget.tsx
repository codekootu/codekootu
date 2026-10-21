'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, X, Circle } from 'lucide-react';

interface ActiveUser {
  userId: string;
  name: string;
  role?: string;
  avatarUrl?: string;
}

export function ActivePresenceWidget({
  currentUser,
}: {
  currentUser?: { id?: string; full_name?: string; name?: string; role?: string; avatar_url?: string } | null;
}) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<ActiveUser[]>([]);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close on click outside (handles mouse and touch)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabase.channel('workbench-online-presence', {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    const syncState = () => {
      const state = channel.presenceState();
      const userMap = new Map<string, ActiveUser>();

      Object.values(state).forEach((presences: any) => {
        if (Array.isArray(presences)) {
          presences.forEach((p: any) => {
            if (p?.userId && !userMap.has(p.userId)) {
              userMap.set(p.userId, p);
            }
          });
        }
      });

      setOnlineUsers(Array.from(userMap.values()));
    };

    channel
      .on('presence', { event: 'sync' }, syncState)
      .on('presence', { event: 'join' }, syncState)
      .on('presence', { event: 'leave' }, syncState)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && currentUser?.id) {
          await channel.track({
            userId: currentUser.id,
            name: currentUser.full_name || currentUser.name || 'Member',
            role: currentUser.role || 'Contributor',
            avatarUrl: currentUser.avatar_url,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUser?.id, currentUser?.full_name, currentUser?.name, currentUser?.role, currentUser?.avatar_url]);

  const count = onlineUsers.length || 1;

  return (
    <div className="relative z-50" ref={widgetRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0a0e12] border border-[#2dd4bf]/30 hover:border-[#2dd4bf] rounded-full transition-all text-xs"
        title="View online members"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2dd4bf] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2dd4bf]"></span>
        </span>
        <span className="text-[#aab4ad] hidden md:inline">Online</span>
        <span className="font-mono text-[#2dd4bf] font-medium">{count}</span>
      </button>

      {isOpen && (
        <div className="absolute top-10 right-0 w-64 bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg shadow-2xl p-3 text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#dfe7e0]/10">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#2dd4bf]" />
              <span className="font-medium text-white uppercase tracking-wider text-[10px]">
                Active Now ({count})
              </span>
            </div>
            <button 
              type="button"
              onClick={() => setIsOpen(false)} 
              className="text-[#78837c] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {onlineUsers.length === 0 ? (
              <div className="text-[11px] text-[#78837c] py-2 text-center">Syncing presence...</div>
            ) : (
              onlineUsers.map((u) => {
                const displayName = u.name || 'Member';
                const initial = displayName.trim().charAt(0).toUpperCase() || 'M';

                return (
                  <div
                    key={u.userId}
                    className="flex items-center justify-between p-1.5 rounded bg-[#111722]/50 border border-[#dfe7e0]/5"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-5 h-5 rounded-full bg-[#1c2433] text-[#dfe7e0] text-[9px] font-medium flex items-center justify-center flex-shrink-0 border border-[#2dd4bf]/20">
                        {initial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-white truncate font-medium">
                          {displayName}
                          {currentUser?.id === u.userId && (
                            <span className="ml-1 text-[9px] text-[#2dd4bf]">(You)</span>
                          )}
                        </span>
                        <span className="text-[9px] text-[#78837c] uppercase">{u.role || 'Member'}</span>
                      </div>
                    </div>
                    <Circle className="w-1.5 h-1.5 fill-[#2dd4bf] text-[#2dd4bf] flex-shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
