import 'server-only';
import type {
    IGetTokenVotingMembershipParams,
    ITokenVotingMembershipPage,
} from '@/modules/governance/api/tokenVotingMembershipService';
import { tokenVotingMembershipServiceServer } from '@/modules/governance/api/tokenVotingMembershipService/tokenVotingMembershipService.server';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import { tokenVotingMembershipOptions } from './useTokenVotingMembership';

/**
 * Server variant of `tokenVotingMembershipOptions` for RSC prefetching. It
 * shares the query key with the client options, so the dehydrated cache
 * resolves the client query without a second network call, and calls the same
 * BFF service in-process instead of going through the route (a server-side
 * relative fetch would fail).
 *
 * @example
 * await queryClient.prefetchInfiniteQuery(
 *     tokenVotingMembershipOptionsServer(params),
 * );
 */
export const tokenVotingMembershipOptionsServer = (
    params: IGetTokenVotingMembershipParams,
    options?: InfiniteQueryOptions<
        ITokenVotingMembershipPage,
        IGetTokenVotingMembershipParams
    >,
): SharedInfiniteQueryOptions<
    ITokenVotingMembershipPage,
    IGetTokenVotingMembershipParams
> => ({
    ...tokenVotingMembershipOptions(params, options),
    queryFn: ({ pageParam }) =>
        tokenVotingMembershipServiceServer.getTokenVotingMembership(pageParam),
});
