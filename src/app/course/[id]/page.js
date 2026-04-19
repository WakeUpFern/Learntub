'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import YouTubePlayer from '@/components/YouTubePlayer';
import { getCourse, toggleModuleComplete } from '@/lib/store';
import { secondsToTimestamp, formatDuration } from '@/lib/chapterParser';

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [course, setCourse] = useState(null);
    const [activeModule, setActiveModule] = useState(null);
    const [mounted, setMounted] = useState(false);

    const userId = user?.id || null;

    const loadCourse = useCallback(async () => {
        const data = await getCourse(params.id, userId);
        if (!data) { router.push('/dashboard'); return; }
        setCourse(data);
        if (!activeModule && data.modules.length > 0) {
            const firstIncomplete = data.modules.find(m => !m.isCompleted);
            setActiveModule(firstIncomplete || data.modules[0]);
        }
    }, [params.id, router, activeModule, userId]);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (mounted && !authLoading) loadCourse();
    }, [mounted, authLoading, loadCourse]);

    const handleToggleComplete = async (moduleId) => {
        const moduleToToggle = course.modules.find(m => m.id === moduleId);
        const wasCompleted = moduleToToggle?.isCompleted;

        await toggleModuleComplete(moduleId, userId);
        const updatedCourse = await getCourse(params.id, userId);
        setCourse(updatedCourse);

        // Si se acaba de marcar como completado y es el que estamos viendo
        if (!wasCompleted && activeModule?.id === moduleId) {
            const currentIdx = updatedCourse.modules.findIndex(m => m.id === moduleId);
            if (currentIdx < updatedCourse.modules.length - 1) {
                // Saltamos al siguiente módulo inmediatamente
                setActiveModule(updatedCourse.modules[currentIdx + 1]);
            } else {
                // Es el último módulo, solo actualizamos su estado visual
                setActiveModule(updatedCourse.modules[currentIdx]);
            }
        } else if (activeModule?.id === moduleId) {
            // Si se desmarcó (wasCompleted era true), solo actualizamos el estado visual
            const updatedMod = updatedCourse.modules.find(m => m.id === moduleId);
            if (updatedMod) setActiveModule(updatedMod);
        }
    };

    const handleModuleEnded = async () => {
        if (!activeModule || !course) return;
        
        // Marcar como completado en el servidor
        if (!activeModule.isCompleted) {
            await toggleModuleComplete(activeModule.id, userId);
        }

        // Obtener datos frescos para que la lista lateral se actualice
        const updatedCourse = await getCourse(params.id, userId);
        setCourse(updatedCourse);

        // Avanzar al siguiente módulo
        const currentIdx = updatedCourse.modules.findIndex(m => m.id === activeModule.id);
        if (currentIdx < updatedCourse.modules.length - 1) {
            setActiveModule(updatedCourse.modules[currentIdx + 1]);
        }
    };

    if (!mounted || authLoading || !course) return null;

    const progressPct = course.totalModules > 0
        ? Math.round((course.completedModules / course.totalModules) * 100)
        : 0;

    return (
        <div className="course-page">
            {/* SIDEBAR: árbol de módulos */}
            <aside className="course-sidebar">
                {/* Cabecera con logo y link al dashboard */}
                <div className="sidebar-logo">
                    <button
                        style={{ border: 'none !important', background: 'none', padding: 0, cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'inherit' }}
                        onClick={() => router.push('/dashboard')}
                    >
                        ← Learntub
                    </button>
                </div>

                {/* Info del curso */}
                <div className="course-sidebar-header">
                    <div className="course-sidebar-title">{course.title}</div>
                    <div className="course-sidebar-channel">{course.channelName}</div>
                </div>

                {/* Barra de progreso */}
                <div className="course-sidebar-progress">
                    <span>{course.completedModules}/{course.totalModules} módulos — {progressPct}%</span>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                </div>

                {/* Lista de módulos */}
                <div className="module-list">
                    <div className="module-list-header">
                        <span>Módulos</span>
                        <span>{course.completedModules}/{course.totalModules}</span>
                    </div>
                    {course.modules.map((mod, index) => (
                        <div
                            key={mod.id}
                            className={`module-item ${activeModule?.id === mod.id ? 'active' : ''} ${mod.isCompleted ? 'completed' : ''}`}
                            onClick={() => setActiveModule(mod)}
                        >
                            <button
                                className={`module-check ${mod.isCompleted ? 'done' : ''}`}
                                onClick={(e) => { e.stopPropagation(); handleToggleComplete(mod.id); }}
                                title={mod.isCompleted ? 'Marcar incompleto' : 'Marcar completo'}
                            >
                                {mod.isCompleted ? '✓' : ''}
                            </button>
                            <div className="module-text">
                                <span className="module-title">{index + 1}. {mod.title}</span>
                                <span className="module-time">
                                    {secondsToTimestamp(mod.startTime)}
                                    {mod.endTime != null && ` — ${formatDuration(mod.startTime, mod.endTime)}`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* ÁREA PRINCIPAL: player */}
            <main className="course-main">
                <div className="course-topbar">
                    <h2>{activeModule ? activeModule.title : course.title}</h2>
                    <span className="channel">{course.channelName}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '12px' }}>{progressPct}% completado</span>
                </div>

                {activeModule ? (
                    <>
                        <div className="course-player-wrap">
                            <YouTubePlayer
                                videoId={course.youtubeId}
                                startTime={activeModule.startTime}
                                endTime={activeModule.endTime}
                                onEnded={handleModuleEnded}
                                autoplay={true}
                            />
                        </div>
                        <div className="active-module-info">
                            <div>
                                <div className="ami-label">Módulo {activeModule.position}</div>
                                <div className="ami-title">{activeModule.title}</div>
                            </div>
                            <button
                                className={activeModule.isCompleted ? 'btn-primary' : ''}
                                onClick={() => handleToggleComplete(activeModule.id)}
                            >
                                {activeModule.isCompleted ? '✓ Completado' : 'Marcar Completado'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: '40px 24px', fontSize: '13px', color: '#555' }}>
                        Selecciona un módulo de la lista para comenzar.
                    </div>
                )}
            </main>
        </div>
    );
}
