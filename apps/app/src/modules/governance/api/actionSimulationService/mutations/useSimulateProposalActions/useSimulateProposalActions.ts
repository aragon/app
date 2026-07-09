import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { actionSimulationService } from '../../actionSimulationService';
import type { ISimulateProposalActionsParams } from '../../actionSimulationService.api';
import type { ISimulationResult } from '../../domain';

export const useSimulateProposalActions = (
    options?: MutationOptions<
        ISimulationResult,
        unknown,
        ISimulateProposalActionsParams
    >,
) =>
    useMutation({
        mutationFn: (params) =>
            actionSimulationService.simulateProposalActions(params),
        ...options,
    });
