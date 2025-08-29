import type { QueryOptions, SharedQueryOptions } from '@/shared/types';
import { useQuery } from '@tanstack/react-query';
import { actionSimulationService } from '../../actionSimulationService';
import type { IGetLastSimulationParams } from '../../actionSimulationService.api';
import { actionSimulationServiceKeys } from '../../actionSimulationServiceKeys';
import type { ISimulationResult } from '../../domain';

export const lastSimulationOptions = (
    params: IGetLastSimulationParams,
    options?: QueryOptions<ISimulationResult>,
): SharedQueryOptions<ISimulationResult> => ({
    queryKey: actionSimulationServiceKeys.lastSimulation(params),
    queryFn: () => actionSimulationService.getLastSimulation(params),
    ...options,
});

export const useLastSimulation = (params: IGetLastSimulationParams, options?: QueryOptions<ISimulationResult>) => {
    return useQuery(lastSimulationOptions(params, options));
};
