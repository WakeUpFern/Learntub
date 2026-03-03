'use client';

import { secondsToTimestamp, formatDuration } from '@/lib/chapterParser';

/**
 * ModuleList — Lista de módulos/capítulos de un curso
 */
export default function ModuleList({ modules, activeModuleId, onSelectModule, onToggleComplete }) {
    if (!modules || modules.length === 0) {
        return (
            <div className="module-list-empty">
                <div className="empty-icon">📭</div>
                <p>No se encontraron capítulos en este video.</p>
            </div>
        );
    }

    const completedCount = modules.filter(m => m.isCompleted).length;
    const progressPercent = modules.length > 0 ? (completedCount / modules.length) * 100 : 0;

    return (
        <div className="module-list">
            <div className="module-list-header">
                <h3>Módulos del Curso</h3>
                <span className="module-count">{completedCount}/{modules.length} completados</span>
            </div>

            <div className="module-progress-bar">
                <div className="module-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="module-items">
                {modules.map((mod, index) => (
                    <div
                        key={mod.id}
                        className={`module-item ${activeModuleId === mod.id ? 'active' : ''} ${mod.isCompleted ? 'completed' : ''}`}
                        onClick={() => onSelectModule(mod)}
                    >
                        <button
                            className="module-checkbox"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleComplete(mod.id);
                            }}
                            aria-label={mod.isCompleted ? 'Marcar como no completado' : 'Marcar como completado'}
                        >
                            {mod.isCompleted ? (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <rect width="20" height="20" rx="6" fill="currentColor" className="checkbox-bg" />
                                    <path d="M5.5 10.5L8.5 13.5L14.5 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <rect x="0.5" y="0.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeOpacity="0.3" />
                                </svg>
                            )}
                        </button>

                        <div className="module-info">
                            <span className="module-number">{index + 1}</span>
                            <div className="module-text">
                                <span className="module-title">{mod.title}</span>
                                <span className="module-time">
                                    {secondsToTimestamp(mod.startTime)}
                                    {mod.endTime != null && ` — ${formatDuration(mod.startTime, mod.endTime)}`}
                                </span>
                            </div>
                        </div>

                        {activeModuleId === mod.id && (
                            <div className="module-playing-indicator">
                                <span className="playing-bar" />
                                <span className="playing-bar" />
                                <span className="playing-bar" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
