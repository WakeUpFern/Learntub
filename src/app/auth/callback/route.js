import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /auth/callback — Maneja el redirect de OAuth de Supabase.
 * Intercambia el código por una sesión y redirige al dashboard.
 */
export async function GET(request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const cookieStore = await cookies();

        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            try {
                                cookieStore.set(name, value, options);
                            } catch {
                                // Ignore errors in server components
                            }
                        });
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            console.error('[Auth Callback] Error exchanging code:', error);
            return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
        }
    }

    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
