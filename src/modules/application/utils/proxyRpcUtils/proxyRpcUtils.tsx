import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
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

        const result = await fetch(rpcEndpoint, requestOptions);
        const parsedResult = (await result.json()) as unknown;

        return NextResponse.json(parsedResult);
    };

    private chainIdToRpcEndpoint = (chainId: string): string | undefined => {
        const network = this.chainIdToNetwork(chainId);
        const { privateRpc, rpcUrls } = network ? networkDefinitions[network] : {};

        return privateRpc ? `${privateRpc}${this.rpcKey}` : rpcUrls?.default.http[0];
    };

    private chainIdToNetwork = (chainId: string): Network | undefined =>
        Object.values(Network).find((network) => networkDefinitions[network as Network].id === Number(chainId));

    private buildRequestOptions = (request: Request): RequestInit => {
        const { method, body, headers } = request;

        // Remove cookies: avoid RPC 413 "Request Entity Too Large" errors caused by sending too much cookies data.
        const filteredHeaders = new Headers(headers);
        filteredHeaders.delete('cookie');
        filteredHeaders.delete('Cookie');

        return {
            method,
            body,
            headers: filteredHeaders,
            // Ensure no implicit credential forwarding
            credentials: 'omit',
            duplex: 'half',
        } as RequestInit;
    };
}
