import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { governanceService } from '../../governanceService';
import type { IGetCanCreateProposalParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const canCreateProposalOptions = (
    params: IGetCanCreateProposalParams,
    options?: QueryOptions<boolean>,
): SharedQueryOptions<boolean> => ({
    queryKey: governanceServiceKeys.canCreateProposal(params),
    queryFn: () => governanceService.getCanCreateProposal(params),
    ...options,
});

export const useCanCreateProposal = (params: IGetCanCreateProposalParams, options?: QueryOptions<boolean>) => {
    return useQuery(canCreateProposalOptions(params, options));
};
