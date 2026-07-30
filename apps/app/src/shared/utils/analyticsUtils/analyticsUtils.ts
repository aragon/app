export type AnalyticsEventProps = Record<string, string>;

type PlausibleTrack = typeof import('@plausible-analytics/tracker')['track'];

class AnalyticsUtils {
    // The package reads `location.href` at module top-level, which crashes during
    // Next.js server rendering — imported dynamically so it only ever loads client-side.
    private track: PlausibleTrack | null = null;

    /**
     * Bootstraps the Plausible tracker. Called once, client-side only, from
     * `instrumentation-client.ts`. No-ops when no site domain is configured
     * for the current environment (see `config/.env.*`).
     */
    init = async () => {
        const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

        if (!domain) {
            return;
        }

        const { init: initPlausibleTracker, track } = await import(
            '@plausible-analytics/tracker'
        );

        // Proxied through our own domain (see `next.config.mjs`) so ad blockers that
        // filter requests to plausible.io don't drop the events.
        initPlausibleTracker({ domain, endpoint: '/api/analytics' });
        this.track = track;
    };

    trackEvent = (event: string, props?: AnalyticsEventProps) => {
        this.track?.(event, { props });
    };
}

export const analyticsUtils = new AnalyticsUtils();
