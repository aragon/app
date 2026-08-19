import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcSimulateResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcSimulateServiceParams } from '../../mpcService.api';

export const useMpcSimulate = (
    options?: MutationOptions<
        IMpcSimulateResponse,
        unknown,
        IMpcSimulateServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.simulate(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            // Nothing to invalidate, simulate is read-only.
            void params;
            void queryClient;
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
