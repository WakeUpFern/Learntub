import { NextResponse } from 'next/server';
import { extractVideoId, fetchVideoDetails, getThumbnailUrl } from '@/lib/youtube';
import { parseChapters } from '@/lib/chapterParser';

/**
 * GET /api/courses — Listar cursos (usa localStorage en el cliente)
 * POST /api/courses — Crear un nuevo curso desde una URL de YouTube
 */

export async function POST(request) {
    try {
        const body = await request.json();
        const { url, manualTitle, manualDescription } = body;

        if (!url && !manualDescription) {
            return NextResponse.json(
                { error: 'Se requiere una URL de YouTube o descripción manual' },
                { status: 400 }
            );
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return NextResponse.json(
                { error: 'URL de YouTube inválida' },
                { status: 400 }
            );
        }

        // Intentar obtener datos de la YouTube API
        let videoData = await fetchVideoDetails(videoId);

        // Si no hay API key o falla, usar datos manuales/fallback
        if (!videoData) {
            videoData = {
                title: manualTitle || `Video ${videoId}`,
                description: manualDescription || '',
                thumbnailUrl: getThumbnailUrl(videoId),
                channelName: 'YouTube',
            };
        }

        // Parsear capítulos
        const description = (manualDescription && manualDescription.trim())
            ? manualDescription
            : videoData.description;

        const chapters = parseChapters(description);

        return NextResponse.json({
            videoId,
            title: videoData.title,
            thumbnailUrl: videoData.thumbnailUrl,
            channelName: videoData.channelName,
            chapters,
            rawDescription: description,
        });
    } catch (error) {
        console.error('Error processing course:', error);
        return NextResponse.json(
            { error: 'Error procesando el video' },
            { status: 500 }
        );
    }
}
