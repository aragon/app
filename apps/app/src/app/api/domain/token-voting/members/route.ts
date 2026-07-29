import { type NextRequest, NextResponse } from 'next/server';
import { tokenVotingMembershipServiceServer } from '@/modules/governance/api/tokenVotingMembershipService/tokenVotingMembershipService.server';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';

export const GET = async (req: NextRequest) => {
    const params = req.nextUrl.searchParams;
    const pluginAddress = params.get('pluginAddress');
    const tokenContractAddress = params.get('tokenContractAddress');
    const page = params.get('page');
    const pageSize = params.get('pageSize');

    if (pluginAddress == null || tokenContractAddress == null) {
        return NextResponse.json(
            {
                error: 'pluginAddress and tokenContractAddress query parameters are required',
            },
            { status: 400 },
        );
    }

    try {
        const result =
            await tokenVotingMembershipServiceServer.getTokenVotingMembership({
                queryParams: {
                    pluginAddress,
                    tokenContractAddress,
                    page: page != null ? Number(page) : undefined,
                    pageSize: pageSize != null ? Number(pageSize) : undefined,
                },
            });

        return NextResponse.json(result);
    } catch (error) {
        monitoringUtils.logError(error, {
            context: {
                errorType: 'get_token_voting_membership_error',
                pluginAddress,
                tokenContractAddress,
            },
        });

        return NextResponse.json(
            { error: 'getTokenVotingMembership request failed' },
            { status: 500 },
        );
    }
};
