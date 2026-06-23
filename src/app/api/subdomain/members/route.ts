import {
    AragonSubdomain,
    EnvioClient,
    type PageDTO,
    type TokenVotingMemberDTO,
} from '@aragon/aragon-subdomain';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * BFF route for the aragon-subdomain token-voting members endpoint.
 * Routed to for the mainnet ERC-20 token-voting slice — see
 * `governanceService.getTokenVotingMembership` for the routing logic.
 */

const endpoint =
    process.env.ENVIO_GRAPHQL_ENDPOINT ?? 'http://localhost:8080/v1/graphql';
const apiToken = process.env.ENVIO_API_TOKEN;

const controller = AragonSubdomain.load(new EnvioClient(endpoint, apiToken));

export const GET = async (req: NextRequest) => {
    const params = req.nextUrl.searchParams;
    const pluginAddress = params.get('pluginAddress');
    const tokenContractAddress = params.get('tokenAddress');
    const page = Number(params.get('page') ?? '1');
    const pageSize = Number(params.get('pageSize') ?? '10');

    if (!pluginAddress || !tokenContractAddress) {
        return NextResponse.json(
            {
                error: 'pluginAddress and tokenAddress query parameters are required',
            },
            { status: 400 },
        );
    }

    const result = await controller.getTokenVotingMembership({
        pluginAddress,
        tokenContractAddress,
        page,
        pageSize,
    });

    if (!result.success) {
        return NextResponse.json(
            { error: 'Subdomain request failed' },
            { status: 500 },
        );
    }

    const payload: PageDTO<TokenVotingMemberDTO> = result.result;

    return NextResponse.json(payload);
};
