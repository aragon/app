import { useQuery } from '@tanstack/react-query';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

export interface IUseIpfsJsonParams<TData> {
    /**
     * CID to fetch. Accepts both `bafy...` raw CIDs and `ipfs://bafy...` URIs.
     * The hook is disabled when nullish so callers can pass the result of
     * another query directly.
     */
    cid: string | null | undefined;
    /**
     * Optional runtime validator. When the parsed JSON does not satisfy the
     * guard the query rejects with a descriptive error rather than passing
     * unsafe data to the consumer.
     */
    validate?: (value: unknown) => value is TData;
}

/** Cache config for IPFS-pinned content. CIDs are immutable so a long TTL is safe. */
export const IPFS_JSON_CACHE = {
    /** Treat IPFS content as fresh for an hour before background revalidation. */
    staleTime: 60 * 60 * 1000,
    /** Retain unused entries for 24 hours. */
    gcTime: 24 * 60 * 60 * 1000,
} as const;

/**
 * Fetches a JSON document from the Pinata gateway by CID. Read-only — no JWT
 * required since the gateway URL is public for our pinned content. Pairs with
 * `usePinJson` (write side) to round-trip a JSON blob through IPFS.
 */
export const useIpfsJson = <TData = unknown>(
    params: IUseIpfsJsonParams<TData>,
) => {
    const { cid, validate } = params;
    const url = ipfsUtils.cidToJsonUrl(cid);

    return useQuery<TData>({
        queryKey: ['ipfsJson', url],
        queryFn: async () => {
            if (url == null) {
                throw new Error('useIpfsJson queryFn ran without a CID');
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch IPFS JSON at ${url}: ${response.status} ${response.statusText}`,
                );
            }

            const parsed: unknown = await response.json();
            if (validate != null && !validate(parsed)) {
                throw new Error(
                    `IPFS JSON at ${url} did not match the expected shape`,
                );
            }

            return parsed as TData;
        },
        enabled: url != null,
        staleTime: IPFS_JSON_CACHE.staleTime,
        gcTime: IPFS_JSON_CACHE.gcTime,
    });
};
