import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcSystemResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcUpdateSystemServiceParams } from '../../mpcService.api';
import { MpcServiceKey, mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcUpdateSystem = (
    options?: MutationOptions<
        IMpcSystemResponse,
        unknown,
        IMpcUpdateSystemServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.updateSystem(params),
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
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
