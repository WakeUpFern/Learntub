/**
 * YouTube API integration — Extrae datos de videos de YouTube.
 */

/**
 * Extrae el video ID de varias formas de URLs de YouTube.
 * @param {string} url
 * @returns {string|null}
 */
export function extractVideoId(url) {
    if (!url) return null;

    const patterns = [
        /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
}

/**
 * Extrae el tipo de contenido (video o playlist) y su ID de una URL.
 * @param {string} url
 * @returns {{type: 'video'|'playlist', id: string}|null}
 */
export function extractYouTubeUrlInfo(url) {
    if (!url) return null;

    // Verificar si es una playlist (tiene parámetro list=)
    // Puede ser youtube.com/playlist?list=... o youtube.com/watch?v=...&list=...
    const playlistPattern = /[?&]list=([a-zA-Z0-9_-]+)/;
    const playlistMatch = url.match(playlistPattern);
    
    if (playlistMatch && playlistMatch[1]) {
        // Ignorar "WL" (Watch Later) y listas automáticas si queremos, pero por ahora las aceptamos
        return { type: 'playlist', id: playlistMatch[1] };
    }

    const videoId = extractVideoId(url);
    if (videoId) {
        return { type: 'video', id: videoId };
    }

    return null;
}

/**
 * Obtiene los detalles de un video de YouTube usando la Data API v3.
 * @param {string} videoId
 * @returns {Promise<{title: string, description: string, thumbnailUrl: string, channelName: string, duration: string}|null>}
 */
export async function fetchVideoDetails(videoId) {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        console.warn('YOUTUBE_API_KEY not set — using fallback mode');
        return null;
    }

    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error('YouTube API error:', response.status, await response.text());
            return null;
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return null;
        }

        const video = data.items[0];
        const snippet = video.snippet;
        const thumbnails = snippet.thumbnails;

        return {
            title: snippet.title,
            description: snippet.description,
            thumbnailUrl: thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url,
            channelName: snippet.channelTitle,
            duration: video.contentDetails?.duration || null,
        };
    } catch (error) {
        console.error('Error fetching video details:', error);
        return null;
    }
}

/**
 * Genera la URL de la thumbnail de un video de YouTube.
 * @param {string} videoId
 * @returns {string}
 */
export function getThumbnailUrl(videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Obtiene los detalles de una playlist de YouTube.
 * @param {string} playlistId
 * @returns {Promise<{title: string, description: string, channelName: string, thumbnailUrl: string}|null>}
 */
export async function fetchPlaylistDetails(playlistId) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return null;

    try {
        const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        if (!data.items || data.items.length === 0) return null;

        const snippet = data.items[0].snippet;
        const thumbnails = snippet.thumbnails;

        return {
            title: snippet.title,
            description: snippet.description,
            channelName: snippet.channelTitle,
            thumbnailUrl: thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url,
        };
    } catch (error) {
        console.error('Error fetching playlist details:', error);
        return null;
    }
}

/**
 * Obtiene todos los videos de una playlist.
 * @param {string} playlistId
 * @returns {Promise<Array<{videoId: string, title: string, position: number}>>}
 */
export async function fetchPlaylistItems(playlistId) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return [];

    let items = [];
    let nextPageToken = '';
    
    try {
        do {
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('YouTube API error:', response.status);
                break;
            }

            const data = await response.json();
            if (!data.items) break;

            for (const item of data.items) {
                // Ignore private or deleted videos (often title is 'Private video')
                if (item.snippet.title === 'Private video' || item.snippet.title === 'Deleted video') continue;

                items.push({
                    videoId: item.contentDetails.videoId,
                    title: item.snippet.title,
                    position: item.snippet.position,
                });
            }

            nextPageToken = data.nextPageToken;
        } while (nextPageToken);

        return items;
    } catch (error) {
        console.error('Error fetching playlist items:', error);
        return items;
    }
}
