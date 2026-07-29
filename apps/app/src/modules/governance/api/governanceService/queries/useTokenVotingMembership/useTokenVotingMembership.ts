import type { PageDTO, TokenVotingMemberDTO } from '@aragon/aragon-domain';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import { governanceService } from '../../governanceService';
import type { IGetTokenVotingMembershipParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const tokenVotingMembershipOptions = (
    params: IGetTokenVotingMembershipParams,
    options?: InfiniteQueryOptions<
        PageDTO<TokenVotingMemberDTO>,
        IGetTokenVotingMembershipParams
    >,
): SharedInfiniteQueryOptions<
    PageDTO<TokenVotingMemberDTO>,
    IGetTokenVotingMembershipParams
> => ({
    queryKey: governanceServiceKeys.tokenVotingMembership(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) =>
        governanceService.getTokenVotingMembership(pageParam),
    getNextPageParam: governanceService.getNextPageParams,
    ...options,
});
