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
        path: string[],
    ): Promise<RequestInit | undefined> => {
        const method = request.method;

        if (method !== 'GET' && method !== 'POST') {
            return undefined;
        }

        if (method === 'POST' && !this.isSupportedPostPath(path)) {
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

        return {
            method,
            body,
            cache: 'no-store',
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
     * POST is intentionally narrower than GET. The proxy API key must not become an authenticated
     * open relay for unrelated transaction-service mutations.
     */
    private isSupportedPostPath = (path: string[]): boolean => {
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
