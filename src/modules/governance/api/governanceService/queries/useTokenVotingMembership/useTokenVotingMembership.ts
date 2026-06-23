import type { TokenVotingMemberDTO } from '@aragon/aragon-subdomain';
import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type {
    InfiniteQueryOptions,
    SharedInfiniteQueryOptions,
} from '@/shared/types';
import { governanceService } from '../../governanceService';
import type { IGetMemberListParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const tokenVotingMembershipOptions = (
    params: IGetMemberListParams,
    options?: InfiniteQueryOptions<
        IPaginatedResponse<TokenVotingMemberDTO>,
        IGetMemberListParams
    >,
): SharedInfiniteQueryOptions<
    IPaginatedResponse<TokenVotingMemberDTO>,
    IGetMemberListParams
> => ({
    queryKey: governanceServiceKeys.tokenVotingMembership(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) =>
        governanceService.getTokenVotingMembership(pageParam),
    getNextPageParam: governanceService.getNextPageParams,
    ...options,
});
