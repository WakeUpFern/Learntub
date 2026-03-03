'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * YouTubePlayer — Wrapper para la YouTube IFrame Player API
 * 
 * Reproduce un fragmento de video controlado por startTime y endTime.
 */
export default function YouTubePlayer({ videoId, startTime = 0, endTime = null, onEnded, autoplay = true }) {
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    const intervalRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [progress, setProgress] = useState(0);

    const duration = endTime ? endTime - startTime : 0;

    // Cargar la API de YouTube
    useEffect(() => {
        if (window.YT && window.YT.Player) {
            setIsReady(true);
            return;
        }

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(tag, firstScript);

        window.onYouTubeIframeAPIReady = () => {
            setIsReady(true);
        };

        return () => {
            window.onYouTubeIframeAPIReady = null;
        };
    }, []);

    // Monitorear el tiempo del video
    const startTimeTracking = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                const time = playerRef.current.getCurrentTime();
                setCurrentTime(time);

                if (endTime && duration > 0) {
                    const elapsed = time - startTime;
                    setProgress(Math.min(100, Math.max(0, (elapsed / duration) * 100)));

                    // Si pasó del endTime, pausar
                    if (time >= endTime) {
                        playerRef.current.pauseVideo();
                        setIsPlaying(false);
                        clearInterval(intervalRef.current);
                        if (onEnded) onEnded();
                    }
                }
            }
        }, 500);
    }, [startTime, endTime, duration, onEnded]);

    // Crear o actualizar el player
    useEffect(() => {
        if (!isReady || !videoId || !containerRef.current) return;

        // Destruir player anterior
        if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
        }

        const playerDiv = document.createElement('div');
        playerDiv.id = 'yt-player-' + Date.now();
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(playerDiv);

        playerRef.current = new window.YT.Player(playerDiv.id, {
            videoId,
            playerVars: {
                start: Math.floor(startTime),
                end: endTime ? Math.ceil(endTime) : undefined,
                autoplay: autoplay ? 1 : 0,
                modestbranding: 1,
                rel: 0,
                fs: 1,
                playsinline: 1,
            },
            events: {
                onStateChange: (event) => {
                    if (event.data === window.YT.PlayerState.PLAYING) {
                        setIsPlaying(true);
                        startTimeTracking();
                    } else if (event.data === window.YT.PlayerState.PAUSED) {
                        setIsPlaying(false);
                    } else if (event.data === window.YT.PlayerState.ENDED) {
                        setIsPlaying(false);
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        if (onEnded) onEnded();
                    }
                },
            },
        });

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isReady, videoId, startTime, endTime, autoplay, startTimeTracking]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch { }
            }
        };
    }, []);

    return (
        <div className="yt-player-wrapper">
            <div ref={containerRef} className="yt-player-container" />
            {endTime && duration > 0 && (
                <div className="yt-progress-bar">
                    <div className="yt-progress-fill" style={{ width: `${progress}%` }} />
                </div>
            )}
        </div>
    );
}
