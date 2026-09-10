import 'server-only';
import type { PageDTO, TokenVotingMemberDTO } from '@aragon/aragon-domain';
import type { ITokenMember } from '@/plugins/tokenPlugin/types';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import { tokenVotingMembershipServiceServer } from '../../../tokenVotingMembershipService/tokenVotingMembershipService.server';
import { governanceService } from '../../governanceService';
import type { IGetTokenVotingMembershipParams } from '../../governanceService.api';
import { fetchTokenVotingMembership } from '../../utils/fetchTokenVotingMembership';
import { tokenVotingMembershipOptions } from './useTokenVotingMembership';

/**
 * Server variant of `tokenVotingMembershipOptions` for RSC prefetching. It
 * shares the query key with the client options, so the dehydrated cache
 * resolves the client query without a second network call, but routes the
 * aragon-domain branch through the in-process controller instead of the BFF
 * route (a server-side relative fetch would fail).
 *
 * @example
 * await queryClient.prefetchInfiniteQuery(
 *     tokenVotingMembershipOptionsServer(params),
 * );
 */
export const tokenVotingMembershipOptionsServer = (
    params: IGetTokenVotingMembershipParams,
    options?: InfiniteQueryOptions<
        PageDTO<TokenVotingMemberDTO>,
        IGetTokenVotingMembershipParams
    >,
): SharedInfiniteQueryOptions<
    PageDTO<TokenVotingMemberDTO>,
    IGetTokenVotingMembershipParams
> => ({
    ...tokenVotingMembershipOptions(params, options),
    queryFn: ({ pageParam }) =>
        fetchTokenVotingMembership(
            pageParam,
            tokenVotingMembershipServiceServer.getTokenVotingMembership,
            (legacyParams) =>
                governanceService.getMemberList<ITokenMember>(legacyParams),
        ),
});
