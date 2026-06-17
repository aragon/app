import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { actionSimulationService } from '../../actionSimulationService';
import type { ISimulateDirectExecuteActionsParams } from '../../actionSimulationService.api';
import type { ISimulationResult } from '../../domain';

export const useSimulateDirectExecuteActions = (
    options?: MutationOptions<
        ISimulationResult,
        unknown,
        ISimulateDirectExecuteActionsParams
    >,
) =>
    useMutation({
        mutationFn: (params) =>
            actionSimulationService.simulateDirectExecuteActions(params),
        ...options,
    });
