import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcSystemResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcUpdatePolicyServiceParams } from '../../mpcService.api';
import { MpcServiceKey, mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcUpdatePolicy = (
    options?: MutationOptions<
        IMpcSystemResponse,
        unknown,
        IMpcUpdatePolicyServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.updatePolicy(params),
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
