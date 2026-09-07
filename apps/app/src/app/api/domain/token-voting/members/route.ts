import type { GetTokenVotingMembershipRequestDTO } from '@aragon/aragon-domain';
import { type NextRequest, NextResponse } from 'next/server';
// biome-ignore lint/style/noRestrictedImports: server-only BFF validation; strict EIP-55 validation is explicitly disabled.
import { isAddress } from 'viem';
import { tokenVotingMembershipServiceServer } from '@/modules/governance/api/tokenVotingMembershipService/tokenVotingMembershipService.server';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';

const maximumPageSize = 250;

const isPositiveInteger = (value: number): boolean =>
    Number.isInteger(value) && value > 0;

const validateQueryParams = (
    params: URLSearchParams,
): GetTokenVotingMembershipRequestDTO | undefined => {
    const chainId = params.get('chainId');
    const pluginAddress = params.get('pluginAddress');
    const tokenContractAddress = params.get('tokenContractAddress');
    const page = params.get('page');
    const pageSize = params.get('pageSize');
    const parsedChainId = chainId != null ? Number(chainId) : undefined;
    const parsedPage = page != null ? Number(page) : undefined;
    const parsedPageSize = pageSize != null ? Number(pageSize) : undefined;

    if (
        parsedChainId == null ||
        !isPositiveInteger(parsedChainId) ||
        pluginAddress == null ||
        tokenContractAddress == null ||
        !isAddress(pluginAddress, { strict: false }) ||
        !isAddress(tokenContractAddress, { strict: false }) ||
        (parsedPage != null && !isPositiveInteger(parsedPage)) ||
        (parsedPageSize != null &&
            (!isPositiveInteger(parsedPageSize) ||
                parsedPageSize > maximumPageSize))
    ) {
        return;
    }

    return {
        chainId: parsedChainId,
        pluginAddress,
        tokenContractAddress,
        page: parsedPage,
        pageSize: parsedPageSize,
    };
};

export const GET = async (req: NextRequest) => {
    const queryParams = validateQueryParams(req.nextUrl.searchParams);

    if (queryParams == null) {
        return NextResponse.json(
            {
                error: 'chainId must be a positive integer; pluginAddress and tokenContractAddress must be valid addresses; page must be a positive integer; pageSize must be a positive integer no greater than 250',
            },
            { status: 400 },
        );
    }

    try {
        const result =
            await tokenVotingMembershipServiceServer.getTokenVotingMembership({
                queryParams,
            });

        return NextResponse.json(result);
    } catch (error) {
        monitoringUtils.logError(error, {
            context: {
                errorType: 'get_token_voting_membership_error',
                chainId: queryParams.chainId,
                pluginAddress: queryParams.pluginAddress,
                tokenContractAddress: queryParams.tokenContractAddress,
            },
        });

        return NextResponse.json(
            { error: 'getTokenVotingMembership request failed' },
            { status: 500 },
        );
    }
};
