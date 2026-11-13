import { useQuery } from '@tanstack/react-query';
import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { actionSimulationService } from '../../actionSimulationService';
import type { IGetLastSafeTransactionSimulationParams } from '../../actionSimulationService.api';
import { actionSimulationServiceKeys } from '../../actionSimulationServiceKeys';
import type { ISimulationResult } from '../../domain';

export const lastSafeTransactionSimulationOptions = (
    params: IGetLastSafeTransactionSimulationParams,
    options?: QueryOptions<ISimulationResult>,
): SharedQueryOptions<ISimulationResult> => ({
    queryKey: actionSimulationServiceKeys.lastSafeTransactionSimulation(params),
    queryFn: () =>
        actionSimulationService.getLastSafeTransactionSimulation(params),
    ...options,
});

/**
 * Reads the last stored simulation of a pending Safe transaction.
 */
export const useLastSafeTransactionSimulation = (
    params: IGetLastSafeTransactionSimulationParams,
    options?: QueryOptions<ISimulationResult>,
) => useQuery(lastSafeTransactionSimulationOptions(params, options));
