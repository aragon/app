import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { actionSimulationService } from '../../actionSimulationService';
import type { ISimulateActionsParams } from '../../actionSimulationService.api';
import type { ISimulationResult } from '../../domain';

export const useSimulateActions = (
    options?: MutationOptions<
        ISimulationResult,
        unknown,
        ISimulateActionsParams
    >,
) =>
    useMutation({
        mutationFn: (params) => actionSimulationService.simulateActions(params),
        ...options,
    });
