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
        // https://www.youtube.com/watch?v=VIDEO_ID
        /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
        // https://youtu.be/VIDEO_ID
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        // https://www.youtube.com/embed/VIDEO_ID
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        // https://www.youtube.com/v/VIDEO_ID
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        // https://www.youtube.com/shorts/VIDEO_ID
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        // Just the video ID
        /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
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
