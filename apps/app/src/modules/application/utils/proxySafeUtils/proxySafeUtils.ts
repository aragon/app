import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { SafeServiceErrorCode } from '@/shared/api/safeService/domain';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { responseUtils } from '@/shared/utils/responseUtils';
import {
    assertServerSafeConfig,
    resolveServerSafeApiKey,
    resolveServerSafeUrl,
} from './resolveServerSafeUrl';
import { safeNetworkFromChainId } from './safeTxServiceNetworks';

const DEFAULT_RATE_LIMIT_BACKOFF_SECONDS = 60;

/**
 * How long a Safe read may be served from Next's data cache.
 *
 * This is the only place where N concurrent viewers of one Safe collapse into one upstream call:
 * without it, every viewer's poll is its own request against a single shared, rate-limited API key.
 *
 * Deliberately short. The Safe nonce drives liveness derivation, and execution happens onchain —
 * outside this proxy — so nothing invalidates the cache when the nonce advances. Ten seconds bounds
 * that staleness, and the post-execution indexing hold already covers the window in the UI.
 */
const SAFE_READ_CACHE_SECONDS = 10;

export interface ISafeRequestParams {
    /**
     * Chain-id of the Safe transaction service to forward the request to.
     */
    chainId: string;
    /**
     * Remaining path segments of the upstream Safe transaction service request.
     */
    path: string[];
}

export interface ISafeRequestOptions {
    /**
     * Parameters of the Safe proxy call.
     */
    params: Promise<ISafeRequestParams>;
}

interface ISafeErrorResponseParams {
    code: SafeServiceErrorCode;
    error: string;
    status: number;
    retryAfter?: number;
}

const safeAddressPattern = /^0x[a-fA-F0-9]{40}$/;
const safeTransactionHashPattern = /^0x[a-fA-F0-9]{64}$/;

export class ProxySafeUtils {
    constructor() {
        assertServerSafeConfig();
    }

    request = async (request: NextRequest, { params }: ISafeRequestOptions) => {
        const { chainId, path } = await params;

        const network = safeNetworkFromChainId(chainId);
        const endpoint =
            network != null ? resolveServerSafeUrl(network) : undefined;

        if (endpoint == null) {
            // Not an error: Citrea and Chiliz have no Safe transaction service, and consumers
            // render a dedicated state for it.
            return this.errorResponse({
                code: SafeServiceErrorCode.UNSUPPORTED_CHAIN,
                error: `Chain ${chainId} is not served by the Safe transaction service`,
                status: 501,
            });
        }

        const upstreamPath = this.buildUpstreamPath(path);

        if (upstreamPath == null) {
            return this.errorResponse({
                code: SafeServiceErrorCode.UPSTREAM_ERROR,
                error: 'Invalid Safe transaction service path',
                status: 400,
            });
        }

        const apiKey = resolveServerSafeApiKey();

        if (apiKey == null) {
            return this.errorResponse({
                code: SafeServiceErrorCode.NOT_CONFIGURED,
                error: 'Safe API key is not configured for this deployment',
                status: 503,
            });
        }

        const upstreamUrl = `${endpoint.baseUrl}${upstreamPath}${request.nextUrl.search}`;
        const monitoringContext = {
            chainId,
            shortName: endpoint.shortName,
            upstreamPath,
        };

        try {
            const requestOptions = await this.buildRequestOptions(
                request,
                apiKey,
                chainId,
                path,
            );

            if (requestOptions == null) {
                return this.errorResponse({
                    code: SafeServiceErrorCode.UPSTREAM_ERROR,
                    error: 'Invalid Safe transaction service request',
                    status: 400,
                });
            }

            const result = await fetch(upstreamUrl, requestOptions);

            if (result.status === 429) {
                // Quota exhaustion is expected under load: answer with a typed degraded response
                // carrying the upstream backoff instead of an anonymous 500.
                const retryAfter = this.parseRetryAfter(result);

                monitoringUtils.logMessage(
                    'Safe transaction service rate limit',
                    {
                        context: {
                            retryAfter,
                            ...monitoringContext,
                        },
                        level: 'warning',
                        noiseClass: 'infra',
                    },
                );

                return this.errorResponse({
                    code: SafeServiceErrorCode.RATE_LIMITED,
                    error: 'Safe transaction service rate limit reached',
                    status: 429,
                    retryAfter,
                });
            }

            if (!result.ok) {
                const isNotFound = result.status === 404;

                if (!isNotFound) {
                    monitoringUtils.logError(
                        new Error(
                            'Safe transaction service returned error status',
                        ),
                        {
                            context: {
                                status: result.status,
                                statusText: result.statusText,
                                ...monitoringContext,
                            },
                        },
                    );
                }

                return this.errorResponse({
                    code: isNotFound
                        ? SafeServiceErrorCode.NOT_FOUND
                        : SafeServiceErrorCode.UPSTREAM_ERROR,
                    error: `Safe request failed with status ${String(result.status)}`,
                    status: result.status,
                });
            }

            // A signer must see their own signature on the next read, so drop the cached Safe
            // state now rather than serving the pre-signature queue for the rest of its window.
            if (request.method === 'POST') {
                for (const tag of this.buildCacheTags(chainId, path)) {
                    revalidateTag(tag, { expire: 0 });
                }
            }

            if (
                request.method === 'POST' &&
                [201, 204, 205].includes(result.status)
            ) {
                return new NextResponse(null, { status: result.status });
            }

            const parsedResult =
                await responseUtils.safeJsonParseForResponse(result);

            if (parsedResult == null && result.status !== 204) {
                return this.errorResponse({
                    code: SafeServiceErrorCode.INVALID_RESPONSE,
                    error: 'Invalid JSON response from the Safe transaction service',
                    status: 502,
                });
            }

            if (parsedResult == null) {
                return new NextResponse(null, { status: result.status });
            }

            return result.status === 200
                ? NextResponse.json(parsedResult)
                : NextResponse.json(parsedResult, { status: result.status });
        } catch (fetchError) {
            monitoringUtils.logError(fetchError, {
                context: { errorType: 'fetch_error', ...monitoringContext },
            });

            return this.errorResponse({
                code: SafeServiceErrorCode.CONNECTION_ERROR,
                error: 'Failed to connect to the Safe transaction service',
                status: 502,
            });
        }
    };

    /**
     * Joins the catch-all segments into an upstream path, rejecting anything that could escape
     * the Safe transaction service base URL. Returns undefined for an invalid path.
     *
     * A trailing slash is always appended because every Safe transaction service endpoint
     * requires one, while Next.js strips it from the incoming request.
     */
    private buildUpstreamPath = (path: string[]): string | undefined => {
        if (path.length === 0) {
            return undefined;
        }

        const isValid = path.every(
            (segment) => segment.length > 0 && !segment.includes('..'),
        );

        if (!isValid) {
            return undefined;
        }

        const encodedPath = path
            .map((segment) => encodeURIComponent(segment))
            .join('/');

        return `/${encodedPath}/`;
    };

    private parseRetryAfter = (response: Response): number => {
        const retryAfterHeader = response.headers.get('retry-after');
        const retryAfterSeconds = Number(retryAfterHeader);

        if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
            return Math.ceil(retryAfterSeconds);
        }

        if (retryAfterHeader != null) {
            const retryAt = Date.parse(retryAfterHeader);

            if (Number.isFinite(retryAt) && retryAt > Date.now()) {
                return Math.ceil((retryAt - Date.now()) / 1000);
            }
        }

        return DEFAULT_RATE_LIMIT_BACKOFF_SECONDS;
    };

    /**
     * Builds the upstream request options. No request headers are forwarded: the Safe service
     * needs none of them, and forwarding cookies would leak user data to a third party.
     */
    private buildRequestOptions = async (
        request: NextRequest,
        apiKey: string,
        chainId: string,
        path: string[],
    ): Promise<RequestInit | undefined> => {
        const method = request.method;

        if (method !== 'GET' && method !== 'POST') {
            return undefined;
        }

        if (!this.isSupportedPath(method, path)) {
            return undefined;
        }

        let body: string | undefined;

        if (method === 'POST') {
            try {
                const parsedBody: unknown = await request.json();

                if (
                    parsedBody == null ||
                    typeof parsedBody !== 'object' ||
                    Array.isArray(parsedBody)
                ) {
                    return undefined;
                }

                body = JSON.stringify(parsedBody);
            } catch {
                return undefined;
            }
        }

        // Reads are shared across viewers; writes must never be cached.
        const isCacheableRead = method === 'GET';

        return {
            method,
            body,
            ...(isCacheableRead
                ? {
                      next: {
                          revalidate: SAFE_READ_CACHE_SECONDS,
                          tags: this.buildCacheTags(chainId, path),
                      },
                  }
                : { cache: 'no-store' as RequestCache }),
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${apiKey}`,
                ...(method === 'POST'
                    ? { 'Content-Type': 'application/json' }
                    : {}),
            },
            credentials: 'omit',
        };
    };

    /**
     * Cache tags for a Safe read: one per chain and, when the path names a Safe, one per Safe.
     *
     * A proposal POST carries the Safe address and can invalidate precisely. A confirmation POST
     * does not — its path is keyed by `safeTxHash` — so it falls back to the chain tag and
     * invalidates every Safe on that chain. Confirmations are human signing actions and therefore
     * rare, so the occasional extra read is cheaper than threading the address through the
     * confirmation URL purely to narrow a tag.
     */
    private buildCacheTags = (chainId: string, path: string[]): string[] => {
        const chainTag = `safe:${chainId}`;
        const address = path[1] === 'safes' ? path[2] : undefined;

        if (address == null || !safeAddressPattern.test(address)) {
            return [chainTag];
        }

        return [chainTag, `${chainTag}:${address.toLowerCase()}`];
    };

    /**
     * Every path this proxy will forward, by method.
     *
     * `/v2/safe/*` on the Aragon backend now serves the reads a governance body needs, so what is
     * left here is only what the backend does not: balances, and the two signature-bearing writes.
     * The surface is allowlisted rather than open because the route is unauthenticated and spends a
     * shared API key — an open GET would let anyone drive the whole transaction service on our quota.
     */
    private isSupportedPath = (method: string, path: string[]): boolean => {
        if (method === 'GET') {
            return (
                path.length === 4 &&
                path[0] === 'v1' &&
                path[1] === 'safes' &&
                safeAddressPattern.test(path[2]) &&
                path[3] === 'balances'
            );
        }

        const isProposalPath =
            path.length === 4 &&
            path[0] === 'v1' &&
            path[1] === 'safes' &&
            safeAddressPattern.test(path[2]) &&
            path[3] === 'multisig-transactions';
        const isConfirmationPath =
            path.length === 4 &&
            path[0] === 'v1' &&
            path[1] === 'multisig-transactions' &&
            safeTransactionHashPattern.test(path[2]) &&
            path[3] === 'confirmations';

        return isProposalPath || isConfirmationPath;
    };

    private errorResponse = ({
        code,
        error,
        status,
        retryAfter,
    }: ISafeErrorResponseParams) =>
        NextResponse.json(
            { error, code, retryAfter },
            {
                status,
                headers:
                    retryAfter != null
                        ? { 'Retry-After': String(retryAfter) }
                        : undefined,
            },
        );
}
