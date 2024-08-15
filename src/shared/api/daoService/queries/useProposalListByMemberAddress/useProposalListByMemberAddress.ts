import { IProposal } from '@/modules/governance/api/governanceService';
import { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { InfiniteQueryOptions, SharedInfiniteQueryOptions } from '@/shared/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { daoService } from '../../daoService';
import type { IGetProposalListByMemberAddressParams } from '../../daoService.api';
import { daoServiceKeys } from '../../daoServiceKeys';

export const proposalListByMemberOptions = (
    params: IGetProposalListByMemberAddressParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IProposal>, IGetProposalListByMemberAddressParams>,
): SharedInfiniteQueryOptions<IPaginatedResponse<IProposal>, IGetProposalListByMemberAddressParams> => ({
    queryKey: daoServiceKeys.proposalListByMemberAddress(params),
    initialPageParam: params,
    queryFn: () => daoService.getProposalListByMemberAddress(params),
    getNextPageParam: daoService.getNextPageParamsQuery,
    ...options,
});

export const useProposalListByMember = (
    params: IGetProposalListByMemberAddressParams,
    options?: InfiniteQueryOptions<IPaginatedResponse<IProposal>, IGetProposalListByMemberAddressParams>,
) => {
    return useInfiniteQuery(proposalListByMemberOptions(params, options));
};
