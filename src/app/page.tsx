'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CodeKootuLanding } from '@/components/landing/CodeKootuLanding';

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
    <>
      <Suspense fallback={null}>
        <AuthCodeCatcher />
      </Suspense>
      <CodeKootuLanding />
    </>
  );
}
