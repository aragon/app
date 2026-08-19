import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcRequestResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcCompleteRequestServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcCompleteRequest = (
    options?: MutationOptions<
        IMpcRequestResponse,
        unknown,
        IMpcCompleteRequestServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.completeRequest(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
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
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.balance({
                    urlParams: { systemId: params.urlParams.systemId },
                }),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
