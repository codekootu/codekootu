'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      // Updated to route through the callback handler
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/portal/dashboard` },
    });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      // Updated to route through the callback handler
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/portal/dashboard` }
    });
    
    if (error) {
      setMessage(error.message);
      setIsSuccess(false);
    } else {
      setMessage('Check your email! We sent you a magic login link.');
      setIsSuccess(true);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-[100dvh] grid place-items-center bg-[#05070a] text-[#dfe7e0] px-6">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#78837c] hover:text-[#dfe7e0] mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="text-[10px] tracking-[0.32em] uppercase text-[#e0231c] mb-6">01 — Public Portal</div>
        <h1 className="text-4xl font-normal tracking-tight mb-4">Enter the Portal.</h1>
        <p className="text-[#aab4ad] mb-8">Submit problems, track briefs, and vote on shipped work.</p>

        <button onClick={handleGoogleLogin} className="w-full py-4 border border-[#dfe7e0]/20 rounded-lg hover:bg-[#dfe7e0]/5 transition-colors flex items-center justify-center gap-3 font-medium mb-6">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-[#dfe7e0]/10 flex-1"></div>
          <div className="text-xs text-[#78837c] uppercase tracking-wider">Or Magic Link</div>
          <div className="h-px bg-[#dfe7e0]/10 flex-1"></div>
        </div>

        <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-[#78837c]" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg pl-12 pr-4 py-4 text-[#dfe7e0] outline-none focus:border-[#e0231c]/50 transition-colors"
            />
          </div>
          
          <button disabled={loading || isSuccess} type="submit" className={`w-full py-4 rounded-lg font-medium transition-colors disabled:opacity-50 ${isSuccess ? 'bg-green-500 text-white' : 'bg-[#dfe7e0] text-[#05070a] hover:bg-white'}`}>
            {loading ? 'Sending Link...' : isSuccess ? 'Link Sent!' : 'Send Magic Link'}
          </button>
        </form>
        
        {message && (
          <div className={`mt-6 p-4 rounded-lg text-sm text-center border ${isSuccess ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
