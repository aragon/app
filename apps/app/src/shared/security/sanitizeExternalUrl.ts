import { urlUtils } from '@aragon/gov-ui-kit';

/**
 * Normalizes a website URL using the shared UI kit utility and only allows
 * absolute HTTP(S) targets.
 */
export function sanitizeExternalHttpUrl(url: string): string | null {
    const normalized = urlUtils.normalizeExternalHref(url);
    if (normalized == null) {
        return null;
    }

    try {
        const parsed = new URL(normalized);
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
            return parsed.href;
        }
        return null;
    } catch {
        return null;
    }
}
