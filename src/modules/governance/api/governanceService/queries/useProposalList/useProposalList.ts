import { type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { IProposal } from '../../domain';
import { governanceService } from '../../governanceService';
import type { IGetProposalListParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const proposalListOptions = <TProposal extends IProposal = IProposal>(
    params: IGetProposalListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<TProposal>, IGetProposalListParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<TProposal>, IGetProposalListParams> => ({
    queryKey: governanceServiceKeys.proposalList(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => governanceService.getProposalList(pageParam),
    getNextPageParam: governanceService.getNextPageParams,
    ...options,
});

export const useProposalList = <TProposal extends IProposal = IProposal>(
    params: IGetProposalListParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<TProposal>, IGetProposalListParams>,
) => {
    return useInfiniteQuery(proposalListOptions(params, options));
};
