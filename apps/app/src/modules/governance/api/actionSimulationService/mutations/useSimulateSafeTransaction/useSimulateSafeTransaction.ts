import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { actionSimulationService } from '../../actionSimulationService';
import type { ISimulateSafeTransactionParams } from '../../actionSimulationService.api';
import type { ISimulationResult } from '../../domain';

/**
 * Simulates a pending Safe transaction.
 */
export const useSimulateSafeTransaction = (
    options?: MutationOptions<
        ISimulationResult,
        unknown,
        ISimulateSafeTransactionParams
    >,
) =>
    useMutation({
        mutationFn: (params) =>
            actionSimulationService.simulateSafeTransaction(params),
        ...options,
    });
