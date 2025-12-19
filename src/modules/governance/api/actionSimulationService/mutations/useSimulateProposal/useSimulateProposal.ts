import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { actionSimulationService } from '../../actionSimulationService';
import type { ISimulateProposalParams } from '../../actionSimulationService.api';
import type { ISimulationResult } from '../../domain';

export const useSimulateProposal = (
    options?: MutationOptions<
        ISimulationResult,
        unknown,
        ISimulateProposalParams
    >,
) =>
    useMutation({
        mutationFn: (params) =>
            actionSimulationService.simulateProposal(params),
        ...options,
    });
