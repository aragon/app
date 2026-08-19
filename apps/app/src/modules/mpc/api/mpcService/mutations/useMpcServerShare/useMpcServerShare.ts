import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcServerShareResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcServerShareServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcServerShare = (
    options?: MutationOptions<
        IMpcServerShareResponse,
        unknown,
        IMpcServerShareServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.getServerShare(params),
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
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
