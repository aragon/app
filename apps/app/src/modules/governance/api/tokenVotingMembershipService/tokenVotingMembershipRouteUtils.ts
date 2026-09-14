import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { tokenVotingMembershipServiceServer } from './tokenVotingMembershipService.server';
import {
    maximumPageSize,
    parseMembershipQueryParams,
} from './tokenVotingMembershipService.utils';

/**
 * Handler of the token-voting membership BFF route. Lives next to the service
 * so that `/app` only wires the route up, see `docs/projectDocs/projectStructure.md`.
 */
class TokenVotingMembershipRouteUtils {
    request = async (req: NextRequest) => {
        const queryParams = parseMembershipQueryParams(
            req.nextUrl.searchParams,
        );

        if (queryParams == null) {
            return NextResponse.json(
                {
                    error: `daoId must be a <network>-<address> id; pluginAddress must be a valid address; page must be a positive integer; pageSize must be a positive integer no greater than ${String(maximumPageSize)}`,
                },
                { status: 400 },
            );
        }

        try {
            const result =
                await tokenVotingMembershipServiceServer.getTokenVotingMembership(
                    { queryParams },
                );

            return NextResponse.json(result);
        } catch (error) {
            monitoringUtils.logError(error, {
                context: {
                    errorType: 'get_token_voting_membership_error',
                    daoId: queryParams.daoId,
                    pluginAddress: queryParams.pluginAddress,
                    page: queryParams.page,
                },
            });

            return NextResponse.json(
                { error: 'getTokenVotingMembership request failed' },
                { status: 500 },
            );
        }
    };
}

export const tokenVotingMembershipRouteUtils =
    new TokenVotingMembershipRouteUtils();
