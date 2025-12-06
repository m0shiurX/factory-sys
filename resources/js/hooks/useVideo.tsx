import VideoModal from '@/components/public/VideoModal';
import {
    getVideoProgress,
    hasWatchedVideo,
    VideoProgress,
} from '@/lib/video-progress';
import { useCallback, useEffect, useState } from 'react';

interface VideoEvents {
    play: string;
    video25?: string;
    video50?: string;
    video90?: string;
    videoCompleted?: string;
    cta?: string;
}

interface UseVideoOptions {
    videoSrc: string;
    videoId: string;
    title?: string;
    showCTAAt?: number;
    ctaText?: string;
    ctaHref?: string;
    // Primary video (lavloss_demo) should track full progress.
    // Secondary videos can set this to false and only track play.
    primary?: boolean;
    // When true, start from the primary video's lastPosition.
    resumeFromPrimary?: boolean;
    events?: VideoEvents;
}

export function useVideo(options: UseVideoOptions) {
    const [isOpen, setIsOpen] = useState(false);
    const [progress, setProgress] = useState<VideoProgress>(() =>
        getVideoProgress(),
    );

    // Update progress when modal closes
    useEffect(() => {
        if (!isOpen) {
            setProgress(getVideoProgress());
        }
    }, [isOpen]);

    const openVideo = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeVideo = useCallback(() => {
        setIsOpen(false);
    }, []);

    // Component to render (must be rendered in the tree)
    const VideoPlayer = useCallback(
        () => (
            <VideoModal open={isOpen} onOpenChange={setIsOpen} {...options} />
        ),
        [isOpen, options],
    );

    return {
        isOpen,
        openVideo,
        closeVideo,
        VideoPlayer,
        progress,
        hasWatched: progress.reached25,
        hasCompleted: progress.completed,
    };
}

/**
 * Check if user has watched the video (can be called outside React)
 */
export { hasWatchedVideo };
