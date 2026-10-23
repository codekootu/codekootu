'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CodeKootuLanding } from '@/components/landing/CodeKootuLanding';
import AnimatedBackground from '@/components/AnimatedBackground';

function AuthCodeCatcher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      // Forward the authorization code to the SSR route handler to exchange for cookies
      router.replace(`/auth/callback?code=${code}&next=/portal/dashboard`);
    }
  }, [searchParams, router]);

  return null;
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#05070a]">
      {/* Heavy Animated Background (Particles, Glows, Grid) */}
      <AnimatedBackground />
      
      {/* Main Landing Page Content */}
      <div className="relative z-10">
        <Suspense fallback={null}>
          <AuthCodeCatcher />
        </Suspense>
        <CodeKootuLanding />
      </div>
    </div>
  );
}
