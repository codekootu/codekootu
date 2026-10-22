'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';

export async function submitIdeaAction(data: any) {
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
  
  // Grab the IP address from Next.js headers
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'Unknown IP';

  const { error } = await supabase.from('ideas').insert({
    ...data,
    ip_address: ip,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true };
}
