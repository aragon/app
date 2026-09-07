// The `next/navigation` alias points to the client-hooks wrapper (src/shared/lib/nextNavigation),
// which cannot re-export server functions — import notFound from the real module instead.
import { notFound } from 'next/navigation-original';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';

class NotFoundUtils {
    /**
     * Runs a server-side lookup for a URL-addressed resource (DAO address/ENS, proposal slug)
     * and renders the 404 page when the backend says the identifier resolves to nothing — an
     * unknown resource or a malformed one, produced constantly by bots and stale links.
     * Everything else — a refused request (401/403/429), a server failure, a network error —
     * keeps propagating so it stays visible.
     *
     * Wrap the URL-addressed lookups only. A call whose failure says nothing about the URL (CMS
     * content, overrides) must stay outside, or its hiccup turns the whole page into a 404.
     */
    fetchOrNotFound = async <T>(
        fetchResource: () => Promise<T>,
    ): Promise<T> => {
        try {
            return await fetchResource();
        } catch (error: unknown) {
            if (AragonBackendServiceError.isUnresolvableResourceError(error)) {
                notFound();
            }

            throw error;
        }
    };
}

export const notFoundUtils = new NotFoundUtils();
