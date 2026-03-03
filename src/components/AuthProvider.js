'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

const AuthContext = createContext({
    user: null,
    session: null,
    loading: true,
    supabaseAvailable: false,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const supabaseAvailable = isSupabaseConfigured();
    const supabase = supabaseAvailable ? getSupabaseClient() : null;

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        // Obtener sesión actual
        const getSession = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
            } catch (error) {
                console.error('[AuthProvider] Error getting session:', error);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, newSession) => {
                setSession(newSession);
                setUser(newSession?.user ?? null);
                setLoading(false);
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, [supabase]);

    const signInWithGoogle = async () => {
        if (!supabase) {
            console.error('[AuthProvider] Cannot sign in: Supabase not configured');
            return { error: 'Supabase no está configurado' };
        }

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error('[AuthProvider] Sign in error:', error);
            return { error: error.message };
        }

        return { data };
    };

    const signOut = async () => {
        if (!supabase) return;

        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('[AuthProvider] Sign out error:', error);
        } else {
            setUser(null);
            setSession(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                supabaseAvailable,
                signInWithGoogle,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
