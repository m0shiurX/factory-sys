/**
 * Centralized tracking for GA4, Meta Pixel, and Microsoft Clarity.
 * - Development: Console logs for easy debugging
 * - Production: Sends to actual analytics platforms
 */

// Track if we've already tracked initial page (to avoid duplicates)
let hasTrackedInitialPage = false;

/**
 * Check if we're in production environment
 */
export const isProduction = (): boolean => {
    return import.meta.env.PROD && !window.location.hostname.includes('.test');
};

/**
 * Event names - use these for consistency
 */
export const Events = {
    // Core Conversion
    SUBSCRIPTION_STARTED: 'subscription_started',
    SUBSCRIPTION_COMPLETED: 'subscription_completed',
    VIEW_PRICING: 'view_pricing',
    START_CHECKOUT: 'start_checkout',

    // Video
    VIDEO_PLAY: 'video_play',
    VIDEO_PAUSE: 'video_pause',
    VIDEO_25: 'video_25',
    VIDEO_50: 'video_50',
    VIDEO_90: 'video_90',
    VIDEO_COMPLETED: 'video_completed',

    // Hero CTAs
    CTA_WHATSAPP: 'cta_whatsapp',
    CTA_DEMO_HERO: 'cta_demo_hero',
    CTA_PRICING_HERO: 'cta_pricing_hero',
    CTA_VIDEO_CTA: 'cta_video_cta',

    // Testimonial CTAs
    CTA_TESTIMONIAL_DEMO: 'cta_testimonial_demo',
    CTA_TESTIMONIAL_PRICING: 'cta_testimonial_pricing',

    // Feature CTAs (use with feature name in payload)
    CTA_FEATURE: 'cta_feature',

    // Pricing CTAs
    CTA_BUY_MONTHLY: 'cta_buy_monthly',
    CTA_BUY_YEARLY: 'cta_buy_yearly',
    CTA_BUY_3YEARS: 'cta_buy_3years',

    // Scroll Tracking
    SCROLL_25: 'scroll_25',
    SCROLL_50: 'scroll_50',
    SCROLL_75: 'scroll_75',
    SCROLL_100: 'scroll_100',

    // FAQ
    FAQ_OPEN: 'faq_open',
    FAQ_CLOSE: 'faq_close',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];

/**
 * Track events to analytics platforms
 *
 * @example
 * track(Events.CTA_DEMO_HERO)
 * track(Events.CTA_FEATURE, { feature: 'stock' })
 * track(Events.FAQ_OPEN, { question: 'What is Lavloss?' })
 */
export const track = (
    eventName: EventName | string,
    data: Record<string, unknown> = {},
): void => {
    if (!isProduction()) {
        console.log(
            `[Track] ${eventName}`,
            Object.keys(data).length > 0 ? data : '',
        );
        return;
    }

    try {
        // GA4
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', eventName, data);
        }

        // Meta Pixel
        if (typeof window.fbq !== 'undefined') {
            window.fbq('trackCustom', eventName, data);
        }

        // Microsoft Clarity
        if (typeof window.clarity !== 'undefined') {
            window.clarity('event', eventName);
        }
    } catch (err) {
        console.warn('Tracking error:', err);
    }
};

/**
 * Track page view - called ONLY on SPA navigation
 */
export const trackPageView = (url: string, title: string): void => {
    // Skip first call (initial page load) - GTM handles it
    if (!hasTrackedInitialPage) {
        hasTrackedInitialPage = true;
        return;
    }

    if (!isProduction()) {
        console.log(`[Page View] ${title}`, { url });
        return;
    }

    try {
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'page_view', {
                page_title: title,
                page_location: window.location.href,
                page_path: url,
            });
        }

        if (typeof window.fbq !== 'undefined') {
            window.fbq('track', 'PageView');
        }

        if (typeof window.clarity !== 'undefined') {
            window.clarity('set', 'page_path', url);
        }
    } catch (err) {
        console.warn('Page tracking error:', err);
    }
};

// TypeScript window types
declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        fbq?: (...args: unknown[]) => void;
        clarity?: (...args: unknown[]) => void;
        dataLayer?: unknown[];
    }
}
