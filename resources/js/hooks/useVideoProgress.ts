import { getVideoProgress, VideoProgress } from '@/lib/video-progress';
import { useEffect, useState } from 'react';

/**
 * Custom event name for video progress updates
 */
const VIDEO_PROGRESS_EVENT = 'video-progress-update';

/**
 * Emit a video progress update event (call this from VideoModal)
 */
export function emitVideoProgress(progress: VideoProgress): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
        new CustomEvent(VIDEO_PROGRESS_EVENT, { detail: progress }),
    );
}

/**
 * Hook to subscribe to video progress from any component.
 * Updates in real-time as the user watches the video.
 *
 * @example
 * const { reached25, reached50, completed } = useVideoProgress();
 *
 * return (
 *   <>
 *     {!reached25 && <Button>Watch Video</Button>}
 *     {reached25 && <Button>Live Demo</Button>}
 *   </>
 * );
 */
export function useVideoProgress(): VideoProgress {
    const [progress, setProgress] = useState<VideoProgress>(() =>
        getVideoProgress(),
    );

    useEffect(() => {
        // Hydrate from localStorage on mount
        setProgress(getVideoProgress());

        // Listen for progress updates from VideoModal
        const handleUpdate = (event: CustomEvent<VideoProgress>) => {
            setProgress(event.detail);
        };

        window.addEventListener(
            VIDEO_PROGRESS_EVENT,
            handleUpdate as EventListener,
        );

        return () => {
            window.removeEventListener(
                VIDEO_PROGRESS_EVENT,
                handleUpdate as EventListener,
            );
        };
    }, []);

    return progress;
}
