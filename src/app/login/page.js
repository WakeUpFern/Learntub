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
            {/* Animated background */}
            <div className="landing-bg" aria-hidden>
                <div className="bg-orb bg-orb-1" />
                <div className="bg-orb bg-orb-2" />
                <div className="bg-orb bg-orb-3" />
            </div>

            <div className={`login-split ${visible ? 'visible' : ''}`}>
                {/* ── Left: Branding ── */}
                <div className="login-branding">
                    <div className="login-logo">
                        <svg width="44" height="44" viewBox="0 0 28 28" fill="none">
                            <rect width="28" height="28" rx="8" fill="url(#ll-grad)" />
                            <path d="M10 8l10 6-10 6V8z" fill="white" />
                            <defs>
                                <linearGradient id="ll-grad" x1="0" y1="0" x2="28" y2="28">
                                    <stop stopColor="#7c3aed" />
                                    <stop offset="1" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="login-logo-name">LearnTube</span>
                    </div>

                    <h1 className="login-headline">
                        Aprende con<br />
                        <span className="gradient-text">estructura real</span>
                    </h1>
                    <p className="login-tagline">
                        Convierte cualquier video de YouTube en un curso con capítulos, progreso y sincronización en la nube.
                    </p>

                    <ul className="login-features">
                        <li>
                            <div className="lf-icon">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2l1.6 3.2 3.4.5-2.5 2.4.6 3.5L8 9.9l-3.1 1.7.6-3.5L3 5.7l3.4-.5L8 2z" fill="currentColor" />
                                </svg>
                            </div>
                            <span>Capítulos detectados automáticamente</span>
                        </li>
                        <li>
                            <div className="lf-icon">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span>Progreso guardado en la nube</span>
                        </li>
                        <li>
                            <div className="lf-icon">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <rect x="2" y="3" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M6 3v9M10 3v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <span>Player integrado por módulo</span>
                        </li>
                        <li>
                            <div className="lf-icon">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 1v6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <span>Historial y estadísticas</span>
                        </li>
                    </ul>
                </div>

                {/* ── Right: Auth Card ── */}
                <div className="login-card-wrapper">
                    <div className="login-card">
                        <div className="login-card-header">
                            <h2>Bienvenido</h2>
                            <p className="login-subtitle">
                                {supabaseAvailable
                                    ? 'Inicia sesión para sincronizar tu progreso en todos los dispositivos.'
                                    : 'Usa el modo offline para guardar localmente en este dispositivo.'}
                            </p>
                        </div>

                        {supabaseAvailable ? (
                            <>
                                <button
                                    className={`btn-google ${signingIn ? 'loading' : ''}`}
                                    onClick={handleGoogleLogin}
                                    disabled={signingIn}
                                    id="btn-google-signin"
                                >
                                    {signingIn ? (
                                        <>
                                            <span className="spinner dark" />
                                            <span>Redirigiendo a Google…</span>
                                        </>
                                    ) : (
                                        <>
                                            {/* Official Google G */}
                                            <svg width="20" height="20" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            <span>Continuar con Google</span>
                                        </>
                                    )}
                                </button>

                                {error && (
                                    <div className="login-error" role="alert">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                                            <path d="M8 5v3M8 10.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                <div className="login-divider"><span>o</span></div>

                                <button className="btn-offline" onClick={handleOfflineMode} id="btn-offline-mode">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M9 2v4M9 12v4M2 9h4M12 9h4M4.22 4.22l2.83 2.83M10.95 10.95l2.83 2.83M4.22 13.78l2.83-2.83M10.95 7.05l2.83-2.83" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                    </svg>
                                    Continuar sin cuenta
                                    <span className="offline-hint">Los datos se guardarán en este dispositivo</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="login-warning">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                                        <path d="M10 6v4M10 14h.01M3.86 17h12.28a2 2 0 001.72-3L11.72 3a2 2 0 00-3.44 0L2.14 14a2 2 0 001.72 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div>
                                        <strong>Supabase no configurado</strong>
                                        <p>Agrega tus credenciales en <code>.env.local</code> para activar auth y sincronización.</p>
                                    </div>
                                </div>
                                <button className="btn-offline" onClick={handleOfflineMode} id="btn-offline-mode">
                                    Continuar en Modo Offline
                                    <span className="offline-hint">Los datos se guardan en localStorage</span>
                                </button>
                            </>
                        )}

                        <p className="login-footer">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}>
                                <rect x="1.5" y="5.5" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                                <path d="M4 5.5V4a2.5 2.5 0 015 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                            Solo usamos Google para autenticarte. Sin contraseñas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
