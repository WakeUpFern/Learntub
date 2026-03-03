/**
 * Chapter Parser — Corazón del proyecto LearnTube
 * 
 * Parsea la descripción de un video de YouTube para extraer capítulos/timestamps.
 * Soporta formatos: 0:00, 00:00, 0:00:00, 00:00:00
 */

/**
 * Convierte un string de timestamp a segundos totales.
 * @param {string} timestamp - ej: "1:20:05", "05:30", "0:00"
 * @returns {number} segundos totales
 */
export function timestampToSeconds(timestamp) {
    const parts = timestamp.split(':').map(Number);

    if (parts.length === 3) {
        // H:MM:SS or HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        // M:SS or MM:SS
        return parts[0] * 60 + parts[1];
    }
    return 0;
}

/**
 * Convierte segundos totales a un string de timestamp legible.
 * @param {number} totalSeconds
 * @returns {string} ej: "1:20:05" o "05:30"
 */
export function secondsToTimestamp(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Calcula la duración formateada entre dos tiempos en segundos.
 * @param {number} startSeconds 
 * @param {number|null} endSeconds 
 * @returns {string} ej: "12:30"
 */
export function formatDuration(startSeconds, endSeconds) {
    if (endSeconds == null) return '—';
    const diff = endSeconds - startSeconds;
    if (diff <= 0) return '0:00';
    return secondsToTimestamp(diff);
}

/**
 * Parsea la descripción de un video de YouTube y extrae los capítulos.
 * 
 * Soporta los siguientes formatos de línea:
 *   0:00 Introducción
 *   0:00 - Introducción
 *   (0:00) Introducción
 *   [0:00] Introducción
 *   00:00 Introducción
 *   1:20:05 Tema avanzado
 *   Introducción 0:00
 *   Introducción - 0:00
 * 
 * @param {string} description - Descripción del video de YouTube
 * @returns {Array<{title: string, startTime: number, endTime: number|null, position: number}>}
 */
export function parseChapters(description) {
    if (!description || typeof description !== 'string') {
        return [];
    }

    const lines = description.split('\n');
    const chapters = [];

    // RegEx patterns para detectar timestamps
    const timestampStartRegex = /^[\s]*[\[\(]?(\d{1,2}:\d{2}(?::\d{2})?)[\]\)]?\s*[-–—:.]?\s*(.+)/;
    const timestampEndRegex = /^[\s]*(.+?)\s*[-–—]?\s*[\[\(]?(\d{1,2}:\d{2}(?::\d{2})?)[\]\)]?\s*$/;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        const trimmed = line.trim();
        if (!trimmed) continue;

        let title = null;
        let timestamp = null;

        // Intentar patrón 1: timestamp al inicio
        const matchStart = trimmed.match(timestampStartRegex);
        if (matchStart) {
            timestamp = matchStart[1];
            title = matchStart[2].trim();
        } else {
            // Intentar patrón 2: timestamp al final
            const matchEnd = trimmed.match(timestampEndRegex);
            if (matchEnd && /\d{1,2}:\d{2}/.test(matchEnd[2])) {
                title = matchEnd[1].trim();
                timestamp = matchEnd[2];
                // Verificar que el título no es solo otro timestamp
                if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(title)) {
                    continue;
                }
            }
        }

        if (title && timestamp) {
            // Limpiar el título de caracteres extra
            title = title.replace(/^[-–—:.\s]+/, '').replace(/[-–—:.\s]+$/, '').trim();
            if (!title) continue;

            chapters.push({
                title,
                startTime: timestampToSeconds(timestamp),
                endTime: null, // se calcula después
                position: chapters.length + 1,
            });
        }
    }

    // Calcular endTime de cada capítulo (= startTime del siguiente)
    for (let i = 0; i < chapters.length; i++) {
        if (i < chapters.length - 1) {
            chapters[i].endTime = chapters[i + 1].startTime;
        }
    }

    return chapters;
}

/**
 * Valida si una descripción parece tener capítulos.
 * @param {string} description
 * @returns {boolean}
 */
export function hasChapters(description) {
    return parseChapters(description).length >= 2;
}
