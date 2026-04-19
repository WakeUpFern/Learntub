'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import AddCourseModal from '@/components/AddCourseModal';
import { getCourses, addCourse, deleteCourse, getProgress } from '@/lib/store';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading, signOut } = useAuth();
    const [courses, setCourses] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState({ totalCourses: 0, completedCourses: 0, totalModules: 0, completedModules: 0 });
    const [mounted, setMounted] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [saveError, setSaveError] = useState('');

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

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (mounted && !authLoading) loadData();
    }, [mounted, authLoading, loadData]);

    const handleAddCourse = async (courseData) => {
        setSaveError('');
        const result = await addCourse(courseData, userId);
        if (result?.error) setSaveError(`Error al guardar: ${result.error}`);
        await loadData();
    };

    const handleDeleteCourse = async (id) => {
        if (!confirm('¿Eliminar este curso?')) return;
        await deleteCourse(id, userId);
        await loadData();
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    const filteredCourses = courses.filter(course => {
        if (filter === 'inProgress') return course.completedModules > 0 && course.completedModules < course.totalModules;
        if (filter === 'completed') return course.totalModules > 0 && course.completedModules === course.totalModules;
        return true;
    });

    const progressPct = stats.totalModules > 0
        ? Math.round((stats.completedModules / stats.totalModules) * 100)
        : 0;

    if (!mounted || authLoading) return null;

    return (
        <div className="dashboard-page">
            {/* SIDEBAR */}
            <aside className="sidebar">
                <div className="sidebar-logo">Learntub</div>

                {/* Filtros de navegación */}
                <div className="sidebar-section-label">Biblioteca</div>
                <nav className="sidebar-nav">
                    <button
                        className={`sidebar-link ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Todos los Cursos
                        <span className="count">{courses.length}</span>
                    </button>
                    <button
                        className={`sidebar-link ${filter === 'inProgress' ? 'active' : ''}`}
                        onClick={() => setFilter('inProgress')}
                    >
                        En Progreso
                    </button>
                    <button
                        className={`sidebar-link ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completados
                    </button>
                </nav>

                {/* Árbol de cursos en sidebar */}
                {courses.length > 0 && (
                    <>
                        <div className="sidebar-section-label">Cursos</div>
                        {courses.map((course, i) => {
                            const pct = course.totalModules > 0
                                ? Math.round((course.completedModules / course.totalModules) * 100)
                                : 0;
                            const isDone = pct === 100 && course.totalModules > 0;
                            return (
                                <button
                                    key={course.id}
                                    className={`sidebar-tree-item ${isDone ? 'done' : ''}`}
                                    onClick={() => router.push(`/course/${course.id}`)}
                                    title={course.title}
                                >
                                    {String(i + 1).padStart(2, '0')}. {course.title.length > 22 ? course.title.slice(0, 22) + '…' : course.title}
                                </button>
                            );
                        })}
                    </>
                )}

                {/* Estadísticas */}
                <div className="sidebar-stats">
                    <div className="sidebar-stats-title">Tu Progreso</div>
                    <div className="stat-row">
                        <span>Cursos</span>
                        <span>{stats.completedCourses}/{stats.totalCourses}</span>
                    </div>
                    <div className="stat-row">
                        <span>Módulos</span>
                        <span>{stats.completedModules}/{stats.totalModules}</span>
                    </div>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                </div>

                {/* Usuario */}
                {user ? (
                    <div 
                        className="sidebar-user" 
                        style={{ cursor: 'pointer', transition: 'background 0.2s', padding: '12px', borderRadius: '8px', border: '1px solid transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ccc'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        onClick={() => router.push('/profile')}
                    >
                        {user.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="" className="user-avatar" />
                        ) : (
                            <div className="user-avatar-placeholder">
                                {(user.user_metadata?.full_name || user.email || '?').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <span className="user-name">{user.user_metadata?.full_name || 'Usuario'}</span>
                            <span className="user-email">{user.email}</span>
                        </div>
                        <button className="btn-logout" onClick={(e) => { e.stopPropagation(); handleSignOut(); }} title="Salir">
                            ×
                        </button>
                    </div>
                ) : (
                    <div className="sidebar-user">
                        <span className="offline-badge">Offline</span>
                    </div>
                )}
            </aside>

            {/* ÁREA PRINCIPAL */}
            <main className="dashboard-main">
                <div className="dashboard-header">
                    <div>
                        <h1>Mis Cursos</h1>
                        <p className="dashboard-subtitle">
                            {courses.length === 0
                                ? 'Sin cursos. Agrega el primero.'
                                : `${courses.length} curso${courses.length !== 1 ? 's' : ''} en tu biblioteca`}
                        </p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)}>+ Agregar Curso</button>
                </div>

                {saveError && (
                    <div className="dashboard-error-banner">
                        {saveError}
                        <button className="banner-close" onClick={() => setSaveError('')}>✕</button>
                    </div>
                )}

                {dataLoading ? (
                    <div className="dashboard-loading">
                        <span className="spinner" />
                        Cargando cursos...
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="dashboard-empty">
                        <h2>{courses.length === 0 ? 'Sin cursos en tu biblioteca' : 'Sin cursos en esta categoría'}</h2>
                        <p>{courses.length === 0 ? 'Agrega un video de YouTube con capítulos para comenzar.' : 'Prueba con otro filtro o agrega un nuevo curso.'}</p>
                        {courses.length === 0 && (
                            <button className="btn-primary" style={{ marginTop: '12px' }} onClick={() => setIsModalOpen(true)}>
                                + Agregar mi Primer Curso
                            </button>
                        )}
                    </div>
                ) : (
                    <table className="course-table">
                        <thead>
                            <tr>
                                <th className="col-thumb">Miniatura</th>
                                <th>Título</th>
                                <th>Canal</th>
                                <th>Progreso</th>
                                <th>Estado</th>
                                <th style={{ width: '60px' }}>Acc.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map((course) => {
                                const pct = course.totalModules > 0
                                    ? Math.round((course.completedModules / course.totalModules) * 100)
                                    : 0;
                                const isDone = pct === 100 && course.totalModules > 0;
                                const isInProgress = course.completedModules > 0 && !isDone;
                                return (
                                    <tr key={course.id} onClick={() => router.push(`/course/${course.id}`)}>
                                        <td className="col-thumb">
                                            <img src={course.thumbnailUrl} alt={course.title} />
                                        </td>
                                        <td><strong>{course.title}</strong></td>
                                        <td>{course.channelName}</td>
                                        <td className="col-progress-bar">
                                            <div className="inline-progress">
                                                <div className="inline-progress-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span style={{ fontSize: '10px' }}>{course.completedModules}/{course.totalModules} módulos ({pct}%)</span>
                                        </td>
                                        <td>
                                            {isDone
                                                ? <span className="status-badge done">Completado</span>
                                                : isInProgress
                                                    ? <span className="status-badge active">En Progreso</span>
                                                    : <span className="status-badge pending">Pendiente</span>
                                            }
                                        </td>
                                        <td>
                                            <button
                                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                                onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}
                                                title="Eliminar"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
