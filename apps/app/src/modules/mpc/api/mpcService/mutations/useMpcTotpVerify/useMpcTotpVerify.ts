import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import type { IMpcTotpVerifyResponse } from '../../domain';
import { mpcService } from '../../mpcService';
import type { IMpcTotpVerifyServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcTotpVerify = (
    options?: MutationOptions<
        IMpcTotpVerifyResponse,
        unknown,
        IMpcTotpVerifyServiceParams
    >,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.verifyTotp(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            // The session user now reports totpEnabled: true.
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.session(),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
