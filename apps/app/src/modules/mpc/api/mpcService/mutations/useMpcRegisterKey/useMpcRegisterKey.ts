import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcSystemResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcRegisterKeyServiceParams } from '../../mpcService.api';
import { MpcServiceKey, mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcRegisterKey = (
    options?: MutationOptions<
        IMpcSystemResponse,
        unknown,
        IMpcRegisterKeyServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.registerKey(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.prefix(MpcServiceKey.SYSTEMS),
            });
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.system({
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
