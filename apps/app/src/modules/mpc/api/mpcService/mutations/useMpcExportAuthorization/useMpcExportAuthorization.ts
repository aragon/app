import {
    type MutationOptions,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { mpcService } from '../../mpcService';
import type { IMpcAuthorizeExportServiceParams } from '../../mpcService.api';
import { mpcServiceKeys } from '../../mpcServiceKeys';

export const useMpcExportAuthorization = (
    options?: MutationOptions<null, unknown, IMpcAuthorizeExportServiceParams>,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => mpcService.authorizeExport(params),
        ...options,
        onSuccess: (data, params, context, mutationContext) => {
            void queryClient.invalidateQueries({
                queryKey: mpcServiceKeys.activity({
                    urlParams: { systemId: params.urlParams.systemId },
                }),
            });
            return options?.onSuccess?.(data, params, context, mutationContext);
        },
    });
};
