/**
 * Stores video watch progress in localStorage.
 */

const STORAGE_KEY = 'lavloss_video_progress';

export interface VideoProgress {
    played: boolean;
    reached25: boolean;
    reached50: boolean;
    reached90: boolean;
    completed: boolean;
    lastPosition: number; // seconds
    lastWatched: string; // ISO date
}

const defaultProgress: VideoProgress = {
    played: false,
    reached25: false,
    reached50: false,
    reached90: false,
    completed: false,
    lastPosition: 0,
    lastWatched: '',
};

/**
 * Get video progress from localStorage
 */
export const getVideoProgress = (): VideoProgress => {
    if (typeof window === 'undefined') return defaultProgress;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return defaultProgress;
        return { ...defaultProgress, ...JSON.parse(stored) };
    } catch {
        return defaultProgress;
    }
};

/**
 * Update video progress in localStorage
 */
export const updateVideoProgress = (
    updates: Partial<VideoProgress>,
): VideoProgress => {
    const current = getVideoProgress();
    const updated = {
        ...current,
        ...updates,
        lastWatched: new Date().toISOString(),
    };

    if (typeof window === 'undefined') {
        return updated;
    }

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
        // localStorage might be full or disabled
    }

    return updated;
};

/**
 * Check if user has watched at least 25% of the video
 */
export const hasWatchedVideo = (): boolean => {
    return getVideoProgress().reached25;
};

/**
 * Check if user has completed the video
 */
export const hasCompletedVideo = (): boolean => {
    return getVideoProgress().completed;
};

/**
 * Reset video progress (for testing)
 */
export const resetVideoProgress = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
};
