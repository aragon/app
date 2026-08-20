import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IMpcSimulatePolicyFlowResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcSimulatePolicyFlowServiceParams } from '../../mpcService.api';

/**
 * Evaluates a policy flow against one sample transaction on the policy engine (editor preview).
 */
export const useMpcSimulatePolicyFlow = (
    options?: MutationOptions<
        IMpcSimulatePolicyFlowResponse,
        unknown,
        IMpcSimulatePolicyFlowServiceParams
    >,
) =>
    useMutation({
        mutationFn: (params) => mpcService.simulatePolicyFlow(params),
        ...options,
    });
