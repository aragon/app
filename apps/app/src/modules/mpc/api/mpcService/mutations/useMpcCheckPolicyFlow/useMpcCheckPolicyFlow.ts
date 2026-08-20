import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IMpcCheckPolicyFlowResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcCheckPolicyFlowServiceParams } from '../../mpcService.api';

/**
 * Formal check of a policy flow on the policy engine (no cache: the result belongs to the flow being edited).
 */
export const useMpcCheckPolicyFlow = (
    options?: MutationOptions<
        IMpcCheckPolicyFlowResponse,
        unknown,
        IMpcCheckPolicyFlowServiceParams
    >,
) =>
    useMutation({
        mutationFn: (params) => mpcService.checkPolicyFlow(params),
        ...options,
    });
