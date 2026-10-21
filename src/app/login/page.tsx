'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TeamLoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/team/dashboard');
    }
  };

  return (
    <main className="min-h-[100dvh] grid place-items-center bg-[#05070a] text-[#dfe7e0] px-6">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#78837c] hover:text-[#dfe7e0] mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="text-[10px] tracking-[0.32em] uppercase text-[#e0231c] mb-6">02 — Team Workbench</div>
        <h1 className="text-4xl font-normal tracking-tight mb-4">Verified Access.</h1>
        <p className="text-[#aab4ad] mb-8">Wing tools, sprints, triage console, admin decisions.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Team Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#0a0e12] border border-[#dfe7e0]/10 rounded px-4 py-4 text-[#dfe7e0] outline-none focus:border-[#e0231c]/50 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-[#0a0e12] border border-[#dfe7e0]/10 rounded px-4 py-4 text-[#dfe7e0] outline-none focus:border-[#e0231c]/50 transition-colors"
          />
          <button disabled={loading} type="submit" className="w-full py-4 bg-[#e0231c] text-white rounded font-medium hover:bg-[#c01d17] transition-colors disabled:opacity-50 mt-2">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        {error && <div className="mt-4 text-sm text-[#e0231c] text-center">{error}</div>}
      </div>
    </main>
  );
}
