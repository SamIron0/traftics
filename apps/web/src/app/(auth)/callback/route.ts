import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
      const supabase = createRouteHandlerClient({ cookies: () => cookies() });
      await supabase.auth.exchangeCodeForSession(code);

      // After successful authentication, check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('is_onboarded')
          .eq('user_id', user.id)
          .single();

        // Redirect to onboarding if not completed, otherwise to dashboard
        if (!profile?.is_onboarded) {
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
      }
    }

    // Default redirect to dashboard
    return NextResponse.redirect(new URL('/dashboards', request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
} 