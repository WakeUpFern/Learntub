import { NextResponse } from 'next/server';
import { extractYouTubeUrlInfo, fetchVideoDetails, fetchPlaylistDetails, fetchPlaylistItems, getThumbnailUrl } from '@/lib/youtube';
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

        const info = extractYouTubeUrlInfo(url);
        if (!info) {
            return NextResponse.json(
                { error: 'URL de YouTube inválida' },
                { status: 400 }
            );
        }

        if (info.type === 'playlist') {
            const playlistId = info.id;
            let playlistData = await fetchPlaylistDetails(playlistId);
            
            if (!playlistData) {
                playlistData = {
                    title: manualTitle || `Playlist ${playlistId}`,
                    description: manualDescription || '',
                    thumbnailUrl: '', // Could use a default
                    channelName: 'YouTube',
                };
            }

            const items = await fetchPlaylistItems(playlistId);
            
            const chapters = items.map((item, index) => ({
                title: item.title,
                startTime: 0,
                endTime: null, // Full video length, handled by YouTube player
                position: index + 1,
                youtubeId: item.videoId
            }));

            // If playlist didn't have a thumbnail, try to use the first video's thumbnail
            if (!playlistData.thumbnailUrl && items.length > 0) {
                playlistData.thumbnailUrl = getThumbnailUrl(items[0].videoId);
            }

            return NextResponse.json({
                videoId: playlistId, // course youtubeId is playlistId
                title: playlistData.title,
                thumbnailUrl: playlistData.thumbnailUrl,
                channelName: playlistData.channelName,
                chapters,
                rawDescription: playlistData.description || '',
            });
        } else {
            const videoId = info.id;
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

            const parsedChapters = parseChapters(description);
            // Agregamos youtubeId opcional por si acaso a los capítulos de un solo video
            const chapters = parsedChapters.map(ch => ({ ...ch, youtubeId: videoId }));

            return NextResponse.json({
                videoId,
                title: videoData.title,
                thumbnailUrl: videoData.thumbnailUrl,
                channelName: videoData.channelName,
                chapters,
                rawDescription: description,
            });
        }
    } catch (error) {
        console.error('Error processing course:', error);
        return NextResponse.json(
            { error: 'Error procesando el video/playlist' },
            { status: 500 }
        );
    }
}
