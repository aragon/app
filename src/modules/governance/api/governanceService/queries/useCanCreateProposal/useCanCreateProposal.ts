import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { governanceService } from '../../governanceService';
import type { IGetCanCreateProposalParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';
import type { ICanCreateProposalResult } from '../../../../types';

export const canCreateProposalOptions = (
    params: IGetCanCreateProposalParams,
    options?: QueryOptions<ICanCreateProposalResult>,
): SharedQueryOptions<ICanCreateProposalResult> => ({
    queryKey: governanceServiceKeys.canCreateProposal(params),
    queryFn: () => governanceService.getCanCreateProposal(params),
    ...options,
});

export const useCanCreateProposal = (
    params: IGetCanCreateProposalParams,
    options?: QueryOptions<ICanCreateProposalResult>,
) => {
    return useQuery(canCreateProposalOptions(params, options));
};
