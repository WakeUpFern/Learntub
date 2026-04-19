'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * YouTubePlayer — Wrapper para la YouTube IFrame Player API
 * 
 * Reproduce el video de forma continua. Al cambiar de módulo desde la lista, 
 * hace 'seekTo'. Si avanza naturalmente, no recarga el player.
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

    // Referencias para evitar stale closures en los callbacks de YouTube
    const timePropsRef = useRef({ startTime, endTime, duration });
    useEffect(() => {
        timePropsRef.current = { startTime, endTime, duration };
    }, [startTime, endTime, duration]);

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

    const hasEndedRef = useRef(false);

    // Reset hasEnded when module changes
    useEffect(() => {
        hasEndedRef.current = false;
    }, [videoId, startTime, endTime]);

    const handleEndTrigger = useCallback(() => {
        if (hasEndedRef.current) return;
        hasEndedRef.current = true;
        
        // NO pausamos el video, permitimos que siga reproduciéndose fluidamente.
        if (onEnded) onEnded();
    }, [onEnded]);

    // Monitorear el tiempo del video
    const startTimeTracking = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                const time = playerRef.current.getCurrentTime();
                setCurrentTime(time);

                const { startTime: st, endTime: et, duration: dur } = timePropsRef.current;

                if (et && dur > 0) {
                    const elapsed = time - st;
                    setProgress(Math.min(100, Math.max(0, (elapsed / dur) * 100)));

                    // Si pasó del endTime (con un pequeño margen de 0.5s), disparar auto-avance
                    if (time >= (et - 0.5)) {
                        handleEndTrigger();
                    }
                }
            }
        }, 500);
    }, [handleEndTrigger]);

    // Crear el player SOLO UNA VEZ por videoId
    useEffect(() => {
        if (!isReady || !videoId || !containerRef.current) return;

        // Destruir player anterior si cambia el ID del video
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
                start: Math.floor(timePropsRef.current.startTime),
                // IMPORTANTE: Removemos 'end' para permitir reproducción continua.
                autoplay: autoplay ? 1 : 0,
                modestbranding: 1,
                rel: 0,
                fs: 1,
                playsinline: 1,
            },
            width: '100%',
            height: '100%',
            events: {
                onStateChange: (event) => {
                    if (event.data === window.YT.PlayerState.PLAYING) {
                        setIsPlaying(true);
                        startTimeTracking();
                    } else if (event.data === window.YT.PlayerState.PAUSED) {
                        setIsPlaying(false);
                    } else if (event.data === window.YT.PlayerState.ENDED) {
                        handleEndTrigger();
                    }
                },
            },
        });

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, videoId]); 

    // Manejar saltos manuales (cuando el usuario hace click en otro módulo de la lista)
    useEffect(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            const time = playerRef.current.getCurrentTime();
            // Si la diferencia entre el tiempo actual y el inicio del módulo es mayor a 2 segundos,
            // asumimos que fue un click explícito en la interfaz y saltamos a ese tiempo.
            // De lo contrario, significa que el video avanzó naturalmente.
            if (Math.abs(time - startTime) > 2) {
                playerRef.current.seekTo(startTime, true);
                if (autoplay) {
                    playerRef.current.playVideo();
                }
            }
        }
    }, [startTime, autoplay]);

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
