import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcPrepareTransactionResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcPrepareRequestServiceParams } from '../../mpcService.api';

export const useMpcPrepareTransaction = (
    options?: MutationOptions<
        IMpcPrepareTransactionResponse,
        unknown,
        IMpcPrepareRequestServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.prepareRequest(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            // Nothing to invalidate, prepare is read-only.
            void params;
            void queryClient;
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
