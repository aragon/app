import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcLoginResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcLoginServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcLogin = (
    options?: MutationOptions<
        IMpcLoginResponse,
        unknown,
        IMpcLoginServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.login(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.all(),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
