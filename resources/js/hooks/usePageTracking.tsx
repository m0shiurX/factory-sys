import { trackPageView } from '@/lib/track';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * Hook to track page views on SPA navigation
 * @returns void
 */
export default function usePageTracking(): void {
    useEffect(() => {
        trackPageView(
            window.location.pathname + window.location.search,
            document.title,
        );

        // Track subsequent SPA navigation
        const unlisten = router.on('navigate', () => {
            // Small delay to ensure title is updated
            setTimeout(() => {
                const url = window.location.pathname + window.location.search;
                trackPageView(url, document.title);
            }, 100);
        });

        return () => unlisten();
    }, []);
}
