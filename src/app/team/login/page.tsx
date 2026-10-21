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
  const [oauthLoading, setOauthLoading] = useState(false);

  // Email / Password Login
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

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setOauthLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/team/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setOauthLoading(false);
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

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={oauthLoading || loading}
          className="w-full py-3.5 px-4 bg-[#0a0e12] border border-[#dfe7e0]/15 hover:border-[#dfe7e0]/40 rounded font-medium flex items-center justify-center gap-3 text-sm text-[#dfe7e0] transition-all hover:bg-[#111722] disabled:opacity-50 mb-6"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.57 0 2.98.54 4.09 1.6l3.07-3.07C17.3 1.73 14.86 1 12 1 7.46 1 3.58 3.58 1.66 7.35l3.78 2.93C6.34 7.28 8.93 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.03 3.66-5.02 3.66-8.73z"
            />
            <path
              fill="#FBBC05"
              d="M5.44 14.72A7.003 7.003 0 0 1 5.09 12c0-.95.16-1.87.44-2.72L1.75 6.35C.64 8.56 0 10.2 0 12c0 1.8.64 3.44 1.75 5.65l3.69-2.93z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.96-1.07 7.95-2.91l-3.76-2.91c-1.08.72-2.45 1.16-4.19 1.16-3.07 0-5.66-2.28-6.56-5.28L1.66 16.65C3.58 20.42 7.46 23 12 23z"
            />
          </svg>
          {oauthLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-[#dfe7e0]/10 w-full" />
          <span className="bg-[#05070a] px-3 text-[10px] uppercase tracking-widest text-[#78837c] absolute">
            or password
          </span>
        </div>

        {/* Traditional Credentials Form */}
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
          <button disabled={loading || oauthLoading} type="submit" className="w-full py-4 bg-[#e0231c] text-white rounded font-medium hover:bg-[#c01d17] transition-colors disabled:opacity-50 mt-2">
            {loading ? 'Authenticating...' : 'Sign In with Email'}
          </button>
        </form>
        {error && <div className="mt-4 text-sm text-[#e0231c] text-center">{error}</div>}
      </div>
    </main>
  );
}
