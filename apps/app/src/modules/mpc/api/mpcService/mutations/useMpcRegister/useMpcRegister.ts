import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcLoginResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcRegisterServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcRegister = (
    options?: MutationOptions<
        IMpcLoginResponse,
        unknown,
        IMpcRegisterServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.register(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.all(),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
