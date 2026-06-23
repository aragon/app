import { useQuery } from '@tanstack/react-query';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import type { ITransactionActionsResult } from '../../domain';
import { financeService } from '../../financeService';
import type { IGetTransactionActionsParams } from '../../financeService.api';
import { financeServiceKeys } from '../../financeServiceKeys';

export const transactionActionsOptions = <
    TAction extends IProposalAction = IProposalAction,
>(
    params: IGetTransactionActionsParams,
    options?: QueryOptions<ITransactionActionsResult<TAction>>,
): SharedQueryOptions<ITransactionActionsResult<TAction>> => ({
    queryKey: financeServiceKeys.transactionActions(params),
    queryFn: () =>
        financeService.getTransactionActions<
            ITransactionActionsResult<TAction>
        >(params),
    ...options,
});

export const useTransactionActions = <
    TAction extends IProposalAction = IProposalAction,
>(
    params: IGetTransactionActionsParams,
    options?: QueryOptions<ITransactionActionsResult<TAction>>,
) => useQuery(transactionActionsOptions(params, options));
