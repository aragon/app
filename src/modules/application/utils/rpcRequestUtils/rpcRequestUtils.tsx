import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { NextResponse } from 'next/server';

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

export class RpcRequestUtils {
    private rpcKey: string;

    constructor() {
        if (process.env.NEXT_SECRET_RPC_KEY == null && process.env.CI !== 'true') {
            throw new Error('RpcRequestUtils: NEXT_SECRET_RPC_KEY not valid.');
        }

        this.rpcKey = process.env.NEXT_SECRET_RPC_KEY!;
    }

    request = async (request: Request, { params }: IRpcRequestOptions) => {
        const { chainId } = await params;

        const rpcEndpoint = this.chainIdToRpcEndpoint(chainId);
        const requestOptions = this.buildRequestOptions(request);

        if (rpcEndpoint == null) {
            return NextResponse.json({ error: `Chain ${chainId.toString()} is not supported` }, { status: 501 });
        }

        const result = await fetch(rpcEndpoint, requestOptions);
        const parsedResult = (await result.json()) as unknown;

        return NextResponse.json(parsedResult);
    };

    private chainIdToRpcEndpoint = (chainId: string): string | undefined => {
        const network = this.chainIdToNetwork(chainId);
        const rpcEndpoint = network ? networkDefinitions[network].rpc : undefined;

        return rpcEndpoint ? `${rpcEndpoint}${this.rpcKey}` : undefined;
    };

    private chainIdToNetwork = (chainId: string): Network | undefined =>
        Object.values(Network).find((network) => networkDefinitions[network as Network].chainId === Number(chainId));

    private buildRequestOptions = (request: Request): RequestInit => {
        const { method, body, headers } = request;

        return { method, body, headers, duplex: 'half' } as RequestInit;
    };
}
