'use client';

/**
 * CourseCard — Tarjeta de curso para el dashboard
 */
export default function CourseCard({ course, onOpen, onDelete }) {
    const progress = course.totalModules > 0
        ? (course.completedModules / course.totalModules) * 100
        : 0;

    const isCompleted = progress === 100 && course.totalModules > 0;
    const isInProgress = course.completedModules > 0 && !isCompleted;

    return (
        <div className={`course-card ${isCompleted ? 'completed' : ''}`} onClick={() => onOpen(course.id)}>
            <div className="course-card-thumbnail">
                <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    loading="lazy"
                />
                <div className="course-card-overlay">
                    <button className="play-button" aria-label="Abrir curso">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M8 5.14v13.72a1 1 0 001.5.86l11.04-6.86a1 1 0 000-1.72L9.5 4.28a1 1 0 00-1.5.86z" fill="white" />
                        </svg>
                    </button>
                </div>
                {isCompleted && (
                    <div className="course-badge completed-badge">✓ Completado</div>
                )}
                {isInProgress && (
                    <div className="course-badge progress-badge">{Math.round(progress)}%</div>
                )}
            </div>

            <div className="course-card-body">
                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-channel">{course.channelName}</p>

                <div className="course-card-progress">
                    <div className="progress-bar-track">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="progress-label">
                        {course.completedModules}/{course.totalModules} módulos
                    </span>
                </div>
            </div>

            <button
                className="course-delete-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('¿Eliminar este curso?')) onDelete(course.id);
                }}
                aria-label="Eliminar curso"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
}
