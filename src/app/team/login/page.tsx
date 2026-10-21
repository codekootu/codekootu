'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function TeamLoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Verify user profile exists and has role access
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profile || profile.role === 'public') {
          await supabase.auth.signOut();
          setErrorMessage('Access denied. No active workbench permissions assigned.');
          setLoading(false);
          return;
        }

        router.push('/team/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070a] text-[#dfe7e0] flex flex-col justify-center items-center px-4 relative selection:bg-[#e0231c]/30 selection:text-[#dfe7e0]">
      {/* Back button */}
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#78837c] hover:text-[#dfe7e0] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>
      </div>

      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="space-y-2 text-left">
          <div className="text-[10px] font-mono tracking-[0.2em] text-[#e0231c] uppercase">
            02 — Team Workbench
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">
            Verified Access.
          </h1>
          <p className="text-xs text-[#78837c] leading-relaxed">
            Wing tools, sprints, triage console, admin decisions.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <input
              type="email"
              required
              placeholder="Team Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0e12] border border-[#dfe7e0]/15 focus:border-[#e0231c] rounded px-3.5 py-3 text-sm text-white placeholder-[#78837c] outline-none transition-colors"
            />
          </div>

          <div>
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0e12] border border-[#dfe7e0]/15 focus:border-[#e0231c] rounded px-3.5 py-3 text-sm text-white placeholder-[#78837c] outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#e0231c] hover:bg-[#c01d17] text-white py-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Credentials...
              </>
            ) : (
              'Sign In with Email'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
