import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { actionSimulationService } from '../../actionSimulationService';
import type { ISimulateSafeActionsParams } from '../../actionSimulationService.api';
import type { ISimulationResult } from '../../domain';

/**
 * Simulates a Safe transaction before it is created.
 */
export const useSimulateSafeActions = (
    options?: MutationOptions<
        ISimulationResult,
        unknown,
        ISimulateSafeActionsParams
    >,
) =>
    useMutation({
        mutationFn: (params) =>
            actionSimulationService.simulateSafeActions(params),
        ...options,
    });
