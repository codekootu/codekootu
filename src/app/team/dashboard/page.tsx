'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Cpu, HardDrive, Megaphone, ShieldAlert, LogOut, MessageSquare, Menu, X } from 'lucide-react';
import { CurrentProjectWidget } from '@/components/team/CurrentProjectWidget';
import { GlobalCommandMenu } from '@/components/team/GlobalCommandMenu';
import { NotificationHub } from '@/components/team/NotificationHub';
import { WingProgressTracker } from '@/components/team/WingProgressTracker';

export default function TeamDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/team/login'); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      if (data) setProfile(data);
      else setProfile({ full_name: 'Unknown', role: 'public' });
      setLoading(false);
    }
    getProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/team/login');
  };

  if (loading) return <div className="min-h-[100dvh] bg-[#05070a] flex items-center justify-center text-[#dfe7e0]">Loading Workbench...</div>;

  const role = profile?.role || '';
  const isAdmin = role === 'super_admin';

  const navItems = [
    { name: 'Dashboard', href: '/team/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Messages', href: '/team/messages', icon: MessageSquare, show: true },
    { name: 'Admin Panel', href: '/team/admin', icon: ShieldAlert, show: isAdmin },
    { name: 'Software', href: '/team/software', icon: Cpu, show: role === 'software' || isAdmin },
    { name: 'Hardware', href: '/team/hardware', icon: HardDrive, show: role === 'hardware' || isAdmin },
    { name: 'Operations', href: '/team/operations', icon: Megaphone, show: role === 'operations' || isAdmin },
    { name: 'Committee', href: '/team/committee', icon: ShieldAlert, show: profile?.is_review_committee || isAdmin },
  ].filter(i => i.show);

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] flex font-sans">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0e12] border-b border-[#dfe7e0]/10 flex items-center justify-between px-4 z-50">
        <span className="text-sm font-medium tracking-widest uppercase">Kootu</span>
        <div className="flex items-center gap-3">
          <GlobalCommandMenu />
          <NotificationHub />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6 text-[#e0231c]" /> : <Menu className="w-6 h-6 text-[#dfe7e0]" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#0a0e12] z-40 p-4 flex flex-col gap-2">
          {navItems.map(item => (
            <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-4 text-[#dfe7e0] hover:bg-[#dfe7e0]/5 rounded-md text-lg">
              <item.icon className="w-5 h-5" /> {item.name}
            </Link>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-4 mt-auto text-[#e0231c] hover:bg-[#e0231c]/10 rounded-md text-lg">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-[#dfe7e0]/10 hidden md:flex flex-col justify-between">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-[#dfe7e0]/10">
            <span className="text-sm font-medium tracking-[0.2em] uppercase">Kootu Workbench</span>
          </div>
          <nav className="p-4 flex flex-col gap-2">
            {navItems.map(item => (
              <Link key={item.name} href={item.href} className="flex items-center gap-3 px-4 py-3 text-[#78837c] hover:text-[#dfe7e0] hover:bg-[#dfe7e0]/5 rounded-md text-sm transition-colors">
                <item.icon className="w-4 h-4" /> {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-[#dfe7e0]/10">
          <div className="mb-4 px-4 flex flex-col gap-1">
            <div className="text-[10px] text-[#78837c] uppercase tracking-wider">Logged in as</div>
            <div className="text-sm font-medium truncate">{profile?.full_name}</div>
            <div className="text-[10px] text-[#e0231c] mt-1 uppercase font-bold tracking-wider">{role ? role.replace('_', ' ') : 'UNKNOWN'}</div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-[#e0231c] hover:bg-[#e0231c]/10 rounded-md text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col pt-16 md:pt-0 pb-16 md:pb-0">
        <header className="hidden md:flex h-20 border-b border-[#dfe7e0]/10 items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-xl font-normal tracking-tight">Workbench Overview</h1>
          <div className="flex items-center gap-3">
            <GlobalCommandMenu />
            <NotificationHub />
            <CurrentProjectWidget userRole={role} />
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          
          {isAdmin ? (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-light mb-2">Executive Overview</h2>
                  <p className="text-[#78837c]">Live progress reports from all wings.</p>
                </div>
                <Link href="/team/admin" className="px-6 py-3 bg-[#e0231c] text-white rounded font-medium hover:bg-[#c01d17] transition-colors">
                  Open Admin Action Panel
                </Link>
              </div>
              <WingProgressTracker isAdmin={true} />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center py-20 border border-dashed border-[#dfe7e0]/20 rounded-lg">
                <h2 className="text-2xl font-medium mb-2 capitalize">{role.replace('_', ' ')} Dashboard</h2>
                <p className="text-[#78837c] mb-6">Welcome to Code Kootu. Check your wing's tools in the sidebar.</p>
                <WingProgressTracker isAdmin={false} />
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0e12] border-t border-[#dfe7e0]/10 flex items-center justify-around z-50">
        {navItems.slice(0, 4).map(item => (
          <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-full h-full text-[#78837c] hover:text-white">
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-[9px] uppercase tracking-wider">{item.name}</span>
          </Link>
        ))}
      </div>

    </div>
  );
}
