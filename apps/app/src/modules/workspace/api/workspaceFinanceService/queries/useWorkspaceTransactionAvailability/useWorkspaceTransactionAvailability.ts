import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { workspaceFinanceService } from '../../workspaceFinanceService';
import type { IGetWorkspaceTransactionAvailabilityParams } from '../../workspaceFinanceService.api';
import { workspaceFinanceServiceKeys } from '../../workspaceFinanceServiceKeys';

export const workspaceTransactionAvailabilityOptions = (
    params: IGetWorkspaceTransactionAvailabilityParams,
    options?: QueryOptions<number>,
): SharedQueryOptions<number> => ({
    queryKey: workspaceFinanceServiceKeys.transactionAvailability(params),
    queryFn: () => workspaceFinanceService.getTransactionAvailability(params),
    ...options,
});

export const useWorkspaceTransactionAvailability = (
    params: IGetWorkspaceTransactionAvailabilityParams,
    options?: QueryOptions<number>,
) => useQuery(workspaceTransactionAvailabilityOptions(params, options));
