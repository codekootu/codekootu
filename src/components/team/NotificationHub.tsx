'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';

export function NotificationHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  return (
    <div className="relative">
      <button onClick={() => { setIsOpen(!isOpen); setHasUnread(false); }} className="relative p-1.5 bg-[#0a0e12] border border-[#dfe7e0]/20 hover:border-[#dfe7e0]/50 rounded-full transition-all text-[#78837c] hover:text-white">
        <Bell className="w-4 h-4" />
        {hasUnread && <span className="absolute top-0 right-0 w-2 h-2 bg-[#e0231c] rounded-full border-2 border-[#0a0e12]" />}
      </button>
      {isOpen && (
        <div className="absolute top-10 right-0 w-72 bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-[#dfe7e0]/10 bg-[#05070a] flex justify-between items-center">
            <span className="text-xs font-medium text-white">Notifications</span>
            <span className="text-[10px] text-[#e0231c] cursor-pointer hover:underline">Mark all read</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <div className="p-3 border-b border-[#dfe7e0]/5 hover:bg-[#dfe7e0]/5 cursor-pointer">
              <div className="text-sm text-white">New idea submitted</div>
              <div className="text-xs text-[#78837c]">Smart Water Meter is pending triage.</div>
              <div className="text-[9px] text-[#78837c] mt-1">2 mins ago</div>
            </div>
            <div className="p-3 hover:bg-[#dfe7e0]/5 cursor-pointer">
              <div className="text-sm text-white">Task assigned</div>
              <div className="text-xs text-[#78837c]">You were assigned to "Build WebSocket relay".</div>
              <div className="text-[9px] text-[#78837c] mt-1">1 hour ago</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
