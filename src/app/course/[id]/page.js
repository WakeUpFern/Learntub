'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import YouTubePlayer from '@/components/YouTubePlayer';
import ModuleList from '@/components/ModuleList';
import { getCourse, toggleModuleComplete } from '@/lib/store';

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
        if (!data) {
            router.push('/dashboard');
            return;
        }
        setCourse(data);

        // Si no hay módulo activo, seleccionar el primero no completado
        if (!activeModule && data.modules.length > 0) {
            const firstIncomplete = data.modules.find(m => !m.isCompleted);
            setActiveModule(firstIncomplete || data.modules[0]);
        }
    }, [params.id, router, activeModule, userId]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !authLoading) {
            loadCourse();
        }
    }, [mounted, authLoading, loadCourse]);

    const handleToggleComplete = async (moduleId) => {
        await toggleModuleComplete(moduleId, userId);
        await loadCourse();
        // Actualizar el módulo activo si cambió
        if (activeModule && activeModule.id === moduleId) {
            const updated = await getCourse(params.id, userId);
            const updatedMod = updated?.modules.find(m => m.id === moduleId);
            if (updatedMod) setActiveModule(updatedMod);
        }
    };

    const handleSelectModule = (mod) => {
        setActiveModule(mod);
    };

    const handleModuleEnded = async () => {
        if (!activeModule || !course) return;

        // Auto-completar el módulo si terminó
        if (!activeModule.isCompleted) {
            await toggleModuleComplete(activeModule.id, userId);
        }

        // Avanzar al siguiente módulo
        const currentIdx = course.modules.findIndex(m => m.id === activeModule.id);
        if (currentIdx < course.modules.length - 1) {
            const nextModule = course.modules[currentIdx + 1];
            setActiveModule(nextModule);
        }

        await loadCourse();
    };

    if (!mounted || authLoading || !course) return null;

    const progressPercent = course.totalModules > 0
        ? Math.round((course.completedModules / course.totalModules) * 100)
        : 0;

    return (
        <div className="course-page">
            {/* Top Bar */}
            <header className="course-topbar">
                <button className="btn-back" onClick={() => router.push('/dashboard')}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Dashboard
                </button>
                <div className="topbar-info">
                    <h2>{course.title}</h2>
                    <span className="topbar-channel">{course.channelName}</span>
                </div>
                <div className="topbar-progress">
                    <span className="progress-text">{progressPercent}% completado</span>
                    <div className="topbar-progress-bar">
                        <div className="topbar-progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="course-content">
                {/* Video Player */}
                <div className="course-player-section">
                    {activeModule ? (
                        <>
                            <YouTubePlayer
                                videoId={course.youtubeId}
                                startTime={activeModule.startTime}
                                endTime={activeModule.endTime}
                                onEnded={handleModuleEnded}
                                autoplay={true}
                            />
                            <div className="active-module-info">
                                <div className="ami-header">
                                    <span className="ami-number">Módulo {activeModule.position}</span>
                                    <h3 className="ami-title">{activeModule.title}</h3>
                                </div>
                                <button
                                    className={`btn-mark-complete ${activeModule.isCompleted ? 'completed' : ''}`}
                                    onClick={() => handleToggleComplete(activeModule.id)}
                                >
                                    {activeModule.isCompleted ? (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                                <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                                                <path d="M5.5 9.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Completado
                                        </>
                                    ) : (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                                <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                                            </svg>
                                            Marcar Completado
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="no-module-selected">
                            <p>Selecciona un módulo de la lista para comenzar.</p>
                        </div>
                    )}
                </div>

                {/* Module List */}
                <div className="course-modules-section">
                    <ModuleList
                        modules={course.modules}
                        activeModuleId={activeModule?.id}
                        onSelectModule={handleSelectModule}
                        onToggleComplete={handleToggleComplete}
                    />
                </div>
            </div>
        </div>
    );
}
