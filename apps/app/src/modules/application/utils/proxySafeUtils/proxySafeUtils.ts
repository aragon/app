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
            const result = await fetch(
                upstreamUrl,
                this.buildRequestOptions(apiKey),
            );

            if (result.status === 429) {
                // Quota exhaustion is expected under load: answer with a typed degraded response
                // carrying the upstream backoff instead of an anonymous 500.
                const retryAfter = this.parseRetryAfter(result);

                monitoringUtils.logMessage(
                    'Safe transaction service rate limit',
                    {
                        context: {
                            retryAfter: retryAfter ?? null,
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

            const parsedResult =
                await responseUtils.safeJsonParseForResponse(result);

            if (parsedResult == null) {
                return this.errorResponse({
                    code: SafeServiceErrorCode.INVALID_RESPONSE,
                    error: 'Invalid JSON response from the Safe transaction service',
                    status: 502,
                });
            }

            return NextResponse.json(parsedResult);
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

    private parseRetryAfter = (response: Response): number | undefined => {
        const retryAfter = Number(response.headers.get('retry-after'));

        return Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter
            : undefined;
    };

    /**
     * Builds the upstream request options. No request headers are forwarded: the Safe service
     * needs none of them, and forwarding cookies would leak user data to a third party.
     */
    private buildRequestOptions = (apiKey: string): RequestInit => ({
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        credentials: 'omit',
    });

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
