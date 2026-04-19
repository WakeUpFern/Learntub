'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
    const router = useRouter();
    const { user, loading, supabaseAvailable, signInWithGoogle } = useAuth();
    const [error, setError] = useState('');
    const [signingIn, setSigningIn] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setMounted(true);
        setTimeout(() => setVisible(true), 50);

        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === 'auth_failed') {
            setError('Error en la autenticación. Inténtalo de nuevo.');
        }
    }, []);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleGoogleLogin = async () => {
        setError('');
        setSigningIn(true);
        const result = await signInWithGoogle();
        if (result?.error) {
            setError(result.error);
            setSigningIn(false);
        }
    };

    const handleOfflineMode = () => router.push('/dashboard');

    if (!mounted || loading) return null;
    if (user) return null;

    return (
        <div className="login-page">
            <div className="login-box">
                <div className="login-box-header">
                    <h1>Learntub</h1>
                    <p>Sistema de gestión de aprendizaje por video</p>
                </div>
                <div className="login-box-body">
                    {supabaseAvailable ? (
                        <>
                            <button
                                className="btn-google"
                                onClick={handleGoogleLogin}
                                disabled={signingIn}
                                id="btn-google-signin"
                                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                            >
                                {signingIn ? (
                                    <><span className="spinner" /> Redirigiendo...</>
                                ) : (
                                    <><svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg> Continuar con Google</>
                                )}
                            </button>
                            {error && <div className="login-error">{error}</div>}
                            <div className="login-divider">o continuar sin cuenta</div>
                            <button
                                onClick={handleOfflineMode}
                                id="btn-offline-mode"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                Modo Offline
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="login-error">
                                Supabase no configurado. Agrega credenciales en <code>.env.local</code>.
                            </div>
                            <button onClick={handleOfflineMode} style={{ width: '100%', justifyContent: 'center' }}>
                                Continuar en Modo Offline
                            </button>
                        </>
                    )}
                    <p className="login-footer-note">Solo usamos Google para autenticarte. Sin contraseñas.</p>
                </div>
            </div>
        </div>
    );
}
