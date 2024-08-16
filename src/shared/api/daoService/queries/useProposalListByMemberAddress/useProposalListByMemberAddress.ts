import { IProposal } from '@/modules/governance/api/governanceService';
import { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { daoService } from '../../daoService';
import type { IGetProposalListByMemberAddressParams } from '../../daoService.api';
import { daoServiceKeys } from '../../daoServiceKeys';

export const proposalListByMemberOptions = <TProposal extends IProposal = IProposal>(
    params: IGetProposalListByMemberAddressParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<TProposal>, IGetProposalListByMemberAddressParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<TProposal>, IGetProposalListByMemberAddressParams> => ({
    queryKey: daoServiceKeys.proposalListByMemberAddress(params),
    initialPageParam: params,
    queryFn: ({ pageParam }) => daoService.getProposalListByMemberAddress(pageParam),
    getNextPageParam: daoService.getNextPageParamsQuery,
    ...options,
});

export const useProposalListByMemberAddress = <TProposal extends IProposal = IProposal>(
    params: IGetProposalListByMemberAddressParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<TProposal>, IGetProposalListByMemberAddressParams>,
) => {
    return useInfiniteQuery(proposalListByMemberOptions(params, options));
};
