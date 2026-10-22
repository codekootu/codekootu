import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ShieldAlert, Users, Mail, MapPin, Lightbulb } from 'lucide-react';

export default async function AdminSubmissionsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 1. Verify the user is logged in and is an Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/team/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Adjust this check if your admin role is named differently
  const isAdmin = profile?.role === 'super_admin' || user.email === 'noel@codekootu.com';
  
  if (!isAdmin) {
    redirect('/team/dashboard'); // Kick out non-admins
  }

  // 2. Fetch Total Users (Lives Changed Counter)
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // 3. Fetch Ideas with Joined User Data (Name & Email)
  const { data: ideas } = await supabase
    .from('ideas')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen text-[#dfe7e0]">
      
      {/* Header & Lives Impacted Counter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#dfe7e0]/10 pb-6 gap-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-[#e0231c] w-8 h-8" /> Intel Submissions
          </h1>
          <p className="text-[#78837c] mt-2 font-mono text-sm">SUBMISSION_METRICS & USER_DATA</p>
        </div>
        
        <div className="bg-[#0a0e12] border border-[#2dd4bf]/30 rounded-xl p-4 flex items-center gap-6 shadow-[0_0_20px_rgba(45,212,191,0.1)]">
          <div className="bg-[#2dd4bf]/10 p-3 rounded-lg">
            <Users className="text-[#2dd4bf] w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono tracking-widest text-[#78837c]">Lives Impacted</p>
            <p className="text-3xl font-bold text-white">{totalUsers || 0}</p>
          </div>
        </div>
      </div>

      {/* Submissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas?.length === 0 ? (
          <div className="col-span-full p-8 text-center border border-dashed border-[#dfe7e0]/20 rounded-xl text-[#78837c]">
            No submissions have been received yet.
          </div>
        ) : (
          ideas?.map((idea) => (
            <div key={idea.id} className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-2xl p-6 hover:border-[#e0231c]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-[#e0231c]/10 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-[#e0231c]" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-[#2dd4bf]">
                    {idea.status || 'RECEIVED'}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{idea.title}</h3>
                <p className="text-xs text-[#78837c] line-clamp-3 mb-6">{idea.description}</p>
              </div>

              {/* Admin Intel Block (Only visible to Admin due to the redirect check above) */}
              <div className="pt-4 border-t border-[#dfe7e0]/5 space-y-3 bg-black/30 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#2dd4bf]" />
                  <div>
                    <p className="text-[9px] font-mono text-[#78837c] uppercase">Submitted By</p>
                    <p className="text-xs text-[#dfe7e0]">{idea.profiles?.full_name || 'Unknown User'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#2dd4bf]" />
                  <div>
                    <p className="text-[9px] font-mono text-[#78837c] uppercase">Email Address</p>
                    <p className="text-xs text-[#dfe7e0]">{idea.profiles?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#e0231c]" />
                  <div>
                    <p className="text-[9px] font-mono text-[#78837c] uppercase">IP Address</p>
                    <p className="text-xs text-[#dfe7e0] font-mono">{idea.ip_address || 'Not Tracked'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
