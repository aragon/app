/**
 * Builds a cors-origin resolver for the hono/cors middleware from a list of allowed entries.
 * Entries are exact origins (https://app.aragon.org) or wildcard suffix patterns (*.vercel.app)
 * used by non-production environments to allow Vercel preview deployments of the app.
 */
export const buildCorsOriginResolver = (allowedOrigins: string[]) => {
    const exactOrigins = new Set(
        allowedOrigins.filter((entry) => !entry.startsWith('*.')),
    );
    const suffixPatterns = allowedOrigins
        .filter((entry) => entry.startsWith('*.'))
        .map((entry) => entry.slice(1));

    return (origin: string): string | undefined => {
        if (exactOrigins.has(origin)) {
            return origin;
        }

        let hostname: string;
        try {
            const url = new URL(origin);
            if (url.protocol !== 'https:') {
                return undefined;
            }
            hostname = url.hostname;
        } catch {
            return undefined;
        }

        const isAllowedSuffix = suffixPatterns.some((suffix) =>
            hostname.endsWith(suffix),
        );

        return isAllowedSuffix ? origin : undefined;
    };
};
