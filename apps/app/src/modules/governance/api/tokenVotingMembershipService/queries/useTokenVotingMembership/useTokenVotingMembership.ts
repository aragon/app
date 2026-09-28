import { useInfiniteQuery } from '@tanstack/react-query';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import type {
    IGetTokenVotingMembershipParams,
    ITokenVotingMembershipPage,
} from '../../tokenVotingMembershipService.api';
import { tokenVotingMembershipServiceClient } from '../../tokenVotingMembershipService.client';
import { tokenVotingMembershipServiceKeys } from '../../tokenVotingMembershipServiceKeys';

export const tokenVotingMembershipOptions = (
    params: IGetTokenVotingMembershipParams,
    options?: InfiniteQueryOptions<
        ITokenVotingMembershipPage,
        IGetTokenVotingMembershipParams
    >,
): SharedInfiniteQueryOptions<
    ITokenVotingMembershipPage,
    IGetTokenVotingMembershipParams
> => ({
    queryKey: tokenVotingMembershipServiceKeys.membership(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) =>
        tokenVotingMembershipServiceClient.getTokenVotingMembership(pageParam),
    getNextPageParam: tokenVotingMembershipServiceClient.getNextPageParams,
    ...options,
});

export const useTokenVotingMembership = (
    params: IGetTokenVotingMembershipParams,
    options?: InfiniteQueryOptions<
        ITokenVotingMembershipPage,
        IGetTokenVotingMembershipParams
    >,
) => useInfiniteQuery(tokenVotingMembershipOptions(params, options));
