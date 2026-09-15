import type {
    IGetTokenVotingMembershipParams,
    ITokenVotingMembershipPage,
} from '@/modules/governance/api/tokenVotingMembershipService';
import { tokenVotingMembershipServiceClient } from '@/modules/governance/api/tokenVotingMembershipService';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import { governanceServiceKeys } from '../../governanceServiceKeys';

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
    queryKey: governanceServiceKeys.tokenVotingMembership(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) =>
        tokenVotingMembershipServiceClient.getTokenVotingMembership(pageParam),
    getNextPageParam: tokenVotingMembershipServiceClient.getNextPageParams,
    ...options,
});
