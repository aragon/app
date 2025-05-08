import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import type { IProposalAction, IProposalActions } from '../../domain';
import { governanceService } from '../../governanceService';
import type { IGetProposalActionsParams } from '../../governanceService.api';
import { governanceServiceKeys } from '../../governanceServiceKeys';

export const proposalActionsOptions = <TAction extends IProposalAction = IProposalAction>(
    params: IGetProposalActionsParams,
    options?: QueryOptions<IProposalActions<TAction>>,
): SharedQueryOptions<IProposalActions<TAction>> => ({
    queryKey: governanceServiceKeys.proposalActions(params),
    queryFn: () => governanceService.getProposalActions<TAction>(params),
    ...options,
});

export const useProposalActions = <TAction extends IProposalAction = IProposalAction>(
    params: IGetProposalActionsParams,
    options?: QueryOptions<IProposalActions<TAction>>,
) => {
    return useQuery(proposalActionsOptions(params, options));
};
