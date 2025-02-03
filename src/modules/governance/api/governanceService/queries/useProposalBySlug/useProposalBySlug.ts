import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import type { IProposal } from '../../domain';
import { governanceService } from '../../governanceService';
import type { IGetProposalBySlugParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const proposalOptions = <TProposal extends IProposal = IProposal>(
    params: IGetProposalBySlugParams,
    options?: QueryOptions<TProposal>,
): SharedQueryOptions<TProposal> => ({
    queryKey: governanceServiceKeys.proposal(params),
    queryFn: () => governanceService.getProposalBySlug(params),
    ...options,
});

export const useProposalBySlug = <TProposal extends IProposal = IProposal>(
    params: IGetProposalBySlugParams,
    options?: QueryOptions<TProposal>,
) => {
    return useQuery(proposalOptions(params, options));
};
