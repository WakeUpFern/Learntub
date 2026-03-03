'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import CourseCard from '@/components/CourseCard';
import AddCourseModal from '@/components/AddCourseModal';
import { getCourses, addCourse, deleteCourse, getProgress } from '@/lib/store';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading, supabaseAvailable, signOut } = useAuth();
    const [courses, setCourses] = useState([]);
    const [filter, setFilter] = useState('all'); // all | inProgress | completed
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState({ totalCourses: 0, completedCourses: 0, totalModules: 0, completedModules: 0 });
    const [mounted, setMounted] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    const userId = user?.id || null;

    const loadData = useCallback(async () => {
        setDataLoading(true);
        try {
            const [coursesData, progressData] = await Promise.all([
                getCourses(userId),
                getProgress(userId),
            ]);
            setCourses(coursesData);
            setStats(progressData);
        } catch (err) {
            console.error('[Dashboard] Error loading data:', err);
        } finally {
            setDataLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !authLoading) {
            loadData();
        }
    }, [mounted, authLoading, loadData]);

    const [saveError, setSaveError] = useState('');

    const handleAddCourse = async (courseData) => {
        setSaveError('');
        const result = await addCourse(courseData, userId);
        if (result?.error) {
            setSaveError(`Error al guardar: ${result.error}`);
            console.error('[Dashboard] addCourse failed:', result.error);
        }
        await loadData();
    };

    const handleDeleteCourse = async (id) => {
        await deleteCourse(id, userId);
        await loadData();
    };

    const handleOpenCourse = (id) => {
        router.push(`/course/${id}`);
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    const filteredCourses = courses.filter(course => {
        if (filter === 'inProgress') {
            return course.completedModules > 0 && course.completedModules < course.totalModules;
        }
        if (filter === 'completed') {
            return course.totalModules > 0 && course.completedModules === course.totalModules;
        }
        return true;
    });

    if (!mounted || authLoading) return null;

    return (
        <div className="dashboard-page">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-logo">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <rect width="28" height="28" rx="8" fill="url(#logo-grad)" />
                        <path d="M10 8l10 6-10 6V8z" fill="white" />
                        <defs>
                            <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28">
                                <stop stopColor="#7c3aed" />
                                <stop offset="1" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="logo-text">LearnTube</span>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`sidebar-link ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <rect x="1" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="10" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="1" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="10" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        Todos los Cursos
                        <span className="sidebar-count">{courses.length}</span>
                    </button>
                    <button
                        className={`sidebar-link ${filter === 'inProgress' ? 'active' : ''}`}
                        onClick={() => setFilter('inProgress')}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M9 4.5v4.5l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        En Progreso
                    </button>
                    <button
                        className={`sidebar-link ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M5.5 9.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Completados
                    </button>
                </nav>

                <div className="sidebar-stats">
                    <h4>Tu Progreso</h4>
                    <div className="stat-item">
                        <span className="stat-label">Cursos</span>
                        <span className="stat-value">{stats.completedCourses}/{stats.totalCourses}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Módulos</span>
                        <span className="stat-value">{stats.completedModules}/{stats.totalModules}</span>
                    </div>
                    <div className="stat-bar">
                        <div
                            className="stat-bar-fill"
                            style={{
                                width: `${stats.totalModules > 0 ? (stats.completedModules / stats.totalModules) * 100 : 0}%`
                            }}
                        />
                    </div>
                </div>

                {/* Status & User Section */}
                <div className="sidebar-bottom">

                    {user ? (
                        <div className="sidebar-user">
                            <div className="user-info">
                                {user.user_metadata?.avatar_url ? (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt=""
                                        className="user-avatar"
                                    />
                                ) : (
                                    <div className="user-avatar-placeholder">
                                        {(user.user_metadata?.full_name || user.email || '?').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="user-text">
                                    <span className="user-name">{user.user_metadata?.full_name || 'Usuario'}</span>
                                    <span className="user-email">{user.email}</span>
                                </div>
                            </div>
                            <button className="btn-logout" onClick={handleSignOut} title="Cerrar sesión">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M6 14H3.33a1.33 1.33 0 01-1.33-1.33V3.33A1.33 1.33 0 013.33 2H6M10.67 11.33L14 8l-3.33-3.33M14 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="sidebar-offline">
                            <span className="offline-badge">Modo Offline</span>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <h1>Mis Cursos</h1>
                        <p className="dashboard-subtitle">
                            {courses.length === 0
                                ? 'Agrega tu primer curso para comenzar'
                                : `${courses.length} curso${courses.length !== 1 ? 's' : ''} en tu biblioteca`
                            }
                        </p>
                    </div>
                    <button className="btn-add-course" onClick={() => setIsModalOpen(true)}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Agregar Curso
                    </button>
                </header>

                {saveError && (
                    <div className="dashboard-error-banner">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 5v3M8 10.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        {saveError}
                        <button onClick={() => setSaveError('')} className="banner-close" aria-label="Cerrar">✕</button>
                    </div>
                )}

                {dataLoading ? (
                    <div className="dashboard-loading">
                        <span className="spinner large" />
                        <p>Cargando cursos...</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="dashboard-empty">
                        {courses.length === 0 ? (
                            <>
                                <div className="empty-illustration">
                                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                                        <circle cx="60" cy="60" r="50" fill="url(#empty-grad)" fillOpacity="0.1" />
                                        <rect x="35" y="40" width="50" height="35" rx="6" stroke="url(#empty-grad)" strokeWidth="2" strokeDasharray="4 4" />
                                        <path d="M55 52l12 7.5-12 7.5V52z" fill="url(#empty-grad)" fillOpacity="0.5" />
                                        <path d="M60 85v10M50 95h20" stroke="url(#empty-grad)" strokeWidth="2" strokeLinecap="round" />
                                        <defs>
                                            <linearGradient id="empty-grad" x1="30" y1="30" x2="90" y2="90">
                                                <stop stopColor="#7c3aed" />
                                                <stop offset="1" stopColor="#a855f7" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <h2>Empieza tu Viaje de Aprendizaje</h2>
                                <p>Pega un link de YouTube con capítulos y conviértelo en un curso estructurado.</p>
                                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                                    Agregar mi Primer Curso
                                </button>
                            </>
                        ) : (
                            <>
                                <h2>No hay cursos en esta categoría</h2>
                                <p>Prueba con otro filtro o agrega un nuevo curso.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="course-grid">
                        {filteredCourses.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onOpen={handleOpenCourse}
                                onDelete={handleDeleteCourse}
                            />
                        ))}
                    </div>
                )}
            </main>

            <AddCourseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddCourse}
            />
        </div>
    );
}
