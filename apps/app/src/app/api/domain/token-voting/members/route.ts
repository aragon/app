import { type NextRequest, NextResponse } from 'next/server';
// biome-ignore lint/style/noRestrictedImports: server-only BFF validation; strict EIP-55 validation is explicitly disabled.
import { isAddress } from 'viem';
import { tokenVotingMembershipServiceServer } from '@/modules/governance/api/tokenVotingMembershipService/tokenVotingMembershipService.server';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';

const maximumPageSize = 250;

interface ITokenVotingMembershipQueryParams {
    pluginAddress: string;
    tokenContractAddress: string;
    page?: number;
    pageSize?: number;
}

const validateQueryParams = (
    params: URLSearchParams,
): ITokenVotingMembershipQueryParams | undefined => {
    const pluginAddress = params.get('pluginAddress');
    const tokenContractAddress = params.get('tokenContractAddress');
    const page = params.get('page');
    const pageSize = params.get('pageSize');
    const parsedPage = page != null ? Number(page) : undefined;
    const parsedPageSize = pageSize != null ? Number(pageSize) : undefined;

    if (
        pluginAddress == null ||
        tokenContractAddress == null ||
        !isAddress(pluginAddress, { strict: false }) ||
        !isAddress(tokenContractAddress, { strict: false }) ||
        (parsedPage != null &&
            (!Number.isInteger(parsedPage) || parsedPage <= 0)) ||
        (parsedPageSize != null &&
            (!Number.isInteger(parsedPageSize) ||
                parsedPageSize <= 0 ||
                parsedPageSize > maximumPageSize))
    ) {
        return;
    }

    return {
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
                error: 'pluginAddress and tokenContractAddress must be valid addresses; page must be a positive integer; pageSize must be a positive integer no greater than 250',
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
