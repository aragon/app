// Resolves the CORS origin (hono/cors callback) against exact origins (https://app.aragon.org)
// and wildcard suffix patterns: *.suffix matches subdomains of a zone we own, any depth
// (*.app.aragon.org); *-suffix matches exactly one DNS label (*-aragon-app.vercel.app — Vercel
// preview hostnames are a single label, so the wildcard part must not span labels). Residual
// risk on shared apex domains like vercel.app is accepted for non-production environments only.
export const resolveCorsOrigin = (
    allowedOrigins: string[],
    origin: string,
): string | undefined => {
    if (allowedOrigins.includes(origin)) {
        return origin;
    }

    let url: URL;
    try {
        url = new URL(origin);
    } catch {
        return undefined;
    }

    const { hostname } = url;
    const isAllowedSuffix =
        url.protocol === 'https:' &&
        allowedOrigins.some((entry) => {
            if (!entry.startsWith('*')) {
                return false;
            }

            const suffix = entry.slice(1);
            if (!hostname.endsWith(suffix)) {
                return false;
            }

            // The wildcard part must be non-empty, and must stay within one DNS label for
            // *-suffix patterns.
            const wildcardPart = hostname.slice(
                0,
                hostname.length - suffix.length,
            );

            return (
                wildcardPart.length > 0 &&
                (entry.startsWith('*.') || !wildcardPart.includes('.'))
            );
        });

    return isAllowedSuffix ? origin : undefined;
};
