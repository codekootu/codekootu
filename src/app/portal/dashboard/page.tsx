'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { 
  FileText, ChevronRight, Zap, Sparkles, 
  Users, ArrowRight, Clock, CheckCircle2, XCircle 
} from 'lucide-react';

export default function PublicDashboard() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  useEffect(() => {
    async function getData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Fetch Profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(prof);

      // Fetch Ideas
      const { data: ideasData } = await supabase.from('ideas').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (ideasData) setIdeas(ideasData);

      // Fetch Application Status
      const { data: appData } = await supabase.from('applications').select('*').eq('user_id', session.user.id).maybeSingle();
      if (appData) setApplication(appData);
      
      setLoading(false);
    }
    getData();
  }, [supabase]);

  const joinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await supabase.from('waitlist').insert({ email });
    setWaitlistJoined(true);
  };

  if (loading) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-t-2 border-[#e0231c] rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-2 border-[#dfe7e0] rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
      </div>
      <p className="mt-6 text-[#78837c] text-xs uppercase tracking-widest animate-pulse">Calibrating...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Shimmering Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-5xl md:text-6xl font-light mb-4">
          Welcome back, <br className="md:hidden" />
          <span className="relative inline-block">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#e0231c] via-[#ff5a3c] to-[#e0231c] bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
              {profile?.full_name?.split(' ')[0] || 'User'}
            </span>
            <span className="absolute -inset-1 blur-2xl bg-gradient-to-r from-[#e0231c] to-[#ff5a3c] opacity-20 animate-pulse" />
          </span>.
        </h1>
        <p className="text-[#78837c] text-lg flex items-center justify-center md:justify-start gap-2">
          <Sparkles className="w-4 h-4 text-[#e0231c]" /> Track the status of your submitted problems below.
        </p>
      </div>

      {/* --- NEW: APPLICATION STATUS SECTION --- */}
      <div className="mb-10">
        {!application ? (
          /* APPLY BANNER */
          <div className="relative group overflow-hidden bg-gradient-to-r from-[#e0231c]/10 to-[#0a0e12]/60 backdrop-blur-xl border border-[#e0231c]/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(224,35,28,0.15)] animate-in slide-in-from-top-4 duration-700">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#e0231c]/10 blur-[80px] pointer-events-none group-hover:bg-[#e0231c]/20 transition-all duration-500" />
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Users className="w-6 h-6 text-[#e0231c]" /> Join the Collective
              </h3>
              <p className="text-sm text-[#aab4ad] max-w-lg">
                We are currently accepting applications for the Software, Hardware, and Operations wings. Do you have what it takes to build the future?
              </p>
            </div>
            <Link href="/apply" className="relative z-10 shrink-0 px-6 py-3 bg-[#e0231c] text-white font-bold uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(224,35,28,0.4)] flex items-center gap-2 text-sm">
              Apply Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* APPLICATION TRACKER */
          <div className="relative bg-[#0a0e12]/80 backdrop-blur-xl border border-[#2dd4bf]/30 rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(45,212,191,0.1)] animate-in zoom-in-95 duration-500 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2dd4bf] to-transparent animate-pulse" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-[10px] font-mono text-[#2dd4bf] uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2dd4bf] animate-ping" /> Application Status
                </p>
                <h3 className="text-2xl font-light text-white">
                  Current Phase: <span className="font-bold text-[#2dd4bf]">{application.status.toUpperCase()}</span>
                </h3>
                
                {/* Show stats if published/accepted */}
                {application.is_published && application.final_decision === 'Accepted' && (
                   <div className="flex gap-4 mt-3">
                     <span className="text-xs font-mono bg-[#2dd4bf]/10 text-[#2dd4bf] px-2 py-1 rounded">Avg Rating: {application.avg_rating}/5</span>
                     <span className="text-xs font-mono bg-[#2dd4bf]/10 text-[#2dd4bf] px-2 py-1 rounded">Approval: {application.endorse_percent}%</span>
                   </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-mono text-[#78837c] uppercase">Desired Wing</p>
                  <p className="text-sm font-medium text-white">{application.desired_wing}</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-[#05070a] border border-[#2dd4bf]/30 flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.2)]">
                  {application.status === 'Pending' && <Clock className="w-6 h-6 text-[#2dd4bf] animate-pulse" />}
                  {application.status === 'Accepted' && <CheckCircle2 className="w-6 h-6 text-[#2dd4bf]" />}
                  {application.status === 'Rejected' && <XCircle className="w-6 h-6 text-[#e0231c]" />}
                </div>
              </div>
            </div>
            
            {application.status === 'Pending' && (
              <p className="mt-4 text-xs text-[#78837c] font-mono italic">
                * The Executive Board is currently reviewing your profile. Please monitor this dashboard for updates.
              </p>
            )}
          </div>
        )}
      </div>
      {/* -------------------------------------- */}

      {/* Floating Waitlist Banner */}
      {!waitlistJoined && (
        <div className="relative group overflow-hidden bg-[#0a0e12]/60 backdrop-blur-xl border border-[#e0231c]/30 rounded-2xl p-1 mb-12 animate-[float_6s_ease-in-out_infinite]">
          {/* Rotating Border */}
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(224,35,28,0.8)_360deg)] animate-[spin_4s_linear_infinite] opacity-50" />
          
          <div className="relative bg-[#0a0e12]/90 backdrop-blur-2xl rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
            <div>
              <h3 className="text-xl font-medium text-white mb-1 flex items-center gap-2"><Zap className="w-5 h-5 text-[#e0231c] animate-bounce"/> Fast-Track Your Idea</h3>
              <p className="text-sm text-[#aab4ad]">Join the waitlist for the upcoming paid tier to skip the review queue.</p>
            </div>
            <form onSubmit={joinWaitlist} className="flex w-full md:w-auto gap-2">
              <input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} required className="flex-1 md:w-64 bg-[#05070a]/80 border border-[#dfe7e0]/20 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#e0231c] transition-colors backdrop-blur-sm" />
              <button type="submit" className="px-6 py-3 bg-[#e0231c] text-white text-sm font-medium rounded-lg hover:bg-[#c01d17] hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(224,35,28,0.3)]">Notify Me</button>
            </form>
          </div>
        </div>
      )}

      {ideas.length === 0 ? (
        <div className="relative text-center py-24 border border-[#dfe7e0]/10 rounded-3xl bg-[#0a0e12]/40 backdrop-blur-xl animate-[float_5s_ease-in-out_infinite] group">
          {/* Glowing aura */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#e0231c]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border border-[#e0231c]/30 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 bg-[#05070a] border border-[#dfe7e0]/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(224,35,28,0.2)]">
                <FileText className="w-10 h-10 text-[#78837c] group-hover:text-[#e0231c] transition-colors duration-500" />
              </div>
            </div>
            <h2 className="text-2xl font-medium mb-3">No problems submitted yet.</h2>
            <p className="text-[#78837c] mb-8 max-w-md mx-auto">Have a real-world problem that needs solving? Let our engineering collective build the solution.</p>
            <Link href="/portal/submit" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#dfe7e0] to-white text-[#05070a] rounded-xl font-medium hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(223,231,224,0.2)] hover:shadow-[0_0_40px_rgba(223,231,224,0.4)]">
              Submit a Problem
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 perspective-1000">
          {ideas.map((idea, index) => (
            <Link 
              key={idea.id} 
              href={`/portal/track/${idea.id}`} 
              className="group relative block bg-[#0a0e12]/60 backdrop-blur-xl border border-[#dfe7e0]/10 p-8 rounded-3xl hover:border-[#e0231c]/50 transition-all duration-300 hover:shadow-[0_20px_50px_-15px_rgba(224,35,28,0.3)] hover:-translate-y-2 hover:rotate-x-2 hover:rotate-y-2 transform-style-3d animate-in slide-in-from-bottom-8"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#e0231c]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex justify-between items-start mb-6">
                <h3 className="text-xl font-medium text-white group-hover:text-[#e0231c] transition-colors">{idea.title}</h3>
                <span className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${
                  idea.status === 'Received' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' :
                  idea.status === 'In Review' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 animate-pulse' :
                  idea.status === 'Building' ? 'text-[#e0231c] border-[#e0231c]/30 bg-[#e0231c]/10 animate-pulse' :
                  'text-green-400 border-green-500/30 bg-green-500/10'
                }`}>
                  {idea.status}
                </span>
              </div>
              
              <p className="relative z-10 text-sm text-[#78837c] line-clamp-2 mb-8">{idea.description}</p>
              
              <div className="relative z-10 flex items-center justify-between text-xs text-[#78837c] border-t border-[#dfe7e0]/10 pt-4">
                <span>Submitted {new Date(idea.created_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 group-hover:text-white transition-colors uppercase tracking-widest font-medium">Track <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Global CSS for Keyframes (Injecting via Style tag for simplicity in this component) */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
