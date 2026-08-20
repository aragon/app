import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcRequestResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcUpdateRequestServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcUpdateRequest = (
    options?: MutationOptions<
        IMpcRequestResponse,
        unknown,
        IMpcUpdateRequestServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.updateRequest(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            const urlParams = { systemId: params.urlParams.systemId };
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.requests({ urlParams }),
            });
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.activity({ urlParams }),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
