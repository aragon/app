import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { crossChainControllerService } from '../../crossChainControllerService';
import type { IEstimateGasLimitParams } from '../../crossChainControllerService.api';
import type { IGasLimitEstimation } from '../../domain';

export const useEstimateGasLimit = (
    options?: MutationOptions<
        IGasLimitEstimation,
        unknown,
        IEstimateGasLimitParams
    >,
) =>
    useMutation({
        mutationFn: (params) =>
            crossChainControllerService.estimateGasLimit(params),
        ...options,
    });
