'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getProgress, getActivityHistory } from '@/lib/store';

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ totalCourses: 0, completedCourses: 0, totalModules: 0, completedModules: 0, topChannels: [] });
    const [activity, setActivity] = useState({ historyMap: {}, streak: 0 });
    const [mounted, setMounted] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [hoveredDay, setHoveredDay] = useState(null);
    const [theme, setTheme] = useState('light');
    const [autoplay, setAutoplay] = useState(true);

    // Cargar ajustes del sistema en montaje
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setTheme(localStorage.getItem('learntub_theme') || 'light');
            const savedAutoplay = localStorage.getItem('learntub_autoplay');
            setAutoplay(savedAutoplay === null ? true : savedAutoplay === 'true');
        }
    }, []);

    const userId = user?.id || null;

    const loadData = useCallback(async () => {
        setDataLoading(true);
        try {
            const [progressData, historyData] = await Promise.all([
                getProgress(userId),
                getActivityHistory(userId),
            ]);
            setStats(progressData);
            setActivity(historyData);
        } catch (err) {
            console.error('[Profile] Error loading data:', err);
        } finally {
            setDataLoading(false);
        }
    }, [userId]);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (mounted && !authLoading) loadData();
    }, [mounted, authLoading, loadData]);

    if (!mounted || authLoading) return null;

    const progressPct = stats.totalModules > 0
        ? Math.round((stats.completedModules / stats.totalModules) * 100)
        : 0;

    // Generar últimos 90 días para el heatmap
    const days = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayKey = d.toISOString().split('T')[0];
        const count = activity.historyMap[dayKey] || 0;
        days.push({ date: dayKey, count });
    }

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('learntub_theme', newTheme);
        window.dispatchEvent(new CustomEvent('theme-update', { detail: newTheme }));
    };

    const handleAutoplayChange = (val) => {
        setAutoplay(val);
        localStorage.setItem('learntub_autoplay', val);
    };

    // Calcular nivel de usuario (Logro)
    const getLevel = () => {
        if (stats.completedModules >= 100) return { name: 'Arquitecto del Conocimiento', color: '#000', bg: '#ffd700' };
        if (stats.completedModules >= 50) return { name: 'Especialista Técnico', color: '#fff', bg: '#000' };
        if (stats.completedModules >= 10) return { name: 'Aprendiz Avanzado', color: '#000', bg: '#ccc' };
        return { name: 'Iniciando Trayectoria', color: '#555', bg: '#f0f0f0' };
    };
    const level = getLevel();

    return (
        <div className="dashboard-page" style={{ background: 'var(--bg, #f8f8f8)' }}>
            <main className="dashboard-main" style={{ padding: '40px 24px', maxWidth: '1000px', margin: '0 auto', background: 'transparent' }}>
                
                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button 
                            className="btn-back"
                            style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} 
                            onClick={() => router.push('/dashboard')}
                        >
                            <span>←</span> DASHBOARD
                        </button>
                        <h1 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            PERFIL DE OPERADOR
                        </h1>
                    </div>
                    <div style={{ padding: '4px 12px', background: level.bg, color: level.color, border: '2px solid var(--border-color, #000)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        RANGO: {level.name}
                    </div>
                </div>

                {dataLoading ? (
                    <div style={{ padding: '100px', textAlign: 'center', fontSize: '13px', border: '2px dashed var(--border-color, #ccc)' }}>
                        <span className="spinner" style={{ marginBottom: '16px' }}></span>
                        <p>SINCRONIZANDO DATOS DEL SISTEMA...</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
                        
                        {/* COLUMNA IZQUIERDA (Principal) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            
                            {/* INFO USUARIO Y RACHA */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '2px', background: 'var(--border-color, #000)', border: '2px solid var(--border-color, #000)' }}>
                                <div style={{ background: 'var(--bg, #fff)', padding: '32px', display: 'flex', alignItems: 'center', gap: '32px' }}>
                                    {user?.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="" style={{ width: '100px', height: '100px', border: '2px solid var(--border-color, #000)', objectFit: 'cover' }} />
                                    ) : (
                                        <div className="user-avatar-placeholder" style={{ width: '100px', height: '100px', fontSize: '40px' }}>
                                            {(user?.user_metadata?.full_name || user?.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h2 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase' }}>{user?.user_metadata?.full_name || 'Usuario'}</h2>
                                        <p style={{ fontSize: '14px', color: 'var(--muted, #555)', fontFamily: 'monospace' }}>ID: {user?.id?.slice(0, 18) || 'LOCAL_GUEST'}</p>
                                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                                            <span style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid var(--border-color, #000)', fontWeight: 'bold' }}>ACTIVE_SESSION</span>
                                            <span style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid var(--border-color, #000)', fontWeight: 'bold', background: 'var(--success-bg, #000)', color: 'var(--success-fg, #fff)' }}>VERIFIED</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ background: 'var(--bg, #fff)', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--muted, #777)', textTransform: 'uppercase', marginBottom: '4px' }}>Racha Actual</div>
                                    <div style={{ fontSize: '48px', fontWeight: '900', lineHeight: '1' }}>{activity.streak}</div>
                                    <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Días</div>
                                </div>
                            </div>

                            {/* HEATMAP */}
                            <div style={{ background: 'var(--bg, #fff)', border: '2px solid var(--border-color, #000)', padding: '32px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Registro de Actividad (Últimos 90 días)</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[0, 1, 3, 6].map(v => {
                                            let bg = 'var(--muted-bg, #f0f0f0)';
                                            if (v > 0) bg = v <= 2 ? 'var(--muted, #ccc)' : v <= 5 ? '#777' : 'var(--fg, #000)';
                                            return <div key={v} style={{ width: '10px', height: '10px', background: bg, border: '1px solid var(--border-color, #ddd)' }} />
                                        })}
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {days.map((day, i) => {
                                        let bg = 'var(--muted-bg, #f0f0f0)';
                                        let border = '#e0e0e0';
                                        if (day.count > 0 && day.count <= 2) { bg = 'var(--muted, #ccc)'; border = '#bbb'; }
                                        else if (day.count > 2 && day.count <= 5) { bg = '#777'; border = '#666'; }
                                        else if (day.count > 5) { bg = 'var(--fg, #000)'; border = 'var(--border-color, #000)'; }

                                        return (
                                            <div 
                                                key={i} 
                                                style={{ 
                                                    width: '16px', 
                                                    height: '16px', 
                                                    background: bg,
                                                    border: `1px solid ${border}`,
                                                    transition: 'transform 0.1s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.2)';
                                                    setHoveredDay(day);
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    setHoveredDay(null);
                                                }}
                                            />
                                        );
                                    })}
                                </div>

                                {/* Status Bar for Activity */}
                                <div style={{ 
                                    marginTop: '24px', 
                                    padding: '12px', 
                                    background: 'var(--muted-bg, #f8f8f8)', 
                                    border: '1px solid var(--border-color, #000)', 
                                    fontSize: '11px', 
                                    fontFamily: 'monospace',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    {hoveredDay ? (
                                        <>
                                            <span>DATOS_FECHA: {hoveredDay.date}</span>
                                            <span style={{ fontWeight: 'bold' }}>MÓDULOS_COMPLETADOS: {hoveredDay.count}</span>
                                        </>
                                    ) : (
                                        <span style={{ color: 'var(--muted, #aaa)' }}>PASE EL MOUSE SOBRE UN RECUADRO PARA VER DETALLES</span>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* COLUMNA DERECHA (Stats secundarios y Ajustes) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            
                            {/* MÉTRICAS RÁPIDAS */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'var(--border-color, #000)', border: '2px solid var(--border-color, #000)' }}>
                                <div style={{ background: 'var(--bg, #fff)', padding: '20px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--muted, #777)', textTransform: 'uppercase' }}>Cursos Finalizados</div>
                                    <div style={{ fontSize: '24px', fontWeight: '900' }}>{stats.completedCourses} <span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--muted, #aaa)' }}>/ {stats.totalCourses}</span></div>
                                </div>
                                <div style={{ background: 'var(--bg, #fff)', padding: '20px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--muted, #777)', textTransform: 'uppercase' }}>Módulos Totales</div>
                                    <div style={{ fontSize: '24px', fontWeight: '900' }}>{stats.completedModules}</div>
                                    <div style={{ height: '4px', background: 'var(--muted-bg, #f0f0f0)', marginTop: '12px' }}>
                                        <div style={{ height: '100%', background: 'var(--fg, #000)', width: `${progressPct}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* CONFIGURACIÓN DEL SISTEMA */}
                            <div style={{ background: 'var(--bg, #fff)', border: '2px solid var(--border-color, #000)', padding: '24px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid var(--border-color, #000)', paddingBottom: '8px' }}>
                                    Ajustes del Sistema
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                    {/* Autoplay */}
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>REPRODUCCIÓN AUTOMÁTICA</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button 
                                                className="btn"
                                                style={{ flex: 1, padding: '6px', background: autoplay ? 'var(--fg, #000)' : 'var(--bg, #fff)', color: autoplay ? 'var(--bg, #fff)' : 'var(--fg, #000)' }}
                                                onClick={() => handleAutoplayChange(true)}
                                            >
                                                ACTIVADO
                                            </button>
                                            <button 
                                                className="btn"
                                                style={{ flex: 1, padding: '6px', background: !autoplay ? 'var(--fg, #000)' : 'var(--bg, #fff)', color: !autoplay ? 'var(--bg, #fff)' : 'var(--fg, #000)' }}
                                                onClick={() => handleAutoplayChange(false)}
                                            >
                                                DESACTIVADO
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sincronización Manual (Placeholder Funcional) */}
                                    <div style={{ marginTop: '8px' }}>
                                        <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => loadData()}>
                                            FORZAR SINCRONIZACIÓN
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* TOP CANALES */}
                            <div style={{ background: 'var(--bg, #fff)', border: '2px solid var(--border-color, #000)', padding: '24px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid var(--border-color, #000)', paddingBottom: '8px' }}>
                                    Fuentes Principales
                                </div>
                                {stats.topChannels?.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {stats.topChannels.map((ch, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{ch.name}</span>
                                                <span style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--muted-bg, #f0f0f0)', border: '1px solid var(--border-color, #ccc)' }}>{ch.count} c.</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '11px', color: 'var(--muted, #999)', fontStyle: 'italic' }}>Sin datos de origen...</div>
                                )}
                            </div>

                            {/* LOGROS (Badges) */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {stats.completedModules > 0 && <Badge label="OPERADOR_ACTIVO" />}
                                {activity.streak >= 3 && <Badge label="CONSTANCIA_LVL1" bg="var(--fg, #000)" color="var(--bg, #fff)" />}
                                {stats.completedCourses > 0 && <Badge label="FINALIZADOR" />}
                                {stats.totalCourses >= 5 && <Badge label="COLECCIONISTA" />}
                            </div>

                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}

function Badge({ label, bg = 'var(--bg, #fff)', color = 'var(--fg, #000)' }) {
    return (
        <div style={{ 
            fontSize: '9px', 
            fontWeight: '900', 
            padding: '4px 8px', 
            background: bg, 
            color: color, 
            border: '2px solid var(--border-color, #000)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        }}>
            {label}
        </div>
    );
}
