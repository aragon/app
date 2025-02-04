import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import type { IProposal } from '../../domain';
import { governanceService } from '../../governanceService';
import type { IGetProposalBySlugParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const proposalBySlugOptions = <TProposal extends IProposal = IProposal>(
    params: IGetProposalBySlugParams,
    options?: QueryOptions<TProposal>,
): SharedQueryOptions<TProposal> => ({
    queryKey: governanceServiceKeys.proposalBySlug(params),
    queryFn: () => governanceService.getProposalBySlug(params),
    ...options,
});

export const useProposalBySlug = <TProposal extends IProposal = IProposal>(
    params: IGetProposalBySlugParams,
    options?: QueryOptions<TProposal>,
) => {
    return useQuery(proposalBySlugOptions(params, options));
};
