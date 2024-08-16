import { IVote } from '@/modules/governance/api/governanceService';
import { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { daoService } from '../../daoService';
import type { IGetVotesListByMemberAddressParams } from '../../daoService.api';
import { daoServiceKeys } from '../../daoServiceKeys';

export const votesListByMemberOptions = (
    params: IGetVotesListByMemberAddressParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IVote>, IGetVotesListByMemberAddressParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<IVote>, IGetVotesListByMemberAddressParams> => ({
    queryKey: daoServiceKeys.votesListByMemberAddress(params),
    initialPageParam: params,
    queryFn: () => daoService.getVotesListByMemberAddress(params),
    getNextPageParam: daoService.getNextPageParamsQuery,
    ...options,
});

export const useVotesListByMember = (
    params: IGetVotesListByMemberAddressParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IVote>, IGetVotesListByMemberAddressParams>,
) => {
    return useInfiniteQuery(votesListByMemberOptions(params, options));
};
