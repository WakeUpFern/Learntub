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
        <div className="modal-overlay" onClick={handleReset}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{step === 1 ? 'Agregar Nuevo Curso' : 'Confirmar Capítulos'}</h2>
                    <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }} onClick={handleReset} aria-label="Cerrar">
                        ✕
                    </button>
                </div>

                {step === 1 ? (
                    <div className="modal-body">
                        <div className="form-field">
                            <label className="form-label" htmlFor="youtube-url">Link de YouTube</label>
                            <input
                                className="form-input"
                                id="youtube-url"
                                type="url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFetchVideo()}
                                autoFocus
                            />
                        </div>

                        {showManual && (
                            <div className="form-field" style={{ marginTop: '1rem' }}>
                                <label className="form-label" htmlFor="manual-desc">
                                    Descripción del video (pega los timestamps aquí)
                                </label>
                                <textarea
                                    className="form-input"
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
                                <div style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '2px solid #000', marginBottom: '16px' }}>
                                    <img
                                        src={preview.thumbnailUrl}
                                        alt={preview.title}
                                        style={{ width: '120px', height: '68px', objectFit: 'cover', border: '2px solid #000' }}
                                    />
                                    <div>
                                        <h3 style={{ fontSize: '13px', fontWeight: 'bold' }}>{preview.title}</h3>
                                        <p style={{ fontSize: '11px', color: '#555' }}>{preview.channelName}</p>
                                        <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
                                            {preview.chapters.length} capítulos detectados
                                        </span>
                                    </div>
                                </div>

                                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px', fontSize: '12px' }}>
                                    {preview.chapters.map((ch, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: '1px solid #ddd' }}>
                                            <span style={{ fontWeight: 'bold', width: '20px' }}>{i + 1}.</span>
                                            <span style={{ flex: 1 }}>{ch.title}</span>
                                            <span style={{ color: '#555', fontSize: '10px' }}>
                                                {secondsToTimestamp(ch.startTime)}
                                                {ch.endTime != null && ` · ${formatDuration(ch.startTime, ch.endTime)}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="modal-footer">
                                    <button style={{ padding: '6px 12px', background: '#fff', border: '2px solid #000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setStep(1)}>
                                        ← Volver
                                    </button>
                                    <button style={{ padding: '6px 12px', background: '#000', color: '#fff', border: '2px solid #000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleConfirm}>
                                        Confirmar y Agregar
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
