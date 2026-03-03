'use client';

import { useState } from 'react';
import { extractVideoId, getThumbnailUrl } from '@/lib/youtube';
import { parseChapters, hasChapters, secondsToTimestamp, formatDuration } from '@/lib/chapterParser';

/**
 * AddCourseModal — Modal para agregar un curso desde YouTube
 */
export default function AddCourseModal({ isOpen, onClose, onAdd }) {
    const [url, setUrl] = useState('');
    const [manualDescription, setManualDescription] = useState('');
    const [showManual, setShowManual] = useState(false);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1 = URL, 2 = Preview

    if (!isOpen) return null;

    const handleFetchVideo = async () => {
        setError('');
        const videoId = extractVideoId(url);

        if (!videoId) {
            setError('URL de YouTube inválida. Intenta con un formato como: https://youtube.com/watch?v=...');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                url,
                manualDescription: showManual ? manualDescription : undefined
            };
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error procesando el video');
                setLoading(false);
                return;
            }

            if (data.chapters.length === 0 && !showManual) {
                setShowManual(true);
                setError('No se encontraron capítulos automáticamente. Puedes pegar la descripción del video manualmente abajo, o verificar que el video tiene timestamps en su descripción.');
                setLoading(false);
                return;
            }

            if (data.chapters.length === 0 && showManual) {
                setError('No se detectaron timestamps en la descripción. Asegúrate de que contenga líneas como "0:00 Introducción".');
                setLoading(false);
                return;
            }

            setPreview(data);
            setStep(2);
        } catch {
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (!preview) return;
        onAdd({
            youtubeId: preview.videoId,
            title: preview.title,
            thumbnailUrl: preview.thumbnailUrl,
            channelName: preview.channelName,
            modules: preview.chapters,
        });
        handleReset();
    };

    const handleReset = () => {
        setUrl('');
        setManualDescription('');
        setShowManual(false);
        setPreview(null);
        setLoading(false);
        setError('');
        setStep(1);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={handleReset}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{step === 1 ? 'Agregar Nuevo Curso' : 'Confirmar Capítulos'}</h2>
                    <button className="modal-close" onClick={handleReset} aria-label="Cerrar">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {step === 1 ? (
                    <div className="modal-body">
                        <div className="input-group">
                            <label htmlFor="youtube-url">Link de YouTube</label>
                            <div className="input-with-icon">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="input-icon">
                                    <path d="M17.5 10c0 1.5-.5 3-1.5 4.2a7.5 7.5 0 01-12-8.4A7.5 7.5 0 0117.5 10z" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M8 7l5 3-5 3V7z" fill="currentColor" />
                                </svg>
                                <input
                                    id="youtube-url"
                                    type="url"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFetchVideo()}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {showManual && (
                            <div className="input-group" style={{ marginTop: '1rem' }}>
                                <label htmlFor="manual-desc">
                                    Descripción del video (pega los timestamps aquí)
                                </label>
                                <textarea
                                    id="manual-desc"
                                    placeholder={"0:00 Introducción\n5:30 Conceptos básicos\n15:00 Ejemplo práctico\n..."}
                                    value={manualDescription}
                                    onChange={(e) => setManualDescription(e.target.value)}
                                    rows={8}
                                />
                            </div>
                        )}

                        {error && <div className="modal-error">{error}</div>}

                        <button
                            className="btn-primary"
                            onClick={handleFetchVideo}
                            disabled={!url || loading}
                        >
                            {loading ? (
                                <span className="btn-loading">
                                    <span className="spinner" />
                                    Procesando...
                                </span>
                            ) : (
                                'Obtener Capítulos'
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="modal-body">
                        {preview && (
                            <>
                                <div className="preview-header">
                                    <img
                                        src={preview.thumbnailUrl}
                                        alt={preview.title}
                                        className="preview-thumbnail"
                                    />
                                    <div className="preview-info">
                                        <h3>{preview.title}</h3>
                                        <p>{preview.channelName}</p>
                                        <span className="chapter-count">
                                            {preview.chapters.length} capítulos detectados
                                        </span>
                                    </div>
                                </div>

                                <div className="preview-chapters">
                                    {preview.chapters.map((ch, i) => (
                                        <div key={i} className="preview-chapter-item">
                                            <span className="chapter-num">{i + 1}</span>
                                            <span className="chapter-title">{ch.title}</span>
                                            <span className="chapter-time">
                                                {secondsToTimestamp(ch.startTime)}
                                                {ch.endTime != null && ` · ${formatDuration(ch.startTime, ch.endTime)}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="modal-actions">
                                    <button className="btn-secondary" onClick={() => setStep(1)}>
                                        ← Volver
                                    </button>
                                    <button className="btn-primary" onClick={handleConfirm}>
                                        Agregar Curso
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
