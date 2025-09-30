import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { type NextRequest, NextResponse } from 'next/server';

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

export class ProxyRpcUtils {
    private rpcKey: string;

    constructor() {
        if (process.env.NEXT_SECRET_RPC_KEY == null && process.env.CI !== 'true') {
            throw new Error('RpcRequestUtils: NEXT_SECRET_RPC_KEY not valid.');
        }

        this.rpcKey = process.env.NEXT_SECRET_RPC_KEY!;
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

                return NextResponse.json(
                    { error: `RPC request failed with status ${String(result.status)}` },
                    { status: 500 },
                );
            }

            try {
                const parsedResult = (await result.json()) as unknown;

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
        const { privateRpc, rpcUrls } = network ? networkDefinitions[network] : {};

        return privateRpc ? `${privateRpc}${this.rpcKey}` : rpcUrls?.default.http[0];
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
