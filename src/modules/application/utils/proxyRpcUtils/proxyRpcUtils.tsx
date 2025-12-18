import { type NextRequest, NextResponse } from 'next/server';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions, RpcProvider } from '@/shared/constants/networkDefinitions';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { responseUtils } from '@/shared/utils/responseUtils';

export interface IRpcRequestParams {
    /**
     * Chain-id to use for the RPC request.
     */
    chainId: string;
}

export interface IRpcRequestOptions {
    /**
     * Parameters of the RPC request call.
     */
    params: Promise<IRpcRequestParams>;
}

// Configuration mapping RPC provider keys to their environment variable names
const RPC_PROVIDER_ENV_VARS: Record<RpcProvider, string> = {
    [RpcProvider.ALCHEMY]: 'NEXT_SECRET_RPC_KEY',
    [RpcProvider.ANKR]: 'NEXT_SECRET_ANKR_RPC_KEY',
    [RpcProvider.DRPC]: 'NEXT_SECRET_DRPC_RPC_KEY',
    [RpcProvider.PEAQ]: 'NEXT_SECRET_PEAQ_QUICKNODE_RPC_KEY',
};

export class ProxyRpcUtils {
    private rpcKeyByProvider: Partial<Record<RpcProvider, string>>;

    constructor() {
        const isCI = process.env.CI === 'true';

        const providerKeys: Partial<Record<RpcProvider, string>> = {};
        const missingKeys: RpcProvider[] = [];

        for (const [provider, envVar] of Object.entries(RPC_PROVIDER_ENV_VARS) as [RpcProvider, string][]) {
            const key = process.env[envVar];
            providerKeys[provider] = key;

            if (!(isCI || key)) {
                missingKeys.push(provider);
            }
        }

        if (missingKeys.length > 0) {
            const missingEnvVars = missingKeys.map((p) => RPC_PROVIDER_ENV_VARS[p]).join(', ');
            throw new Error(
                `ProxyRpcUtils: Missing RPC keys for providers: ${missingKeys.join(', ')}. Required env vars: ${missingEnvVars}`
            );
        }

        this.rpcKeyByProvider = providerKeys;
    }

    request = async (request: NextRequest, { params }: IRpcRequestOptions) => {
        const { chainId } = await params;

        const rpcEndpoint = this.chainIdToRpcEndpoint(chainId);
        const requestOptions = this.buildRequestOptions(request);

        if (rpcEndpoint == null) {
            return NextResponse.json({ error: `Chain ${chainId} is not supported` }, { status: 501 });
        }

        const monitoringContext = {
            chainId,
            rpcEndpoint,
            requestMethod: request.method,
            requestOptions,
        };

        try {
            const result = await fetch(rpcEndpoint, requestOptions);

            if (!result.ok) {
                monitoringUtils.logError(new Error('RPC endpoint returned error status'), {
                    context: {
                        status: result.status,
                        statusText: result.statusText,
                        ...monitoringContext,
                    },
                });

                return NextResponse.json({ error: `RPC request failed with status ${String(result.status)}` }, { status: 500 });
            }

            // Forward no-content responses as-is without a body
            if (result.status === 204 || result.status === 205 || result.status === 304) {
                return new NextResponse(null, { status: result.status, headers: result.headers });
            }

            try {
                const parsedResult = await responseUtils.safeJsonParseForResponse(result);

                if (parsedResult == null) {
                    return new NextResponse(null, { status: result.status, headers: result.headers });
                }

                return NextResponse.json(parsedResult);
            } catch (jsonError) {
                monitoringUtils.logError(jsonError, {
                    context: {
                        errorType: 'json_parse_error',
                        status: result.status,
                        statusText: result.statusText,
                        ...monitoringContext,
                    },
                });

                return NextResponse.json({ error: 'Invalid JSON response from RPC endpoint' }, { status: 500 });
            }
        } catch (fetchError) {
            monitoringUtils.logError(fetchError, {
                context: {
                    errorType: 'fetch_error',
                    ...monitoringContext,
                },
            });

            return NextResponse.json({ error: 'Failed to connect to RPC endpoint' }, { status: 500 });
        }
    };

    private chainIdToRpcEndpoint = (chainId: string): string | undefined => {
        const network = this.chainIdToNetwork(chainId);

        if (!network) {
            return undefined;
        }

        const { privateRpcConfig, rpcUrls } = networkDefinitions[network];

        if (!privateRpcConfig) {
            return rpcUrls.default.http[0];
        }

        const rpcKey = this.rpcKeyByProvider[privateRpcConfig.rpcProvider];

        if (!rpcKey) {
            monitoringUtils.logError(new Error(`RPC key not found for provider ${privateRpcConfig.rpcProvider}`), {
                context: {
                    chainId,
                    network,
                    rpcProvider: privateRpcConfig.rpcProvider,
                    fallbackToPublicRpc: true,
                },
            });

            return rpcUrls.default.http[0];
        }

        return `${privateRpcConfig.rpcUrl}${rpcKey}`;
    };

    private chainIdToNetwork = (chainId: string): Network | undefined =>
        Object.values(Network).find((network) => networkDefinitions[network as Network].id === Number(chainId));

    // Return type extended to include Node-specific 'duplex' property used for streamed requests.
    private buildRequestOptions = (request: Request): RequestInit & { duplex?: 'half' } => {
        const { method, body } = request;

        // Don't forward headers: avoid RPC 413 "Request Entity Too Large" errors caused by sending headers' data, specifically cookies.
        // (Also, beneficial to prevent potential sensitive data leaks to 3rd party services.)
        return {
            method,
            body,
            headers: {
                'Content-Type': 'application/json',
            },
            // Ensure no implicit credential forwarding
            credentials: 'omit',
            duplex: 'half',
        };
    };
}
