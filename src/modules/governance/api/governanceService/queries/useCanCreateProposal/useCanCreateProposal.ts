import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { ICanCreateProposalResult } from '../../../../types';
import { governanceService } from '../../governanceService';
import type { IGetCanCreateProposalParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const canCreateProposalOptions = (
    params: IGetCanCreateProposalParams,
    options?: QueryOptions<ICanCreateProposalResult>
): SharedQueryOptions<ICanCreateProposalResult> => ({
    queryKey: governanceServiceKeys.canCreateProposal(params),
    queryFn: () => governanceService.getCanCreateProposal(params),
    ...options,
});

export const useCanCreateProposal = (params: IGetCanCreateProposalParams, options?: QueryOptions<ICanCreateProposalResult>) =>
    useQuery(canCreateProposalOptions(params, options));
