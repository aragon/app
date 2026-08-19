import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcRequestResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcCreateRequestServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcCreateRequest = (
    options?: MutationOptions<
        IMpcRequestResponse,
        unknown,
        IMpcCreateRequestServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.createRequest(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            // Dry runs (policy preview) do not persist anything: nothing to invalidate.
            if (params.body.dryRun) {
                return options?.onSuccess?.(
                    data,
                    params,
                    context,
                    mutationContext,
                );
            }

            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.requests({
                    urlParams: { systemId: params.urlParams.systemId },
                }),
            });
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.activity({
                    urlParams: { systemId: params.urlParams.systemId },
                }),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
